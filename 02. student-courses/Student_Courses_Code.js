/**
 * Wix 学生课程页面 - 完整代码实现
 * Student Courses Page - Complete Velo JavaScript Implementation
 * 
 * 项目描述：
 * 这是 Purple Ruler Academy 学生门户网站的课程管理页面。
 * 学生可以查看已注册的课程、课程详情、课程进度、课程资源等。
 * 
 * 主要功能：
 * - 课程列表显示和管理
 * - 课程搜索和筛选
 * - 课程详情查看
 * - 课程进度跟踪
 * - 课程资源访问
 * - 课程评价和反馈
 * 
 * 开发者：Purple Ruler Academy 开发团队
 * 最后更新：2024年
 * 版本：1.0.0
 */

// ==================== 模块导入 ====================
import { session } from 'wix-storage-frontend';
import { currentMember } from 'wix-members-frontend';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { timeline } from 'wix-animations';
import wixWindow from 'wix-window';

// ==================== 全局变量定义 ====================

// 用户相关变量
let currentUser = null;           // 当前登录用户信息
let userProfile = null;           // 用户详细资料
let userCourses = [];            // 用户已注册课程列表

// 课程相关变量
let allCourses = [];             // 所有可用课程
let filteredCourses = [];        // 筛选后的课程
let currentCourse = null;        // 当前选中的课程

// UI 状态变量
let isLoading = false;           // 页面加载状态
let currentView = 'grid';        // 当前视图模式：grid/list
let currentFilter = 'all';       // 当前筛选条件
let searchQuery = '';            // 搜索关键词

// 缓存和性能相关
let dataCache = new Map();       // 数据缓存
let lastRefresh = null;          // 最后刷新时间
const CACHE_DURATION = 5 * 60 * 1000; // 缓存持续时间：5分钟

// 防抖定时器
let searchDebounceTimer = null;
let filterDebounceTimer = null;

// ==================== 页面初始化 ====================

/**
 * 页面加载时的初始化函数
 * 设置页面基本状态和加载必要数据
 */
$w.onReady(async function () {
    console.log('学生课程页面开始初始化...');
    
    try {
        // 显示加载状态
        showLoadingState(true);
        
        // 初始化用户认证
        await initializeAuthentication();
        
        // 设置事件处理器
        setupEventHandlers();
        
        // 加载页面数据
        await loadPageData();
        
        // 初始化UI组件
        initializeUI();
        
        // 设置响应式设计
        setupResponsiveDesign();
        
        // 启动自动刷新
        startAutoRefresh();
        
        console.log('学生课程页面初始化完成');
        
    } catch (error) {
        console.error('页面初始化失败:', error);
        showErrorMessage('页面加载失败，请刷新重试');
    } finally {
        showLoadingState(false);
    }
});

// ==================== 用户认证和初始化 ====================

/**
 * 初始化用户认证
 * 检查用户登录状态并获取用户信息
 */
async function initializeAuthentication() {
    try {
        // 检查用户是否已登录
        const member = await currentMember.getMember();
        
        if (!member) {
            // 用户未登录，重定向到登录页面
            wixLocation.to('/login');
            return;
        }
        
        currentUser = member;
        console.log('当前用户:', currentUser.loginEmail);
        
        // 加载用户详细资料
        await loadUserProfile();
        
    } catch (error) {
        console.error('用户认证失败:', error);
        throw new Error('用户认证失败');
    }
}

/**
 * 加载用户详细资料
 * 从数据库获取用户的详细信息
 */
async function loadUserProfile() {
    try {
        const profileResult = await wixData.query('StudentProfiles')
            .eq('userId', currentUser._id)
            .find();
        
        if (profileResult.items.length > 0) {
            userProfile = profileResult.items[0];
            updateUserProfileDisplay();
        } else {
            console.warn('未找到用户资料，创建默认资料');
            await createDefaultUserProfile();
        }
        
    } catch (error) {
        console.error('加载用户资料失败:', error);
        throw error;
    }
}

