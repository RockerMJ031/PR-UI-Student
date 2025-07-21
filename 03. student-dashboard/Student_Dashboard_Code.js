/**
 * Wix Student Dashboard - Complete Velo JavaScript Code
 * 学生仪表盘页面 - 完整的Wix Velo代码实现
 * 
 * 项目描述：
 * 这是一个为学生设计的综合仪表盘页面，提供学习进度概览、快速操作、
 * 课程管理、通知系统等功能。页面采用响应式设计，支持桌面和移动设备。
 * 
 * 主要功能：
 * - 学生个人信息展示
 * - 学习统计数据（课程数量、待办任务、出勤率）
 * - 快速操作卡片（提交作业、访问资源、健康检查、安全报告）
 * - 即将到来的课程列表
 * - 通知和更新系统
 * - 响应式导航菜单
 * 
 * 技术栈：
 * - Wix Velo (JavaScript)
 * - Wix Database Collections
 * - Wix HTTP Functions
 * - External APIs (Lark, Google Analytics)
 */

// ==================== 模块导入 ====================
import { local, session } from 'wix-storage-frontend';
import { authentication } from 'wix-members-frontend';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { fetch } from 'wix-fetch';
import { timeline } from 'wix-animations';

// ==================== 全局变量定义 ====================
let currentUser = null;           // 当前登录用户信息
let studentData = null;           // 学生详细数据
let coursesData = [];             // 课程数据数组
let notificationsData = [];       // 通知数据数组
let refreshInterval = null;       // 自动刷新定时器
let isLoading = false;            // 加载状态标识
let isMobileView = false;         // 移动端视图标识

// 防抖函数配置
const DEBOUNCE_DELAY = 300;
let debounceTimers = {};

// 缓存配置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
const cacheData = {
    student: { data: null, timestamp: 0 },
    courses: { data: null, timestamp: 0 },
    notifications: { data: null, timestamp: 0 }
};

// ==================== 页面初始化 ====================
$w.onReady(async function () {
    console.log('学生仪表盘页面初始化开始');
    
    try {
        // 显示加载状态
        showLoadingState();
        
        // 检查用户认证状态
        await checkAuthentication();
        
        // 设置事件处理器
        setupEventHandlers();
        
        // 检测设备类型
        detectDeviceType();
        
        // 加载页面数据
        await loadPageData();
        
        // 设置自动刷新
        setupAutoRefresh();
        
        // 隐藏加载状态
        hideLoadingState();
        
        console.log('学生仪表盘页面初始化完成');
        
        // 发送页面访问分析事件
        trackPageView();
        
    } catch (error) {
        console.error('页面初始化失败:', error);
        showErrorMessage('页面加载失败，请刷新重试');
        hideLoadingState();
    }
});

// ==================== 事件处理器设置 ====================
function setupEventHandlers() {
    console.log('设置事件处理器');
    
    // 导航菜单事件
    setupNavigationEvents();
    
    // 快速操作卡片事件
    setupQuickActionEvents();
    
    // 课程相关事件
    setupCourseEvents();
    
    // 通知相关事件
    setupNotificationEvents();
    
    // 响应式设计事件
    setupResponsiveEvents();
    
    // 用户交互事件
    setupUserInteractionEvents();
}

// 导航菜单事件设置
function setupNavigationEvents() {
    // 移动端菜单切换
    if ($w('#mobileMenuBtn')) {
        $w('#mobileMenuBtn').onClick(() => {
            toggleMobileMenu();
        });
    }
    
    // 导航链接点击事件
    if ($w('#navRepeater')) {
        $w('#navRepeater').onItemReady(($item, itemData) => {
            $item('#navLink').onClick(() => {
                navigateToPage(itemData.url);
                trackNavigation(itemData.title);
            });
        });
    }
    
    // 用户资料点击事件
    if ($w('#userProfileContainer')) {
        $w('#userProfileContainer').onClick(() => {
            openUserProfileLightbox();
        });
    }
}

// 快速操作事件设置
function setupQuickActionEvents() {
    // 提交作业按钮
    if ($w('#submitAssignmentBtn')) {
        $w('#submitAssignmentBtn').onClick(() => {
            debounce('submitAssignment', () => {
                handleSubmitAssignment();
            });
        });
    }
    
    // 资源文件夹按钮
    if ($w('#resourcesBtn')) {
        $w('#resourcesBtn').onClick(() => {
            navigateToPage('/student-resources');
            trackQuickAction('Resources Access');
        });
    }
    
    // 健康检查按钮
    if ($w('#wellbeingBtn')) {
        $w('#wellbeingBtn').onClick(() => {
            handleWellbeingCheck();
        });
    }
    
    // 安全报告按钮
    if ($w('#safeguardingBtn')) {
        $w('#safeguardingBtn').onClick(() => {
            handleSafeguardingReport();
        });
    }
}

