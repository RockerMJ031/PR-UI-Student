/**
 * Purple Ruler Academy - 学生课程表页面
 * Wix Velo JavaScript 代码实现
 * 
 * 功能概述：
 * - 个人课程表查看和管理
 * - 多视图显示（日视图、周视图、月视图）
 * - 课程提醒和通知
 * - 作业和考试日程
 * - 课程冲突检测
 * - 日程导出和同步
 * - 教室位置和导航
 * - 课程资料快速访问
 * 
 * 作者：Purple Ruler Academy 开发团队
 * 创建日期：2024年
 * 最后更新：2024年
 */

// ==================== 模块导入 ====================
import { authentication } from 'wix-members';
import { currentMember } from 'wix-members';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { local, session } from 'wix-storage';
import wixWindow from 'wix-window';
import { timeline } from 'wix-animations';
import { fetch } from 'wix-fetch';

// ==================== 全局变量 ====================
let currentUser = null;
let scheduleData = {
    classes: [],
    assignments: [],
    exams: [],
    events: []
};
let currentView = 'week'; // day, week, month
let currentDate = new Date();
let selectedDate = new Date();
let calendarSettings = {
    startTime: '08:00',
    endTime: '18:00',
    timeSlotDuration: 30, // minutes
    showWeekends: false,
    defaultReminder: 15 // minutes before
};
let notifications = [];
let conflicts = [];

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== 页面初始化 ====================
$w.onReady(function () {
    console.log('学生课程表页面初始化开始');
    
    initializePage();
    setupEventHandlers();
    checkUserAuthentication();
    loadScheduleData();
    initializeCalendar();
    setupNotifications();
    
    console.log('学生课程表页面初始化完成');
});

/**
 * 初始化页面基本设置
 */
function initializePage() {
    try {
        // 设置页面标题和当前日期
        $w('#pageTitle').text = '我的课程表';
        $w('#currentDateDisplay').text = formatDate(currentDate, 'full');
        
        // 初始化视图按钮状态
        updateViewButtons();
        
        // 设置初始UI状态
        $w('#loadingOverlay').show();
        $w('#scheduleContainer').hide();
        
        // 初始化日期选择器
        $w('#datePicker').value = currentDate;
        
        console.log('页面基本设置初始化完成');
    } catch (error) {
        console.error('页面初始化失败:', error);
        showMessage('页面初始化失败，请刷新重试', 'error');
    }
}

/**
 * 设置事件处理器
 */
function setupEventHandlers() {
    try {
        // 视图切换按钮
        $w('#dayViewButton').onClick(() => switchView('day'));
        $w('#weekViewButton').onClick(() => switchView('week'));
        $w('#monthViewButton').onClick(() => switchView('month'));
        
        // 导航按钮
        $w('#prevButton').onClick(navigatePrevious);
        $w('#nextButton').onClick(navigateNext);
        $w('#todayButton').onClick(navigateToday);
        
        // 日期选择器
        $w('#datePicker').onChange(handleDatePickerChange);
        
        // 课程操作按钮
        $w('#addEventButton').onClick(showAddEventModal);
        $w('#exportButton').onClick(handleExportSchedule);
        $w('#syncButton').onClick(handleSyncCalendar);
        $w('#settingsButton').onClick(showSettingsModal);
        
        // 搜索和筛选
        $w('#searchInput').onInput(debounce(handleSearch, 300));
        $w('#subjectFilter').onChange(handleSubjectFilter);
        $w('#typeFilter').onChange(handleTypeFilter);
        $w('#locationFilter').onChange(handleLocationFilter);
        
        // 课程表交互
        $w('#scheduleGrid').onItemReady(setupScheduleItem);
        $w('#upcomingList').onItemReady(setupUpcomingItem);
        $w('#conflictsList').onItemReady(setupConflictItem);
        
        // 模态框事件
        $w('#eventModal').onClose(handleEventModalClose);
        $w('#saveEventButton').onClick(handleSaveEvent);
        $w('#deleteEventButton').onClick(handleDeleteEvent);
        $w('#cancelEventButton').onClick(closeEventModal);
        
        // 设置模态框事件
        $w('#settingsModal').onClose(handleSettingsModalClose);
        $w('#saveSettingsButton').onClick(handleSaveSettings);
        $w('#cancelSettingsButton').onClick(closeSettingsModal);
        
        // 通知相关事件
        $w('#notificationsList').onItemReady(setupNotificationItem);
        $w('#markAllReadButton').onClick(markAllNotificationsRead);
        $w('#clearNotificationsButton').onClick(clearAllNotifications);
        
        // 其他功能按钮
        $w('#refreshButton').onClick(refreshScheduleData);
        $w('#helpButton').onClick(showHelpModal);
        $w('#printButton').onClick(handlePrintSchedule);
        
        console.log('事件处理器设置完成');
    } catch (error) {
        console.error('事件处理器设置失败:', error);
    }
}

/**
 * 检查用户认证状态
 */
async function checkUserAuthentication() {
    try {
        const isLoggedIn = authentication.loggedIn();
        
        if (isLoggedIn) {
            currentUser = await currentMember.getMember();
            updateUserInterface();
            console.log('用户已登录:', currentUser.loginEmail);
        } else {
            // 重定向到登录页面
            wixLocation.to('/login');
            return;
        }
    } catch (error) {
        console.error('用户认证检查失败:', error);
        wixLocation.to('/login');
    }
}

/**
 * 更新用户界面
 */
function updateUserInterface() {
    try {
        if (currentUser) {
            $w('#userWelcome').text = `${currentUser.profile?.nickname || '同学'}的课程表`;
            $w('#userWelcome').show();
            
            // 加载用户偏好设置
            loadUserPreferences();
        }
        
        console.log('用户界面更新完成');
    } catch (error) {
        console.error('用户界面更新失败:', error);
    }
}

// ==================== 数据加载和管理 ====================

/**
 * 加载课程表数据
 */
async function loadScheduleData() {
    try {
        $w('#loadingOverlay').show();
        
        // 并行加载所有数据
        const [classesData, assignmentsData, examsData, eventsData] = await Promise.all([
            loadClassesData(),
            loadAssignmentsData(),
            loadExamsData(),
            loadEventsData()
        ]);
        
        scheduleData = {
            classes: classesData,
            assignments: assignmentsData,
            exams: examsData,
            events: eventsData
        };
        
        // 检测课程冲突
        detectConflicts();
        
        // 更新显示
        updateScheduleDisplay();
        updateUpcomingEvents();
        updateStatistics();
        
        $w('#loadingOverlay').hide();
        $w('#scheduleContainer').show();
        
        console.log('课程表数据加载完成');
        
    } catch (error) {
        console.error('数据加载失败:', error);
        $w('#loadingOverlay').hide();
        showMessage('数据加载失败，请刷新重试', 'error');
    }
}