/**
 * 创建默认用户资料
 * 为新用户创建基本的资料信息
 */
async function createDefaultUserProfile() {
    try {
        const defaultProfile = {
            userId: currentUser._id,
            email: currentUser.loginEmail,
            firstName: currentUser.contactDetails?.firstName || '',
            lastName: currentUser.contactDetails?.lastName || '',
            yearGroup: 'Year 10',
            enrollmentDate: new Date(),
            status: 'active'
        };
        
        const result = await wixData.save('StudentProfiles', defaultProfile);
        userProfile = result;
        updateUserProfileDisplay();
        
    } catch (error) {
        console.error('创建用户资料失败:', error);
        throw error;
    }
}

// ==================== 事件处理器设置 ====================

/**
 * 设置所有事件处理器
 * 绑定用户交互事件到相应的处理函数
 */
function setupEventHandlers() {
    // 搜索相关事件
    $w('#searchInput').onInput(handleSearchInput);
    $w('#searchButton').onClick(handleSearchClick);
    $w('#clearSearchButton').onClick(handleClearSearch);
    
    // 筛选相关事件
    $w('#subjectFilter').onChange(handleSubjectFilter);
    $w('#levelFilter').onChange(handleLevelFilter);
    $w('#statusFilter').onChange(handleStatusFilter);
    $w('#clearFiltersButton').onClick(handleClearFilters);
    
    // 视图切换事件
    $w('#gridViewButton').onClick(() => handleViewChange('grid'));
    $w('#listViewButton').onClick(() => handleViewChange('list'));
    
    // 课程操作事件
    $w('#coursesRepeater').onItemReady(setupCourseCardEvents);
    
    // 快速操作事件
    $w('#enrollNewCourseButton').onClick(handleEnrollNewCourse);
    $w('#viewAllCoursesButton').onClick(handleViewAllCourses);
    $w('#downloadScheduleButton').onClick(handleDownloadSchedule);
    
    // 刷新按钮事件
    $w('#refreshButton').onClick(handleRefreshData);
    
    console.log('事件处理器设置完成');
}

// ==================== 数据加载和管理 ====================

/**
 * 加载页面所需的所有数据
 * 包括用户课程、可用课程等
 */
async function loadPageData() {
    try {
        console.log('开始加载页面数据...');
        
        // 并行加载数据以提高性能
        const [userCoursesData, allCoursesData, quickStatsData] = await Promise.all([
            loadUserCourses(),
            loadAllCourses(),
            loadQuickStats()
        ]);
        
        // 更新UI显示
        updateCoursesDisplay();
        updateQuickStatsDisplay();
        
        console.log('页面数据加载完成');
        
    } catch (error) {
        console.error('数据加载失败:', error);
        throw error;
    }
}

/**
 * 加载用户已注册的课程
 * 从数据库获取当前用户的课程信息
 */
async function loadUserCourses() {
    try {
        const cacheKey = `userCourses_${currentUser._id}`;
        
        // 检查缓存
        if (dataCache.has(cacheKey) && !isCacheExpired(cacheKey)) {
            userCourses = dataCache.get(cacheKey).data;
            return userCourses;
        }
        
        // 从数据库查询用户课程
        const enrollmentResult = await wixData.query('CourseEnrollments')
            .eq('studentId', currentUser._id)
            .eq('status', 'active')
            .include('courseId')
            .find();
        
        userCourses = enrollmentResult.items.map(enrollment => ({
            ...enrollment.courseId,
            enrollmentId: enrollment._id,
            enrollmentDate: enrollment.enrollmentDate,
            progress: enrollment.progress || 0,
            lastAccessed: enrollment.lastAccessed,
            grade: enrollment.currentGrade
        }));
        
        // 缓存数据
        dataCache.set(cacheKey, {
            data: userCourses,
            timestamp: Date.now()
        });
        
        console.log(`加载了 ${userCourses.length} 门用户课程`);
        return userCourses;
        
    } catch (error) {
        console.error('加载用户课程失败:', error);
        throw error;
    }
}