// 课程相关事件设置
function setupCourseEvents() {
    if ($w('#coursesRepeater')) {
        $w('#coursesRepeater').onItemReady(($item, itemData) => {
            // 加入课程按钮
            $item('#joinCourseBtn').onClick(() => {
                debounce(`joinCourse_${itemData._id}`, () => {
                    handleJoinCourse(itemData);
                });
            });
            
            // 课程详情点击
            $item('#courseCard').onClick(() => {
                viewCourseDetails(itemData);
            });
        });
    }
}

// 通知相关事件设置
function setupNotificationEvents() {
    // 通知图标点击
    if ($w('#notificationIcon')) {
        $w('#notificationIcon').onClick(() => {
            toggleNotificationPanel();
        });
    }
    
    // 通知列表事件
    if ($w('#notificationsRepeater')) {
        $w('#notificationsRepeater').onItemReady(($item, itemData) => {
            $item('#notificationItem').onClick(() => {
                handleNotificationClick(itemData);
            });
            
            // 标记为已读按钮
            if ($item('#markReadBtn')) {
                $item('#markReadBtn').onClick(() => {
                    markNotificationAsRead(itemData._id);
                });
            }
        });
    }
}

// 响应式设计事件设置
function setupResponsiveEvents() {
    // 窗口大小变化监听
    wixWindow.viewportEnter('mobile', () => {
        isMobileView = true;
        adaptToMobileView();
    });
    
    wixWindow.viewportLeave('mobile', () => {
        isMobileView = false;
        adaptToDesktopView();
    });
}

// 用户交互事件设置
function setupUserInteractionEvents() {
    // 紧急按钮
    if ($w('#emergencyBtn')) {
        $w('#emergencyBtn').onClick(() => {
            handleEmergencyAction();
        });
    }
    
    // 反馈按钮
    if ($w('#feedbackBtn')) {
        $w('#feedbackBtn').onClick(() => {
            openFeedbackForm();
        });
    }
    
    // 刷新按钮
    if ($w('#refreshBtn')) {
        $w('#refreshBtn').onClick(() => {
            debounce('refreshData', () => {
                refreshPageData();
            });
        });
    }
}

// ==================== 认证和安全检查 ====================
async function checkAuthentication() {
    console.log('检查用户认证状态');
    
    try {
        // 检查用户是否已登录
        const isLoggedIn = authentication.loggedIn();
        
        if (!isLoggedIn) {
            console.log('用户未登录，重定向到登录页面');
            wixLocation.to('/login');
            return;
        }
        
        // 获取当前用户信息
        currentUser = await authentication.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('无法获取用户信息');
        }
        
        console.log('用户认证成功:', currentUser.id);
        
        // 验证用户角色
        await validateUserRole();
        
    } catch (error) {
        console.error('认证检查失败:', error);
        showErrorMessage('认证失败，请重新登录');
        setTimeout(() => {
            wixLocation.to('/login');
        }, 2000);
    }
}

// 验证用户角色
async function validateUserRole() {
    try {
        const userProfile = await wixData.query('UserProfiles')
            .eq('userId', currentUser.id)
            .find();
        
        if (userProfile.items.length === 0) {
            throw new Error('用户资料不存在');
        }
        
        const profile = userProfile.items[0];
        
        if (profile.role !== 'student') {
            console.log('用户角色不匹配，重定向到相应页面');
            redirectBasedOnRole(profile.role);
            return;
        }
        
        console.log('用户角色验证通过');
        
    } catch (error) {
        console.error('角色验证失败:', error);
        throw error;
    }
}

// 根据角色重定向
function redirectBasedOnRole(role) {
    const roleRedirects = {
        'mentor': '/mentor-dashboard',
        'admin': '/admin-dashboard',
        'parent': '/parent-dashboard'
    };
    
    const redirectUrl = roleRedirects[role] || '/unauthorized';
    wixLocation.to(redirectUrl);
}

// ==================== 数据加载和管理 ====================
async function loadPageData() {
    console.log('开始加载页面数据');
    
    try {
        // 并行加载所有数据
        const [studentInfo, coursesInfo, notificationsInfo] = await Promise.all([
            loadStudentData(),
            loadCoursesData(),
            loadNotificationsData()
        ]);
        
        // 更新UI
        await updateUI();
        
        console.log('页面数据加载完成');
        
    } catch (error) {
        console.error('数据加载失败:', error);
        showErrorMessage('数据加载失败，请稍后重试');
    }
}

