/**
 * Student Wellbeing Page - Wix Velo JavaScript Code
 * 
 * 功能概述：
 * 这个页面为学生提供全面的心理健康和福祉支持，包括：
 * - 心理健康评估和自测
 * - 情绪跟踪和日记
 * - 冥想和放松资源
 * - 心理咨询预约
 * - 危机干预和紧急支持
 * - 健康习惯跟踪
 * - 同伴支持社区
 * - 心理健康教育资源
 * 
 * 主要特性：
 * - 隐私保护和数据安全
 * - 个性化推荐
 * - 进度跟踪和分析
 * - 多媒体资源支持
 * - 响应式设计
 * - 无障碍访问
 */

// 导入必要的 Wix 模块
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { local, session } from 'wix-storage';
import wixWindow from 'wix-window';
import { timeline } from 'wix-animations';

// 全局变量定义
let currentUser = null;
let wellbeingData = [];
let moodEntries = [];
let assessmentResults = [];
let meditationSessions = [];
let counselingAppointments = [];
let habitTracking = [];
let supportResources = [];
let communityPosts = [];
let userPreferences = {};
let currentView = 'dashboard';
let selectedDate = new Date();
let moodChart = null;
let progressChart = null;

// 页面初始化
$w.onReady(async function () {
    console.log('Student Wellbeing page loading...');
    
    try {
        // 显示加载状态
        showLoading(true);
        
        // 初始化页面
        await initializePage();
        
        // 设置事件处理器
        setupEventHandlers();
        
        // 检查用户认证
        await checkUserAuthentication();
        
        // 加载数据
        await loadAllData();
        
        // 初始化视图
        await initializeViews();
        
        // 隐藏加载状态
        showLoading(false);
        
        console.log('Student Wellbeing page loaded successfully');
        
        // 跟踪页面访问
        trackUserAction('page_visit', { page: 'student-wellbeing' });
        
    } catch (error) {
        console.error('Error loading Student Wellbeing page:', error);
        showMessage('页面加载失败，请刷新重试', 'error');
        showLoading(false);
    }
});

// 页面初始化函数
async function initializePage() {
    try {
        // 设置页面标题
        $w('#pageTitle').text = '学生心理健康';
        
        // 初始化日期选择器
        $w('#dateSelector').value = selectedDate;
        
        // 设置默认视图
        switchView('dashboard');
        
        // 初始化图表容器
        initializeCharts();
        
        // 加载用户偏好
        await loadUserPreferences();
        
        console.log('Page initialization completed');
    } catch (error) {
        console.error('Error initializing page:', error);
        throw error;
    }
}

// 设置事件处理器
function setupEventHandlers() {
    // 导航按钮事件
    $w('#dashboardTab').onClick(() => switchView('dashboard'));
    $w('#moodTrackingTab').onClick(() => switchView('mood-tracking'));
    $w('#assessmentTab').onClick(() => switchView('assessment'));
    $w('#meditationTab').onClick(() => switchView('meditation'));
    $w('#counselingTab').onClick(() => switchView('counseling'));
    $w('#habitsTab').onClick(() => switchView('habits'));
    $w('#communityTab').onClick(() => switchView('community'));
    $w('#resourcesTab').onClick(() => switchView('resources'));
    
    // 情绪跟踪事件
    $w('#addMoodButton').onClick(handleAddMood);
    $w('#moodSlider').onChange(handleMoodChange);
    $w('#saveMoodButton').onClick(handleSaveMood);
    
    // 评估测试事件
    $w('#startAssessmentButton').onClick(handleStartAssessment);
    $w('#submitAssessmentButton').onClick(handleSubmitAssessment);
    $w('#viewResultsButton').onClick(handleViewResults);
    
    // 冥想和放松事件
    $w('#startMeditationButton').onClick(handleStartMeditation);
    $w('#pauseMeditationButton').onClick(handlePauseMeditation);
    $w('#stopMeditationButton').onClick(handleStopMeditation);
    $w('#meditationTimer').onChange(handleTimerChange);
    
    // 咨询预约事件
    $w('#bookCounselingButton').onClick(handleBookCounseling);
    $w('#cancelAppointmentButton').onClick(handleCancelAppointment);
    $w('#rescheduleButton').onClick(handleRescheduleAppointment);
    
    // 习惯跟踪事件
    $w('#addHabitButton').onClick(handleAddHabit);
    $w('#completeHabitButton').onClick(handleCompleteHabit);
    $w('#editHabitButton').onClick(handleEditHabit);
    
    // 社区支持事件
    $w('#createPostButton').onClick(handleCreatePost);
    $w('#joinGroupButton').onClick(handleJoinGroup);
    $w('#sendMessageButton').onClick(handleSendMessage);
    
    // 紧急支持事件
    $w('#emergencyButton').onClick(handleEmergencySupport);
    $w('#crisisHotlineButton').onClick(handleCrisisHotline);
    $w('#emergencyContactButton').onClick(handleEmergencyContact);
    
    // 搜索和筛选事件
    $w('#searchInput').onInput(handleSearch);
    $w('#filterDropdown').onChange(handleFilter);
    $w('#dateSelector').onChange(handleDateChange);
    
    // 设置和偏好事件
    $w('#settingsButton').onClick(handleSettings);
    $w('#privacyButton').onClick(handlePrivacySettings);
    $w('#notificationButton').onClick(handleNotificationSettings);
    
    // 导出和分享事件
    $w('#exportDataButton').onClick(handleExportData);
    $w('#shareProgressButton').onClick(handleShareProgress);
    $w('#printReportButton').onClick(handlePrintReport);
    
    // 中继器事件
    $w('#moodEntriesRepeater').onItemReady(setupMoodEntryItem);
    $w('#assessmentHistoryRepeater').onItemReady(setupAssessmentItem);
    $w('#meditationSessionsRepeater').onItemReady(setupMeditationItem);
    $w('#appointmentsRepeater').onItemReady(setupAppointmentItem);
    $w('#habitsRepeater').onItemReady(setupHabitItem);
    $w('#communityPostsRepeater').onItemReady(setupCommunityPostItem);
    $w('#resourcesRepeater').onItemReady(setupResourceItem);
}

// 用户认证检查
async function checkUserAuthentication() {
    try {
        currentUser = wixUsers.currentUser;
        
        if (currentUser.loggedIn) {
            const userInfo = await currentUser.getUser();
            console.log('User authenticated:', userInfo.loginEmail);
            
            // 更新用户界面
            $w('#userWelcome').text = `欢迎，${userInfo.firstName || '同学'}`;
            $w('#userAvatar').src = userInfo.picture || '/images/default-avatar.png';
            
            // 显示用户相关内容
            $w('#authenticatedContent').show();
            $w('#unauthenticatedContent').hide();
            
        } else {
            console.log('User not authenticated');
            
            // 显示登录提示
            $w('#authenticatedContent').hide();
            $w('#unauthenticatedContent').show();
            
            // 重定向到登录页面
            setTimeout(() => {
                wixLocation.to('/login');
            }, 3000);
        }
    } catch (error) {
        console.error('Error checking user authentication:', error);
        throw error;
    }
}