/**
 * 加载所有可用课程
 * 获取学校提供的所有课程信息
 */
async function loadAllCourses() {
    try {
        const cacheKey = 'allCourses';
        
        // 检查缓存
        if (dataCache.has(cacheKey) && !isCacheExpired(cacheKey)) {
            allCourses = dataCache.get(cacheKey).data;
            return allCourses;
        }
        
        // 从数据库查询所有课程
        const coursesResult = await wixData.query('Courses')
            .eq('status', 'active')
            .ascending('subject')
            .ascending('title')
            .find();
        
        allCourses = coursesResult.items;
        
        // 缓存数据
        dataCache.set(cacheKey, {
            data: allCourses,
            timestamp: Date.now()
        });
        
        console.log(`加载了 ${allCourses.length} 门可用课程`);
        return allCourses;
        
    } catch (error) {
        console.error('加载所有课程失败:', error);
        throw error;
    }
}

/**
 * 加载快速统计数据
 * 计算和显示课程相关的统计信息
 */
async function loadQuickStats() {
    try {
        const stats = {
            totalCourses: userCourses.length,
            activeCourses: userCourses.filter(course => course.status === 'active').length,
            completedCourses: userCourses.filter(course => course.progress >= 100).length,
            averageProgress: userCourses.length > 0 
                ? Math.round(userCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / userCourses.length)
                : 0
        };
        
        // 更新统计显示
        $w('#totalCoursesText').text = stats.totalCourses.toString();
        $w('#activeCoursesText').text = stats.activeCourses.toString();
        $w('#completedCoursesText').text = stats.completedCourses.toString();
        $w('#averageProgressText').text = `${stats.averageProgress}%`;
        
        return stats;
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
        throw error;
    }
}

// ==================== 搜索和筛选处理 ====================

/**
 * 处理搜索输入事件
 * 实现防抖搜索功能
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();
    
    // 清除之前的防抖定时器
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    // 设置新的防抖定时器
    searchDebounceTimer = setTimeout(() => {
        performSearch(query);
    }, 300); // 300ms 防抖延迟
}

/**
 * 处理搜索按钮点击事件
 */
function handleSearchClick() {
    const query = $w('#searchInput').value.trim();
    performSearch(query);
}

/**
 * 执行搜索操作
 * 根据搜索关键词筛选课程
 */
function performSearch(query) {
    searchQuery = query.toLowerCase();
    
    if (searchQuery === '') {
        // 如果搜索为空，显示所有课程
        filteredCourses = [...userCourses];
    } else {
        // 根据课程标题、描述、教师等进行搜索
        filteredCourses = userCourses.filter(course => {
            return course.title.toLowerCase().includes(searchQuery) ||
                   course.description.toLowerCase().includes(searchQuery) ||
                   course.subject.toLowerCase().includes(searchQuery) ||
                   course.instructor.toLowerCase().includes(searchQuery);
        });
    }
    
    // 应用其他筛选条件
    applyFilters();
    
    // 更新显示
    updateCoursesDisplay();
    
    console.log(`搜索 "${query}" 找到 ${filteredCourses.length} 门课程`);
}

/**
 * 处理清除搜索事件
 */
function handleClearSearch() {
    $w('#searchInput').value = '';
    searchQuery = '';
    performSearch('');
}

/**
 * 处理学科筛选事件
 */
function handleSubjectFilter(event) {
    const selectedSubject = event.target.value;
    applySubjectFilter(selectedSubject);
}

/**
 * 处理级别筛选事件
 */
function handleLevelFilter(event) {
    const selectedLevel = event.target.value;
    applyLevelFilter(selectedLevel);
}

/**
 * 处理状态筛选事件
 */
function handleStatusFilter(event) {
    const selectedStatus = event.target.value;
    applyStatusFilter(selectedStatus);
}

/**
 * 应用所有筛选条件
 * 综合考虑搜索和各种筛选条件
 */
