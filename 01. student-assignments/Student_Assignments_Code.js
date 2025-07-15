/**
 * Wix学生作业与考试页面 - 完整代码实现
 * 
 * 项目描述：
 * 这是一个全面的学生作业管理系统，允许学生查看、管理和提交作业与考试。
 * 页面提供了直观的仪表盘界面，包含作业筛选、进度跟踪、快速统计等功能。
 * 
 * 主要功能：
 * - 作业和考试的查看与管理
 * - 多维度筛选系统（科目、类型、状态、截止日期）
 * - 实时进度跟踪和统计
 * - 响应式设计支持
 * - 紧急支持功能
 * 
 * 技术栈：Wix Velo (JavaScript)
 * 开发时间：预计15-20小时
 * 维护：定期更新和性能优化
 */

// ==================== 模块导入 ====================
import { authentication } from 'wix-members';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { local, session } from 'wix-storage';
import wixWindow from 'wix-window';

// ==================== 全局变量定义 ====================
let currentUser = null;           // 当前登录用户信息
let assignmentsData = [];         // 作业数据缓存
let currentFilters = {            // 当前筛选条件
    subject: '',
    type: '',
    status: '',
    dueDate: '',
    search: ''
};
let currentView = 'grid';         // 当前视图模式：grid 或 list
let isLoading = false;            // 加载状态标识
let refreshInterval = null;       // 自动刷新定时器

// ==================== 页面初始化 ====================
$w.onReady(function () {
    console.log('学生作业页面初始化开始');
    
    // 检查用户认证状态
    checkAuthentication()
        .then(() => {
            // 初始化页面组件
            initializePage();
            
            // 设置事件处理器
            setupEventHandlers();
            
            // 加载初始数据
            loadInitialData();
            
            // 启动自动刷新
            startAutoRefresh();
            
            console.log('页面初始化完成');
        })
        .catch((error) => {
            console.error('页面初始化失败:', error);
            handleAuthenticationError();
        });
});

// ==================== 认证检查 ====================
/**
 * 检查用户认证状态
 * @returns {Promise} 认证检查结果
 */
function checkAuthentication() {
    return authentication.currentUser.getUser()
        .then((user) => {
            if (user.loggedIn) {
                currentUser = user;
                console.log('用户已登录:', user.id);
                return Promise.resolve();
            } else {
                throw new Error('用户未登录');
            }
        });
}

/**
 * 处理认证错误
 */
function handleAuthenticationError() {
    console.log('重定向到登录页面');
    wixLocation.to('/login');
}

// ==================== 页面初始化函数 ====================
/**
 * 初始化页面组件和设置
 */
function initializePage() {
    // 设置页面标题
    $w('#pageTitle').text = '作业与考试';
    
    // 初始化筛选器
    initializeFilters();
    
    // 设置默认视图
    setViewMode('grid');
    
    // 初始化加载状态
    showLoadingState();
    
    // 设置响应式布局
    setupResponsiveLayout();
}

/**
 * 初始化筛选器选项
 */
function initializeFilters() {
    // 科目筛选器选项
    const subjectOptions = [
        { label: '全部科目', value: '' },
        { label: '数学', value: 'mathematics' },
        { label: '英语', value: 'english' },
        { label: '科学', value: 'science' },
        { label: '历史', value: 'history' },
        { label: '地理', value: 'geography' },
        { label: '艺术', value: 'art' },
        { label: '体育', value: 'pe' }
    ];
    
    // 类型筛选器选项
    const typeOptions = [
        { label: '全部类型', value: '' },
        { label: '作业', value: 'assignment' },
        { label: '考试', value: 'exam' },
        { label: '项目', value: 'project' },
        { label: '测验', value: 'quiz' }
    ];
    
    // 状态筛选器选项
    const statusOptions = [
        { label: '全部状态', value: '' },
        { label: '未开始', value: 'not-started' },
        { label: '进行中', value: 'in-progress' },
        { label: '已提交', value: 'submitted' },
        { label: '已评分', value: 'graded' },
        { label: '逾期', value: 'overdue' }
    ];
    
    // 截止日期筛选器选项
    const dueDateOptions = [
        { label: '全部时间', value: '' },
        { label: '今天到期', value: 'today' },
        { label: '本周到期', value: 'week' },
        { label: '本月到期', value: 'month' },
        { label: '已逾期', value: 'overdue' }
    ];
    
    // 设置筛选器选项
    $w('#subjectFilterDropdown').options = subjectOptions;
    $w('#typeFilterDropdown').options = typeOptions;
    $w('#statusFilterDropdown').options = statusOptions;
    $w('#dueDateFilterDropdown').options = dueDateOptions;
}