// 加载学生数据
async function loadStudentData() {
    console.log('加载学生数据');
    
    try {
        // 检查缓存
        if (isCacheValid('student')) {
            studentData = cacheData.student.data;
            console.log('使用缓存的学生数据');
            return studentData;
        }
        
        // 从数据库查询学生信息
        const studentQuery = await wixData.query('Students')
            .eq('userId', currentUser.id)
            .include('courses')
            .find();
        
        if (studentQuery.items.length === 0) {
            throw new Error('学生信息不存在');
        }
        
        studentData = studentQuery.items[0];
        
        // 更新缓存
        updateCache('student', studentData);
        
        console.log('学生数据加载成功');
        return studentData;
        
    } catch (error) {
        console.error('学生数据加载失败:', error);
        throw error;
    }
}

// 加载课程数据
async function loadCoursesData() {
    console.log('加载课程数据');
    
    try {
        // 检查缓存
        if (isCacheValid('courses')) {
            coursesData = cacheData.courses.data;
            console.log('使用缓存的课程数据');
            return coursesData;
        }
        
        if (!studentData) {
            await loadStudentData();
        }
        
        // 查询学生的课程
        const coursesQuery = await wixData.query('Courses')
            .hasSome('enrolledStudents', [studentData._id])
            .eq('status', 'active')
            .ascending('startTime')
            .limit(10)
            .find();
        
        coursesData = coursesQuery.items;
        
        // 更新缓存
        updateCache('courses', coursesData);
        
        console.log(`课程数据加载成功，共${coursesData.length}门课程`);
        return coursesData;
        
    } catch (error) {
        console.error('课程数据加载失败:', error);
        throw error;
    }
}

// 加载通知数据
async function loadNotificationsData() {
    console.log('加载通知数据');
    
    try {
        // 检查缓存
        if (isCacheValid('notifications')) {
            notificationsData = cacheData.notifications.data;
            console.log('使用缓存的通知数据');
            return notificationsData;
        }
        
        // 查询学生的通知
        const notificationsQuery = await wixData.query('Notifications')
            .eq('recipientId', currentUser.id)
            .eq('recipientType', 'student')
            .descending('createdDate')
            .limit(20)
            .find();
        
        notificationsData = notificationsQuery.items;
        
        // 更新缓存
        updateCache('notifications', notificationsData);
        
        console.log(`通知数据加载成功，共${notificationsData.length}条通知`);
        return notificationsData;
        
    } catch (error) {
        console.error('通知数据加载失败:', error);
        throw error;
    }
}

// ==================== UI更新函数 ====================
async function updateUI() {
    console.log('更新用户界面');
    
    try {
        // 更新用户信息
        updateUserProfile();
        
        // 更新统计数据
        updateStatistics();
        
        // 更新课程列表
        updateCoursesList();
        
        // 更新通知
        updateNotifications();
        
        // 更新导航状态
        updateNavigationState();
        
        console.log('UI更新完成');
        
    } catch (error) {
        console.error('UI更新失败:', error);
    }
}

// 更新用户资料显示
function updateUserProfile() {
    if (!studentData) return;
    
    try {
        // 更新用户姓名
        if ($w('#userNameText')) {
            $w('#userNameText').text = studentData.firstName + ' ' + studentData.lastName;
        }
        
        // 更新欢迎消息
        if ($w('#welcomeText')) {
            const currentHour = new Date().getHours();
            let greeting = '早上好';
            
            if (currentHour >= 12 && currentHour < 18) {
                greeting = '下午好';
            } else if (currentHour >= 18) {
                greeting = '晚上好';
            }
            
            $w('#welcomeText').text = `${greeting}, ${studentData.firstName}!`;
        }
        
        // 更新用户头像
        if ($w('#userAvatar') && studentData.profileImage) {
            $w('#userAvatar').src = studentData.profileImage;
        }
        
        // 更新学生ID
        if ($w('#studentIdText')) {
            $w('#studentIdText').text = `学号: ${studentData.studentId}`;
        }
        
        console.log('用户资料更新完成');
        
    } catch (error) {
        console.error('用户资料更新失败:', error);
    }
}