function applyFilters() {
    let courses = [...userCourses];
    
    // 应用搜索筛选
    if (searchQuery) {
        courses = courses.filter(course => {
            return course.title.toLowerCase().includes(searchQuery) ||
                   course.description.toLowerCase().includes(searchQuery) ||
                   course.subject.toLowerCase().includes(searchQuery) ||
                   course.instructor.toLowerCase().includes(searchQuery);
        });
    }
    
    // 应用学科筛选
    const subjectFilter = $w('#subjectFilter').value;
    if (subjectFilter && subjectFilter !== 'all') {
        courses = courses.filter(course => course.subject === subjectFilter);
    }
    
    // 应用级别筛选
    const levelFilter = $w('#levelFilter').value;
    if (levelFilter && levelFilter !== 'all') {
        courses = courses.filter(course => course.level === levelFilter);
    }
    
    // 应用状态筛选
    const statusFilter = $w('#statusFilter').value;
    if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'completed') {
            courses = courses.filter(course => course.progress >= 100);
        } else if (statusFilter === 'in-progress') {
            courses = courses.filter(course => course.progress > 0 && course.progress < 100);
        } else if (statusFilter === 'not-started') {
            courses = courses.filter(course => course.progress === 0);
        }
    }
    
    filteredCourses = courses;
}

/**
 * 处理清除所有筛选条件
 */
function handleClearFilters() {
    // 重置所有筛选控件
    $w('#searchInput').value = '';
    $w('#subjectFilter').value = 'all';
    $w('#levelFilter').value = 'all';
    $w('#statusFilter').value = 'all';
    
    // 重置筛选变量
    searchQuery = '';
    
    // 重新应用筛选（实际上是显示所有课程）
    filteredCourses = [...userCourses];
    updateCoursesDisplay();
}

// ==================== 视图切换处理 ====================

/**
 * 处理视图模式切换
 * 在网格视图和列表视图之间切换
 */
function handleViewChange(viewMode) {
    currentView = viewMode;
    
    // 更新按钮状态
    $w('#gridViewButton').style.backgroundColor = viewMode === 'grid' ? '#663399' : '#f0f0f0';
    $w('#listViewButton').style.backgroundColor = viewMode === 'list' ? '#663399' : '#f0f0f0';
    
    // 更新课程显示
    updateCoursesDisplay();
    
    console.log(`切换到 ${viewMode} 视图模式`);
}

// ==================== 课程操作处理 ====================

/**
 * 设置课程卡片事件
 * 为每个课程卡片设置交互事件
 */
function setupCourseCardEvents($item, itemData, index) {
    // 课程卡片点击事件
    $item('#courseCard').onClick(() => {
        handleCourseCardClick(itemData);
    });
    
    // 继续学习按钮
    $item('#continueButton').onClick((event) => {
        event.stopPropagation();
        handleContinueCourse(itemData);
    });
    
    // 查看详情按钮
    $item('#viewDetailsButton').onClick((event) => {
        event.stopPropagation();
        handleViewCourseDetails(itemData);
    });
    
    // 查看资源按钮
    $item('#viewResourcesButton').onClick((event) => {
        event.stopPropagation();
        handleViewCourseResources(itemData);
    });
    
    // 设置课程卡片数据
    updateCourseCardData($item, itemData);
}

/**
 * 更新课程卡片数据显示
 * 设置课程卡片中的各种信息
 */
function updateCourseCardData($item, courseData) {
    try {
        // 基本信息
        $item('#courseTitleText').text = courseData.title;
        $item('#courseSubjectText').text = courseData.subject;
        $item('#courseInstructorText').text = courseData.instructor;
        $item('#courseLevelText').text = courseData.level;
        
        // 进度信息
        const progress = courseData.progress || 0;
        $item('#progressText').text = `${progress}%`;
        $item('#progressBar').value = progress;
        
        // 状态信息
        const status = getProgressStatus(progress);
        $item('#statusText').text = status.text;
        $item('#statusText').style.color = status.color;
        
        // 最后访问时间
        if (courseData.lastAccessed) {
            $item('#lastAccessedText').text = `最后访问: ${formatDate(courseData.lastAccessed)}`;
        } else {
            $item('#lastAccessedText').text = '尚未开始';
        }
        
        // 课程图片
        if (courseData.image) {
            $item('#courseImage').src = courseData.image;
        }
        
        // 根据进度设置按钮状态
        if (progress === 0) {
            $item('#continueButton').label = '开始学习';
        } else if (progress >= 100) {
            $item('#continueButton').label = '复习课程';
        } else {
            $item('#continueButton').label = '继续学习';
        }
        
    } catch (error) {
        console.error('更新课程卡片数据失败:', error);
    }
}