// ==================== 事件处理器设置 ====================
/**
 * 设置所有事件处理器
 */
function setupEventHandlers() {
    // 搜索输入框事件
    $w('#assignmentSearchInput').onInput(debounce(handleSearch, 300));
    
    // 筛选器下拉菜单事件
    $w('#subjectFilterDropdown').onChange(handleSubjectFilter);
    $w('#typeFilterDropdown').onChange(handleTypeFilter);
    $w('#statusFilterDropdown').onChange(handleStatusFilter);
    $w('#dueDateFilterDropdown').onChange(handleDueDateFilter);
    
    // 视图切换按钮事件
    $w('#gridViewButton').onClick(handleGridView);
    $w('#listViewButton').onClick(handleListView);
    
    // 紧急支持按钮事件
    $w('#emergencyButton').onClick(handleEmergencySupport);
    
    // 作业卡片点击事件（通过数据集）
    $w('#assignmentsDataset').onReady(() => {
        $w('#assignmentCardsRepeater').onItemReady(setupCardEvents);
    });
    
    // 刷新按钮事件
    if ($w('#refreshButton')) {
        $w('#refreshButton').onClick(handleRefresh);
    }
}

/**
 * 设置作业卡片事件
 * @param {Object} $item - 卡片项目元素
 */
function setupCardEvents($item) {
    // 卡片点击事件
    $item('#assignmentCard').onClick((event) => {
        const itemData = $item('#assignmentCardsRepeater').getCurrentItem();
        handleAssignmentCardClick(itemData);
    });
    
    // 开始作业按钮
    if ($item('#startAssignmentBtn')) {
        $item('#startAssignmentBtn').onClick((event) => {
            const itemData = $item('#assignmentCardsRepeater').getCurrentItem();
            handleStartAssignment(itemData);
        });
    }
    
    // 继续作业按钮
    if ($item('#continueAssignmentBtn')) {
        $item('#continueAssignmentBtn').onClick((event) => {
            const itemData = $item('#assignmentCardsRepeater').getCurrentItem();
            handleContinueAssignment(itemData);
        });
    }
    
    // 提交作业按钮
    if ($item('#submitAssignmentBtn')) {
        $item('#submitAssignmentBtn').onClick((event) => {
            const itemData = $item('#assignmentCardsRepeater').getCurrentItem();
            handleSubmitAssignment(itemData);
        });
    }
}

// ==================== 数据加载函数 ====================
/**
 * 加载初始数据
 */
function loadInitialData() {
    Promise.all([
        loadUserProfile(),
        loadAssignments(),
        loadQuickStats()
    ])
    .then(() => {
        hideLoadingState();
        console.log('所有初始数据加载完成');
    })
    .catch((error) => {
        console.error('数据加载失败:', error);
        showErrorMessage('数据加载失败，请刷新页面重试');
        hideLoadingState();
    });
}

/**
 * 加载用户资料
 * @returns {Promise} 用户资料加载结果
 */