/**
 * 加载课程数据
 */
async function loadClassesData() {
    try {
        const results = await wixData.query('StudentClasses')
            .eq('studentId', currentUser._id)
            .eq('isActive', true)
            .ascending('startTime')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('课程数据加载失败:', error);
        return [];
    }
}

/**
 * 加载作业数据
 */
async function loadAssignmentsData() {
    try {
        const results = await wixData.query('StudentAssignments')
            .eq('studentId', currentUser._id)
            .eq('status', 'assigned')
            .ascending('dueDate')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('作业数据加载失败:', error);
        return [];
    }
}

/**
 * 加载考试数据
 */
async function loadExamsData() {
    try {
        const results = await wixData.query('StudentExams')
            .eq('studentId', currentUser._id)
            .eq('isActive', true)
            .ascending('examDate')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('考试数据加载失败:', error);
        return [];
    }
}

/**
 * 加载事件数据
 */
async function loadEventsData() {
    try {
        const results = await wixData.query('StudentEvents')
            .eq('studentId', currentUser._id)
            .eq('isActive', true)
            .ascending('eventDate')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('事件数据加载失败:', error);
        return [];
    }
}

// ==================== 日历和视图管理 ====================

/**
 * 初始化日历
 */
function initializeCalendar() {
    try {
        // 设置日历基本配置
        setupCalendarGrid();
        
        // 初始化时间轴
        setupTimeAxis();
        
        // 设置默认视图
        switchView(currentView);
        
        console.log('日历初始化完成');
    } catch (error) {
        console.error('日历初始化失败:', error);
    }
}

/**
 * 设置日历网格
 */