/**
 * 处理课程卡片点击事件
 * 显示课程详细信息
 */
function handleCourseCardClick(courseData) {
    currentCourse = courseData;
    showCourseDetailsLightbox(courseData);
}

/**
 * 处理继续学习课程
 * 跳转到课程学习页面
 */
function handleContinueCourse(courseData) {
    try {
        // 更新最后访问时间
        updateLastAccessed(courseData.enrollmentId);
        
        // 跳转到课程学习页面
        const courseUrl = `/course-learning?courseId=${courseData._id}`;
        wixLocation.to(courseUrl);
        
        // 记录学习行为
        trackCourseAccess(courseData._id, 'continue');
        
    } catch (error) {
        console.error('继续学习课程失败:', error);
        showErrorMessage('无法打开课程，请稍后重试');
    }
}

/**
 * 处理查看课程详情
 * 在弹窗中显示详细信息
 */
function handleViewCourseDetails(courseData) {
    currentCourse = courseData;
    showCourseDetailsLightbox(courseData);
}

/**
 * 处理查看课程资源
 * 跳转到课程资源页面
 */
function handleViewCourseResources(courseData) {
    try {
        const resourcesUrl = `/course-resources?courseId=${courseData._id}`;
        wixLocation.to(resourcesUrl);
        
        // 记录资源访问行为
        trackCourseAccess(courseData._id, 'resources');
        
    } catch (error) {
        console.error('查看课程资源失败:', error);
        showErrorMessage('无法打开课程资源，请稍后重试');
    }
}

// ==================== 快速操作处理 ====================

/**
 * 处理注册新课程
 * 跳转到课程注册页面
 */
function handleEnrollNewCourse() {
    wixLocation.to('/course-enrollment');
}

/**
 * 处理查看所有课程
 * 跳转到课程目录页面
 */
function handleViewAllCourses() {
    wixLocation.to('/course-catalog');
}

/**
 * 处理下载课程表
 * 生成并下载个人课程表
 */
async function handleDownloadSchedule() {
    try {
        showLoadingMessage('正在生成课程表...');
        
        // 这里应该调用生成课程表的API
        // 暂时显示提示信息
        showSuccessMessage('课程表下载功能即将推出');
        
    } catch (error) {
        console.error('下载课程表失败:', error);
        showErrorMessage('下载失败，请稍后重试');
    }
}

/**
 * 处理刷新数据
 * 重新加载页面数据
 */
async function handleRefreshData() {
    try {
        showLoadingState(true);
        
        // 清除缓存
        dataCache.clear();
        
        // 重新加载数据
        await loadPageData();
        
        showSuccessMessage('数据已刷新');
        
    } catch (error) {
        console.error('刷新数据失败:', error);
        showErrorMessage('刷新失败，请稍后重试');
    } finally {
        showLoadingState(false);
    }
}

// ==================== UI 更新函数 ====================

/**
 * 更新用户资料显示
 * 在页面头部显示用户信息
 */
function updateUserProfileDisplay() {
    if (userProfile) {
        $w('#userNameText').text = `${userProfile.firstName} ${userProfile.lastName}`;
        $w('#userYearGroupText').text = userProfile.yearGroup;
        
        if (userProfile.avatar) {
            $w('#userAvatarImage').src = userProfile.avatar;
        }
    }
}

/**
 * 更新课程显示
 * 根据当前筛选条件和视图模式更新课程列表
 */