// 更新统计数据
function updateStatistics() {
    try {
        // 活跃课程数量
        const activeCourses = coursesData.length;
        if ($w('#activeCoursesValue')) {
            $w('#activeCoursesValue').text = activeCourses.toString();
        }
        
        // 待办任务数量
        const pendingTasks = calculatePendingTasks();
        if ($w('#pendingTasksValue')) {
            $w('#pendingTasksValue').text = pendingTasks.toString();
        }
        
        // 出勤率
        const attendanceRate = calculateAttendanceRate();
        if ($w('#attendanceRateValue')) {
            $w('#attendanceRateValue').text = `${attendanceRate}%`;
        }
        
        // 更新统计卡片颜色
        updateStatCardColors(activeCourses, pendingTasks, attendanceRate);
        
        console.log('统计数据更新完成');
        
    } catch (error) {
        console.error('统计数据更新失败:', error);
    }
}

// 计算待办任务数量
function calculatePendingTasks() {
    if (!studentData || !studentData.assignments) return 0;
    
    return studentData.assignments.filter(assignment => 
        assignment.status === 'pending' || assignment.status === 'in_progress'
    ).length;
}

// 计算出勤率
function calculateAttendanceRate() {
    if (!studentData || !studentData.attendanceRecords) return 0;
    
    const records = studentData.attendanceRecords;
    if (records.length === 0) return 0;
    
    const presentCount = records.filter(record => record.status === 'present').length;
    return Math.round((presentCount / records.length) * 100);
}

// 更新统计卡片颜色
function updateStatCardColors(courses, tasks, attendance) {
    // 根据数值设置不同的颜色主题
    if ($w('#activeCoursesCard')) {
        $w('#activeCoursesCard').style.backgroundColor = courses > 5 ? '#e3f2fd' : '#f3e5f5';
    }
    
    if ($w('#pendingTasksCard')) {
        const taskColor = tasks > 10 ? '#ffebee' : tasks > 5 ? '#fff3e0' : '#e8f5e8';
        $w('#pendingTasksCard').style.backgroundColor = taskColor;
    }
    
    if ($w('#attendanceCard')) {
        const attendanceColor = attendance >= 90 ? '#e8f5e8' : attendance >= 75 ? '#fff3e0' : '#ffebee';
        $w('#attendanceCard').style.backgroundColor = attendanceColor;
    }
}

// 更新课程列表
function updateCoursesList() {
    if (!$w('#coursesRepeater')) return;
    
    try {
        // 过滤即将到来的课程
        const upcomingCourses = coursesData.filter(course => {
            const courseDate = new Date(course.startTime);
            const now = new Date();
            const timeDiff = courseDate.getTime() - now.getTime();
            return timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000; // 7天内
        }).slice(0, 5); // 最多显示5门课程
        
        // 为每门课程添加格式化信息
        const formattedCourses = upcomingCourses.map(course => ({
            ...course,
            formattedDate: formatDate(course.startTime),
            formattedTime: formatTime(course.startTime),
            statusColor: getCourseStatusColor(course.status)
        }));
        
        // 更新repeater数据
        $w('#coursesRepeater').data = formattedCourses;
        
        // 显示或隐藏空状态
        if (formattedCourses.length === 0) {
            showEmptyCoursesState();
        } else {
            hideEmptyCoursesState();
        }
        
        console.log(`课程列表更新完成，显示${formattedCourses.length}门课程`);
        
    } catch (error) {
        console.error('课程列表更新失败:', error);
    }
}



// 获取课程状态颜色
function getCourseStatusColor(status) {
    const statusColors = {
        'active': '#4caf50',
        'upcoming': '#ff9800',
        'completed': '#2196f3',
        'cancelled': '#f44336'
    };
    
    return statusColors[status] || '#9e9e9e';
}

// 显示空课程状态
function showEmptyCoursesState() {
    if ($w('#emptyCoursesMessage')) {
        $w('#emptyCoursesMessage').show();
    }
    if ($w('#coursesContainer')) {
        $w('#coursesContainer').hide();
    }
}

// 隐藏空课程状态
function hideEmptyCoursesState() {
    if ($w('#emptyCoursesMessage')) {
        $w('#emptyCoursesMessage').hide();
    }
    if ($w('#coursesContainer')) {
        $w('#coursesContainer').show();
    }
}

// 更新通知
function updateNotifications() {
    if (!$w('#notificationsRepeater')) return;
    
    try {
        // 过滤最近的通知
        const recentNotifications = notificationsData.slice(0, 10);
        
        // 格式化通知数据
        const formattedNotifications = recentNotifications.map(notification => ({
            ...notification,
            formattedDate: formatRelativeTime(notification.createdDate),
            priorityColor: getNotificationPriorityColor(notification.priority),
            isUnread: !notification.isRead
        }));
        
        // 更新repeater数据
        $w('#notificationsRepeater').data = formattedNotifications;
        
        // 更新通知计数
        updateNotificationCount();
        
        console.log(`通知更新完成，显示${formattedNotifications.length}条通知`);
        
    } catch (error) {
        console.error('通知更新失败:', error);
    }
}