function loadUserProfile() {
    return wixData.get('Students', currentUser.id)
        .then((student) => {
            // 更新用户信息显示
            $w('#userNameText').text = `${student.firstName} ${student.lastName}`;
            $w('#userRoleText').text = student.yearGroup || '学生';
            
            // 设置用户头像
            if (student.profileImage) {
                $w('#userAvatarImage').src = student.profileImage;
            }
            
            console.log('用户资料加载完成');
        })
        .catch((error) => {
            console.error('用户资料加载失败:', error);
            // 使用默认值
            $w('#userNameText').text = '学生用户';
            $w('#userRoleText').text = '学生';
        });
}

/**
 * 加载作业数据
 * @returns {Promise} 作业数据加载结果
 */
function loadAssignments() {
    const filter = buildAssignmentFilter();
    
    return $w('#assignmentsDataset')
        .setFilter(filter)
        .then(() => {
            // 获取数据集中的数据
            assignmentsData = $w('#assignmentsDataset').getCurrentPageItems();
            console.log(`加载了 ${assignmentsData.length} 个作业`);
            
            // 更新UI显示
            updateAssignmentDisplay();
        });
}

/**
 * 构建作业筛选条件
 * @returns {Object} Wix数据筛选器
 */
function buildAssignmentFilter() {
    let filter = wixData.filter()
        .eq('studentId', currentUser.id)
        .eq('isVisible', true);
    
    // 科目筛选
    if (currentFilters.subject) {
        filter = filter.eq('subject', currentFilters.subject);
    }
    
    // 类型筛选
    if (currentFilters.type) {
        filter = filter.eq('type', currentFilters.type);
    }
    
    // 状态筛选
    if (currentFilters.status) {
        filter = filter.eq('status', currentFilters.status);
    }
    
    // 搜索筛选
    if (currentFilters.search) {
        filter = filter.or(
            wixData.filter().contains('title', currentFilters.search),
            wixData.filter().contains('description', currentFilters.search),
            wixData.filter().contains('subject', currentFilters.search)
        );
    }
    
    // 截止日期筛选
    if (currentFilters.dueDate) {
        const today = new Date();
        let endDate;
        
        switch (currentFilters.dueDate) {
            case 'today':
                endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                filter = filter.between('dueDate', today, endDate);
                break;
            case 'week':
                endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                filter = filter.between('dueDate', today, endDate);
                break;
            case 'month':
                endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                filter = filter.between('dueDate', today, endDate);
                break;
            case 'overdue':
                filter = filter.lt('dueDate', today)
                    .ne('status', 'submitted')
                    .ne('status', 'graded');
                break;
        }
    }
    
    return filter;
}

/**
 * 加载快速统计数据
 * @returns {Promise} 统计数据加载结果
 */
function loadQuickStats() {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const promises = [
        // 本周到期的作业数量
        wixData.query('Assignments')
            .eq('studentId', currentUser.id)
            .between('dueDate', today, weekFromNow)
            .ne('status', 'submitted')
            .ne('status', 'graded')
            .count(),
        
        // 本周的考试数量
        wixData.query('Assignments')
            .eq('studentId', currentUser.id)
            .eq('type', 'exam')
            .between('dueDate', today, weekFromNow)
            .count(),
        
        // 已完成的作业数量
        wixData.query('Assignments')
            .eq('studentId', currentUser.id)
            .eq('type', 'assignment')
            .eq('status', 'graded')
            .count(),
        
        // 已完成的考试数量
        wixData.query('Assignments')
            .eq('studentId', currentUser.id)
            .eq('type', 'exam')
            .eq('status', 'graded')
            .count()
    ];
    
    return Promise.all(promises)
        .then(([dueThisWeek, examsThisWeek, completedAssignments, completedExams]) => {
            // 更新统计显示
            $w('#dueThisWeekCount').text = dueThisWeek.toString();
            $w('#examsThisWeekCount').text = examsThisWeek.toString();
            $w('#completedAssignmentsCount').text = completedAssignments.toString();
            $w('#completedExamsCount').text = completedExams.toString();
            
            console.log('快速统计数据加载完成');
        });
}