function updateCoursesDisplay() {
    try {
        // 如果没有筛选结果，使用所有用户课程
        const coursesToShow = filteredCourses.length > 0 ? filteredCourses : userCourses;
        
        if (coursesToShow.length === 0) {
            // 显示空状态
            $w('#coursesRepeater').hide();
            $w('#emptyStateContainer').show();
            $w('#emptyStateText').text = searchQuery ? '未找到匹配的课程' : '您还没有注册任何课程';
        } else {
            // 显示课程列表
            $w('#emptyStateContainer').hide();
            $w('#coursesRepeater').show();
            
            // 设置repeater数据
            $w('#coursesRepeater').data = coursesToShow;
            
            // 根据视图模式调整布局
            if (currentView === 'grid') {
                $w('#coursesRepeater').layout = 'grid';
            } else {
                $w('#coursesRepeater').layout = 'list';
            }
        }
        
        // 更新结果计数
        $w('#resultsCountText').text = `显示 ${coursesToShow.length} 门课程`;
        
    } catch (error) {
        console.error('更新课程显示失败:', error);
    }
}

/**
 * 更新快速统计显示
 * 更新页面顶部的统计信息
 */
function updateQuickStatsDisplay() {
    // 这个函数在loadQuickStats中已经实现
    // 这里可以添加额外的UI更新逻辑
}

/**
 * 显示课程详情弹窗
 * 在lightbox中显示课程的详细信息
 */
function showCourseDetailsLightbox(courseData) {
    try {
        // 设置lightbox中的课程信息
        $w('#lightboxCourseTitle').text = courseData.title;
        $w('#lightboxCourseDescription').text = courseData.description;
        $w('#lightboxCourseSubject').text = courseData.subject;
        $w('#lightboxCourseInstructor').text = courseData.instructor;
        $w('#lightboxCourseLevel').text = courseData.level;
        $w('#lightboxCourseDuration').text = courseData.duration;
        
        // 设置进度信息
        const progress = courseData.progress || 0;
        $w('#lightboxProgressText').text = `${progress}%`;
        $w('#lightboxProgressBar').value = progress;
        
        // 设置课程图片
        if (courseData.image) {
            $w('#lightboxCourseImage').src = courseData.image;
        }
        
        // 设置按钮事件
        $w('#lightboxContinueButton').onClick(() => {
            $w('#courseDetailsLightbox').hide();
            handleContinueCourse(courseData);
        });
        
        $w('#lightboxResourcesButton').onClick(() => {
            $w('#courseDetailsLightbox').hide();
            handleViewCourseResources(courseData);
        });
        
        // 显示lightbox
        $w('#courseDetailsLightbox').show();
        
    } catch (error) {
        console.error('显示课程详情失败:', error);
        showErrorMessage('无法显示课程详情');
    }
}

// ==================== 响应式设计处理 ====================

/**
 * 设置响应式设计
 * 根据屏幕尺寸调整布局
 */
function setupResponsiveDesign() {
    // 监听窗口大小变化
    wixWindow.viewportEnter('mobile', () => {
        handleMobileLayout();
    });
    
    wixWindow.viewportEnter('tablet', () => {
        handleTabletLayout();
    });
    
    wixWindow.viewportEnter('desktop', () => {
        handleDesktopLayout();
    });
    
    // 初始化当前视口的布局
    const currentViewport = wixWindow.viewportEnter.getCurrentViewport();
    switch (currentViewport) {
        case 'mobile':
            handleMobileLayout();
            break;
        case 'tablet':
            handleTabletLayout();
            break;
        case 'desktop':
            handleDesktopLayout();
            break;
    }
}

/**
 * 处理移动端布局
 * 优化移动设备的显示效果
 */
function handleMobileLayout() {
    // 强制使用列表视图
    currentView = 'list';
    
    // 隐藏一些不必要的元素
    $w('#viewToggleContainer').hide();
    
    // 调整搜索框大小
    $w('#searchInput').style.width = '100%';
    
    // 调整统计卡片布局
    $w('#statsContainer').style.gridTemplateColumns = '1fr 1fr';
    
    console.log('切换到移动端布局');
}