// 获取通知优先级颜色
function getNotificationPriorityColor(priority) {
    const priorityColors = {
        'high': '#f44336',
        'medium': '#ff9800',
        'low': '#4caf50'
    };
    
    return priorityColors[priority] || '#9e9e9e';
}

// 更新通知计数
function updateNotificationCount() {
    const unreadCount = notificationsData.filter(n => !n.isRead).length;
    
    if ($w('#notificationBadge')) {
        if (unreadCount > 0) {
            $w('#notificationBadge').text = unreadCount > 99 ? '99+' : unreadCount.toString();
            $w('#notificationBadge').show();
        } else {
            $w('#notificationBadge').hide();
        }
    }
}

// 更新导航状态
function updateNavigationState() {
    if (!$w('#navRepeater')) return;
    
    try {
        const navItems = [
            { title: "Dashboard", icon: "fas fa-tachometer-alt", url: "/student-dashboard", active: true },
            { title: "My Courses", icon: "fas fa-book", url: "/student-courses", active: false },
            { title: "Schedule", icon: "fas fa-calendar-alt", url: "/student-schedule", active: false },
            { title: "Resources", icon: "fas fa-folder-open", url: "/student-resources", active: false },
            { title: "Wellbeing", icon: "fas fa-heart", url: "/student-wellbeing", active: false },
            { title: "Safeguarding", icon: "fas fa-shield-alt", url: "/student-safeguarding", active: false },
            { title: "Get Support", icon: "fas fa-hands-helping", url: "/student-support", active: false }
        ];
        
        $w('#navRepeater').data = navItems;
        
        console.log('导航状态更新完成');
        
    } catch (error) {
        console.error('导航状态更新失败:', error);
    }
}

// ==================== 快速操作处理 ====================
// 处理提交作业
async function handleSubmitAssignment() {
    console.log('处理提交作业操作');
    
    try {
        // 检查是否有待提交的作业
        const pendingAssignments = await wixData.query('Assignments')
            .eq('studentId', studentData._id)
            .eq('status', 'pending')
            .find();
        
        if (pendingAssignments.items.length === 0) {
            showMessage('暂无待提交的作业', 'info');
            return;
        }
        
        // 打开作业提交页面
        wixLocation.to('/student-assignments');
        
        // 跟踪操作
        trackQuickAction('Submit Assignment');
        
    } catch (error) {
        console.error('提交作业操作失败:', error);
        showErrorMessage('操作失败，请稍后重试');
    }
}

// 处理健康检查
async function handleWellbeingCheck() {
    console.log('处理健康检查操作');
    
    try {
        // 打开健康检查表单
        const larkFormUrl = 'https://example.larksuite.com/wellbeing-form';
        wixWindow.openLightbox('WellbeingFormLightbox', { formUrl: larkFormUrl });
        
        // 跟踪操作
        trackQuickAction('Wellbeing Check');
        
    } catch (error) {
        console.error('健康检查操作失败:', error);
        showErrorMessage('操作失败，请稍后重试');
    }
}

// 处理安全报告
async function handleSafeguardingReport() {
    console.log('处理安全报告操作');
    
    try {
        // 打开安全报告表单
        const larkFormUrl = 'https://example.larksuite.com/safeguarding-form';
        wixWindow.openLightbox('SafeguardingFormLightbox', { formUrl: larkFormUrl });
        
        // 跟踪操作
        trackQuickAction('Safeguarding Report');
        
    } catch (error) {
        console.error('安全报告操作失败:', error);
        showErrorMessage('操作失败，请稍后重试');
    }
}

// ==================== 课程操作处理 ====================
// 处理加入课程
async function handleJoinCourse(courseData) {
    console.log('处理加入课程操作:', courseData.title);
    
    try {
        // 检查课程是否即将开始
        const courseStartTime = new Date(courseData.startTime);
        const now = new Date();
        const timeDiff = courseStartTime.getTime() - now.getTime();
        
        if (timeDiff > 15 * 60 * 1000) { // 15分钟前
            showMessage('课程尚未开始，请在开始前15分钟加入', 'warning');
            return;
        }
        
        if (timeDiff < -30 * 60 * 1000) { // 30分钟后
            showMessage('课程已结束', 'info');
            return;
        }
        
        // 打开课程链接
        if (courseData.meetingUrl) {
            wixWindow.openLightbox('CourseMeetingLightbox', {
                meetingUrl: courseData.meetingUrl,
                courseTitle: courseData.title
            });
        } else {
            showErrorMessage('课程链接不可用');
        }
        
        // 记录出勤
        await recordAttendance(courseData._id);
        
        // 跟踪操作
        trackCourseAction('Join Course', courseData.title);
        
    } catch (error) {
        console.error('加入课程失败:', error);
        showErrorMessage('加入课程失败，请稍后重试');
    }
}