function setupCalendarGrid() {
    try {
        const startHour = parseInt(calendarSettings.startTime.split(':')[0]);
        const endHour = parseInt(calendarSettings.endTime.split(':')[0]);
        const slotDuration = calendarSettings.timeSlotDuration;
        
        // 计算时间槽数量
        const totalMinutes = (endHour - startHour) * 60;
        const timeSlots = totalMinutes / slotDuration;
        
        // 生成时间轴标签
        const timeLabels = [];
        for (let i = 0; i < timeSlots; i++) {
            const minutes = startHour * 60 + i * slotDuration;
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            timeLabels.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
        
        // 更新时间轴显示
        $w('#timeAxisRepeater').data = timeLabels.map(time => ({ time }));
        
        console.log('日历网格设置完成');
    } catch (error) {
        console.error('日历网格设置失败:', error);
    }
}

/**
 * 设置时间轴
 */
function setupTimeAxis() {
    try {
        // 时间轴样式设置
        $w('#timeAxis').style.backgroundColor = '#F8F9FA';
        $w('#timeAxis').style.borderRight = '1px solid #DEE2E6';
        
        console.log('时间轴设置完成');
    } catch (error) {
        console.error('时间轴设置失败:', error);
    }
}

/**
 * 切换视图
 */
function switchView(viewType) {
    try {
        currentView = viewType;
        
        // 更新视图按钮状态
        updateViewButtons();
        
        // 根据视图类型显示不同内容
        switch (viewType) {
            case 'day':
                showDayView();
                break;
            case 'week':
                showWeekView();
                break;
            case 'month':
                showMonthView();
                break;
        }
        
        // 更新导航标题
        updateNavigationTitle();
        
        console.log('视图切换到:', viewType);
    } catch (error) {
        console.error('视图切换失败:', error);
    }
}

/**
 * 更新视图按钮状态
 */
function updateViewButtons() {
    try {
        // 重置所有按钮
        $w('#dayViewButton').style.backgroundColor = '#FFFFFF';
        $w('#weekViewButton').style.backgroundColor = '#FFFFFF';
        $w('#monthViewButton').style.backgroundColor = '#FFFFFF';
        
        // 高亮当前视图按钮
        switch (currentView) {
            case 'day':
                $w('#dayViewButton').style.backgroundColor = '#663399';
                break;
            case 'week':
                $w('#weekViewButton').style.backgroundColor = '#663399';
                break;
            case 'month':
                $w('#monthViewButton').style.backgroundColor = '#663399';
                break;
        }
    } catch (error) {
        console.error('视图按钮更新失败:', error);
    }
}

/**
 * 显示日视图
 */
function showDayView() {
    try {
        $w('#dayViewContainer').show();
        $w('#weekViewContainer').hide();
        $w('#monthViewContainer').hide();
        
        // 加载当天的课程
        const dayEvents = getEventsForDate(selectedDate);
        updateDayViewDisplay(dayEvents);
        
    } catch (error) {
        console.error('日视图显示失败:', error);
    }
}

/**
 * 显示周视图
 */
function showWeekView() {
    try {
        $w('#dayViewContainer').hide();
        $w('#weekViewContainer').show();
        $w('#monthViewContainer').hide();
        
        // 加载本周的课程
        const weekEvents = getEventsForWeek(selectedDate);
        updateWeekViewDisplay(weekEvents);
        
    } catch (error) {
        console.error('周视图显示失败:', error);
    }
}

/**
 * 显示月视图
 */
function showMonthView() {
    try {
        $w('#dayViewContainer').hide();
        $w('#weekViewContainer').hide();
        $w('#monthViewContainer').show();
        
        // 加载本月的课程
        const monthEvents = getEventsForMonth(selectedDate);
        updateMonthViewDisplay(monthEvents);
        
    } catch (error) {
        console.error('月视图显示失败:', error);
    }
}

// ==================== 事件处理器 ====================

/**
 * 导航到上一个时间段
 */
function navigatePrevious() {
    try {
        switch (currentView) {
            case 'day':
                selectedDate.setDate(selectedDate.getDate() - 1);
                break;
            case 'week':
                selectedDate.setDate(selectedDate.getDate() - 7);
                break;
            case 'month':
                selectedDate.setMonth(selectedDate.getMonth() - 1);
                break;
        }
        
        updateDateDisplay();
        updateScheduleDisplay();
        
        console.log('导航到上一个时间段');
    } catch (error) {
        console.error('导航失败:', error);
    }
}

/**
 * 导航到下一个时间段
 */
function navigateNext() {
    try {
        switch (currentView) {
            case 'day':
                selectedDate.setDate(selectedDate.getDate() + 1);
                break;
            case 'week':
                selectedDate.setDate(selectedDate.getDate() + 7);
                break;
            case 'month':
                selectedDate.setMonth(selectedDate.getMonth() + 1);
                break;
        }
        
        updateDateDisplay();
        updateScheduleDisplay();
        
        console.log('导航到下一个时间段');
    } catch (error) {
        console.error('导航失败:', error);
    }
}

/**
 * 导航到今天
 */
function navigateToday() {
    try {
        selectedDate = new Date();
        currentDate = new Date();
        
        updateDateDisplay();
        updateScheduleDisplay();
        
        console.log('导航到今天');
    } catch (error) {
        console.error('导航到今天失败:', error);
    }
}

/**
 * 处理日期选择器变化
 */
function handleDatePickerChange() {
    try {
        const newDate = $w('#datePicker').value;
        selectedDate = new Date(newDate);
        
        updateDateDisplay();
        updateScheduleDisplay();
        
        console.log('日期选择器变化:', newDate);
    } catch (error) {
        console.error('日期选择器处理失败:', error);
    }
}

/**
 * 处理搜索
 */
function handleSearch() {
    try {
        const searchTerm = $w('#searchInput').value.toLowerCase();
        
        if (searchTerm) {
            const filteredEvents = getAllEvents().filter(event => 
                event.title.toLowerCase().includes(searchTerm) ||
                event.subject?.toLowerCase().includes(searchTerm) ||
                event.location?.toLowerCase().includes(searchTerm) ||
                event.instructor?.toLowerCase().includes(searchTerm)
            );
            
            updateSearchResults(filteredEvents);
        } else {
            updateScheduleDisplay();
        }
        
        console.log('搜索执行:', searchTerm);
    } catch (error) {
        console.error('搜索处理失败:', error);
    }
}

/**
 * 处理科目筛选
 */
function handleSubjectFilter() {
    try {
        const selectedSubject = $w('#subjectFilter').value;
        applyFilters();
        
        console.log('科目筛选:', selectedSubject);
    } catch (error) {
        console.error('科目筛选处理失败:', error);
    }
}

/**
 * 处理类型筛选
 */
function handleTypeFilter() {
    try {
        const selectedType = $w('#typeFilter').value;
        applyFilters();
        
        console.log('类型筛选:', selectedType);
    } catch (error) {
        console.error('类型筛选处理失败:', error);
    }
}

/**
 * 处理地点筛选
 */
function handleLocationFilter() {
    try {
        const selectedLocation = $w('#locationFilter').value;
        applyFilters();
        
        console.log('地点筛选:', selectedLocation);
    } catch (error) {
        console.error('地点筛选处理失败:', error);
    }
}

/**
 * 显示添加事件模态框
 */
function showAddEventModal() {
    try {
        // 重置表单
        resetEventForm();
        
        // 设置默认日期和时间
        $w('#eventDate').value = selectedDate;
        $w('#eventStartTime').value = '09:00';
        $w('#eventEndTime').value = '10:00';
        
        // 显示模态框
        $w('#eventModal').show();
        $w('#eventModalTitle').text = '添加新事件';
        $w('#deleteEventButton').hide();
        
        console.log('显示添加事件模态框');
    } catch (error) {
        console.error('显示添加事件模态框失败:', error);
    }
}

/**
 * 处理导出课程表
 */
function handleExportSchedule() {
    try {
        // 生成导出数据
        const exportData = generateExportData();
        
        // 创建下载链接
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        // 触发下载
        const link = document.createElement('a');
        link.href = url;
        link.download = `schedule_${formatDate(new Date(), 'filename')}.json`;
        link.click();
        
        showMessage('课程表导出成功', 'success');
        console.log('课程表导出完成');
        
    } catch (error) {
        console.error('课程表导出失败:', error);
        showMessage('课程表导出失败', 'error');
    }
}

/**
 * 处理同步日历
 */
async function handleSyncCalendar() {
    try {
        $w('#syncButton').disable();
        $w('#syncButton').label = '同步中...';
        
        // 这里应该调用外部日历API进行同步
        // 例如 Google Calendar, Outlook 等
        
        // 模拟同步过程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showMessage('日历同步成功', 'success');
        console.log('日历同步完成');
        
    } catch (error) {
        console.error('日历同步失败:', error);
        showMessage('日历同步失败', 'error');
    } finally {
        $w('#syncButton').enable();
        $w('#syncButton').label = '同步日历';
    }
}

/**
 * 显示设置模态框
 */
function showSettingsModal() {
    try {
        // 加载当前设置
        loadCurrentSettings();
        
        // 显示模态框
        $w('#settingsModal').show();
        
        console.log('显示设置模态框');
    } catch (error) {
        console.error('显示设置模态框失败:', error);
    }
}

// ==================== UI 更新函数 ====================

/**
 * 更新课程表显示
 */
function updateScheduleDisplay() {
    try {
        switch (currentView) {
            case 'day':
                showDayView();
                break;
            case 'week':
                showWeekView();
                break;
            case 'month':
                showMonthView();
                break;
        }
        
        console.log('课程表显示更新完成');
    } catch (error) {
        console.error('课程表显示更新失败:', error);
    }
}

/**
 * 更新日期显示
 */
function updateDateDisplay() {
    try {
        $w('#currentDateDisplay').text = formatDate(selectedDate, 'full');
        $w('#datePicker').value = selectedDate;
        
        updateNavigationTitle();
        
    } catch (error) {
        console.error('日期显示更新失败:', error);
    }
}

/**
 * 更新导航标题
 */
function updateNavigationTitle() {
    try {
        let title = '';
        
        switch (currentView) {
            case 'day':
                title = formatDate(selectedDate, 'weekday');
                break;
            case 'week':
                const weekStart = getWeekStart(selectedDate);
                const weekEnd = getWeekEnd(selectedDate);
                title = `${formatDate(weekStart, 'short')} - ${formatDate(weekEnd, 'short')}`;
                break;
            case 'month':
                title = formatDate(selectedDate, 'month');
                break;
        }
        
        $w('#navigationTitle').text = title;
        
    } catch (error) {
        console.error('导航标题更新失败:', error);
    }
}

/**
 * 更新即将到来的事件
 */
function updateUpcomingEvents() {
    try {
        const now = new Date();
        const upcomingEvents = getAllEvents()
            .filter(event => new Date(event.startTime) > now)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .slice(0, 5);
        
        $w('#upcomingList').data = upcomingEvents.map(event => ({
            ...event,
            timeUntil: getTimeUntil(event.startTime),
            formattedTime: formatTime(event.startTime)
        }));
        
        console.log('即将到来的事件更新完成');
    } catch (error) {
        console.error('即将到来的事件更新失败:', error);
    }
}

/**
 * 更新统计信息
 */
function updateStatistics() {
    try {
        const today = new Date();
        const todayEvents = getEventsForDate(today);
        const thisWeekEvents = getEventsForWeek(today);
        const pendingAssignments = scheduleData.assignments.filter(a => a.status === 'assigned');
        const upcomingExams = scheduleData.exams.filter(e => new Date(e.examDate) > today);
        
        $w('#todayEventsCount').text = todayEvents.length.toString();
        $w('#weekEventsCount').text = thisWeekEvents.length.toString();
        $w('#pendingAssignmentsCount').text = pendingAssignments.length.toString();
        $w('#upcomingExamsCount').text = upcomingExams.length.toString();
        
        console.log('统计信息更新完成');
    } catch (error) {
        console.error('统计信息更新失败:', error);
    }
}

/**
 * 更新日视图显示
 */
function updateDayViewDisplay(events) {
    try {
        // 清空现有显示
        $w('#dayEventsContainer').children.forEach(child => child.hide());
        
        // 显示当天事件
        events.forEach((event, index) => {
            const eventElement = createEventElement(event, 'day');
            $w('#dayEventsContainer').appendChild(eventElement);
        });
        
        // 如果没有事件，显示提示
        if (events.length === 0) {
            $w('#noDayEventsMessage').show();
        } else {
            $w('#noDayEventsMessage').hide();
        }
        
        console.log('日视图显示更新完成');
    } catch (error) {
        console.error('日视图显示更新失败:', error);
    }
}

/**
 * 更新周视图显示
 */
function updateWeekViewDisplay(events) {
    try {
        // 生成周视图网格
        const weekDays = getWeekDays(selectedDate);
        
        // 更新周视图数据
        $w('#weekViewGrid').data = weekDays.map(day => {
            const dayEvents = events.filter(event => 
                isSameDay(new Date(event.startTime), day)
            );
            
            return {
                date: day,
                dayName: formatDate(day, 'weekday-short'),
                dayNumber: day.getDate(),
                events: dayEvents,
                isToday: isSameDay(day, new Date())
            };
        });
        
        console.log('周视图显示更新完成');
    } catch (error) {
        console.error('周视图显示更新失败:', error);
    }
}

/**
 * 更新月视图显示
 */
function updateMonthViewDisplay(events) {
    try {
        // 生成月视图网格
        const monthDays = getMonthDays(selectedDate);
        
        // 更新月视图数据
        $w('#monthViewGrid').data = monthDays.map(day => {
            const dayEvents = events.filter(event => 
                isSameDay(new Date(event.startTime), day)
            );
            
            return {
                date: day,
                dayNumber: day.getDate(),
                events: dayEvents.slice(0, 3), // 最多显示3个事件
                moreEventsCount: Math.max(0, dayEvents.length - 3),
                isToday: isSameDay(day, new Date()),
                isCurrentMonth: day.getMonth() === selectedDate.getMonth()
            };
        });
        
        console.log('月视图显示更新完成');
    } catch (error) {
        console.error('月视图显示更新失败:', error);
    }
}

// ==================== 中继器项目设置 ====================

/**
 * 设置课程表项目
 */
function setupScheduleItem($item, itemData) {
    try {
        $item('#eventTitle').text = itemData.title;
        $item('#eventTime').text = `${formatTime(itemData.startTime)} - ${formatTime(itemData.endTime)}`;
        $item('#eventLocation').text = itemData.location || '';
        $item('#eventInstructor').text = itemData.instructor || '';
        
        // 设置事件类型样式
        const typeColors = {
            'class': '#663399',
            'assignment': '#FFC107',
            'exam': '#DC3545',
            'event': '#17A2B8'
        };
        
        const color = typeColors[itemData.type] || '#6C757D';
        $item('#eventCard').style.borderLeft = `4px solid ${color}`;
        
        // 设置点击事件
        $item('#eventCard').onClick(() => showEventDetails(itemData));
        
        // 设置快速操作按钮
        if (itemData.type === 'class') {
            $item('#joinClassButton').show();
            $item('#joinClassButton').onClick(() => joinClass(itemData));
        } else {
            $item('#joinClassButton').hide();
        }
        
        if (itemData.location) {
            $item('#locationButton').show();
            $item('#locationButton').onClick(() => showLocation(itemData.location));
        } else {
            $item('#locationButton').hide();
        }
        
    } catch (error) {
        console.error('课程表项目设置失败:', error);
    }
}

/**
 * 设置即将到来的事件项目
 */
function setupUpcomingItem($item, itemData) {
    try {
        $item('#upcomingTitle').text = itemData.title;
        $item('#upcomingTime').text = itemData.formattedTime;
        $item('#upcomingTimeUntil').text = itemData.timeUntil;
        $item('#upcomingLocation').text = itemData.location || '';
        
        // 设置紧急程度样式
        const timeUntilMs = new Date(itemData.startTime) - new Date();
        const hoursUntil = timeUntilMs / (1000 * 60 * 60);
        
        if (hoursUntil < 1) {
            $item('#upcomingCard').style.backgroundColor = '#FFE6E6';
            $item('#upcomingCard').style.borderColor = '#DC3545';
        } else if (hoursUntil < 24) {
            $item('#upcomingCard').style.backgroundColor = '#FFF3CD';
            $item('#upcomingCard').style.borderColor = '#FFC107';
        }
        
        // 设置点击事件
        $item('#upcomingCard').onClick(() => showEventDetails(itemData));
        
    } catch (error) {
        console.error('即将到来的事件项目设置失败:', error);
    }
}

/**
 * 设置冲突项目
 */
function setupConflictItem($item, itemData) {
    try {
        $item('#conflictTitle').text = `冲突: ${itemData.event1.title} 与 ${itemData.event2.title}`;
        $item('#conflictTime').text = formatTime(itemData.conflictTime);
        $item('#conflictDate').text = formatDate(itemData.conflictDate, 'short');
        $item('#conflictSeverity').text = itemData.severity;
        
        // 设置严重程度样式
        const severityColors = {
            'high': '#DC3545',
            'medium': '#FFC107',
            'low': '#28A745'
        };
        
        const color = severityColors[itemData.severity] || '#6C757D';
        $item('#conflictCard').style.borderLeft = `4px solid ${color}`;
        
        // 设置解决按钮
        $item('#resolveConflictButton').onClick(() => resolveConflict(itemData));
        
    } catch (error) {
        console.error('冲突项目设置失败:', error);
    }
}

/**
 * 设置通知项目
 */
function setupNotificationItem($item, itemData) {
    try {
        $item('#notificationTitle').text = itemData.title;
        $item('#notificationMessage').text = itemData.message;
        $item('#notificationTime').text = formatDate(itemData.timestamp, 'relative');
        $item('#notificationType').text = itemData.type;
        
        // 设置已读/未读状态
        if (itemData.isRead) {
            $item('#notificationCard').style.backgroundColor = '#F8F9FA';
        } else {
            $item('#notificationCard').style.backgroundColor = '#E3F2FD';
            $item('#notificationCard').style.fontWeight = 'bold';
        }
        
        // 设置点击事件
        $item('#notificationCard').onClick(() => markNotificationRead(itemData._id));
        
    } catch (error) {
        console.error('通知项目设置失败:', error);
    }
}

// ==================== 工具函数 ====================

/**
 * 获取指定日期的所有事件
 */
function getEventsForDate(date) {
    try {
        return getAllEvents().filter(event => 
            isSameDay(new Date(event.startTime), date)
        );
    } catch (error) {
        console.error('获取日期事件失败:', error);
        return [];
    }
}

/**
 * 获取指定周的所有事件
 */
function getEventsForWeek(date) {
    try {
        const weekStart = getWeekStart(date);
        const weekEnd = getWeekEnd(date);
        
        return getAllEvents().filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= weekStart && eventDate <= weekEnd;
        });
    } catch (error) {
        console.error('获取周事件失败:', error);
        return [];
    }
}