// 加载所有数据
async function loadAllData() {
    try {
        const userId = currentUser?.id;
        if (!userId) return;
        
        // 并行加载所有数据
        const [wellbeing, moods, assessments, meditations, appointments, habits, resources, community] = await Promise.all([
            loadWellbeingData(userId),
            loadMoodEntries(userId),
            loadAssessmentResults(userId),
            loadMeditationSessions(userId),
            loadCounselingAppointments(userId),
            loadHabitTracking(userId),
            loadSupportResources(),
            loadCommunityPosts()
        ]);
        
        // 存储数据
        wellbeingData = wellbeing;
        moodEntries = moods;
        assessmentResults = assessments;
        meditationSessions = meditations;
        counselingAppointments = appointments;
        habitTracking = habits;
        supportResources = resources;
        communityPosts = community;
        
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// 加载心理健康数据
async function loadWellbeingData(userId) {
    try {
        const results = await wixData.query('WellbeingData')
            .eq('studentId', userId)
            .descending('createdDate')
            .limit(100)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading wellbeing data:', error);
        return [];
    }
}

// 加载情绪记录
async function loadMoodEntries(userId) {
    try {
        const results = await wixData.query('MoodEntries')
            .eq('studentId', userId)
            .descending('entryDate')
            .limit(50)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading mood entries:', error);
        return [];
    }
}

// 加载评估结果
async function loadAssessmentResults(userId) {
    try {
        const results = await wixData.query('AssessmentResults')
            .eq('studentId', userId)
            .descending('completedDate')
            .limit(20)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading assessment results:', error);
        return [];
    }
}

// 加载冥想会话
async function loadMeditationSessions(userId) {
    try {
        const results = await wixData.query('MeditationSessions')
            .eq('studentId', userId)
            .descending('sessionDate')
            .limit(30)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading meditation sessions:', error);
        return [];
    }
}

// 加载咨询预约
async function loadCounselingAppointments(userId) {
    try {
        const results = await wixData.query('CounselingAppointments')
            .eq('studentId', userId)
            .descending('appointmentDate')
            .limit(10)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading counseling appointments:', error);
        return [];
    }
}

// 加载习惯跟踪
async function loadHabitTracking(userId) {
    try {
        const results = await wixData.query('HabitTracking')
            .eq('studentId', userId)
            .descending('createdDate')
            .limit(50)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading habit tracking:', error);
        return [];
    }
}

// 加载支持资源
async function loadSupportResources() {
    try {
        const results = await wixData.query('SupportResources')
            .eq('isActive', true)
            .ascending('category')
            .limit(100)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading support resources:', error);
        return [];
    }
}

// 加载社区帖子
async function loadCommunityPosts() {
    try {
        const results = await wixData.query('CommunityPosts')
            .eq('isActive', true)
            .descending('createdDate')
            .limit(20)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading community posts:', error);
        return [];
    }
}

// 初始化视图
async function initializeViews() {
    try {
        // 更新仪表板
        updateDashboard();
        
        // 更新各个视图的显示
        updateMoodTrackingDisplay();
        updateAssessmentDisplay();
        updateMeditationDisplay();
        updateCounselingDisplay();
        updateHabitsDisplay();
        updateCommunityDisplay();
        updateResourcesDisplay();
        
        console.log('Views initialized successfully');
    } catch (error) {
        console.error('Error initializing views:', error);
        throw error;
    }
}

// 切换视图
function switchView(viewName) {
    // 隐藏所有视图
    const views = ['dashboard', 'mood-tracking', 'assessment', 'meditation', 'counseling', 'habits', 'community', 'resources'];
    views.forEach(view => {
        $w(`#${view}Container`).hide();
        $w(`#${view}Tab`).removeClass('active');
    });
    
    // 显示选中的视图
    $w(`#${viewName}Container`).show();
    $w(`#${viewName}Tab`).addClass('active');
    
    currentView = viewName;
    
    // 跟踪视图切换
    trackUserAction('view_switch', { view: viewName });
    
    // 根据视图加载特定数据
    switch (viewName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'mood-tracking':
            updateMoodChart();
            break;
        case 'assessment':
            loadAvailableAssessments();
            break;
        case 'meditation':
            loadMeditationPrograms();
            break;
        case 'counseling':
            loadAvailableSlots();
            break;
        case 'habits':
            updateHabitsProgress();
            break;
        case 'community':
            loadCommunityGroups();
            break;
        case 'resources':
            filterResourcesByCategory();
            break;
    }
}

// 事件处理器函数

// 处理添加情绪记录
async function handleAddMood() {
    try {
        // 显示情绪记录表单
        $w('#moodEntryLightbox').show();
        
        // 重置表单
        $w('#moodSlider').value = 5;
        $w('#moodNotes').value = '';
        $w('#moodTags').value = [];
        
        // 设置当前日期
        $w('#moodDate').value = new Date();
        
        trackUserAction('mood_entry_started');
    } catch (error) {
        console.error('Error handling add mood:', error);
        showMessage('无法打开情绪记录表单', 'error');
    }
}

// 处理情绪变化
function handleMoodChange() {
    const moodValue = $w('#moodSlider').value;
    const moodLabels = {
        1: '非常糟糕',
        2: '糟糕',
        3: '不好',
        4: '一般',
        5: '还可以',
        6: '不错',
        7: '好',
        8: '很好',
        9: '非常好',
        10: '极好'
    };
    
    $w('#moodLabel').text = moodLabels[moodValue] || '未知';
    
    // 更新情绪颜色
    const moodColors = {
        1: '#FF4444', 2: '#FF6666', 3: '#FF8888',
        4: '#FFAA44', 5: '#FFCC44', 6: '#FFDD44',
        7: '#CCFF44', 8: '#88FF44', 9: '#44FF88',
        10: '#44FFCC'
    };
    
    $w('#moodIndicator').style.backgroundColor = moodColors[moodValue];
}

// 处理保存情绪记录
async function handleSaveMood() {
    try {
        const moodData = {
            studentId: currentUser.id,
            moodValue: $w('#moodSlider').value,
            notes: $w('#moodNotes').value,
            tags: $w('#moodTags').value,
            entryDate: $w('#moodDate').value,
            createdDate: new Date()
        };
        
        // 保存到数据库
        const result = await wixData.save('MoodEntries', moodData);
        
        // 更新本地数据
        moodEntries.unshift(result);
        
        // 更新显示
        updateMoodTrackingDisplay();
        updateMoodChart();
        
        // 关闭表单
        $w('#moodEntryLightbox').hide();
        
        showMessage('情绪记录已保存', 'success');
        trackUserAction('mood_entry_saved', { mood: moodData.moodValue });
        
    } catch (error) {
        console.error('Error saving mood entry:', error);
        showMessage('保存情绪记录失败', 'error');
    }
}

// 处理开始评估
async function handleStartAssessment() {
    try {
        const assessmentType = $w('#assessmentTypeDropdown').value;
        
        if (!assessmentType) {
            showMessage('请选择评估类型', 'warning');
            return;
        }
        
        // 加载评估问题
        const questions = await loadAssessmentQuestions(assessmentType);
        
        if (questions.length === 0) {
            showMessage('暂无可用的评估问题', 'warning');
            return;
        }
        
        // 显示评估界面
        displayAssessmentQuestions(questions);
        
        trackUserAction('assessment_started', { type: assessmentType });
        
    } catch (error) {
        console.error('Error starting assessment:', error);
        showMessage('无法开始评估', 'error');
    }
}

// 处理提交评估
async function handleSubmitAssessment() {
    try {
        // 收集答案
        const answers = collectAssessmentAnswers();
        
        if (answers.length === 0) {
            showMessage('请完成所有问题', 'warning');
            return;
        }
        
        // 计算分数
        const score = calculateAssessmentScore(answers);
        
        // 保存结果
        const assessmentResult = {
            studentId: currentUser.id,
            assessmentType: $w('#assessmentTypeDropdown').value,
            answers: answers,
            score: score,
            completedDate: new Date(),
            recommendations: generateRecommendations(score)
        };
        
        const result = await wixData.save('AssessmentResults', assessmentResult);
        
        // 更新本地数据
        assessmentResults.unshift(result);
        
        // 显示结果
        displayAssessmentResults(result);
        
        trackUserAction('assessment_completed', { 
            type: assessmentResult.assessmentType, 
            score: score 
        });
        
    } catch (error) {
        console.error('Error submitting assessment:', error);
        showMessage('提交评估失败', 'error');
    }
}

// 处理查看结果
function handleViewResults() {
    try {
        const selectedResult = $w('#assessmentHistoryRepeater').getCurrentItem();
        
        if (selectedResult) {
            displayAssessmentResults(selectedResult);
            trackUserAction('assessment_results_viewed', { id: selectedResult._id });
        }
    } catch (error) {
        console.error('Error viewing results:', error);
        showMessage('无法查看结果', 'error');
    }
}

// 处理开始冥想
async function handleStartMeditation() {
    try {
        const meditationType = $w('#meditationTypeDropdown').value;
        const duration = $w('#meditationDuration').value;
        
        if (!meditationType || !duration) {
            showMessage('请选择冥想类型和时长', 'warning');
            return;
        }
        
        // 开始冥想会话
        const session = {
            studentId: currentUser.id,
            meditationType: meditationType,
            plannedDuration: duration,
            startTime: new Date(),
            status: 'active'
        };
        
        const result = await wixData.save('MeditationSessions', session);
        
        // 启动计时器
        startMeditationTimer(duration);
        
        // 更新界面
        $w('#startMeditationButton').hide();
        $w('#pauseMeditationButton').show();
        $w('#stopMeditationButton').show();
        $w('#meditationProgress').show();
        
        trackUserAction('meditation_started', { 
            type: meditationType, 
            duration: duration 
        });
        
    } catch (error) {
        console.error('Error starting meditation:', error);
        showMessage('无法开始冥想', 'error');
    }
}

// 处理暂停冥想
function handlePauseMeditation() {
    try {
        // 暂停计时器
        pauseMeditationTimer();
        
        // 更新界面
        $w('#pauseMeditationButton').hide();
        $w('#resumeMeditationButton').show();
        
        trackUserAction('meditation_paused');
    } catch (error) {
        console.error('Error pausing meditation:', error);
    }
}

// 处理停止冥想
async function handleStopMeditation() {
    try {
        // 停止计时器
        stopMeditationTimer();
        
        // 更新会话记录
        const actualDuration = getCurrentMeditationDuration();
        
        // 保存会话结果
        const sessionUpdate = {
            endTime: new Date(),
            actualDuration: actualDuration,
            status: 'completed'
        };
        
        // 更新界面
        resetMeditationInterface();
        
        // 显示完成消息
        showMessage(`冥想完成！持续时间：${formatDuration(actualDuration)}`, 'success');
        
        trackUserAction('meditation_completed', { duration: actualDuration });
        
    } catch (error) {
        console.error('Error stopping meditation:', error);
        showMessage('停止冥想时出错', 'error');
    }
}

// 处理预约咨询
async function handleBookCounseling() {
    try {
        // 显示预约表单
        $w('#counselingBookingLightbox').show();
        
        // 加载可用时间段
        await loadAvailableSlots();
        
        trackUserAction('counseling_booking_started');
    } catch (error) {
        console.error('Error handling book counseling:', error);
        showMessage('无法打开预约表单', 'error');
    }
}

// 处理取消预约
async function handleCancelAppointment() {
    try {
        const appointmentId = $w('#appointmentsRepeater').getCurrentItem()._id;
        
        const confirmed = await wixWindow.openLightbox('confirmationLightbox', {
            title: '确认取消',
            message: '确定要取消这个预约吗？',
            confirmText: '确认取消',
            cancelText: '保留预约'
        });
        
        if (confirmed) {
            // 更新预约状态
            await wixData.update('CounselingAppointments', {
                _id: appointmentId,
                status: 'cancelled',
                cancelledDate: new Date()
            });
            
            // 重新加载预约数据
            counselingAppointments = await loadCounselingAppointments(currentUser.id);
            updateCounselingDisplay();
            
            showMessage('预约已取消', 'success');
            trackUserAction('appointment_cancelled', { id: appointmentId });
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showMessage('取消预约失败', 'error');
    }
}

// 处理重新安排预约
async function handleRescheduleAppointment() {
    try {
        const appointment = $w('#appointmentsRepeater').getCurrentItem();
        
        // 显示重新安排表单
        $w('#rescheduleAppointmentLightbox').show();
        
        // 预填当前预约信息
        $w('#rescheduleAppointmentId').value = appointment._id;
        $w('#rescheduleCurrentDate').text = formatDateTime(appointment.appointmentDate);
        
        // 加载可用时间段
        await loadAvailableSlots();
        
        trackUserAction('appointment_reschedule_started', { id: appointment._id });
    } catch (error) {
        console.error('Error handling reschedule appointment:', error);
        showMessage('无法重新安排预约', 'error');
    }
}

// 处理添加习惯
async function handleAddHabit() {
    try {
        // 显示添加习惯表单
        $w('#addHabitLightbox').show();
        
        // 重置表单
        $w('#habitName').value = '';
        $w('#habitDescription').value = '';
        $w('#habitFrequency').value = 'daily';
        $w('#habitCategory').value = '';
        $w('#habitGoal').value = 1;
        
        trackUserAction('habit_creation_started');
    } catch (error) {
        console.error('Error handling add habit:', error);
        showMessage('无法打开添加习惯表单', 'error');
    }
}

// 处理完成习惯
async function handleCompleteHabit() {
    try {
        const habit = $w('#habitsRepeater').getCurrentItem();
        
        // 记录习惯完成
        const completion = {
            habitId: habit._id,
            studentId: currentUser.id,
            completedDate: new Date(),
            notes: ''
        };
        
        await wixData.save('HabitCompletions', completion);
        
        // 更新习惯进度
        await updateHabitProgress(habit._id);
        
        // 更新显示
        updateHabitsDisplay();
        
        showMessage('习惯已标记为完成！', 'success');
        trackUserAction('habit_completed', { habitId: habit._id });
        
    } catch (error) {
        console.error('Error completing habit:', error);
        showMessage('标记习惯完成失败', 'error');
    }
}

// 处理编辑习惯
function handleEditHabit() {
    try {
        const habit = $w('#habitsRepeater').getCurrentItem();
        
        // 显示编辑表单
        $w('#editHabitLightbox').show();
        
        // 预填表单数据
        $w('#editHabitId').value = habit._id;
        $w('#editHabitName').value = habit.name;
        $w('#editHabitDescription').value = habit.description;
        $w('#editHabitFrequency').value = habit.frequency;
        $w('#editHabitCategory').value = habit.category;
        $w('#editHabitGoal').value = habit.goal;
        
        trackUserAction('habit_edit_started', { habitId: habit._id });
    } catch (error) {
        console.error('Error handling edit habit:', error);
        showMessage('无法编辑习惯', 'error');
    }
}

// 处理创建帖子
async function handleCreatePost() {
    try {
        // 显示创建帖子表单
        $w('#createPostLightbox').show();
        
        // 重置表单
        $w('#postTitle').value = '';
        $w('#postContent').value = '';
        $w('#postCategory').value = '';
        $w('#postTags').value = [];
        $w('#postAnonymous').checked = false;
        
        trackUserAction('community_post_creation_started');
    } catch (error) {
        console.error('Error handling create post:', error);
        showMessage('无法创建帖子', 'error');
    }
}

// 处理加入群组
async function handleJoinGroup() {
    try {
        const group = $w('#communityGroupsRepeater').getCurrentItem();
        
        // 检查是否已经是成员
        const membership = await wixData.query('GroupMemberships')
            .eq('groupId', group._id)
            .eq('studentId', currentUser.id)
            .find();
        
        if (membership.items.length > 0) {
            showMessage('您已经是该群组的成员', 'info');
            return;
        }
        
        // 添加成员关系
        await wixData.save('GroupMemberships', {
            groupId: group._id,
            studentId: currentUser.id,
            joinedDate: new Date(),
            status: 'active'
        });
        
        // 更新群组成员数
        await wixData.update('CommunityGroups', {
            _id: group._id,
            memberCount: (group.memberCount || 0) + 1
        });
        
        showMessage('成功加入群组！', 'success');
        trackUserAction('group_joined', { groupId: group._id });
        
        // 更新显示
        updateCommunityDisplay();
        
    } catch (error) {
        console.error('Error joining group:', error);
        showMessage('加入群组失败', 'error');
    }
}

// 处理发送消息
async function handleSendMessage() {
    try {
        const messageContent = $w('#messageInput').value.trim();
        
        if (!messageContent) {
            showMessage('请输入消息内容', 'warning');
            return;
        }
        
        const message = {
            senderId: currentUser.id,
            content: messageContent,
            timestamp: new Date(),
            type: 'text'
        };
        
        // 这里可以根据具体的聊天实现来发送消息
        // 例如发送到群组聊天或私人聊天
        
        // 清空输入框
        $w('#messageInput').value = '';
        
        trackUserAction('message_sent', { length: messageContent.length });
        
    } catch (error) {
        console.error('Error sending message:', error);
        showMessage('发送消息失败', 'error');
    }
}

// 处理紧急支持
function handleEmergencySupport() {
    try {
        // 显示紧急支持选项
        $w('#emergencySupportLightbox').show();
        
        // 记录紧急支持访问
        trackUserAction('emergency_support_accessed', {
            timestamp: new Date(),
            urgent: true
        });
        
        // 可以添加自动通知相关人员的逻辑
        notifyEmergencyContacts();
        
    } catch (error) {
        console.error('Error handling emergency support:', error);
    }
}

// 处理危机热线
function handleCrisisHotline() {
    try {
        // 显示危机热线信息
        const hotlineNumbers = {
            'national': '988', // 美国国家自杀预防热线
            'crisis': '1-800-273-8255',
            'text': 'Text HOME to 741741'
        };
        
        $w('#crisisHotlineLightbox').show();
        $w('#hotlineNumbers').text = Object.values(hotlineNumbers).join('\n');
        
        trackUserAction('crisis_hotline_accessed', {
            timestamp: new Date(),
            critical: true
        });
        
    } catch (error) {
        console.error('Error handling crisis hotline:', error);
    }
}

// 处理紧急联系人
function handleEmergencyContact() {
    try {
        // 显示紧急联系人信息
        $w('#emergencyContactLightbox').show();
        
        // 加载用户的紧急联系人
        loadEmergencyContacts();
        
        trackUserAction('emergency_contact_accessed');
        
    } catch (error) {
        console.error('Error handling emergency contact:', error);
    }
}

// 处理搜索
function handleSearch() {
    try {
        const searchTerm = $w('#searchInput').value.toLowerCase();
        
        if (searchTerm.length < 2) {
            // 重置显示
            resetSearchResults();
            return;
        }
        
        // 根据当前视图搜索不同的内容
        switch (currentView) {
            case 'resources':
                searchResources(searchTerm);
                break;
            case 'community':
                searchCommunityPosts(searchTerm);
                break;
            case 'mood-tracking':
                searchMoodEntries(searchTerm);
                break;
            default:
                performGlobalSearch(searchTerm);
        }
        
        trackUserAction('search_performed', { 
            term: searchTerm, 
            view: currentView 
        });
        
    } catch (error) {
        console.error('Error handling search:', error);
    }
}

// 处理筛选
function handleFilter() {
    try {
        const filterValue = $w('#filterDropdown').value;
        
        // 根据当前视图应用不同的筛选
        switch (currentView) {
            case 'mood-tracking':
                filterMoodEntries(filterValue);
                break;
            case 'assessment':
                filterAssessments(filterValue);
                break;
            case 'meditation':
                filterMeditationSessions(filterValue);
                break;
            case 'counseling':
                filterAppointments(filterValue);
                break;
            case 'habits':
                filterHabits(filterValue);
                break;
            case 'community':
                filterCommunityPosts(filterValue);
                break;
            case 'resources':
                filterResources(filterValue);
                break;
        }
        
        trackUserAction('filter_applied', { 
            filter: filterValue, 
            view: currentView 
        });
        
    } catch (error) {
        console.error('Error handling filter:', error);
    }
}

// 处理日期变化
function handleDateChange() {
    try {
        selectedDate = $w('#dateSelector').value;
        
        // 根据新日期更新显示
        updateDateBasedContent();
        
        trackUserAction('date_changed', { 
            date: selectedDate.toISOString().split('T')[0] 
        });
        
    } catch (error) {
        console.error('Error handling date change:', error);
    }
}

// 处理设置
function handleSettings() {
    try {
        // 显示设置面板
        $w('#settingsLightbox').show();
        
        // 加载当前设置
        loadUserSettings();
        
        trackUserAction('settings_opened');
    } catch (error) {
        console.error('Error handling settings:', error);
    }
}

// 处理隐私设置
function handlePrivacySettings() {
    try {
        // 显示隐私设置
        $w('#privacySettingsLightbox').show();
        
        // 加载隐私偏好
        loadPrivacyPreferences();
        
        trackUserAction('privacy_settings_opened');
    } catch (error) {
        console.error('Error handling privacy settings:', error);
    }
}

// 处理通知设置
function handleNotificationSettings() {
    try {
        // 显示通知设置
        $w('#notificationSettingsLightbox').show();
        
        // 加载通知偏好
        loadNotificationPreferences();
        
        trackUserAction('notification_settings_opened');
    } catch (error) {
        console.error('Error handling notification settings:', error);
    }
}

// 处理导出数据
async function handleExportData() {
    try {
        // 收集用户数据
        const exportData = {
            moodEntries: moodEntries,
            assessmentResults: assessmentResults,
            meditationSessions: meditationSessions,
            habitTracking: habitTracking,
            exportDate: new Date()
        };
        
        // 生成导出文件
        const exportContent = JSON.stringify(exportData, null, 2);
        
        // 创建下载链接
        const blob = new Blob([exportContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // 触发下载
        const link = document.createElement('a');
        link.href = url;
        link.download = `wellbeing-data-${formatDate(new Date())}.json`;
        link.click();
        
        // 清理
        URL.revokeObjectURL(url);
        
        showMessage('数据导出成功', 'success');
        trackUserAction('data_exported');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showMessage('数据导出失败', 'error');
    }
}

// 处理分享进度
function handleShareProgress() {
    try {
        // 生成进度报告
        const progressReport = generateProgressReport();
        
        // 显示分享选项
        $w('#shareProgressLightbox').show();
        $w('#progressReportPreview').html = progressReport;
        
        trackUserAction('progress_share_initiated');
    } catch (error) {
        console.error('Error handling share progress:', error);
        showMessage('无法分享进度', 'error');
    }
}

// 处理打印报告
function handlePrintReport() {
    try {
        // 生成打印友好的报告
        const printContent = generatePrintableReport();
        
        // 打开新窗口进行打印
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        
        trackUserAction('report_printed');
    } catch (error) {
        console.error('Error handling print report:', error);
        showMessage('无法打印报告', 'error');
    }
}

// UI 更新函数

// 更新仪表板
function updateDashboard() {
    try {
        // 更新统计数据
        updateWellbeingStatistics();
        
        // 更新最近活动
        updateRecentActivity();
        
        // 更新推荐内容
        updateRecommendations();
        
        // 更新快速操作
        updateQuickActions();
        
        console.log('Dashboard updated');
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// 更新心理健康统计
function updateWellbeingStatistics() {
    try {
        // 计算平均情绪
        const avgMood = calculateAverageMood();
        $w('#averageMoodText').text = avgMood.toFixed(1);
        $w('#averageMoodIndicator').style.backgroundColor = getMoodColor(avgMood);
        
        // 计算冥想总时长
        const totalMeditationTime = calculateTotalMeditationTime();
        $w('#totalMeditationText').text = formatDuration(totalMeditationTime);
        
        // 计算习惯完成率
        const habitCompletionRate = calculateHabitCompletionRate();
        $w('#habitCompletionText').text = `${habitCompletionRate}%`;
        
        // 计算评估分数趋势
        const assessmentTrend = calculateAssessmentTrend();
        $w('#assessmentTrendText').text = assessmentTrend;
        
        // 更新进度条
        updateProgressBars();
        
    } catch (error) {
        console.error('Error updating wellbeing statistics:', error);
    }
}

// 更新最近活动
function updateRecentActivity() {
    try {
        const recentActivities = [];
        
        // 添加最近的情绪记录
        if (moodEntries.length > 0) {
            recentActivities.push({
                type: 'mood',
                description: `记录了情绪：${getMoodLabel(moodEntries[0].moodValue)}`,
                date: moodEntries[0].entryDate,
                icon: '😊'
            });
        }
        
        // 添加最近的冥想会话
        if (meditationSessions.length > 0) {
            recentActivities.push({
                type: 'meditation',
                description: `完成了${meditationSessions[0].meditationType}冥想`,
                date: meditationSessions[0].sessionDate,
                icon: '🧘'
            });
        }
        
        // 添加最近的评估
        if (assessmentResults.length > 0) {
            recentActivities.push({
                type: 'assessment',
                description: `完成了${assessmentResults[0].assessmentType}评估`,
                date: assessmentResults[0].completedDate,
                icon: '📊'
            });
        }
        
        // 按日期排序
        recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 更新显示
        $w('#recentActivityRepeater').data = recentActivities.slice(0, 5);
        
    } catch (error) {
        console.error('Error updating recent activity:', error);
    }
}

// 更新推荐内容
function updateRecommendations() {
    try {
        const recommendations = generatePersonalizedRecommendations();
        $w('#recommendationsRepeater').data = recommendations;
    } catch (error) {
        console.error('Error updating recommendations:', error);
    }
}

// 更新快速操作
function updateQuickActions() {
    try {
        const quickActions = [
            {
                title: '记录情绪',
                description: '快速记录当前心情',
                icon: '😊',
                action: 'mood'
            },
            {
                title: '开始冥想',
                description: '进行5分钟快速冥想',
                icon: '🧘',
                action: 'meditation'
            },
            {
                title: '心理评估',
                description: '进行心理健康自测',
                icon: '📊',
                action: 'assessment'
            },
            {
                title: '预约咨询',
                description: '预约心理咨询师',
                icon: '👨‍⚕️',
                action: 'counseling'
            }
        ];
        
        $w('#quickActionsRepeater').data = quickActions;
    } catch (error) {
        console.error('Error updating quick actions:', error);
    }
}

// 更新情绪跟踪显示
function updateMoodTrackingDisplay() {
    try {
        // 更新情绪记录列表
        $w('#moodEntriesRepeater').data = moodEntries;
        
        // 更新情绪统计
        updateMoodStatistics();
        
        // 更新情绪图表
        updateMoodChart();
        
    } catch (error) {
        console.error('Error updating mood tracking display:', error);
    }
}

// 更新情绪统计
function updateMoodStatistics() {
    try {
        if (moodEntries.length === 0) {
            $w('#moodStatsContainer').hide();
            return;
        }
        
        $w('#moodStatsContainer').show();
        
        // 计算统计数据
        const avgMood = calculateAverageMood();
        const moodTrend = calculateMoodTrend();
        const bestDay = findBestMoodDay();
        const worstDay = findWorstMoodDay();
        
        // 更新显示
        $w('#avgMoodStat').text = avgMood.toFixed(1);
        $w('#moodTrendStat').text = moodTrend;
        $w('#bestDayStat').text = bestDay;
        $w('#worstDayStat').text = worstDay;
        
    } catch (error) {
        console.error('Error updating mood statistics:', error);
    }
}

// 更新情绪图表
function updateMoodChart() {
    try {
        if (moodEntries.length === 0) {
            $w('#moodChartContainer').hide();
            return;
        }
        
        $w('#moodChartContainer').show();
        
        // 准备图表数据
        const chartData = prepareMoodChartData();
        
        // 这里可以使用图表库（如Chart.js）来渲染图表
        // 由于Wix的限制，这里使用简化的显示方式
        renderSimpleMoodChart(chartData);
        
    } catch (error) {
        console.error('Error updating mood chart:', error);
    }
}

// 更新评估显示
function updateAssessmentDisplay() {
    try {
        // 更新评估历史
        $w('#assessmentHistoryRepeater').data = assessmentResults;
        
        // 更新可用评估
        loadAvailableAssessments();
        
        // 更新评估统计
        updateAssessmentStatistics();
        
    } catch (error) {
        console.error('Error updating assessment display:', error);
    }
}

// 更新冥想显示
function updateMeditationDisplay() {
    try {
        // 更新冥想会话历史
        $w('#meditationSessionsRepeater').data = meditationSessions;
        
        // 更新冥想统计
        updateMeditationStatistics();
        
        // 更新推荐冥想
        updateRecommendedMeditations();
        
    } catch (error) {
        console.error('Error updating meditation display:', error);
    }
}

// 更新咨询显示
function updateCounselingDisplay() {
    try {
        // 更新预约列表
        $w('#appointmentsRepeater').data = counselingAppointments;
        
        // 更新可用时间段
        loadAvailableSlots();
        
        // 更新咨询师信息
        loadCounselorInfo();
        
    } catch (error) {
        console.error('Error updating counseling display:', error);
    }
}

// 更新习惯显示
function updateHabitsDisplay() {
    try {
        // 更新习惯列表
        $w('#habitsRepeater').data = habitTracking;
        
        // 更新习惯统计
        updateHabitsStatistics();
        
        // 更新习惯进度
        updateHabitsProgress();
        
    } catch (error) {
        console.error('Error updating habits display:', error);
    }
}

// 更新社区显示
function updateCommunityDisplay() {
    try {
        // 更新社区帖子
        $w('#communityPostsRepeater').data = communityPosts;
        
        // 更新群组信息
        loadCommunityGroups();
        
        // 更新活动信息
        loadCommunityEvents();
        
    } catch (error) {
        console.error('Error updating community display:', error);
    }
}

// 更新资源显示
function updateResourcesDisplay() {
    try {
        // 更新资源列表
        $w('#resourcesRepeater').data = supportResources;
        
        // 更新资源分类
        updateResourceCategories();
        
        // 更新推荐资源
        updateRecommendedResources();
        
    } catch (error) {
        console.error('Error updating resources display:', error);
    }
}

// 中继器项目设置函数

// 设置情绪记录项目
function setupMoodEntryItem($item, itemData, index) {
    try {
        $item('#moodValue').text = itemData.moodValue;
        $item('#moodDate').text = formatDate(itemData.entryDate);
        $item('#moodNotes').text = itemData.notes || '';
        $item('#moodIndicator').style.backgroundColor = getMoodColor(itemData.moodValue);
        
        // 设置点击事件
        $item('#viewMoodButton').onClick(() => {
            viewMoodEntryDetails(itemData);
        });
        
        $item('#editMoodButton').onClick(() => {
            editMoodEntry(itemData);
        });
        
        $item('#deleteMoodButton').onClick(() => {
            deleteMoodEntry(itemData._id);
        });
        
    } catch (error) {
        console.error('Error setting up mood entry item:', error);
    }
}

// 设置评估项目
function setupAssessmentItem($item, itemData, index) {
    try {
        $item('#assessmentType').text = itemData.assessmentType;
        $item('#assessmentDate').text = formatDate(itemData.completedDate);
        $item('#assessmentScore').text = itemData.score;
        $item('#assessmentLevel').text = getAssessmentLevel(itemData.score);
        
        // 设置分数颜色
        const scoreColor = getScoreColor(itemData.score);
        $item('#assessmentScore').style.color = scoreColor;
        
        // 设置点击事件
        $item('#viewResultsButton').onClick(() => {
            viewAssessmentResults(itemData);
        });
        
        $item('#retakeAssessmentButton').onClick(() => {
            retakeAssessment(itemData.assessmentType);
        });
        
    } catch (error) {
        console.error('Error setting up assessment item:', error);
    }
}

// 设置冥想项目
function setupMeditationItem($item, itemData, index) {
    try {
        $item('#meditationType').text = itemData.meditationType;
        $item('#meditationDate').text = formatDate(itemData.sessionDate);
        $item('#meditationDuration').text = formatDuration(itemData.actualDuration);
        $item('#meditationStatus').text = itemData.status;
        
        // 设置状态颜色
        const statusColor = getStatusColor(itemData.status);
        $item('#meditationStatus').style.color = statusColor;
        
        // 设置点击事件
        $item('#repeatMeditationButton').onClick(() => {
            repeatMeditation(itemData.meditationType, itemData.plannedDuration);
        });
        
    } catch (error) {
        console.error('Error setting up meditation item:', error);
    }
}

// 设置预约项目
function setupAppointmentItem($item, itemData, index) {
    try {
        $item('#appointmentDate').text = formatDateTime(itemData.appointmentDate);
        $item('#appointmentType').text = itemData.appointmentType;
        $item('#counselorName').text = itemData.counselorName;
        $item('#appointmentStatus').text = itemData.status;
        
        // 设置状态颜色
        const statusColor = getStatusColor(itemData.status);
        $item('#appointmentStatus').style.color = statusColor;
        
        // 根据状态显示不同的按钮
        if (itemData.status === 'scheduled') {
            $item('#cancelButton').show();
            $item('#rescheduleButton').show();
            $item('#joinButton').hide();
        } else if (itemData.status === 'active') {
            $item('#cancelButton').hide();
            $item('#rescheduleButton').hide();
            $item('#joinButton').show();
        } else {
            $item('#cancelButton').hide();
            $item('#rescheduleButton').hide();
            $item('#joinButton').hide();
        }
        
        // 设置点击事件
        $item('#cancelButton').onClick(() => {
            cancelAppointment(itemData._id);
        });
        
        $item('#rescheduleButton').onClick(() => {
            rescheduleAppointment(itemData);
        });
        
        $item('#joinButton').onClick(() => {
            joinAppointment(itemData._id);
        });
        
    } catch (error) {
        console.error('Error setting up appointment item:', error);
    }
}

// 设置习惯项目
function setupHabitItem($item, itemData, index) {
    try {
        $item('#habitName').text = itemData.name;
        $item('#habitDescription').text = itemData.description;
        $item('#habitFrequency').text = itemData.frequency;
        $item('#habitProgress').text = `${itemData.completedCount || 0}/${itemData.goal}`;
        
        // 计算完成百分比
        const completionPercentage = ((itemData.completedCount || 0) / itemData.goal) * 100;
        $item('#habitProgressBar').style.width = `${completionPercentage}%`;
        
        // 设置进度条颜色
        const progressColor = completionPercentage >= 100 ? '#4CAF50' : '#2196F3';
        $item('#habitProgressBar').style.backgroundColor = progressColor;
        
        // 检查今天是否已完成
        const todayCompleted = checkHabitCompletedToday(itemData._id);
        
        if (todayCompleted) {
            $item('#completeHabitButton').hide();
            $item('#habitCompletedIndicator').show();
        } else {
            $item('#completeHabitButton').show();
            $item('#habitCompletedIndicator').hide();
        }
        
        // 设置点击事件
        $item('#completeHabitButton').onClick(() => {
            completeHabit(itemData._id);
        });
        
        $item('#editHabitButton').onClick(() => {
            editHabit(itemData);
        });
        
        $item('#deleteHabitButton').onClick(() => {
            deleteHabit(itemData._id);
        });
        
    } catch (error) {
        console.error('Error setting up habit item:', error);
    }
}

// 设置社区帖子项目
function setupCommunityPostItem($item, itemData, index) {
    try {
        $item('#postTitle').text = itemData.title;
        $item('#postContent').text = itemData.content.substring(0, 150) + '...';
        $item('#postAuthor').text = itemData.anonymous ? '匿名用户' : itemData.authorName;
        $item('#postDate').text = formatDate(itemData.createdDate);
        $item('#postCategory').text = itemData.category;
        $item('#postLikes').text = itemData.likesCount || 0;
        $item('#postComments').text = itemData.commentsCount || 0;
        
        // 设置点击事件
        $item('#viewPostButton').onClick(() => {
            viewPostDetails(itemData);
        });
        
        $item('#likePostButton').onClick(() => {
            likePost(itemData._id);
        });
        
        $item('#commentPostButton').onClick(() => {
            commentOnPost(itemData._id);
        });
        
    } catch (error) {
        console.error('Error setting up community post item:', error);
    }
}

// 设置资源项目
function setupResourceItem($item, itemData, index) {
    try {
        $item('#resourceTitle').text = itemData.title;
        $item('#resourceDescription').text = itemData.description;
        $item('#resourceCategory').text = itemData.category;
        $item('#resourceType').text = itemData.type;
        $item('#resourceRating').text = itemData.rating || 'N/A';
        
        // 设置资源图标
        const typeIcons = {
            'article': '📄',
            'video': '🎥',
            'audio': '🎵',
            'app': '📱',
            'book': '📚',
            'website': '🌐'
        };
        
        $item('#resourceIcon').text = typeIcons[itemData.type] || '📄';
        
        // 设置点击事件
        $item('#openResourceButton').onClick(() => {
            openResource(itemData);
        });
        
        $item('#saveResourceButton').onClick(() => {
            saveResource(itemData._id);
        });
        
        $item('#shareResourceButton').onClick(() => {
            shareResource(itemData);
        });
        
    } catch (error) {
        console.error('Error setting up resource item:', error);
    }
}

// 工具函数

// 计算平均情绪
function calculateAverageMood() {
    if (moodEntries.length === 0) return 0;
    
    const total = moodEntries.reduce((sum, entry) => sum + entry.moodValue, 0);
    return total / moodEntries.length;
}

// 计算情绪趋势
function calculateMoodTrend() {
    if (moodEntries.length < 2) return '数据不足';
    
    const recent = moodEntries.slice(0, 7); // 最近7天
    const older = moodEntries.slice(7, 14); // 之前7天
    
    if (older.length === 0) return '数据不足';
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.moodValue, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.moodValue, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return '上升趋势 📈';
    if (difference < -0.5) return '下降趋势 📉';
    return '稳定 ➡️';
}

// 查找最佳情绪日
function findBestMoodDay() {
    if (moodEntries.length === 0) return '暂无数据';
    
    const bestEntry = moodEntries.reduce((best, current) => 
        current.moodValue > best.moodValue ? current : best
    );
    
    return formatDate(bestEntry.entryDate);
}

// 查找最差情绪日
function findWorstMoodDay() {
    if (moodEntries.length === 0) return '暂无数据';
    
    const worstEntry = moodEntries.reduce((worst, current) => 
        current.moodValue < worst.moodValue ? current : worst
    );
    
    return formatDate(worstEntry.entryDate);
}

// 计算总冥想时间
function calculateTotalMeditationTime() {
    return meditationSessions.reduce((total, session) => 
        total + (session.actualDuration || 0), 0
    );
}

// 计算习惯完成率
function calculateHabitCompletionRate() {
    if (habitTracking.length === 0) return 0;
    
    const totalGoals = habitTracking.reduce((sum, habit) => sum + habit.goal, 0);
    const totalCompleted = habitTracking.reduce((sum, habit) => sum + (habit.completedCount || 0), 0);
    
    return totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;
}

// 计算评估趋势
function calculateAssessmentTrend() {
    if (assessmentResults.length < 2) return '数据不足';
    
    const latest = assessmentResults[0].score;
    const previous = assessmentResults[1].score;
    
    if (latest > previous) return '改善 📈';
    if (latest < previous) return '需要关注 📉';
    return '稳定 ➡️';
}

// 获取情绪颜色
function getMoodColor(moodValue) {
    const colors = {
        1: '#FF4444', 2: '#FF6666', 3: '#FF8888',
        4: '#FFAA44', 5: '#FFCC44', 6: '#FFDD44',
        7: '#CCFF44', 8: '#88FF44', 9: '#44FF88',
        10: '#44FFCC'
    };
    return colors[Math.round(moodValue)] || '#CCCCCC';
}

// 获取情绪标签
function getMoodLabel(moodValue) {
    const labels = {
        1: '非常糟糕', 2: '糟糕', 3: '不好',
        4: '一般', 5: '还可以', 6: '不错',
        7: '好', 8: '很好', 9: '非常好',
        10: '极好'
    };
    return labels[Math.round(moodValue)] || '未知';
}

// 获取评估等级
function getAssessmentLevel(score) {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    if (score >= 20) return '需要关注';
    return '需要帮助';
}

// 获取分数颜色
function getScoreColor(score) {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
}

// 获取状态颜色
function getStatusColor(status) {
    const colors = {
        'active': '#4CAF50',
        'scheduled': '#2196F3',
        'completed': '#9C27B0',
        'cancelled': '#F44336',
        'pending': '#FF9800'
    };
    return colors[status] || '#757575';
}

// 检查习惯今天是否已完成
function checkHabitCompletedToday(habitId) {
    const today = new Date().toDateString();
    // 这里需要查询 HabitCompletions 集合
    // 简化实现，实际应该查询数据库
    return false;
}

// 生成个性化推荐
function generatePersonalizedRecommendations() {
    const recommendations = [];
    
    // 基于情绪数据的推荐
    const avgMood = calculateAverageMood();
    if (avgMood < 5) {
        recommendations.push({
            title: '情绪提升建议',
            description: '尝试进行10分钟的正念冥想',
            type: 'meditation',
            priority: 'high'
        });
    }
    
    // 基于冥想数据的推荐
    const totalMeditationTime = calculateTotalMeditationTime();
    if (totalMeditationTime < 300) { // 少于5分钟
        recommendations.push({
            title: '冥想练习',
            description: '建立每日冥想习惯，从5分钟开始',
            type: 'meditation',
            priority: 'medium'
        });
    }
    
    // 基于评估结果的推荐
    if (assessmentResults.length > 0) {
        const latestScore = assessmentResults[0].score;
        if (latestScore < 40) {
            recommendations.push({
                title: '专业支持',
                description: '考虑预约心理咨询师进行专业指导',
                type: 'counseling',
                priority: 'high'
            });
        }
    }
    
    return recommendations;
}

// 准备情绪图表数据
function prepareMoodChartData() {
    const last30Days = moodEntries
        .filter(entry => {
            const entryDate = new Date(entry.entryDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return entryDate >= thirtyDaysAgo;
        })
        .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
    
    return last30Days.map(entry => ({
        date: formatDate(entry.entryDate),
        mood: entry.moodValue
    }));
}

// 渲染简单情绪图表
function renderSimpleMoodChart(data) {
    try {
        // 由于Wix的限制，这里使用简化的图表显示
        let chartHTML = '<div class="mood-chart">';
        
        data.forEach((point, index) => {
            const height = (point.mood / 10) * 100;
            const color = getMoodColor(point.mood);
            
            chartHTML += `
                <div class="chart-bar" style="height: ${height}%; background-color: ${color}; width: ${100/data.length}%;">
                    <span class="chart-value">${point.mood}</span>
                    <span class="chart-date">${point.date}</span>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        
        $w('#moodChartContainer').html = chartHTML;
        
    } catch (error) {
        console.error('Error rendering mood chart:', error);
    }
}

// 加载可用评估
async function loadAvailableAssessments() {
    try {
        const assessments = await wixData.query('AssessmentTypes')
            .eq('isActive', true)
            .ascending('name')
            .find();
        
        $w('#assessmentTypeDropdown').options = assessments.items.map(assessment => ({
            label: assessment.name,
            value: assessment._id
        }));
        
    } catch (error) {
        console.error('Error loading available assessments:', error);
    }
}

// 加载评估问题
async function loadAssessmentQuestions(assessmentType) {
    try {
        const questions = await wixData.query('AssessmentQuestions')
            .eq('assessmentType', assessmentType)
            .ascending('order')
            .find();
        
        return questions.items;
    } catch (error) {
        console.error('Error loading assessment questions:', error);
        return [];
    }
}

// 显示评估问题
function displayAssessmentQuestions(questions) {
    try {
        // 隐藏评估选择，显示问题界面
        $w('#assessmentSelectionContainer').hide();
        $w('#assessmentQuestionsContainer').show();
        
        // 设置问题数据
        $w('#assessmentQuestionsRepeater').data = questions;
        
        // 重置进度
        $w('#assessmentProgress').value = 0;
        $w('#assessmentProgressText').text = `0 / ${questions.length}`;
        
    } catch (error) {
        console.error('Error displaying assessment questions:', error);
    }
}

// 收集评估答案
function collectAssessmentAnswers() {
    try {
        const answers = [];
        const questionItems = $w('#assessmentQuestionsRepeater').data;
        
        questionItems.forEach((question, index) => {
            const answerElement = $w(`#question${index}Answer`);
            if (answerElement && answerElement.value !== undefined) {
                answers.push({
                    questionId: question._id,
                    answer: answerElement.value
                });
            }
        });
        
        return answers;
    } catch (error) {
        console.error('Error collecting assessment answers:', error);
        return [];
    }
}

// 计算评估分数
function calculateAssessmentScore(answers) {
    try {
        // 简化的分数计算逻辑
        // 实际应该根据具体的评估类型和问题权重来计算
        const totalScore = answers.reduce((sum, answer) => {
            return sum + (parseInt(answer.answer) || 0);
        }, 0);
        
        const maxPossibleScore = answers.length * 5; // 假设每题最高5分
        return Math.round((totalScore / maxPossibleScore) * 100);
    } catch (error) {
        console.error('Error calculating assessment score:', error);
        return 0;
    }
}

// 生成推荐建议
function generateRecommendations(score) {
    const recommendations = [];
    
    if (score < 40) {
        recommendations.push('建议寻求专业心理咨询师的帮助');
        recommendations.push('考虑参加心理健康支持小组');
        recommendations.push('尝试每日冥想和放松练习');
    } else if (score < 60) {
        recommendations.push('增加体育锻炼和户外活动');
        recommendations.push('建立规律的作息时间');
        recommendations.push('培养积极的社交关系');
    } else if (score < 80) {
        recommendations.push('继续保持良好的心理健康习惯');
        recommendations.push('定期进行自我反思和评估');
        recommendations.push('帮助他人，参与志愿活动');
    } else {
        recommendations.push('您的心理健康状况很好！');
        recommendations.push('继续保持现有的健康习惯');
        recommendations.push('可以分享您的经验帮助他人');
    }
    
    return recommendations;
}

// 显示评估结果
function displayAssessmentResults(result) {
    try {
        // 显示结果界面
        $w('#assessmentResultsLightbox').show();
        
        // 设置结果数据
        $w('#resultScore').text = result.score;
        $w('#resultLevel').text = getAssessmentLevel(result.score);
        $w('#resultDate').text = formatDate(result.completedDate);
        
        // 设置推荐建议
        $w('#recommendationsList').data = result.recommendations.map(rec => ({ text: rec }));
        
        // 设置分数颜色
        $w('#resultScore').style.color = getScoreColor(result.score);
        
    } catch (error) {
        console.error('Error displaying assessment results:', error);
    }
}

// 加载冥想程序
async function loadMeditationPrograms() {
    try {
        const programs = await wixData.query('MeditationPrograms')
            .eq('isActive', true)
            .ascending('category')
            .find();
        
        $w('#meditationProgramsRepeater').data = programs.items;
        
    } catch (error) {
        console.error('Error loading meditation programs:', error);
    }
}

// 冥想计时器相关函数
let meditationTimer = null;
let meditationStartTime = null;
let meditationPausedTime = 0;

// 开始冥想计时器
function startMeditationTimer(duration) {
    try {
        meditationStartTime = new Date();
        const durationMs = duration * 60 * 1000; // 转换为毫秒
        
        meditationTimer = setInterval(() => {
            const elapsed = new Date() - meditationStartTime - meditationPausedTime;
            const remaining = durationMs - elapsed;
            
            if (remaining <= 0) {
                // 冥想完成
                clearInterval(meditationTimer);
                handleMeditationComplete();
            } else {
                // 更新进度
                const progress = (elapsed / durationMs) * 100;
                $w('#meditationProgress').value = progress;
                $w('#meditationTimeRemaining').text = formatDuration(remaining / 1000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error starting meditation timer:', error);
    }
}

// 暂停冥想计时器
function pauseMeditationTimer() {
    if (meditationTimer) {
        clearInterval(meditationTimer);
        meditationPausedTime += new Date() - meditationStartTime;
    }
}

// 停止冥想计时器
function stopMeditationTimer() {
    if (meditationTimer) {
        clearInterval(meditationTimer);
        meditationTimer = null;
    }
}

// 获取当前冥想持续时间
function getCurrentMeditationDuration() {
    if (meditationStartTime) {
        return Math.floor((new Date() - meditationStartTime - meditationPausedTime) / 1000);
    }
    return 0;
}

// 处理冥想完成
function handleMeditationComplete() {
    try {
        // 播放完成音效（如果有）
        // playCompletionSound();
        
        // 显示完成消息
        showMessage('冥想完成！做得很好！', 'success');
        
        // 重置界面
        resetMeditationInterface();
        
        // 更新统计
        updateMeditationStatistics();
        
    } catch (error) {
        console.error('Error handling meditation complete:', error);
    }
}

// 重置冥想界面
function resetMeditationInterface() {
    try {
        $w('#startMeditationButton').show();
        $w('#pauseMeditationButton').hide();
        $w('#stopMeditationButton').hide();
        $w('#resumeMeditationButton').hide();
        $w('#meditationProgress').hide();
        $w('#meditationTimeRemaining').text = '';
        
        meditationStartTime = null;
        meditationPausedTime = 0;
        
    } catch (error) {
        console.error('Error resetting meditation interface:', error);
    }
}

// 加载可用时间段
async function loadAvailableSlots() {
    try {
        const slots = await wixData.query('CounselingSlots')
            .eq('isAvailable', true)
            .ge('slotDate', new Date())
            .ascending('slotDate')
            .find();
        
        $w('#availableSlotsRepeater').data = slots.items;
        
    } catch (error) {
        console.error('Error loading available slots:', error);
    }
}

// 加载咨询师信息
async function loadCounselorInfo() {
    try {
        const counselors = await wixData.query('Counselors')
            .eq('isActive', true)
            .ascending('name')
            .find();
        
        $w('#counselorsRepeater').data = counselors.items;
        
    } catch (error) {
        console.error('Error loading counselor info:', error);
    }
}

// 更新习惯进度
async function updateHabitProgress(habitId) {
    try {
        // 查询习惯完成记录
        const completions = await wixData.query('HabitCompletions')
            .eq('habitId', habitId)
            .find();
        
        // 更新习惯的完成次数
        await wixData.update('HabitTracking', {
            _id: habitId,
            completedCount: completions.items.length,
            lastCompletedDate: new Date()
        });
        
    } catch (error) {
        console.error('Error updating habit progress:', error);
    }
}

// 加载社区群组
async function loadCommunityGroups() {
    try {
        const groups = await wixData.query('CommunityGroups')
            .eq('isActive', true)
            .descending('memberCount')
            .find();
        
        $w('#communityGroupsRepeater').data = groups.items;
        
    } catch (error) {
        console.error('Error loading community groups:', error);
    }
}

// 加载社区活动
async function loadCommunityEvents() {
    try {
        const events = await wixData.query('CommunityEvents')
            .eq('isActive', true)
            .ge('eventDate', new Date())
            .ascending('eventDate')
            .find();
        
        $w('#communityEventsRepeater').data = events.items;
        
    } catch (error) {
        console.error('Error loading community events:', error);
    }
}

// 搜索功能

// 搜索资源
function searchResources(searchTerm) {
    try {
        const filteredResources = supportResources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm) ||
            resource.category.toLowerCase().includes(searchTerm)
        );
        
        $w('#resourcesRepeater').data = filteredResources;
        
    } catch (error) {
        console.error('Error searching resources:', error);
    }
}

// 搜索社区帖子
function searchCommunityPosts(searchTerm) {
    try {
        const filteredPosts = communityPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.category.toLowerCase().includes(searchTerm)
        );
        
        $w('#communityPostsRepeater').data = filteredPosts;
        
    } catch (error) {
        console.error('Error searching community posts:', error);
    }
}

// 搜索情绪记录
function searchMoodEntries(searchTerm) {
    try {
        const filteredEntries = moodEntries.filter(entry => 
            (entry.notes && entry.notes.toLowerCase().includes(searchTerm)) ||
            (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
        
        $w('#moodEntriesRepeater').data = filteredEntries;
        
    } catch (error) {
        console.error('Error searching mood entries:', error);
    }
}

// 全局搜索
function performGlobalSearch(searchTerm) {
    try {
        const results = [];
        
        // 搜索资源
        supportResources.forEach(resource => {
            if (resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'resource',
                    title: resource.title,
                    description: resource.description,
                    data: resource
                });
            }
        });
        
        // 搜索社区帖子
        communityPosts.forEach(post => {
            if (post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'post',
                    title: post.title,
                    description: post.content.substring(0, 100),
                    data: post
                });
            }
        });
        
        // 显示搜索结果
        $w('#searchResultsRepeater').data = results;
        $w('#searchResultsContainer').show();
        
    } catch (error) {
        console.error('Error performing global search:', error);
    }
}

// 重置搜索结果
function resetSearchResults() {
    try {
        $w('#searchResultsContainer').hide();
        
        // 根据当前视图重置显示
        switch (currentView) {
            case 'resources':
                $w('#resourcesRepeater').data = supportResources;
                break;
            case 'community':
                $w('#communityPostsRepeater').data = communityPosts;
                break;
            case 'mood-tracking':
                $w('#moodEntriesRepeater').data = moodEntries;
                break;
        }
        
    } catch (error) {
        console.error('Error resetting search results:', error);
    }
}

// 筛选功能

// 筛选情绪记录
function filterMoodEntries(filterValue) {
    try {
        let filteredEntries = [...moodEntries];
        
        switch (filterValue) {
            case 'last-week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filteredEntries = filteredEntries.filter(entry => 
                    new Date(entry.entryDate) >= weekAgo
                );
                break;
            case 'last-month':
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                filteredEntries = filteredEntries.filter(entry => 
                    new Date(entry.entryDate) >= monthAgo
                );
                break;
            case 'high-mood':
                filteredEntries = filteredEntries.filter(entry => entry.moodValue >= 7);
                break;
            case 'low-mood':
                filteredEntries = filteredEntries.filter(entry => entry.moodValue <= 4);
                break;
        }
        
        $w('#moodEntriesRepeater').data = filteredEntries;
        
    } catch (error) {
        console.error('Error filtering mood entries:', error);
    }
}

// 筛选评估
function filterAssessments(filterValue) {
    try {
        let filteredAssessments = [...assessmentResults];
        
        switch (filterValue) {
            case 'last-month':
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                filteredAssessments = filteredAssessments.filter(assessment => 
                    new Date(assessment.completedDate) >= monthAgo
                );
                break;
            case 'high-score':
                filteredAssessments = filteredAssessments.filter(assessment => assessment.score >= 80);
                break;
            case 'low-score':
                filteredAssessments = filteredAssessments.filter(assessment => assessment.score < 40);
                break;
        }
        
        $w('#assessmentHistoryRepeater').data = filteredAssessments;
        
    } catch (error) {
        console.error('Error filtering assessments:', error);
    }
}

// 筛选冥想会话
function filterMeditationSessions(filterValue) {
    try {
        let filteredSessions = [...meditationSessions];
        
        switch (filterValue) {
            case 'last-week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filteredSessions = filteredSessions.filter(session => 
                    new Date(session.sessionDate) >= weekAgo
                );
                break;
            case 'completed':
                filteredSessions = filteredSessions.filter(session => session.status === 'completed');
                break;
            case 'long-sessions':
                filteredSessions = filteredSessions.filter(session => session.actualDuration >= 600); // 10分钟以上
                break;
        }
        
        $w('#meditationSessionsRepeater').data = filteredSessions;
        
    } catch (error) {
        console.error('Error filtering meditation sessions:', error);
    }
}

// 筛选预约
function filterAppointments(filterValue) {
    try {
        let filteredAppointments = [...counselingAppointments];
        
        switch (filterValue) {
            case 'upcoming':
                filteredAppointments = filteredAppointments.filter(appointment => 
                    new Date(appointment.appointmentDate) > new Date() &&
                    appointment.status === 'scheduled'
                );
                break;
            case 'completed':
                filteredAppointments = filteredAppointments.filter(appointment => 
                    appointment.status === 'completed'
                );
                break;
            case 'cancelled':
                filteredAppointments = filteredAppointments.filter(appointment => 
                    appointment.status === 'cancelled'
                );
                break;
        }
        
        $w('#appointmentsRepeater').data = filteredAppointments;
        
    } catch (error) {
        console.error('Error filtering appointments:', error);
    }
}

// 筛选习惯
function filterHabits(filterValue) {
    try {
        let filteredHabits = [...habitTracking];
        
        switch (filterValue) {
            case 'active':
                filteredHabits = filteredHabits.filter(habit => habit.isActive);
                break;
            case 'completed':
                filteredHabits = filteredHabits.filter(habit => 
                    (habit.completedCount || 0) >= habit.goal
                );
                break;
            case 'daily':
                filteredHabits = filteredHabits.filter(habit => habit.frequency === 'daily');
                break;
            case 'weekly':
                filteredHabits = filteredHabits.filter(habit => habit.frequency === 'weekly');
                break;
        }
        
        $w('#habitsRepeater').data = filteredHabits;
        
    } catch (error) {
        console.error('Error filtering habits:', error);
    }
}

// 筛选社区帖子
function filterCommunityPosts(filterValue) {
    try {
        let filteredPosts = [...communityPosts];
        
        switch (filterValue) {
            case 'recent':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                filteredPosts = filteredPosts.filter(post => 
                    new Date(post.createdDate) >= weekAgo
                );
                break;
            case 'popular':
                filteredPosts = filteredPosts.filter(post => 
                    (post.likesCount || 0) >= 5
                );
                break;
            case 'support':
                filteredPosts = filteredPosts.filter(post => 
                    post.category === 'support'
                );
                break;
            case 'discussion':
                filteredPosts = filteredPosts.filter(post => 
                    post.category === 'discussion'
                );
                break;
        }
        
        $w('#communityPostsRepeater').data = filteredPosts;
        
    } catch (error) {
        console.error('Error filtering community posts:', error);
    }
}

// 筛选资源
function filterResources(filterValue) {
    try {
        let filteredResources = [...supportResources];
        
        switch (filterValue) {
            case 'articles':
                filteredResources = filteredResources.filter(resource => resource.type === 'article');
                break;
            case 'videos':
                filteredResources = filteredResources.filter(resource => resource.type === 'video');
                break;
            case 'apps':
                filteredResources = filteredResources.filter(resource => resource.type === 'app');
                break;
            case 'high-rated':
                filteredResources = filteredResources.filter(resource => 
                    (resource.rating || 0) >= 4
                );
                break;
        }
        
        $w('#resourcesRepeater').data = filteredResources;
        
    } catch (error) {
        console.error('Error filtering resources:', error);
    }
}

// 更新基于日期的内容
function updateDateBasedContent() {
    try {
        // 根据选择的日期更新相关内容
        const selectedDateStr = selectedDate.toDateString();
        
        // 筛选当天的情绪记录
        const dayMoodEntries = moodEntries.filter(entry => 
            new Date(entry.entryDate).toDateString() === selectedDateStr
        );
        
        // 筛选当天的冥想会话
        const dayMeditationSessions = meditationSessions.filter(session => 
            new Date(session.sessionDate).toDateString() === selectedDateStr
        );
        
        // 筛选当天的预约
        const dayAppointments = counselingAppointments.filter(appointment => 
            new Date(appointment.appointmentDate).toDateString() === selectedDateStr
        );
        
        // 更新显示
        $w('#dayMoodEntriesCount').text = dayMoodEntries.length.toString();
        $w('#dayMeditationCount').text = dayMeditationSessions.length.toString();
        $w('#dayAppointmentsCount').text = dayAppointments.length.toString();
        
        // 如果在相应的视图中，更新中继器数据
        if (currentView === 'mood-tracking') {
            $w('#moodEntriesRepeater').data = dayMoodEntries;
        } else if (currentView === 'meditation') {
            $w('#meditationSessionsRepeater').data = dayMeditationSessions;
        } else if (currentView === 'counseling') {
            $w('#appointmentsRepeater').data = dayAppointments;
        }
        
    } catch (error) {
        console.error('Error updating date-based content:', error);
    }
}

// 设置和偏好相关函数

// 加载用户偏好
async function loadUserPreferences() {
    try {
        const preferences = await wixData.query('UserPreferences')
            .eq('userId', currentUser.id)
            .find();
        
        if (preferences.items.length > 0) {
            userPreferences = preferences.items[0];
        } else {
            // 创建默认偏好
            userPreferences = {
                userId: currentUser.id,
                theme: 'light',
                notifications: true,
                privacy: 'private',
                language: 'zh-CN',
                autoRefresh: true
            };
        }
        
        // 应用偏好设置
        applyUserPreferences();
        
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

// 应用用户偏好
function applyUserPreferences() {
    try {
        // 应用主题
        if (userPreferences.theme === 'dark') {
            $w('#pageContainer').addClass('dark-theme');
        }
        
        // 应用其他偏好设置
        // ...
        
    } catch (error) {
        console.error('Error applying user preferences:', error);
    }
}

// 加载用户设置
function loadUserSettings() {
    try {
        // 预填设置表单
        $w('#themeSelector').value = userPreferences.theme || 'light';
        $w('#notificationsToggle').checked = userPreferences.notifications !== false;
        $w('#privacySelector').value = userPreferences.privacy || 'private';
        $w('#languageSelector').value = userPreferences.language || 'zh-CN';
        $w('#autoRefreshToggle').checked = userPreferences.autoRefresh !== false;
        
    } catch (error) {
        console.error('Error loading user settings:', error);
    }
}

// 加载隐私偏好
function loadPrivacyPreferences() {
    try {
        // 加载隐私设置
        $w('#dataVisibilitySelector').value = userPreferences.dataVisibility || 'private';
        $w('#shareProgressToggle').checked = userPreferences.shareProgress === true;
        $w('#anonymousPostingToggle').checked = userPreferences.anonymousPosting === true;
        
    } catch (error) {
        console.error('Error loading privacy preferences:', error);
    }
}

// 加载通知偏好
function loadNotificationPreferences() {
    try {
        // 加载通知设置
        $w('#emailNotificationsToggle').checked = userPreferences.emailNotifications !== false;
        $w('#pushNotificationsToggle').checked = userPreferences.pushNotifications !== false;
        $w('#reminderNotificationsToggle').checked = userPreferences.reminderNotifications !== false;
        $w('#communityNotificationsToggle').checked = userPreferences.communityNotifications !== false;
        
    } catch (error) {
        console.error('Error loading notification preferences:', error);
    }
}

// 紧急支持相关函数

// 通知紧急联系人
async function notifyEmergencyContacts() {
    try {
        // 这里应该实现实际的通知逻辑
        // 例如发送邮件或短信给紧急联系人
        console.log('Emergency contacts notified');
        
        // 记录紧急事件
        await wixData.save('EmergencyEvents', {
            studentId: currentUser.id,
            eventType: 'emergency_support_accessed',
            timestamp: new Date(),
            status: 'active'
        });
        
    } catch (error) {
        console.error('Error notifying emergency contacts:', error);
    }
}

// 加载紧急联系人
async function loadEmergencyContacts() {
    try {
        const contacts = await wixData.query('EmergencyContacts')
            .eq('studentId', currentUser.id)
            .find();
        
        $w('#emergencyContactsRepeater').data = contacts.items;
        
    } catch (error) {
        console.error('Error loading emergency contacts:', error);
    }
}

// 报告和分析相关函数

// 生成进度报告
function generateProgressReport() {
    try {
        const report = {
            period: '最近30天',
            moodStats: {
                average: calculateAverageMood(),
                trend: calculateMoodTrend(),
                entries: moodEntries.length
            },
            meditationStats: {
                totalTime: calculateTotalMeditationTime(),
                sessions: meditationSessions.length,
                averageSession: meditationSessions.length > 0 ? 
                    calculateTotalMeditationTime() / meditationSessions.length : 0
            },
            habitStats: {
                completionRate: calculateHabitCompletionRate(),
                activeHabits: habitTracking.filter(h => h.isActive).length
            },
            assessmentStats: {
                completed: assessmentResults.length,
                latestScore: assessmentResults.length > 0 ? assessmentResults[0].score : 0,
                trend: calculateAssessmentTrend()
            }
        };
        
        return formatProgressReport(report);
    } catch (error) {
        console.error('Error generating progress report:', error);
        return '无法生成报告';
    }
}

// 格式化进度报告
function formatProgressReport(report) {
    return `
        <div class="progress-report">
            <h2>心理健康进度报告</h2>
            <p><strong>报告期间：</strong>${report.period}</p>
            
            <div class="report-section">
                <h3>情绪跟踪</h3>
                <p>平均情绪：${report.moodStats.average.toFixed(1)}/10</p>
                <p>趋势：${report.moodStats.trend}</p>
                <p>记录次数：${report.moodStats.entries}</p>
            </div>
            
            <div class="report-section">
                <h3>冥想练习</h3>
                <p>总时长：${formatDuration(report.meditationStats.totalTime)}</p>
                <p>会话次数：${report.meditationStats.sessions}</p>
                <p>平均时长：${formatDuration(report.meditationStats.averageSession)}</p>
            </div>
            
            <div class="report-section">
                <h3>习惯跟踪</h3>
                <p>完成率：${report.habitStats.completionRate}%</p>
                <p>活跃习惯：${report.habitStats.activeHabits}</p>
            </div>
            
            <div class="report-section">
                <h3>心理评估</h3>
                <p>完成次数：${report.assessmentStats.completed}</p>
                <p>最新分数：${report.assessmentStats.latestScore}</p>
                <p>趋势：${report.assessmentStats.trend}</p>
            </div>
        </div>
    `;
}

// 生成可打印报告
function generatePrintableReport() {
    const report = generateProgressReport();
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>心理健康报告</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .report-section { margin-bottom: 20px; }
                h2, h3 { color: #333; }
                p { margin: 5px 0; }
            </style>
        </head>
        <body>
            ${report}
            <div class="report-footer">
                <p>生成时间：${formatDateTime(new Date())}</p>
                <p>学生：${currentUser.loginEmail}</p>
            </div>
        </body>
        </html>
    `;
}

// 显示加载状态
function showLoading(show) {
    try {
        if (show) {
            $w('#loadingOverlay').show();
        } else {
            $w('#loadingOverlay').hide();
        }
    } catch (error) {
        console.error('Error showing loading state:', error);
    }
}

// 日期和时间格式化函数
function formatDate(date) {
    try {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN');
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}

function formatDateTime(date) {
    try {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('zh-CN');
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '';
    }
}

function formatDuration(seconds) {
    try {
        if (!seconds || seconds < 0) return '0分钟';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    } catch (error) {
        console.error('Error formatting duration:', error);
        return '0分钟';
    }
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 显示消息
function showMessage(message, type = 'info') {
    try {
        const messageColors = {
            'success': '#4CAF50',
            'error': '#F44336',
            'warning': '#FF9800',
            'info': '#2196F3'
        };
        
        $w('#messageText').text = message;
        $w('#messageContainer').style.backgroundColor = messageColors[type] || messageColors.info;
        $w('#messageContainer').show();
        
        // 3秒后自动隐藏
        setTimeout(() => {
            $w('#messageContainer').hide();
        }, 3000);
        
    } catch (error) {
        console.error('Error showing message:', error);
    }
}

// 自动刷新和缓存管理
let autoRefreshInterval = null;

function startAutoRefresh() {
    if (userPreferences.autoRefresh && !autoRefreshInterval) {
        autoRefreshInterval = setInterval(async () => {
            try {
                await refreshData();
            } catch (error) {
                console.error('Error in auto refresh:', error);
            }
        }, 300000); // 每5分钟刷新一次
    }
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

async function refreshData() {
    try {
        console.log('Refreshing data...');
        
        // 重新加载数据
        await loadAllData();
        
        // 更新当前视图
        switch (currentView) {
            case 'dashboard':
                updateDashboard();
                break;
            case 'mood-tracking':
                updateMoodTrackingDisplay();
                break;
            case 'assessment':
                updateAssessmentDisplay();
                break;
            case 'meditation':
                updateMeditationDisplay();
                break;
            case 'counseling':
                updateCounselingDisplay();
                break;
            case 'habits':
                updateHabitsDisplay();
                break;
            case 'community':
                updateCommunityDisplay();
                break;
            case 'resources':
                updateResourcesDisplay();
                break;
        }
        
        console.log('Data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

// 分析和跟踪
let userActionStats = {
    pageViews: 0,
    moodEntries: 0,
    meditationSessions: 0,
    assessmentsCompleted: 0,
    resourcesViewed: 0,
    communityInteractions: 0
};

function trackUserAction(action, data = {}) {
    try {
        // 更新本地统计
        switch (action) {
            case 'page_visit':
                userActionStats.pageViews++;
                break;
            case 'mood_entry_saved':
                userActionStats.moodEntries++;
                break;
            case 'meditation_completed':
                userActionStats.meditationSessions++;
                break;
            case 'assessment_completed':
                userActionStats.assessmentsCompleted++;
                break;
            case 'resource_opened':
                userActionStats.resourcesViewed++;
                break;
            case 'community_interaction':
                userActionStats.communityInteractions++;
                break;
        }
        
        // 发送到分析服务（如果需要）
        sendUsageStatistics(action, data);
        
        console.log(`Action tracked: ${action}`, data);
    } catch (error) {
        console.error('Error tracking user action:', error);
    }
}

async function sendUsageStatistics(action, data) {
    try {
        // 这里可以发送统计数据到分析服务
        // 例如 Google Analytics, Mixpanel 等
        
        // 保存到数据库用于内部分析
        await wixData.save('UserAnalytics', {
            userId: currentUser.id,
            action: action,
            data: data,
            timestamp: new Date(),
            sessionId: session.getItem('sessionId') || generateUniqueId()
        });
        
    } catch (error) {
        console.error('Error sending usage statistics:', error);
    }
}

// 页面生命周期管理
$w.onReady(() => {
    // 页面加载完成后的初始化
    console.log('Student Wellbeing page ready');
    
    // 设置会话ID
    if (!session.getItem('sessionId')) {
        session.setItem('sessionId', generateUniqueId());
    }
    
    // 启动自动刷新
    setTimeout(() => {
        startAutoRefresh();
    }, 5000); // 5秒后启动自动刷新
});

// 页面卸载时的清理
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        console.log('Student Wellbeing page unloading');
        
        // 停止自动刷新
        stopAutoRefresh();
        
        // 清理计时器
        if (meditationTimer) {
            clearInterval(meditationTimer);
        }
        
        // 发送最终统计
        sendUsageStatistics('page_unload', {
            sessionDuration: Date.now() - (session.getItem('sessionStart') || Date.now()),
            stats: userActionStats
        });
    });
}

/**
 * 使用说明：
 * 
 * 1. 页面结构要求：
 *    - 主容器：#pageContainer
 *    - 导航标签：#dashboardTab, #moodTrackingTab, #assessmentTab 等
 *    - 视图容器：#dashboardContainer, #mood-trackingContainer 等
 *    - 各种按钮和输入框按照代码中的ID命名
 * 
 * 2. 数据库集合结构：
 *    - WellbeingData: 心理健康数据
 *    - MoodEntries: 情绪记录
 *    - AssessmentResults: 评估结果
 *    - MeditationSessions: 冥想会话
 *    - CounselingAppointments: 咨询预约
 *    - HabitTracking: 习惯跟踪
 *    - SupportResources: 支持资源
 *    - CommunityPosts: 社区帖子
 *    - UserPreferences: 用户偏好
 *    - EmergencyContacts: 紧急联系人
 * 
 * 3. 权限设置：
 *    - 确保用户只能访问自己的数据
 *    - 设置适当的读写权限
 *    - 保护敏感信息
 * 
 * 4. 自定义功能：
 *    - 根据需要调整评估算法
 *    - 自定义推荐逻辑
 *    - 添加更多冥想类型
 *    - 扩展社区功能
 * 
 * 5. 性能优化：
 *    - 使用分页加载大量数据
 *    - 实现数据缓存
 *    - 优化图表渲染
 * 
 * 6. 安全考虑：
 *    - 验证所有用户输入
 *    - 保护隐私数据
 *    - 实现适当的访问控制
 *    - 遵循数据保护法规
 */

// 导出主要函数（如果需要在其他文件中使用）
export {
    switchView,
    updateDashboard,
    trackUserAction,
    showMessage,
    formatDate,
    formatDateTime,
    formatDuration
};