// 记录出勤
async function recordAttendance(courseId) {
    try {
        const attendanceRecord = {
            studentId: studentData._id,
            courseId: courseId,
            date: new Date(),
            status: 'present',
            joinTime: new Date()
        };
        
        await wixData.insert('AttendanceRecords', attendanceRecord);
        console.log('出勤记录已保存');
        
    } catch (error) {
        console.error('出勤记录保存失败:', error);
    }
}

// 查看课程详情
function viewCourseDetails(courseData) {
    console.log('查看课程详情:', courseData.title);
    
    try {
        wixWindow.openLightbox('CourseDetailsLightbox', {
            courseId: courseData._id,
            courseData: courseData
        });
        
        // 跟踪操作
        trackCourseAction('View Details', courseData.title);
        
    } catch (error) {
        console.error('查看课程详情失败:', error);
        showErrorMessage('无法查看课程详情');
    }
}

// ==================== 通知处理 ====================
// 处理通知点击
async function handleNotificationClick(notificationData) {
    console.log('处理通知点击:', notificationData.title);
    
    try {
        // 标记为已读
        if (!notificationData.isRead) {
            await markNotificationAsRead(notificationData._id);
        }
        
        // 根据通知类型执行相应操作
        switch (notificationData.type) {
            case 'assignment':
                wixLocation.to('/student-assignments');
                break;
            case 'course':
                wixLocation.to('/student-courses');
                break;
            case 'announcement':
                showNotificationDetails(notificationData);
                break;
            default:
                showNotificationDetails(notificationData);
        }
        
        // 跟踪操作
        trackNotificationAction('Click', notificationData.type);
        
    } catch (error) {
        console.error('通知点击处理失败:', error);
    }
}

// 标记通知为已读
async function markNotificationAsRead(notificationId) {
    try {
        await wixData.update('Notifications', {
            _id: notificationId,
            isRead: true,
            readDate: new Date()
        });
        
        // 更新本地数据
        const notification = notificationsData.find(n => n._id === notificationId);
        if (notification) {
            notification.isRead = true;
            notification.readDate = new Date();
        }
        
        // 更新UI
        updateNotificationCount();
        
        console.log('通知已标记为已读');
        
    } catch (error) {
        console.error('标记通知为已读失败:', error);
    }
}

// 显示通知详情
function showNotificationDetails(notificationData) {
    wixWindow.openLightbox('NotificationDetailsLightbox', {
        notificationData: notificationData
    });
}

// 切换通知面板
function toggleNotificationPanel() {
    if ($w('#notificationPanel')) {
        const isVisible = $w('#notificationPanel').isVisible;
        
        if (isVisible) {
            $w('#notificationPanel').hide('fade');
        } else {
            $w('#notificationPanel').show('fade');
        }
    }
}

// ==================== 响应式设计处理 ====================
// 检测设备类型
function detectDeviceType() {
    const screenWidth = wixWindow.formFactor;
    isMobileView = screenWidth === 'Mobile';
    
    console.log('设备类型:', isMobileView ? '移动端' : '桌面端');
    
    if (isMobileView) {
        adaptToMobileView();
    } else {
        adaptToDesktopView();
    }
}

// 适配移动端视图
function adaptToMobileView() {
    console.log('适配移动端视图');
    
    try {
        // 调整侧边栏
        if ($w('#sidebarContainer')) {
            $w('#sidebarContainer').hide();
        }
        
        // 显示移动端菜单按钮
        if ($w('#mobileMenuBtn')) {
            $w('#mobileMenuBtn').show();
        }
        
        // 调整快速操作网格
        if ($w('#quickActionsContainer')) {
            $w('#quickActionsContainer').style.gridTemplateColumns = '1fr';
        }
        
        // 调整统计卡片网格
        if ($w('#statsContainer')) {
            $w('#statsContainer').style.gridTemplateColumns = '1fr';
        }
        
        // 调整内容网格
        if ($w('#contentGrid')) {
            $w('#contentGrid').style.gridTemplateColumns = '1fr';
        }
        
    } catch (error) {
        console.error('移动端适配失败:', error);
    }
}