/**
 * 获取指定月的所有事件
 */
function getEventsForMonth(date) {
    try {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return getAllEvents().filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= monthStart && eventDate <= monthEnd;
        });
    } catch (error) {
        console.error('获取月事件失败:', error);
        return [];
    }
}

/**
 * 获取所有事件
 */
function getAllEvents() {
    try {
        const allEvents = [];
        
        // 添加课程
        scheduleData.classes.forEach(cls => {
            allEvents.push({
                ...cls,
                type: 'class',
                title: cls.className,
                startTime: cls.startTime,
                endTime: cls.endTime
            });
        });
        
        // 添加作业截止日期
        scheduleData.assignments.forEach(assignment => {
            allEvents.push({
                ...assignment,
                type: 'assignment',
                title: `作业: ${assignment.title}`,
                startTime: assignment.dueDate,
                endTime: assignment.dueDate
            });
        });
        
        // 添加考试
        scheduleData.exams.forEach(exam => {
            allEvents.push({
                ...exam,
                type: 'exam',
                title: `考试: ${exam.subject}`,
                startTime: exam.examDate,
                endTime: exam.examEndTime || exam.examDate
            });
        });
        
        // 添加其他事件
        scheduleData.events.forEach(event => {
            allEvents.push({
                ...event,
                type: 'event'
            });
        });
        
        return allEvents;
    } catch (error) {
        console.error('获取所有事件失败:', error);
        return [];
    }
}