// ==================== 筛选事件处理器 ====================
/**
 * 处理搜索输入
 * @param {Event} event - 输入事件
 */
function handleSearch(event) {
    currentFilters.search = event.target.value.toLowerCase().trim();
    console.log('搜索条件:', currentFilters.search);
    
    // 重新加载作业数据
    loadAssignments();
    
    // 跟踪搜索行为
    if (currentFilters.search.length > 2) {
        trackEvent('搜索', '作业搜索', currentFilters.search);
    }
}

/**
 * 处理科目筛选
 * @param {Event} event - 选择事件
 */
function handleSubjectFilter(event) {
    currentFilters.subject = event.target.value;
    console.log('科目筛选:', currentFilters.subject);
    loadAssignments();
    trackEvent('筛选', '科目筛选', currentFilters.subject);
}

/**
 * 处理类型筛选
 * @param {Event} event - 选择事件
 */
function handleTypeFilter(event) {
    currentFilters.type = event.target.value;
    console.log('类型筛选:', currentFilters.type);
    loadAssignments();
    trackEvent('筛选', '类型筛选', currentFilters.type);
}

/**
 * 处理状态筛选
 * @param {Event} event - 选择事件
 */
function handleStatusFilter(event) {
    currentFilters.status = event.target.value;
    console.log('状态筛选:', currentFilters.status);
    loadAssignments();
    trackEvent('筛选', '状态筛选', currentFilters.status);
}

/**
 * 处理截止日期筛选
 * @param {Event} event - 选择事件
 */
function handleDueDateFilter(event) {
    currentFilters.dueDate = event.target.value;
    console.log('截止日期筛选:', currentFilters.dueDate);
    loadAssignments();
    trackEvent('筛选', '截止日期筛选', currentFilters.dueDate);
}

// ==================== 视图切换处理器 ====================
/**
 * 处理网格视图切换
 */
function handleGridView() {
    setViewMode('grid');
    trackEvent('界面', '视图切换', '网格视图');
}

/**
 * 处理列表视图切换
 */
function handleListView() {
    setViewMode('list');
    trackEvent('界面', '视图切换', '列表视图');
}

/**
 * 设置视图模式
 * @param {string} mode - 视图模式：'grid' 或 'list'
 */
function setViewMode(mode) {
    currentView = mode;
    
    if (mode === 'grid') {
        $w('#assignmentsGridContainer').show();
        $w('#assignmentListContainer').hide();
        $w('#gridViewButton').addClass('active');
        $w('#listViewButton').removeClass('active');
    } else {
        $w('#assignmentsGridContainer').hide();
        $w('#assignmentListContainer').show();
        $w('#listViewButton').addClass('active');
        $w('#gridViewButton').removeClass('active');
    }
    
    // 保存用户偏好
    local.setItem('preferredView', mode);
}

// ==================== 作业操作处理器 ====================
/**
 * 处理作业卡片点击
 * @param {Object} assignmentData - 作业数据
 */
function handleAssignmentCardClick(assignmentData) {
    console.log('点击作业:', assignmentData.title);
    
    // 跟踪点击事件
    trackEvent('作业', '查看详情', assignmentData.subject);
    
    // 加载作业详情
    loadAssignmentDetails(assignmentData);
    
    // 显示详情弹窗
    $w('#assignmentDetailsLightbox').show();
}

/**
 * 加载作业详情
 * @param {Object} assignment - 作业对象
 */
function loadAssignmentDetails(assignment) {
    // 基本信息
    $w('#detailTitle').text = assignment.title;
    $w('#detailSubject').text = assignment.subject;
    $w('#detailDescription').html = assignment.description || '暂无描述';
    $w('#detailDueDate').text = formatDate(assignment.dueDate);
    $w('#detailPoints').text = `${assignment.points || 0} 分`;
    $w('#detailStatus').text = formatStatus(assignment.status);
    
    // 设置状态颜色
    setStatusColor($w('#detailStatus'), assignment.status);
    
    // 配置操作按钮
    configureDetailButtons(assignment);
    
    // 加载附件信息
    if (assignment.attachments && assignment.attachments.length > 0) {
        loadAttachments(assignment.attachments);
    }
    
    // 加载提交历史
    loadSubmissionHistory(assignment._id);
}