// 适配桌面端视图
function adaptToDesktopView() {
    console.log('适配桌面端视图');
    
    try {
        // 显示侧边栏
        if ($w('#sidebarContainer')) {
            $w('#sidebarContainer').show();
        }
        
        // 隐藏移动端菜单按钮
        if ($w('#mobileMenuBtn')) {
            $w('#mobileMenuBtn').hide();
        }
        
        // 恢复桌面端网格布局
        if ($w('#quickActionsContainer')) {
            $w('#quickActionsContainer').style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
        
        if ($w('#statsContainer')) {
            $w('#statsContainer').style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
        
        if ($w('#contentGrid')) {
            $w('#contentGrid').style.gridTemplateColumns = '2fr 1fr';
        }
        
    } catch (error) {
        console.error('桌面端适配失败:', error);
    }
}

// 切换移动端菜单
function toggleMobileMenu() {
    if ($w('#sidebarContainer')) {
        const isVisible = $w('#sidebarContainer').isVisible;
        
        if (isVisible) {
            $w('#sidebarContainer').hide('slide', { direction: 'left' });
        } else {
            $w('#sidebarContainer').show('slide', { direction: 'left' });
        }
    }
}

// ==================== 工具函数 ====================
// 防抖函数
function debounce(key, func, delay = DEBOUNCE_DELAY) {
    if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
    }
    
    debounceTimers[key] = setTimeout(() => {
        func();
        delete debounceTimers[key];
    }, delay);
}

// 日期格式化
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    };
    
    return date.toLocaleDateString('zh-CN', options);
}

// 时间格式化
function formatTime(dateString) {
    const date = new Date(dateString);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    
    return date.toLocaleTimeString('zh-CN', options);
}

// 相对时间格式化
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return '刚刚';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}小时前`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}天前`;
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    console.log(`显示消息 [${type}]: ${message}`);
    
    if ($w('#messageBar')) {
        $w('#messageBar').text = message;
        $w('#messageBar').style.backgroundColor = getMessageColor(type);
        $w('#messageBar').show('fade');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            if ($w('#messageBar')) {
                $w('#messageBar').hide('fade');
            }
        }, 3000);
    }
}

// 显示错误消息
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// 获取消息颜色
function getMessageColor(type) {
    const colors = {
        'info': '#2196f3',
        'success': '#4caf50',
        'warning': '#ff9800',
        'error': '#f44336'
    };
    
    return colors[type] || colors.info;
}

// 显示加载状态
function showLoadingState() {
    isLoading = true;
    
    if ($w('#loadingOverlay')) {
        $w('#loadingOverlay').show();
    }
    
    if ($w('#loadingSpinner')) {
        $w('#loadingSpinner').show();
    }
}

// 隐藏加载状态
function hideLoadingState() {
    isLoading = false;
    
    if ($w('#loadingOverlay')) {
        $w('#loadingOverlay').hide();
    }
    
    if ($w('#loadingSpinner')) {
        $w('#loadingSpinner').hide();
    }
}

// 页面导航
function navigateToPage(url) {
    console.log('导航到页面:', url);
    wixLocation.to(url);
}

// ==================== 缓存管理 ====================
// 检查缓存是否有效
function isCacheValid(key) {
    const cache = cacheData[key];
    if (!cache || !cache.data) return false;
    
    const now = Date.now();
    return (now - cache.timestamp) < CACHE_DURATION;
}

// 更新缓存
function updateCache(key, data) {
    cacheData[key] = {
        data: data,
        timestamp: Date.now()
    };
}

// 清除缓存
function clearCache(key = null) {
    if (key) {
        cacheData[key] = { data: null, timestamp: 0 };
    } else {
        Object.keys(cacheData).forEach(k => {
            cacheData[k] = { data: null, timestamp: 0 };
        });
    }
}

// ==================== 自动刷新和数据同步 ====================
// 设置自动刷新
function setupAutoRefresh() {
    // 每5分钟自动刷新数据
    refreshInterval = setInterval(() => {
        if (!isLoading) {
            refreshPageData();
        }
    }, 5 * 60 * 1000);
    
    console.log('自动刷新已设置');
}

// 刷新页面数据
async function refreshPageData() {
    console.log('刷新页面数据');
    
    try {
        // 清除缓存
        clearCache();
        
        // 重新加载数据
        await loadPageData();
        
        showMessage('数据已更新', 'success');
        
    } catch (error) {
        console.error('数据刷新失败:', error);
    }
}