/**
 * 检测课程冲突
 */
function detectConflicts() {
    try {
        conflicts = [];
        const events = getAllEvents();
        
        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {
                const event1 = events[i];
                const event2 = events[j];
                
                if (isTimeConflict(event1, event2)) {
                    conflicts.push({
                        event1: event1,
                        event2: event2,
                        conflictTime: event1.startTime,
                        conflictDate: new Date(event1.startTime),
                        severity: calculateConflictSeverity(event1, event2)
                    });
                }
            }
        }
        
        // 更新冲突显示
        updateConflictsDisplay();
        
        console.log('冲突检测完成，发现', conflicts.length, '个冲突');
    } catch (error) {
        console.error('冲突检测失败:', error);
    }
}

/**
 * 检查时间冲突
 */
function isTimeConflict(event1, event2) {
    try {
        const start1 = new Date(event1.startTime);
        const end1 = new Date(event1.endTime);
        const start2 = new Date(event2.startTime);
        const end2 = new Date(event2.endTime);
        
        return (start1 < end2 && start2 < end1);
    } catch (error) {
        console.error('时间冲突检查失败:', error);
        return false;
    }
}

/**
 * 计算冲突严重程度
 */
function calculateConflictSeverity(event1, event2) {
    try {
        // 考试和课程冲突为高严重程度
        if ((event1.type === 'exam' && event2.type === 'class') ||
            (event1.type === 'class' && event2.type === 'exam')) {
            return 'high';
        }
        
        // 课程和课程冲突为中等严重程度
        if (event1.type === 'class' && event2.type === 'class') {
            return 'medium';
        }
        
        // 其他冲突为低严重程度
        return 'low';
    } catch (error) {
        console.error('冲突严重程度计算失败:', error);
        return 'low';
    }
}

/**
 * 应用筛选
 */
function applyFilters() {
    try {
        const subjectFilter = $w('#subjectFilter').value;
        const typeFilter = $w('#typeFilter').value;
        const locationFilter = $w('#locationFilter').value;
        
        let filteredEvents = getAllEvents();
        
        if (subjectFilter && subjectFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
                event.subject === subjectFilter
            );
        }
        
        if (typeFilter && typeFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
                event.type === typeFilter
            );
        }
        
        if (locationFilter && locationFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => 
                event.location === locationFilter
            );
        }
        
        updateFilteredDisplay(filteredEvents);
        
        console.log('筛选应用完成');
    } catch (error) {
        console.error('筛选应用失败:', error);
    }
}

/**
 * 更新筛选显示
 */
function updateFilteredDisplay(filteredEvents) {
    try {
        // 根据当前视图更新显示
        switch (currentView) {
            case 'day':
                const dayFiltered = filteredEvents.filter(event => 
                    isSameDay(new Date(event.startTime), selectedDate)
                );
                updateDayViewDisplay(dayFiltered);
                break;
            case 'week':
                const weekFiltered = filteredEvents.filter(event => {
                    const eventDate = new Date(event.startTime);
                    const weekStart = getWeekStart(selectedDate);
                    const weekEnd = getWeekEnd(selectedDate);
                    return eventDate >= weekStart && eventDate <= weekEnd;
                });
                updateWeekViewDisplay(weekFiltered);
                break;
            case 'month':
                const monthFiltered = filteredEvents.filter(event => {
                    const eventDate = new Date(event.startTime);
                    return eventDate.getMonth() === selectedDate.getMonth() &&
                           eventDate.getFullYear() === selectedDate.getFullYear();
                });
                updateMonthViewDisplay(monthFiltered);
                break;
        }
    } catch (error) {
        console.error('筛选显示更新失败:', error);
    }
}