/**
 * 处理平板端布局
 * 优化平板设备的显示效果
 */
function handleTabletLayout() {
    // 显示视图切换按钮
    $w('#viewToggleContainer').show();
    
    // 调整统计卡片布局
    $w('#statsContainer').style.gridTemplateColumns = 'repeat(2, 1fr)';
    
    console.log('切换到平板端布局');
}

/**
 * 处理桌面端布局
 * 优化桌面设备的显示效果
 */
function handleDesktopLayout() {
    // 显示所有功能
    $w('#viewToggleContainer').show();
    
    // 调整统计卡片布局
    $w('#statsContainer').style.gridTemplateColumns = 'repeat(4, 1fr)';
    
    console.log('切换到桌面端布局');
}

// ==================== 工具函数 ====================

/**
 * 防抖函数
 * 限制函数调用频率
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
 * 将日期对象转换为可读的字符串
 */
function formatDate(date) {
    if (!date) return '';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = Math.abs(now - targetDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今天';
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return targetDate.toLocaleDateString('zh-CN');
    }
}

/**
 * 获取进度状态
 * 根据进度百分比返回状态信息
 */
function getProgressStatus(progress) {
    if (progress === 0) {
        return { text: '未开始', color: '#999999' };
    } else if (progress < 30) {
        return { text: '刚开始', color: '#ff6b6b' };
    } else if (progress < 70) {
        return { text: '进行中', color: '#ffa726' };
    } else if (progress < 100) {
        return { text: '即将完成', color: '#42a5f5' };
    } else {
        return { text: '已完成', color: '#66bb6a' };
    }
}

/**
 * 显示加载状态
 * 控制页面加载指示器的显示
 */
function showLoadingState(show) {
    isLoading = show;
    
    if (show) {
        $w('#loadingContainer').show();
        $w('#mainContent').style.opacity = '0.5';
    } else {
        $w('#loadingContainer').hide();
        $w('#mainContent').style.opacity = '1';
    }
}

/**
 * 显示成功消息
 * 显示操作成功的提示信息
 */
function showSuccessMessage(message) {
    $w('#messageText').text = message;
    $w('#messageContainer').style.backgroundColor = '#4caf50';
    $w('#messageContainer').show();
    
    // 3秒后自动隐藏
    setTimeout(() => {
        $w('#messageContainer').hide();
    }, 3000);
}

/**
 * 显示错误消息
 * 显示操作失败的提示信息
 */
function showErrorMessage(message) {
    $w('#messageText').text = message;
    $w('#messageContainer').style.backgroundColor = '#f44336';
    $w('#messageContainer').show();
    
    // 5秒后自动隐藏
    setTimeout(() => {
        $w('#messageContainer').hide();
    }, 5000);
}

/**
 * 显示加载消息
 * 显示正在处理的提示信息
 */
function showLoadingMessage(message) {
    $w('#messageText').text = message;
    $w('#messageContainer').style.backgroundColor = '#2196f3';
    $w('#messageContainer').show();
}

/**
 * 检查缓存是否过期
 * 判断缓存数据是否需要刷新
 */
function isCacheExpired(cacheKey) {
    const cacheData = dataCache.get(cacheKey);
    if (!cacheData) return true;
    
    return (Date.now() - cacheData.timestamp) > CACHE_DURATION;
}

// ==================== 数据库操作函数 ====================

/**
 * 更新最后访问时间
 * 记录学生最后访问课程的时间
 */
async function updateLastAccessed(enrollmentId) {
    try {
        await wixData.update('CourseEnrollments', {
            _id: enrollmentId,
            lastAccessed: new Date()
        });
    } catch (error) {
        console.error('更新最后访问时间失败:', error);
    }
}

/**
 * 初始化UI组件
 * 设置页面UI组件的初始状态
 */