// ==================== 第三方集成 ====================
// 打开反馈表单
function openFeedbackForm() {
    const larkFormUrl = 'https://example.larksuite.com/feedback-form';
    wixWindow.openLightbox('FeedbackFormLightbox', { formUrl: larkFormUrl });
    
    trackQuickAction('Feedback Form');
}

// 打开用户资料Lightbox
function openUserProfileLightbox() {
    wixWindow.openLightbox('UserProfileLightbox', {
        studentData: studentData
    });
}

// 处理紧急操作
function handleEmergencyAction() {
    console.log('处理紧急操作');
    
    // 打开紧急联系表单
    const emergencyFormUrl = 'https://example.larksuite.com/emergency-form';
    wixWindow.openLightbox('EmergencyFormLightbox', { formUrl: emergencyFormUrl });
    
    // 发送紧急通知
    sendEmergencyNotification();
    
    trackQuickAction('Emergency Action');
}

// 发送紧急通知
async function sendEmergencyNotification() {
    try {
        const notificationData = {
            studentId: studentData._id,
            type: 'emergency',
            timestamp: new Date(),
            message: '学生触发了紧急按钮'
        };
        
        // 调用后端API发送通知
        await fetch('/api/emergency-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notificationData)
        });
        
        console.log('紧急通知已发送');
        
    } catch (error) {
        console.error('紧急通知发送失败:', error);
    }
}

// ==================== 分析和跟踪 ====================
// 跟踪页面访问
function trackPageView() {
    try {
        // Google Analytics 事件跟踪
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Student Dashboard',
                page_location: wixLocation.url,
                user_id: currentUser.id
            });
        }
        
        console.log('页面访问已跟踪');
        
    } catch (error) {
        console.error('页面访问跟踪失败:', error);
    }
}

// 跟踪导航操作
function trackNavigation(pageName) {
    try {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'navigation', {
                event_category: 'User Interaction',
                event_label: pageName,
                user_id: currentUser.id
            });
        }
        
        console.log('导航操作已跟踪:', pageName);
        
    } catch (error) {
        console.error('导航跟踪失败:', error);
    }
}

// 跟踪快速操作
function trackQuickAction(actionName) {
    try {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quick_action', {
                event_category: 'User Interaction',
                event_label: actionName,
                user_id: currentUser.id
            });
        }
        
        console.log('快速操作已跟踪:', actionName);
        
    } catch (error) {
        console.error('快速操作跟踪失败:', error);
    }
}

// 跟踪课程操作
function trackCourseAction(actionType, courseName) {
    try {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'course_action', {
                event_category: 'Course Interaction',
                event_label: `${actionType}: ${courseName}`,
                user_id: currentUser.id
            });
        }
        
        console.log('课程操作已跟踪:', actionType, courseName);
        
    } catch (error) {
        console.error('课程操作跟踪失败:', error);
    }
}

// 跟踪通知操作
function trackNotificationAction(actionType, notificationType) {
    try {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'notification_action', {
                event_category: 'Notification Interaction',
                event_label: `${actionType}: ${notificationType}`,
                user_id: currentUser.id
            });
        }
        
        console.log('通知操作已跟踪:', actionType, notificationType);
        
    } catch (error) {
        console.error('通知操作跟踪失败:', error);
    }
}

// ==================== 页面卸载清理 ====================
$w.onReady(() => {
    // 页面卸载时清理资源
    wixWindow.onBeforeUnload(() => {
        console.log('页面即将卸载，清理资源');
        
        // 清除定时器
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        // 清除防抖定时器
        Object.keys(debounceTimers).forEach(key => {
            clearTimeout(debounceTimers[key]);
        });
        
        // 清除缓存
        clearCache();
        
        console.log('资源清理完成');
    });
});

// ==================== 导出函数（供其他模块使用）====================
export {
    loadPageData,
    refreshPageData,
    showMessage,
    showErrorMessage,
    formatDate,
    formatTime,
    trackQuickAction,
    trackCourseAction
};

/**
 * 代码文件结束
 * 
 * 使用说明：
 * 1. 确保所有Wix元素ID与代码中的选择器匹配
 * 2. 配置数据库集合和字段
 * 3. 设置外部API集成（Lark表单、Google Analytics等）
 * 4. 测试所有功能在不同设备上的表现
 * 5. 部署前进行完整的功能测试
 * 
 * 维护注意事项：
 * - 定期检查和更新缓存策略
 * - 监控性能指标和错误日志
 * - 根据用户反馈优化用户体验
 * - 保持代码注释的及时更新
 */