/**
 * 更新搜索结果
 */
function updateSearchResults(searchResults) {
    try {
        $w('#searchResultsContainer').show();
        $w('#searchResultsList').data = searchResults.map(event => ({
            ...event,
            formattedTime: `${formatDate(event.startTime, 'short')} ${formatTime(event.startTime)}`
        }));
        
        $w('#searchResultsCount').text = `找到 ${searchResults.length} 个结果`;
        
    } catch (error) {
        console.error('搜索结果更新失败:', error);
    }
}

/**
 * 更新冲突显示
 */
function updateConflictsDisplay() {
    try {
        if (conflicts.length > 0) {
            $w('#conflictsContainer').show();
            $w('#conflictsList').data = conflicts;
            $w('#conflictsCount').text = `发现 ${conflicts.length} 个冲突`;
        } else {
            $w('#conflictsContainer').hide();
        }
    } catch (error) {
        console.error('冲突显示更新失败:', error);
    }
}

/**
 * 显示事件详情
 */
function showEventDetails(eventData) {
    try {
        // 填充事件详情
        $w('#eventDetailTitle').text = eventData.title;
        $w('#eventDetailTime').text = `${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`;
        $w('#eventDetailDate').text = formatDate(eventData.startTime, 'full');
        $w('#eventDetailLocation').text = eventData.location || '未指定';
        $w('#eventDetailInstructor').text = eventData.instructor || '未指定';
        $w('#eventDetailDescription').text = eventData.description || '无描述';
        
        // 显示详情模态框
        $w('#eventDetailModal').show();
        
        console.log('显示事件详情:', eventData.title);
    } catch (error) {
        console.error('显示事件详情失败:', error);
    }
}

/**
 * 加入课程
 */
function joinClass(classData) {
    try {
        if (classData.meetingUrl) {
            wixLocation.to(classData.meetingUrl);
        } else if (classData.location) {
            showLocation(classData.location);
        } else {
            showMessage('课程链接或地点信息不可用', 'warning');
        }
        
        console.log('加入课程:', classData.title);
    } catch (error) {
        console.error('加入课程失败:', error);
    }
}

/**
 * 显示地点
 */
function showLocation(location) {
    try {
        // 这里可以集成地图服务
        const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
        wixLocation.to(mapUrl);
        
        console.log('显示地点:', location);
    } catch (error) {
        console.error('显示地点失败:', error);
    }
}

/**
 * 解决冲突
 */
function resolveConflict(conflictData) {
    try {
        // 显示冲突解决选项
        $w('#conflictResolutionModal').show();
        $w('#conflictEvent1').text = conflictData.event1.title;
        $w('#conflictEvent2').text = conflictData.event2.title;
        
        // 设置解决选项
        $w('#rescheduleEvent1Button').onClick(() => rescheduleEvent(conflictData.event1));
        $w('#rescheduleEvent2Button').onClick(() => rescheduleEvent(conflictData.event2));
        $w('#ignoreConflictButton').onClick(() => ignoreConflict(conflictData));
        
        console.log('解决冲突:', conflictData);
    } catch (error) {
        console.error('解决冲突失败:', error);
    }
}

/**
 * 重新安排事件
 */
function rescheduleEvent(eventData) {
    try {
        // 显示重新安排模态框
        $w('#rescheduleModal').show();
        $w('#rescheduleEventTitle').text = eventData.title;
        $w('#rescheduleDate').value = new Date(eventData.startTime);
        $w('#rescheduleStartTime').value = formatTime(eventData.startTime);
        $w('#rescheduleEndTime').value = formatTime(eventData.endTime);
        
        console.log('重新安排事件:', eventData.title);
    } catch (error) {
        console.error('重新安排事件失败:', error);
    }
}

/**
 * 忽略冲突
 */
function ignoreConflict(conflictData) {
    try {
        // 从冲突列表中移除
        conflicts = conflicts.filter(c => c !== conflictData);
        
        // 更新显示
        updateConflictsDisplay();
        
        // 关闭模态框
        $w('#conflictResolutionModal').hide();
        
        showMessage('冲突已忽略', 'info');
        console.log('忽略冲突:', conflictData);
    } catch (error) {
        console.error('忽略冲突失败:', error);
    }
}

/**
 * 生成导出数据
 */
function generateExportData() {
    try {
        return {
            exportDate: new Date().toISOString(),
            studentId: currentUser._id,
            studentName: currentUser.profile?.nickname || '学生',
            schedule: {
                classes: scheduleData.classes,
                assignments: scheduleData.assignments,
                exams: scheduleData.exams,
                events: scheduleData.events
            },
            settings: calendarSettings
        };
    } catch (error) {
        console.error('生成导出数据失败:', error);
        return {};
    }
}

/**
 * 加载用户偏好设置
 */
function loadUserPreferences() {
    try {
        const savedPreferences = session.getItem('schedulePreferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            
            // 应用保存的设置
            if (preferences.view) {
                currentView = preferences.view;
            }
            if (preferences.calendarSettings) {
                calendarSettings = { ...calendarSettings, ...preferences.calendarSettings };
            }
        }
        
        console.log('用户偏好设置加载完成');
    } catch (error) {
        console.error('用户偏好设置加载失败:', error);
    }
}

/**
 * 保存用户偏好设置
 */
function saveUserPreferences() {
    try {
        const preferences = {
            view: currentView,
            calendarSettings: calendarSettings,
            timestamp: new Date().toISOString()
        };
        
        session.setItem('schedulePreferences', JSON.stringify(preferences));
        console.log('用户偏好设置保存完成');
    } catch (error) {
        console.error('用户偏好设置保存失败:', error);
    }
}

/**
 * 设置通知
 */
function setupNotifications() {
    try {
        // 检查即将到来的事件
        checkUpcomingEvents();
        
        // 设置定期检查
        setInterval(checkUpcomingEvents, 5 * 60 * 1000); // 每5分钟检查一次
        
        console.log('通知系统设置完成');
    } catch (error) {
        console.error('通知系统设置失败:', error);
    }
}