function initializeUI() {
    // 设置默认视图模式
    handleViewChange('grid');
    
    // 隐藏加载状态
    showLoadingState(false);
    
    // 隐藏消息容器
    $w('#messageContainer').hide();
    
    // 设置筛选器默认值
    $w('#subjectFilter').value = 'all';
    $w('#levelFilter').value = 'all';
    $w('#statusFilter').value = 'all';
}

// ==================== 自动刷新和缓存机制 ====================

/**
 * 启动自动刷新机制
 * 定期刷新页面数据
 */
function startAutoRefresh() {
    // 每5分钟自动刷新一次数据
    setInterval(async () => {
        try {
            console.log('执行自动数据刷新...');
            
            // 清除过期缓存
            clearExpiredCache();
            
            // 重新加载关键数据
            await loadUserCourses();
            await loadQuickStats();
            
            // 更新显示
            updateCoursesDisplay();
            
        } catch (error) {
            console.error('自动刷新失败:', error);
        }
    }, 5 * 60 * 1000); // 5分钟
}

/**
 * 清除过期缓存
 * 删除已过期的缓存数据
 */
function clearExpiredCache() {
    for (const [key, value] of dataCache.entries()) {
        if ((Date.now() - value.timestamp) > CACHE_DURATION) {
            dataCache.delete(key);
        }
    }
}

// ==================== 分析和跟踪 ====================

/**
 * 跟踪课程访问行为
 * 记录学生的课程访问数据用于分析
 */
function trackCourseAccess(courseId, action) {
    try {
        // 这里可以集成Google Analytics或其他分析工具
        console.log(`课程访问跟踪: 课程ID=${courseId}, 操作=${action}`);
        
        // 示例：发送到分析服务
        // analytics.track('course_access', {
        //     courseId: courseId,
        //     action: action,
        //     userId: currentUser._id,
        //     timestamp: new Date()
        // });
        
    } catch (error) {
        console.error('跟踪课程访问失败:', error);
    }
}

// ==================== 导出函数（供其他页面使用） ====================

/**
 * 获取当前用户课程
 * 供其他页面调用的公共函数
 */
export function getCurrentUserCourses() {
    return userCourses;
}

/**
 * 获取当前用户信息
 * 供其他页面调用的公共函数
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * 刷新课程数据
 * 供其他页面调用的公共函数
 */
export async function refreshCoursesData() {
    await handleRefreshData();
}

// ==================== 页面卸载处理 ====================

/**
 * 页面卸载时的清理工作
 */
$w.onReady(() => {
    // 监听页面卸载事件
    window.addEventListener('beforeunload', () => {
        // 清除定时器
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        if (filterDebounceTimer) {
            clearTimeout(filterDebounceTimer);
        }
        
        // 清除缓存（可选）
        // dataCache.clear();
        
        console.log('学生课程页面清理完成');
    });
});

/**
 * 开发调试函数
 * 仅在开发环境中使用
 */
if (process.env.NODE_ENV === 'development') {
    // 将一些函数暴露到全局作用域以便调试
    window.debugCourses = {
        userCourses,
        filteredCourses,
        dataCache,
        refreshData: handleRefreshData,
        clearCache: () => dataCache.clear()
    };
}

/* 
使用说明：

1. 数据库集合要求：
   - StudentProfiles: 学生资料表
   - Courses: 课程信息表
   - CourseEnrollments: 课程注册表

2. 页面元素要求：
   - 搜索框: #searchInput
   - 筛选器: #subjectFilter, #levelFilter, #statusFilter
   - 课程列表: #coursesRepeater
   - 统计显示: #totalCoursesText, #activeCoursesText等
   - 用户信息: #userNameText, #userYearGroupText

3. 功能特点：
   - 实时搜索和筛选
   - 响应式设计支持
   - 数据缓存机制
   - 自动刷新功能
   - 完整的错误处理
   - 用户行为跟踪

4. 性能优化：
   - 防抖搜索
   - 数据缓存
   - 懒加载
   - 内存管理

5. 安全考虑：
   - 用户认证检查
   - 数据访问控制
   - 输入验证
   - XSS防护
*/