/**
 * 配置详情页面的操作按钮
 * @param {Object} assignment - 作业对象
 */
function configureDetailButtons(assignment) {
    const startBtn = $w('#startAssignmentBtn');
    const continueBtn = $w('#continueAssignmentBtn');
    const submitBtn = $w('#submitAssignmentBtn');
    const viewBtn = $w('#viewSubmissionBtn');
    
    // 先隐藏所有按钮
    [startBtn, continueBtn, submitBtn, viewBtn].forEach(btn => {
        if (btn) btn.hide();
    });
    
    // 根据状态显示相应按钮
    switch (assignment.status) {
        case 'not-started':
            if (startBtn) {
                startBtn.show();
                startBtn.onClick(() => handleStartAssignment(assignment));
            }
            break;
            
        case 'in-progress':
            if (continueBtn) {
                continueBtn.show();
                continueBtn.onClick(() => handleContinueAssignment(assignment));
            }
            if (submitBtn) {
                submitBtn.show();
                submitBtn.onClick(() => handleSubmitAssignment(assignment));
            }
            break;
            
        case 'submitted':
        case 'graded':
            if (viewBtn) {
                viewBtn.show();
                viewBtn.onClick(() => handleViewSubmission(assignment));
            }
            break;
    }
}

/**
 * 处理开始作业
 * @param {Object} assignment - 作业对象
 */
function handleStartAssignment(assignment) {
    console.log('开始作业:', assignment.title);
    
    // 更新作业状态
    wixData.update('Assignments', {
        _id: assignment._id,
        status: 'in-progress',
        startedAt: new Date()
    })
    .then(() => {
        showSuccessMessage('作业已开始！');
        
        // 跟踪事件
        trackEvent('作业', '开始作业', assignment.subject);
        
        // 刷新数据
        loadAssignments();
        loadQuickStats();
        
        // 关闭弹窗
        $w('#assignmentDetailsLightbox').hide();
        
        // 跳转到作业页面
        if (assignment.workUrl) {
            wixLocation.to(assignment.workUrl);
        }
    })
    .catch((error) => {
        console.error('开始作业失败:', error);
        showErrorMessage('开始作业失败，请重试');
    });
}

/**
 * 处理继续作业
 * @param {Object} assignment - 作业对象
 */
function handleContinueAssignment(assignment) {
    console.log('继续作业:', assignment.title);
    
    // 跟踪事件
    trackEvent('作业', '继续作业', assignment.subject);
    
    // 跳转到作业页面
    if (assignment.workUrl) {
        wixLocation.to(assignment.workUrl);
    } else {
        showErrorMessage('作业链接不可用');
    }
}

/**
 * 处理提交作业
 * @param {Object} assignment - 作业对象
 */
function handleSubmitAssignment(assignment) {
    console.log('提交作业:', assignment.title);
    
    // 显示确认对话框
    wixWindow.openLightbox('SubmitConfirmationLightbox', assignment)
        .then((result) => {
            if (result && result.confirmed) {
                // 执行提交逻辑
                submitAssignment(assignment, result.submissionData);
            }
        });
}

/**
 * 执行作业提交
 * @param {Object} assignment - 作业对象
 * @param {Object} submissionData - 提交数据
 */