/**
 * 检查即将到来的事件
 */
function checkUpcomingEvents() {
    try {
        const now = new Date();
        const reminderTime = calendarSettings.defaultReminder * 60 * 1000; // 转换为毫秒
        
        getAllEvents().forEach(event => {
            const eventTime = new Date(event.startTime);
            const timeDiff = eventTime - now;
            
            // 如果事件在提醒时间内且还没有发送通知
            if (timeDiff > 0 && timeDiff <= reminderTime && !event.notificationSent) {
                sendNotification(event);
                event.notificationSent = true;
            }
        });
        
    } catch (error) {
        console.error('检查即将到来的事件失败:', error);
    }
}

/**
 * 发送通知
 */
function sendNotification(event) {
    try {
        const notification = {
            _id: generateId(),
            title: '课程提醒',
            message: `${event.title} 将在 ${calendarSettings.defaultReminder} 分钟后开始`,
            type: event.type,
            timestamp: new Date(),
            isRead: false,
            eventId: event._id
        };
        
        notifications.unshift(notification);
        
        // 更新通知显示
        updateNotificationsDisplay();
        
        // 显示浏览器通知（如果用户允许）
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/images/logo.png'
            });
        }
        
        console.log('通知发送:', notification.message);
    } catch (error) {
        console.error('发送通知失败:', error);
    }
}

/**
 * 更新通知显示
 */
function updateNotificationsDisplay() {
    try {
        $w('#notificationsList').data = notifications.slice(0, 10); // 最多显示10个通知
        
        const unreadCount = notifications.filter(n => !n.isRead).length;
        $w('#notificationsBadge').text = unreadCount.toString();
        
        if (unreadCount > 0) {
            $w('#notificationsBadge').show();
        } else {
            $w('#notificationsBadge').hide();
        }
        
    } catch (error) {
        console.error('通知显示更新失败:', error);
    }
}

/**
 * 标记通知为已读
 */
function markNotificationRead(notificationId) {
    try {
        const notification = notifications.find(n => n._id === notificationId);
        if (notification) {
            notification.isRead = true;
            updateNotificationsDisplay();
        }
        
        console.log('通知标记为已读:', notificationId);
    } catch (error) {
        console.error('标记通知已读失败:', error);
    }
}

/**
 * 标记所有通知为已读
 */
function markAllNotificationsRead() {
    try {
        notifications.forEach(notification => {
            notification.isRead = true;
        });
        
        updateNotificationsDisplay();
        showMessage('所有通知已标记为已读', 'success');
        
        console.log('所有通知标记为已读');
    } catch (error) {
        console.error('标记所有通知已读失败:', error);
    }
}

/**
 * 清除所有通知
 */
function clearAllNotifications() {
    try {
        notifications = [];
        updateNotificationsDisplay();
        showMessage('所有通知已清除', 'success');
        
        console.log('所有通知已清除');
    } catch (error) {
        console.error('清除所有通知失败:', error);
    }
}

/**
 * 刷新课程表数据
 */
async function refreshScheduleData() {
    try {
        $w('#refreshButton').disable();
        $w('#refreshButton').label = '刷新中...';
        
        await loadScheduleData();
        
        showMessage('课程表数据已刷新', 'success');
        console.log('课程表数据刷新完成');
        
    } catch (error) {
        console.error('课程表数据刷新失败:', error);
        showMessage('数据刷新失败', 'error');
    } finally {
        $w('#refreshButton').enable();
        $w('#refreshButton').label = '刷新';
    }
}

/**
 * 处理打印课程表
 */
function handlePrintSchedule() {
    try {
        // 生成打印友好的HTML
        const printContent = generatePrintContent();
        
        // 创建新窗口进行打印
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        
        console.log('打印课程表');
    } catch (error) {
        console.error('打印课程表失败:', error);
        showMessage('打印失败', 'error');
    }
}

/**
 * 生成打印内容
 */
function generatePrintContent() {
    try {
        const events = getAllEvents();
        const currentWeekEvents = getEventsForWeek(selectedDate);
        
        let html = `
            <html>
            <head>
                <title>课程表 - ${formatDate(selectedDate, 'week')}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .schedule-table { width: 100%; border-collapse: collapse; }
                    .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .schedule-table th { background-color: #f2f2f2; }
                    .event { margin-bottom: 5px; padding: 3px; border-radius: 3px; }
                    .class { background-color: #e3f2fd; }
                    .assignment { background-color: #fff3e0; }
                    .exam { background-color: #ffebee; }
                    .event-type { background-color: #f3e5f5; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Purple Ruler Academy</h1>
                    <h2>学生课程表</h2>
                    <p>${formatDate(selectedDate, 'week')}</p>
                    <p>学生: ${currentUser.profile?.nickname || '学生'}</p>
                </div>
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>周一</th>
                            <th>周二</th>
                            <th>周三</th>
                            <th>周四</th>
                            <th>周五</th>
                            <th>周六</th>
                            <th>周日</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        // 生成时间槽
        const startHour = parseInt(calendarSettings.startTime.split(':')[0]);
        const endHour = parseInt(calendarSettings.endTime.split(':')[0]);
        
        for (let hour = startHour; hour < endHour; hour++) {
            html += `<tr><td>${hour}:00</td>`;
            
            // 为每一天生成单元格
            const weekDays = getWeekDays(selectedDate);
            weekDays.forEach(day => {
                const dayEvents = currentWeekEvents.filter(event => {
                    const eventDate = new Date(event.startTime);
                    const eventHour = eventDate.getHours();
                    return isSameDay(eventDate, day) && eventHour === hour;
                });
                
                html += '<td>';
                dayEvents.forEach(event => {
                    html += `<div class="event ${event.type}">${event.title}</div>`;
                });
                html += '</td>';
            });
            
            html += '</tr>';
        }
        
        html += `
                    </tbody>
                </table>
            </body>
            </html>`;
        
        return html;
    } catch (error) {
        console.error('生成打印内容失败:', error);
        return '<html><body><h1>生成打印内容失败</h1></body></html>';
    }
}

// ==================== 日期和时间工具函数 ====================

/**
 * 格式化日期
 */
function formatDate(date, format = 'default') {
    try {
        const options = {
            'default': { year: 'numeric', month: '2-digit', day: '2-digit' },
            'full': { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            'short': { month: 'short', day: 'numeric' },
            'weekday': { weekday: 'long', month: 'long', day: 'numeric' },
            'weekday-short': { weekday: 'short' },
            'month': { year: 'numeric', month: 'long' },
            'week': { year: 'numeric', month: 'long', day: 'numeric' },
            'filename': { year: 'numeric', month: '2-digit', day: '2-digit' },
            'relative': { year: 'numeric', month: 'short', day: 'numeric' }
        };
        
        const option = options[format] || options['default'];
        return new Intl.DateTimeFormat('zh-CN', option).format(date);
    } catch (error) {
        console.error('日期格式化失败:', error);
        return date.toString();
    }
}

/**
 * 格式化时间
 */
function formatTime(dateTime) {
    try {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('时间格式化失败:', error);
        return '';
    }
}

/**
 * 获取距离指定时间的时间差描述
 */
function getTimeUntil(dateTime) {
    try {
        const now = new Date();
        const target = new Date(dateTime);
        const diff = target - now;
        
        if (diff < 0) {
            return '已过期';
        }
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}天后`;
        } else if (hours > 0) {
            return `${hours}小时后`;
        } else if (minutes > 0) {
            return `${minutes}分钟后`;
        } else {
            return '即将开始';
        }
    } catch (error) {
        console.error('时间差计算失败:', error);
        return '';
    }
}

/**
 * 检查两个日期是否为同一天
 */
function isSameDay(date1, date2) {
    try {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    } catch (error) {
        console.error('日期比较失败:', error);
        return false;
    }
}

/**
 * 获取周的开始日期
 */
function getWeekStart(date) {
    try {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 周一为一周开始
        return new Date(d.setDate(diff));
    } catch (error) {
        console.error('获取周开始日期失败:', error);
        return new Date();
    }
}

/**
 * 获取周的结束日期
 */
function getWeekEnd(date) {
    try {
        const weekStart = getWeekStart(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return weekEnd;
    } catch (error) {
        console.error('获取周结束日期失败:', error);
        return new Date();
    }
}

/**
 * 获取一周的所有日期
 */
function getWeekDays(date) {
    try {
        const weekStart = getWeekStart(date);
        const days = [];
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }
        
        return days;
    } catch (error) {
        console.error('获取周日期失败:', error);
        return [];
    }
}

/**
 * 获取一个月的所有日期
 */
function getMonthDays(date) {
    try {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取第一周的开始日期（可能包含上个月的日期）
        const startDate = getWeekStart(firstDay);
        
        // 获取最后一周的结束日期（可能包含下个月的日期）
        const endDate = getWeekEnd(lastDay);
        
        const days = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    } catch (error) {
        console.error('获取月日期失败:', error);
        return [];
    }
}

/**
 * 生成唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 显示消息
 */
function showMessage(message, type = 'info') {
    try {
        const messageColors = {
            'success': '#28A745',
            'error': '#DC3545',
            'warning': '#FFC107',
            'info': '#17A2B8'
        };
        
        $w('#messageText').text = message;
        $w('#messageBar').style.backgroundColor = messageColors[type] || messageColors['info'];
        $w('#messageBar').show();
        
        // 3秒后自动隐藏
        setTimeout(() => {
            $w('#messageBar').hide();
        }, 3000);
        
        console.log(`消息显示 [${type}]:`, message);
    } catch (error) {
        console.error('消息显示失败:', error);
    }
}

// ==================== 自动刷新和缓存管理 ====================

/**
 * 设置自动刷新
 */
function setupAutoRefresh() {
    try {
        // 每30分钟自动刷新数据
        setInterval(async () => {
            console.log('执行自动数据刷新');
            await loadScheduleData();
        }, 30 * 60 * 1000);
        
        console.log('自动刷新设置完成');
    } catch (error) {
        console.error('自动刷新设置失败:', error);
    }
}

/**
 * 缓存管理
 */
function manageCacheData() {
    try {
        // 清理过期的缓存数据
        const cacheKeys = ['scheduleData', 'userPreferences', 'notifications'];
        
        cacheKeys.forEach(key => {
            const cachedData = local.getItem(key);
            if (cachedData) {
                const data = JSON.parse(cachedData);
                const cacheTime = new Date(data.timestamp);
                const now = new Date();
                const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
                
                // 如果缓存超过24小时，则清除
                if (hoursDiff > 24) {
                    local.removeItem(key);
                    console.log('清除过期缓存:', key);
                }
            }
        });
        
        console.log('缓存管理完成');
    } catch (error) {
        console.error('缓存管理失败:', error);
    }
}

// ==================== 分析和跟踪 ====================

/**
 * 跟踪用户行为
 */
function trackUserAction(action, details = {}) {
    try {
        const trackingData = {
            userId: currentUser?._id,
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            page: 'student-schedule'
        };
        
        // 这里可以发送到分析服务
        console.log('用户行为跟踪:', trackingData);
        
        // 保存到本地存储用于离线分析
        const existingTracking = local.getItem('userTracking') || '[]';
        const trackingArray = JSON.parse(existingTracking);
        trackingArray.push(trackingData);
        
        // 只保留最近100条记录
        if (trackingArray.length > 100) {
            trackingArray.splice(0, trackingArray.length - 100);
        }
        
        local.setItem('userTracking', JSON.stringify(trackingArray));
        
    } catch (error) {
        console.error('用户行为跟踪失败:', error);
    }
}

/**
 * 发送使用统计
 */
async function sendUsageStatistics() {
    try {
        const stats = {
            userId: currentUser?._id,
            sessionDuration: Date.now() - sessionStartTime,
            viewSwitches: viewSwitchCount,
            eventsViewed: eventsViewedCount,
            searchesPerformed: searchCount,
            timestamp: new Date().toISOString()
        };
        
        // 发送统计数据到服务器
        await wixData.save('UsageStatistics', stats);
        
        console.log('使用统计发送完成');
    } catch (error) {
        console.error('使用统计发送失败:', error);
    }
}

// ==================== 页面生命周期管理 ====================

// 页面加载完成后的初始化
$w.onReady(() => {
    setupAutoRefresh();
    manageCacheData();
    
    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // 记录会话开始时间
    sessionStartTime = Date.now();
    
    // 设置页面卸载时的清理
    window.addEventListener('beforeunload', () => {
        saveUserPreferences();
        sendUsageStatistics();
    });
});

// 全局变量用于统计
let sessionStartTime = 0;
let viewSwitchCount = 0;
let eventsViewedCount = 0;
let searchCount = 0;

console.log('Purple Ruler Academy 学生课程表页面代码加载完成');