function submitAssignment(assignment, submissionData) {
    // 更新作业状态
    const updateData = {
        _id: assignment._id,
        status: 'submitted',
        submittedAt: new Date(),
        submissionText: submissionData.text || '',
        submissionFiles: submissionData.files || []
    };
    
    wixData.update('Assignments', updateData)
        .then(() => {
            showSuccessMessage('作业提交成功！');
            
            // 跟踪事件
            trackEvent('作业', '提交作业', assignment.subject);
            
            // 刷新数据
            loadAssignments();
            loadQuickStats();
            
            // 关闭弹窗
            $w('#assignmentDetailsLightbox').hide();
        })
        .catch((error) => {
            console.error('作业提交失败:', error);
            showErrorMessage('作业提交失败，请重试');
        });
}

/**
 * 处理查看提交
 * @param {Object} assignment - 作业对象
 */
function handleViewSubmission(assignment) {
    console.log('查看提交:', assignment.title);
    
    // 跟踪事件
    trackEvent('作业', '查看提交', assignment.subject);
    
    // 显示提交详情弹窗
    wixWindow.openLightbox('SubmissionDetailsLightbox', assignment);
}

// ==================== 紧急支持处理器 ====================
/**
 * 处理紧急支持请求
 */
function handleEmergencySupport() {
    console.log('紧急支持请求');
    
    // 跟踪事件
    trackEvent('支持', '紧急支持', '学生作业页面');
    
    // 显示紧急支持弹窗
    wixWindow.openLightbox('EmergencySupportLightbox')
        .then((result) => {
            if (result && result.contactMethod) {
                handleEmergencyContact(result);
            }
        });
}

/**
 * 处理紧急联系
 * @param {Object} contactData - 联系数据
 */
function handleEmergencyContact(contactData) {
    // 记录紧急支持请求
    const supportRequest = {
        studentId: currentUser.id,
        type: 'emergency',
        method: contactData.contactMethod,
        message: contactData.message || '',
        timestamp: new Date(),
        status: 'pending'
    };
    
    wixData.insert('SupportRequests', supportRequest)
        .then(() => {
            showSuccessMessage('紧急支持请求已发送，我们会尽快联系您');
        })
        .catch((error) => {
            console.error('紧急支持请求失败:', error);
            showErrorMessage('请求发送失败，请直接拨打紧急电话');
        });
}

// ==================== UI更新函数 ====================
/**
 * 更新作业显示
 */
function updateAssignmentDisplay() {
    // 更新作业计数
    const totalCount = assignmentsData.length;
    $w('#assignmentCountText').text = `共 ${totalCount} 个作业`;
    
    // 如果没有作业，显示空状态
    if (totalCount === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
    }
}

/**
 * 显示空状态
 */
function showEmptyState() {
    if ($w('#emptyStateContainer')) {
        $w('#emptyStateContainer').show();
        $w('#assignmentsGridContainer').hide();
        $w('#assignmentListContainer').hide();
    }
}

/**
 * 隐藏空状态
 */
function hideEmptyState() {
    if ($w('#emptyStateContainer')) {
        $w('#emptyStateContainer').hide();
        
        // 显示相应的视图容器
        if (currentView === 'grid') {
            $w('#assignmentsGridContainer').show();
        } else {
            $w('#assignmentListContainer').show();
        }
    }
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    isLoading = true;
    if ($w('#loadingIndicator')) {
        $w('#loadingIndicator').show();
    }
    
    // 禁用交互元素
    disableInteractions();
}

/**
 * 隐藏加载状态
 */
function hideLoadingState() {
    isLoading = false;
    if ($w('#loadingIndicator')) {
        $w('#loadingIndicator').hide();
    }
    
    // 启用交互元素
    enableInteractions();
}

/**
 * 禁用交互元素
 */
function disableInteractions() {
    const elements = [
        '#assignmentSearchInput',
        '#subjectFilterDropdown',
        '#typeFilterDropdown',
        '#statusFilterDropdown',
        '#dueDateFilterDropdown',
        '#gridViewButton',
        '#listViewButton'
    ];
    
    elements.forEach(selector => {
        if ($w(selector)) {
            $w(selector).disable();
        }
    });
}

/**
 * 启用交互元素
 */
function enableInteractions() {
    const elements = [
        '#assignmentSearchInput',
        '#subjectFilterDropdown',
        '#typeFilterDropdown',
        '#statusFilterDropdown',
        '#dueDateFilterDropdown',
        '#gridViewButton',
        '#listViewButton'
    ];
    
    elements.forEach(selector => {
        if ($w(selector)) {
            $w(selector).enable();
        }
    });
}

// ==================== 响应式设计处理 ====================
/**
 * 设置响应式布局
 */
function setupResponsiveLayout() {
    // 检测屏幕尺寸
    const screenWidth = wixWindow.viewMode === 'mobile' ? 'mobile' : 'desktop';
    
    if (screenWidth === 'mobile') {
        setupMobileLayout();
    } else {
        setupDesktopLayout();
    }
    
    // 监听窗口大小变化
    wixWindow.onViewModeChange((viewMode) => {
        if (viewMode === 'mobile') {
            setupMobileLayout();
        } else {
            setupDesktopLayout();
        }
    });
}

/**
 * 设置移动端布局
 */
function setupMobileLayout() {
    console.log('切换到移动端布局');
    
    // 调整侧边栏
    if ($w('#sidebarContainer')) {
        $w('#sidebarContainer').collapse();
    }
    
    // 调整主内容区域
    if ($w('#mainContentContainer')) {
        $w('#mainContentContainer').expand();
    }
    
    // 调整统计卡片布局
    if ($w('#quickStatsContainer')) {
        $w('#quickStatsContainer').layout = 'column';
    }
    
    // 强制使用列表视图（移动端更友好）
    setViewMode('list');
}

/**
 * 设置桌面端布局
 */
function setupDesktopLayout() {
    console.log('切换到桌面端布局');
    
    // 显示侧边栏
    if ($w('#sidebarContainer')) {
        $w('#sidebarContainer').expand();
    }
    
    // 调整主内容区域
    if ($w('#mainContentContainer')) {
        $w('#mainContentContainer').collapse();
    }
    
    // 调整统计卡片布局
    if ($w('#quickStatsContainer')) {
        $w('#quickStatsContainer').layout = 'grid';
    }
    
    // 恢复用户偏好的视图模式
    const preferredView = local.getItem('preferredView') || 'grid';
    setViewMode(preferredView);
}

// ==================== 工具函数 ====================
/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
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

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    if (!date) return '未设置';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `已逾期 ${Math.abs(diffDays)} 天`;
    } else if (diffDays === 0) {
        return '今天到期';
    } else if (diffDays === 1) {
        return '明天到期';
    } else if (diffDays <= 7) {
        return `${diffDays} 天后到期`;
    } else {
        return targetDate.toLocaleDateString('zh-CN');
    }
}

/**
 * 格式化状态文本
 * @param {string} status - 状态值
 * @returns {string} 格式化后的状态文本
 */
function formatStatus(status) {
    const statusMap = {
        'not-started': '未开始',
        'in-progress': '进行中',
        'submitted': '已提交',
        'graded': '已评分',
        'overdue': '已逾期'
    };
    
    return statusMap[status] || status;
}

/**
 * 设置状态颜色
 * @param {Object} element - 元素对象
 * @param {string} status - 状态值
 */
function setStatusColor(element, status) {
    const colorMap = {
        'not-started': '#6c757d',
        'in-progress': '#007bff',
        'submitted': '#28a745',
        'graded': '#17a2b8',
        'overdue': '#dc3545'
    };
    
    const color = colorMap[status] || '#6c757d';
    element.style.color = color;
}

/**
 * 显示成功消息
 * @param {string} message - 消息内容
 */
function showSuccessMessage(message) {
    if ($w('#successMessage')) {
        $w('#successMessageText').text = message;
        $w('#successMessage').show();
        
        // 3秒后自动隐藏
        setTimeout(() => {
            $w('#successMessage').hide();
        }, 3000);
    } else {
        console.log('成功:', message);
    }
}

/**
 * 显示错误消息
 * @param {string} message - 消息内容
 */
function showErrorMessage(message) {
    if ($w('#errorMessage')) {
        $w('#errorMessageText').text = message;
        $w('#errorMessage').show();
        
        // 5秒后自动隐藏
        setTimeout(() => {
            $w('#errorMessage').hide();
        }, 5000);
    } else {
        console.error('错误:', message);
    }
}

/**
 * 处理刷新
 */
function handleRefresh() {
    console.log('手动刷新数据');
    
    // 显示加载状态
    showLoadingState();
    
    // 重新加载所有数据
    loadInitialData();
    
    // 跟踪刷新事件
    trackEvent('界面', '手动刷新', '学生作业页面');
}

// ==================== 自动刷新机制 ====================
/**
 * 启动自动刷新
 */
function startAutoRefresh() {
    // 每5分钟自动刷新一次数据
    refreshInterval = setInterval(() => {
        if (!isLoading) {
            console.log('自动刷新数据');
            loadQuickStats();
            
            // 如果没有筛选条件，也刷新作业列表
            if (!hasActiveFilters()) {
                loadAssignments();
            }
        }
    }, 5 * 60 * 1000); // 5分钟
}

/**
 * 停止自动刷新
 */
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

/**
 * 检查是否有活跃的筛选条件
 * @returns {boolean} 是否有筛选条件
 */
function hasActiveFilters() {
    return currentFilters.subject || 
           currentFilters.type || 
           currentFilters.status || 
           currentFilters.dueDate || 
           currentFilters.search;
}

// ==================== 分析和跟踪 ====================
/**
 * 跟踪事件
 * @param {string} category - 事件类别
 * @param {string} action - 事件动作
 * @param {string} label - 事件标签
 */
function trackEvent(category, action, label) {
    try {
        // 这里可以集成Google Analytics或其他分析工具
        console.log(`跟踪事件: ${category} - ${action} - ${label}`);
        
        // 示例：发送到分析服务
        // analytics.track({
        //     event: action,
        //     category: category,
        //     label: label,
        //     userId: currentUser.id,
        //     timestamp: new Date()
        // });
    } catch (error) {
        console.error('事件跟踪失败:', error);
    }
}

// ==================== 页面卸载处理 ====================
/**
 * 页面卸载时的清理工作
 */
$w.onPageUnload(() => {
    console.log('页面卸载，执行清理工作');
    
    // 停止自动刷新
    stopAutoRefresh();
    
    // 清理事件监听器
    // 注意：Wix会自动清理大部分事件监听器
    
    // 保存用户状态
    if (currentFilters) {
        session.setItem('lastFilters', JSON.stringify(currentFilters));
    }
});

// ==================== 导出函数（供其他模块使用） ====================
export {
    loadAssignments,
    loadQuickStats,
    handleRefresh,
    formatDate,
    formatStatus,
    showSuccessMessage,
    showErrorMessage
};

/**
 * 开发说明：
 * 
 * 1. 数据库集合要求：
 *    - Assignments: 作业集合
 *    - Students: 学生集合
 *    - SupportRequests: 支持请求集合
 * 
 * 2. 页面元素要求：
 *    - 所有元素ID必须与代码中的选择器匹配
 *    - 数据集配置正确连接到相应集合
 *    - Lightbox组件正确配置
 * 
 * 3. 权限设置：
 *    - 确保学生只能访问自己的数据
 *    - 设置适当的数据库权限
 * 
 * 4. 性能优化：
 *    - 使用数据集进行数据绑定
 *    - 实现适当的缓存机制
 *    - 优化数据库查询
 * 
 * 5. 测试要点：
 *    - 所有筛选组合
 *    - 响应式设计
 *    - 错误处理
 *    - 性能测试
 */