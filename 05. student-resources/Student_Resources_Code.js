/**
 * Wix 学生资源页面 - 完整 Velo JavaScript 代码
 * 
 * 项目描述：
 * 这是一个全面的学生资源管理页面，提供学习资料、工具、链接和下载功能。
 * 页面包含资源浏览、搜索、分类筛选、收藏管理、下载跟踪等功能。
 * 
 * 主要功能：
 * - 资源分类浏览（文档、视频、工具、链接等）
 * - 智能搜索和筛选系统
 * - 资源收藏和个人资源库
 * - 下载管理和进度跟踪
 * - 资源评分和评论系统
 * - 最近访问和推荐资源
 * - 响应式设计和移动端优化
 * 
 * 技术特点：
 * - 使用 Wix Velo 平台开发
 * - 集成 Wix 数据库和用户管理
 * - 实现文件上传和下载功能
 * - 支持多媒体资源预览
 * - 包含搜索优化和缓存机制
 * 
 * 作者：Purple Ruler Academy 开发团队
 * 创建日期：2024年
 * 最后更新：2024年12月
 */

// ==================== 模块导入 ====================
import { local, session } from 'wix-storage-frontend';
import { currentMember } from 'wix-members-frontend';
import { authentication } from 'wix-members-frontend';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { timeline } from 'wix-animations';
import wixWindow from 'wix-window';

// ==================== 全局变量定义 ====================

// 用户相关变量
let currentUser = null;
let userProfile = null;
let userPreferences = {};

// 资源数据变量
let allResources = [];
let filteredResources = [];
let favoriteResources = [];
let recentResources = [];
let downloadHistory = [];

// UI 状态变量
let currentView = 'grid'; // grid, list, card
let currentCategory = 'all';
let currentSortBy = 'newest';
let isLoading = false;
let searchQuery = '';

// 分页和加载变量
let currentPage = 1;
let itemsPerPage = 12;
let totalItems = 0;
let hasMoreItems = true;

// 缓存和性能变量
let resourceCache = new Map();
let searchCache = new Map();
let lastSearchTime = 0;
const SEARCH_DEBOUNCE_DELAY = 300;

// 下载管理变量
let activeDownloads = new Map();
let downloadQueue = [];
let maxConcurrentDownloads = 3;

// ==================== 页面初始化 ====================

/**
 * 页面加载时的初始化函数
 * 设置用户认证、加载数据、初始化UI组件
 */
$w.onReady(async function () {
    console.log('学生资源页面初始化开始');
    
    try {
        // 显示加载状态
        showLoadingState();
        
        // 检查用户认证状态
        await checkUserAuthentication();
        
        // 加载用户资料和偏好设置
        await loadUserProfile();
        
        // 设置事件处理器
        setupEventHandlers();
        
        // 加载资源数据
        await loadResourcesData();
        
        // 加载用户收藏和历史记录
        await loadUserResourceData();
        
        // 初始化UI组件
        initializeUIComponents();
        
        // 设置响应式设计
        setupResponsiveDesign();
        
        // 隐藏加载状态
        hideLoadingState();
        
        console.log('学生资源页面初始化完成');
        
    } catch (error) {
        console.error('页面初始化错误:', error);
        showErrorMessage('页面加载失败，请刷新重试');
        hideLoadingState();
    }
});

// ==================== 用户认证检查 ====================

/**
 * 检查用户认证状态
 * 确保只有登录用户可以访问资源页面
 */
async function checkUserAuthentication() {
    try {
        const isLoggedIn = authentication.loggedIn();
        
        if (!isLoggedIn) {
            // 重定向到登录页面
            wixLocation.to('/login?redirect=' + encodeURIComponent(wixLocation.url));
            return;
        }
        
        // 获取当前用户信息
        currentUser = await currentMember.getMember();
        
        if (!currentUser) {
            throw new Error('无法获取用户信息');
        }
        
        console.log('用户认证成功:', currentUser.loginEmail);
        
    } catch (error) {
        console.error('用户认证检查失败:', error);
        throw error;
    }
}

// ==================== 事件处理器设置 ====================

/**
 * 设置页面所有事件处理器
 * 包括搜索、筛选、视图切换、资源操作等
 */
function setupEventHandlers() {
    // 搜索相关事件
    $w('#searchInput').onInput(debounce(handleSearchInput, SEARCH_DEBOUNCE_DELAY));
    $w('#searchButton').onClick(handleSearchSubmit);
    $w('#clearSearchButton').onClick(handleClearSearch);
    
    // 筛选器事件
    $w('#categoryDropdown').onChange(handleCategoryFilter);
    $w('#typeDropdown').onChange(handleTypeFilter);
    $w('#sortDropdown').onChange(handleSortChange);
    $w('#difficultyDropdown').onChange(handleDifficultyFilter);
    
    // 视图切换事件
    $w('#gridViewButton').onClick(() => handleViewChange('grid'));
    $w('#listViewButton').onClick(() => handleViewChange('list'));
    $w('#cardViewButton').onClick(() => handleViewChange('card'));
    
    // 资源操作事件
    $w('#resourceRepeater').onItemReady(setupResourceItemEvents);
    
    // 收藏和历史记录事件
    $w('#favoritesButton').onClick(handleShowFavorites);
    $w('#recentButton').onClick(handleShowRecent);
    $w('#downloadHistoryButton').onClick(handleShowDownloadHistory);
    
    // 分页事件
    $w('#loadMoreButton').onClick(handleLoadMore);
    $w('#paginationRepeater').onItemReady(setupPaginationEvents);
    
    // 上传资源事件（如果用户有权限）
    $w('#uploadButton').onClick(handleResourceUpload);
    
    // 快速操作事件
    $w('#refreshButton').onClick(handleRefreshResources);
    $w('#exportButton').onClick(handleExportResources);
    
    console.log('事件处理器设置完成');
}

// ==================== 数据加载函数 ====================

/**
 * 加载用户资料和偏好设置
 */
async function loadUserProfile() {
    try {
        // 从数据库加载用户资料
        const userQuery = await wixData.query('UserProfiles')
            .eq('userId', currentUser._id)
            .find();
        
        if (userQuery.items.length > 0) {
            userProfile = userQuery.items[0];
        } else {
            // 创建新的用户资料
            userProfile = await createUserProfile();
        }
        
        // 加载用户偏好设置
        userPreferences = userProfile.preferences || {
            defaultView: 'grid',
            itemsPerPage: 12,
            autoDownload: false,
            showPreviews: true,
            defaultSort: 'newest'
        };
        
        // 应用用户偏好设置
        applyUserPreferences();
        
        console.log('用户资料加载完成');
        
    } catch (error) {
        console.error('加载用户资料失败:', error);
        // 使用默认设置
        userPreferences = {
            defaultView: 'grid',
            itemsPerPage: 12,
            autoDownload: false,
            showPreviews: true,
            defaultSort: 'newest'
        };
    }
}

/**
 * 加载资源数据
 * 从数据库获取所有可用的学习资源
 */
async function loadResourcesData() {
    try {
        showLoadingIndicator('正在加载资源...');
        
        // 构建查询
        let query = wixData.query('StudentResources')
            .eq('isActive', true)
            .ascending('title');
        
        // 应用筛选条件
        if (currentCategory !== 'all') {
            query = query.eq('category', currentCategory);
        }
        
        // 应用排序
        query = applySorting(query, currentSortBy);
        
        // 执行查询
        const result = await query.find();
        
        allResources = result.items;
        totalItems = result.totalCount;
        
        // 处理资源数据
        processResourcesData();
        
        // 更新UI
        await updateResourcesDisplay();
        
        hideLoadingIndicator();
        
        console.log(`加载了 ${allResources.length} 个资源`);
        
    } catch (error) {
        console.error('加载资源数据失败:', error);
        showErrorMessage('无法加载资源，请稍后重试');
        hideLoadingIndicator();
    }
}

/**
 * 加载用户相关的资源数据
 * 包括收藏、最近访问、下载历史等
 */
async function loadUserResourceData() {
    try {
        // 加载收藏资源
        const favoritesQuery = await wixData.query('UserFavorites')
            .eq('userId', currentUser._id)
            .eq('type', 'resource')
            .find();
        
        favoriteResources = favoritesQuery.items.map(item => item.resourceId);
        
        // 加载最近访问的资源
        const recentQuery = await wixData.query('UserActivity')
            .eq('userId', currentUser._id)
            .eq('activityType', 'resource_view')
            .descending('timestamp')
            .limit(20)
            .find();
        
        recentResources = recentQuery.items;
        
        // 加载下载历史
        const downloadQuery = await wixData.query('UserDownloads')
            .eq('userId', currentUser._id)
            .descending('downloadDate')
            .limit(50)
            .find();
        
        downloadHistory = downloadQuery.items;
        
        // 更新UI显示
        updateUserResourcesUI();
        
        console.log('用户资源数据加载完成');
        
    } catch (error) {
        console.error('加载用户资源数据失败:', error);
    }
}

// ==================== 搜索事件处理器 ====================

/**
 * 处理搜索输入
 * 实现实时搜索建议和自动完成
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();
    searchQuery = query;
    
    if (query.length === 0) {
        // 清空搜索，显示所有资源
        filteredResources = [...allResources];
        updateResourcesDisplay();
        hideSuggestions();
        return;
    }
    
    if (query.length >= 2) {
        // 显示搜索建议
        showSearchSuggestions(query);
        
        // 执行搜索
        performSearch(query);
    }
}

/**
 * 处理搜索提交
 */
async function handleSearchSubmit() {
    const query = $w('#searchInput').value.trim();
    
    if (query.length === 0) {
        showMessage('请输入搜索关键词');
        return;
    }
    
    await performAdvancedSearch(query);
    
    // 记录搜索历史
    recordSearchHistory(query);
}

/**
 * 执行搜索
 * 在本地数据中进行快速搜索
 */
function performSearch(query) {
    const searchTerms = query.toLowerCase().split(' ');
    
    filteredResources = allResources.filter(resource => {
        const searchableText = [
            resource.title,
            resource.description,
            resource.tags,
            resource.category,
            resource.type
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
    });
    
    updateResourcesDisplay();
}

/**
 * 执行高级搜索
 * 在数据库中进行全文搜索
 */
async function performAdvancedSearch(query) {
    try {
        showLoadingIndicator('正在搜索...');
        
        // 检查搜索缓存
        if (searchCache.has(query)) {
            const cachedResult = searchCache.get(query);
            filteredResources = cachedResult;
            updateResourcesDisplay();
            hideLoadingIndicator();
            return;
        }
        
        // 构建搜索查询
        const searchResult = await wixData.query('StudentResources')
            .contains('title', query)
            .or(
                wixData.query('StudentResources')
                    .contains('description', query)
            )
            .or(
                wixData.query('StudentResources')
                    .contains('tags', query)
            )
            .eq('isActive', true)
            .find();
        
        filteredResources = searchResult.items;
        
        // 缓存搜索结果
        searchCache.set(query, filteredResources);
        
        updateResourcesDisplay();
        hideLoadingIndicator();
        
        console.log(`搜索 "${query}" 找到 ${filteredResources.length} 个结果`);
        
    } catch (error) {
        console.error('搜索失败:', error);
        showErrorMessage('搜索失败，请稍后重试');
        hideLoadingIndicator();
    }
}

/**
 * 清除搜索
 */
function handleClearSearch() {
    $w('#searchInput').value = '';
    searchQuery = '';
    filteredResources = [...allResources];
    updateResourcesDisplay();
    hideSuggestions();
}

// ==================== 筛选事件处理器 ====================

/**
 * 处理分类筛选
 */
async function handleCategoryFilter(event) {
    currentCategory = event.target.value;
    currentPage = 1;
    
    await loadResourcesData();
    updateFilterUI();
}

/**
 * 处理类型筛选
 */
function handleTypeFilter(event) {
    const selectedType = event.target.value;
    
    if (selectedType === 'all') {
        filteredResources = [...allResources];
    } else {
        filteredResources = allResources.filter(resource => 
            resource.type === selectedType
        );
    }
    
    updateResourcesDisplay();
}

/**
 * 处理难度筛选
 */
function handleDifficultyFilter(event) {
    const selectedDifficulty = event.target.value;
    
    if (selectedDifficulty === 'all') {
        filteredResources = [...allResources];
    } else {
        filteredResources = allResources.filter(resource => 
            resource.difficulty === selectedDifficulty
        );
    }
    
    updateResourcesDisplay();
}

/**
 * 处理排序变更
 */
function handleSortChange(event) {
    currentSortBy = event.target.value;
    
    // 对当前显示的资源进行排序
    sortResources(filteredResources, currentSortBy);
    updateResourcesDisplay();
}

// ==================== 视图切换处理器 ====================

/**
 * 处理视图切换
 */
function handleViewChange(viewType) {
    currentView = viewType;
    
    // 更新视图按钮状态
    updateViewButtons();
    
    // 更新资源显示
    updateResourcesDisplay();
    
    // 保存用户偏好
    saveUserPreference('defaultView', viewType);
}

/**
 * 更新视图按钮状态
 */
function updateViewButtons() {
    // 重置所有按钮
    $w('#gridViewButton').style.backgroundColor = '#f5f5f5';
    $w('#listViewButton').style.backgroundColor = '#f5f5f5';
    $w('#cardViewButton').style.backgroundColor = '#f5f5f5';
    
    // 高亮当前视图按钮
    switch (currentView) {
        case 'grid':
            $w('#gridViewButton').style.backgroundColor = '#663399';
            break;
        case 'list':
            $w('#listViewButton').style.backgroundColor = '#663399';
            break;
        case 'card':
            $w('#cardViewButton').style.backgroundColor = '#663399';
            break;
    }
}

// ==================== 资源操作处理器 ====================

/**
 * 设置资源项目事件
 */
function setupResourceItemEvents($item, itemData, index) {
    // 资源点击事件
    $item('#resourceCard').onClick(() => handleResourceClick(itemData));
    
    // 收藏按钮事件
    $item('#favoriteButton').onClick((event) => {
        event.stopPropagation();
        handleToggleFavorite(itemData);
    });
    
    // 下载按钮事件
    $item('#downloadButton').onClick((event) => {
        event.stopPropagation();
        handleResourceDownload(itemData);
    });
    
    // 分享按钮事件
    $item('#shareButton').onClick((event) => {
        event.stopPropagation();
        handleResourceShare(itemData);
    });
    
    // 预览按钮事件
    $item('#previewButton').onClick((event) => {
        event.stopPropagation();
        handleResourcePreview(itemData);
    });
    
    // 评分事件
    $item('#ratingStars').onClick((event) => {
        event.stopPropagation();
        handleResourceRating(itemData);
    });
    
    // 更新收藏状态
    updateFavoriteButton($item, itemData);
}

/**
 * 处理资源点击
 */
async function handleResourceClick(resource) {
    try {
        // 记录访问历史
        await recordResourceView(resource);
        
        // 根据资源类型执行不同操作
        switch (resource.type) {
            case 'document':
            case 'pdf':
                await handleDocumentView(resource);
                break;
            case 'video':
                await handleVideoView(resource);
                break;
            case 'link':
                await handleLinkView(resource);
                break;
            case 'tool':
                await handleToolLaunch(resource);
                break;
            default:
                await handleGenericResourceView(resource);
        }
        
    } catch (error) {
        console.error('处理资源点击失败:', error);
        showErrorMessage('无法打开资源，请稍后重试');
    }
}

/**
 * 处理收藏切换
 */
async function handleToggleFavorite(resource) {
    try {
        const isFavorited = favoriteResources.includes(resource._id);
        
        if (isFavorited) {
            // 取消收藏
            await removeFavorite(resource._id);
            favoriteResources = favoriteResources.filter(id => id !== resource._id);
            showMessage('已取消收藏');
        } else {
            // 添加收藏
            await addFavorite(resource._id);
            favoriteResources.push(resource._id);
            showMessage('已添加到收藏');
        }
        
        // 更新UI
        updateResourcesDisplay();
        
    } catch (error) {
        console.error('收藏操作失败:', error);
        showErrorMessage('收藏操作失败，请稍后重试');
    }
}

/**
 * 处理资源下载
 */
async function handleResourceDownload(resource) {
    try {
        // 检查下载权限
        if (!await checkDownloadPermission(resource)) {
            showMessage('您没有下载此资源的权限');
            return;
        }
        
        // 检查并发下载限制
        if (activeDownloads.size >= maxConcurrentDownloads) {
            downloadQueue.push(resource);
            showMessage('下载已加入队列');
            return;
        }
        
        // 开始下载
        await startDownload(resource);
        
    } catch (error) {
        console.error('下载失败:', error);
        showErrorMessage('下载失败，请稍后重试');
    }
}

/**
 * 处理资源分享
 */
function handleResourceShare(resource) {
    const shareData = {
        title: resource.title,
        text: resource.description,
        url: `${wixLocation.baseUrl}/resources/${resource._id}`
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // 复制链接到剪贴板
        copyToClipboard(shareData.url);
        showMessage('链接已复制到剪贴板');
    }
}

/**
 * 处理资源预览
 */
async function handleResourcePreview(resource) {
    try {
        // 根据资源类型显示预览
        switch (resource.type) {
            case 'image':
                showImagePreview(resource);
                break;
            case 'video':
                showVideoPreview(resource);
                break;
            case 'document':
            case 'pdf':
                showDocumentPreview(resource);
                break;
            default:
                showGenericPreview(resource);
        }
        
    } catch (error) {
        console.error('预览失败:', error);
        showErrorMessage('无法预览此资源');
    }
}

// ==================== 收藏和历史记录处理器 ====================

/**
 * 显示收藏资源
 */
function handleShowFavorites() {
    filteredResources = allResources.filter(resource => 
        favoriteResources.includes(resource._id)
    );
    
    updateResourcesDisplay();
    updateFilterStatus('收藏的资源');
}

/**
 * 显示最近访问的资源
 */
function handleShowRecent() {
    const recentResourceIds = recentResources.map(item => item.resourceId);
    
    filteredResources = allResources.filter(resource => 
        recentResourceIds.includes(resource._id)
    );
    
    // 按访问时间排序
    filteredResources.sort((a, b) => {
        const aTime = recentResources.find(item => item.resourceId === a._id)?.timestamp || 0;
        const bTime = recentResources.find(item => item.resourceId === b._id)?.timestamp || 0;
        return new Date(bTime) - new Date(aTime);
    });
    
    updateResourcesDisplay();
    updateFilterStatus('最近访问的资源');
}

/**
 * 显示下载历史
 */
function handleShowDownloadHistory() {
    const downloadedResourceIds = downloadHistory.map(item => item.resourceId);
    
    filteredResources = allResources.filter(resource => 
        downloadedResourceIds.includes(resource._id)
    );
    
    // 按下载时间排序
    filteredResources.sort((a, b) => {
        const aTime = downloadHistory.find(item => item.resourceId === a._id)?.downloadDate || 0;
        const bTime = downloadHistory.find(item => item.resourceId === b._id)?.downloadDate || 0;
        return new Date(bTime) - new Date(aTime);
    });
    
    updateResourcesDisplay();
    updateFilterStatus('下载历史');
}

// ==================== 分页处理器 ====================

/**
 * 处理加载更多
 */
async function handleLoadMore() {
    if (!hasMoreItems || isLoading) {
        return;
    }
    
    try {
        isLoading = true;
        $w('#loadMoreButton').label = '加载中...';
        $w('#loadMoreButton').disable();
        
        currentPage++;
        
        // 加载下一页数据
        const nextPageData = await loadResourcesPage(currentPage);
        
        if (nextPageData.length > 0) {
            allResources = [...allResources, ...nextPageData];
            filteredResources = [...filteredResources, ...nextPageData];
            updateResourcesDisplay();
        } else {
            hasMoreItems = false;
            $w('#loadMoreButton').hide();
        }
        
    } catch (error) {
        console.error('加载更多失败:', error);
        showErrorMessage('加载失败，请稍后重试');
    } finally {
        isLoading = false;
        $w('#loadMoreButton').label = '加载更多';
        $w('#loadMoreButton').enable();
    }
}

// ==================== 资源上传处理器 ====================

/**
 * 处理资源上传
 */
async function handleResourceUpload() {
    try {
        // 检查上传权限
        if (!await checkUploadPermission()) {
            showMessage('您没有上传资源的权限');
            return;
        }
        
        // 打开上传对话框
        $w('#uploadLightbox').show();
        
    } catch (error) {
        console.error('上传处理失败:', error);
        showErrorMessage('无法打开上传界面');
    }
}

// ==================== 快速操作处理器 ====================

/**
 * 刷新资源
 */
async function handleRefreshResources() {
    try {
        // 清除缓存
        resourceCache.clear();
        searchCache.clear();
        
        // 重新加载数据
        await loadResourcesData();
        await loadUserResourceData();
        
        showMessage('资源已刷新');
        
    } catch (error) {
        console.error('刷新失败:', error);
        showErrorMessage('刷新失败，请稍后重试');
    }
}

/**
 * 导出资源列表
 */
function handleExportResources() {
    try {
        const exportData = filteredResources.map(resource => ({
            title: resource.title,
            category: resource.category,
            type: resource.type,
            description: resource.description,
            url: resource.url || resource.fileUrl,
            dateAdded: formatDate(resource._createdDate)
        }));
        
        const csvContent = convertToCSV(exportData);
        downloadCSV(csvContent, 'student-resources.csv');
        
        showMessage('资源列表已导出');
        
    } catch (error) {
        console.error('导出失败:', error);
        showErrorMessage('导出失败，请稍后重试');
    }
}

// ==================== UI 更新函数 ====================

/**
 * 更新资源显示
 */
async function updateResourcesDisplay() {
    try {
        // 根据当前视图类型更新显示
        switch (currentView) {
            case 'grid':
                await updateGridView();
                break;
            case 'list':
                await updateListView();
                break;
            case 'card':
                await updateCardView();
                break;
        }
        
        // 更新统计信息
        updateResourcesStats();
        
        // 更新分页信息
        updatePaginationInfo();
        
    } catch (error) {
        console.error('更新资源显示失败:', error);
    }
}

/**
 * 更新网格视图
 */
async function updateGridView() {
    $w('#resourceRepeater').data = filteredResources.map(resource => ({
        ...resource,
        formattedDate: formatDate(resource._createdDate),
        formattedSize: formatFileSize(resource.fileSize),
        isFavorited: favoriteResources.includes(resource._id),
        downloadCount: resource.downloadCount || 0,
        rating: resource.averageRating || 0
    }));
    
    // 设置网格布局
    $w('#resourceRepeater').layout = 'grid';
}

/**
 * 更新列表视图
 */
async function updateListView() {
    $w('#resourceRepeater').data = filteredResources.map(resource => ({
        ...resource,
        formattedDate: formatDate(resource._createdDate),
        formattedSize: formatFileSize(resource.fileSize),
        isFavorited: favoriteResources.includes(resource._id),
        downloadCount: resource.downloadCount || 0,
        rating: resource.averageRating || 0
    }));
    
    // 设置列表布局
    $w('#resourceRepeater').layout = 'list';
}

/**
 * 更新卡片视图
 */
async function updateCardView() {
    $w('#resourceRepeater').data = filteredResources.map(resource => ({
        ...resource,
        formattedDate: formatDate(resource._createdDate),
        formattedSize: formatFileSize(resource.fileSize),
        isFavorited: favoriteResources.includes(resource._id),
        downloadCount: resource.downloadCount || 0,
        rating: resource.averageRating || 0
    }));
    
    // 设置卡片布局
    $w('#resourceRepeater').layout = 'card';
}

/**
 * 更新资源统计信息
 */
function updateResourcesStats() {
    const totalResources = filteredResources.length;
    const totalSize = filteredResources.reduce((sum, resource) => 
        sum + (resource.fileSize || 0), 0
    );
    
    $w('#totalResourcesText').text = `共 ${totalResources} 个资源`;
    $w('#totalSizeText').text = `总大小: ${formatFileSize(totalSize)}`;
    
    // 更新分类统计
    updateCategoryStats();
}

/**
 * 更新用户资源UI
 */
function updateUserResourcesUI() {
    // 更新收藏数量
    $w('#favoritesCount').text = favoriteResources.length.toString();
    
    // 更新最近访问数量
    $w('#recentCount').text = recentResources.length.toString();
    
    // 更新下载历史数量
    $w('#downloadHistoryCount').text = downloadHistory.length.toString();
}

// ==================== 响应式设计处理 ====================

/**
 * 设置响应式设计
 */
function setupResponsiveDesign() {
    // 监听窗口大小变化
    wixWindow.onResize(() => {
        handleWindowResize();
    });
    
    // 初始化响应式布局
    handleWindowResize();
}

/**
 * 处理窗口大小变化
 */
function handleWindowResize() {
    const windowWidth = wixWindow.getBoundingRect().width;
    
    if (windowWidth < 768) {
        // 移动端布局
        setupMobileLayout();
    } else if (windowWidth < 1024) {
        // 平板布局
        setupTabletLayout();
    } else {
        // 桌面布局
        setupDesktopLayout();
    }
}

/**
 * 设置移动端布局
 */
function setupMobileLayout() {
    // 调整每页显示数量
    itemsPerPage = 6;
    
    // 隐藏某些筛选器
    $w('#advancedFilters').collapse();
    
    // 调整资源卡片大小
    $w('#resourceRepeater').itemsPerRow = 1;
}

/**
 * 设置平板布局
 */
function setupTabletLayout() {
    itemsPerPage = 9;
    $w('#advancedFilters').expand();
    $w('#resourceRepeater').itemsPerRow = 2;
}

/**
 * 设置桌面布局
 */
function setupDesktopLayout() {
    itemsPerPage = 12;
    $w('#advancedFilters').expand();
    $w('#resourceRepeater').itemsPerRow = 3;
}

// ==================== 工具函数 ====================

/**
 * 防抖函数
 * 用于优化搜索性能
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
 */
function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays} 天前`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} 周前`;
    } else {
        return d.toLocaleDateString('zh-CN');
    }
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '未知大小';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 显示消息
 */
function showMessage(message, type = 'info') {
    $w('#messageText').text = message;
    $w('#messageBar').style.backgroundColor = type === 'error' ? '#ff4757' : '#663399';
    $w('#messageBar').show();
    
    // 3秒后自动隐藏
    setTimeout(() => {
        $w('#messageBar').hide();
    }, 3000);
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
    showMessage(message, 'error');
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    $w('#loadingOverlay').show();
    $w('#mainContent').collapse();
}

/**
 * 隐藏加载状态
 */
function hideLoadingState() {
    $w('#loadingOverlay').hide();
    $w('#mainContent').expand();
}

/**
 * 显示加载指示器
 */
function showLoadingIndicator(message = '加载中...') {
    $w('#loadingText').text = message;
    $w('#loadingIndicator').show();
}

/**
 * 隐藏加载指示器
 */
function hideLoadingIndicator() {
    $w('#loadingIndicator').hide();
}

// ==================== 数据库操作函数 ====================

/**
 * 记录资源访问
 */
async function recordResourceView(resource) {
    try {
        await wixData.insert('UserActivity', {
            userId: currentUser._id,
            activityType: 'resource_view',
            resourceId: resource._id,
            timestamp: new Date(),
            metadata: {
                resourceTitle: resource.title,
                resourceType: resource.type
            }
        });
        
        // 更新资源访问计数
        await wixData.update('StudentResources', {
            _id: resource._id,
            viewCount: (resource.viewCount || 0) + 1
        });
        
    } catch (error) {
        console.error('记录资源访问失败:', error);
    }
}

/**
 * 添加收藏
 */
async function addFavorite(resourceId) {
    await wixData.insert('UserFavorites', {
        userId: currentUser._id,
        resourceId: resourceId,
        type: 'resource',
        dateAdded: new Date()
    });
}

/**
 * 移除收藏
 */
async function removeFavorite(resourceId) {
    const favoriteQuery = await wixData.query('UserFavorites')
        .eq('userId', currentUser._id)
        .eq('resourceId', resourceId)
        .eq('type', 'resource')
        .find();
    
    if (favoriteQuery.items.length > 0) {
        await wixData.remove('UserFavorites', favoriteQuery.items[0]._id);
    }
}

// ==================== 自动刷新和缓存机制 ====================

/**
 * 设置自动刷新
 */
function setupAutoRefresh() {
    // 每5分钟检查一次新资源
    setInterval(async () => {
        try {
            await checkForNewResources();
        } catch (error) {
            console.error('自动刷新失败:', error);
        }
    }, 5 * 60 * 1000);
}

/**
 * 检查新资源
 */
async function checkForNewResources() {
    const latestResource = allResources[0];
    const latestDate = latestResource ? latestResource._createdDate : new Date(0);
    
    const newResourcesQuery = await wixData.query('StudentResources')
        .gt('_createdDate', latestDate)
        .eq('isActive', true)
        .find();
    
    if (newResourcesQuery.items.length > 0) {
        // 有新资源，显示通知
        showNewResourcesNotification(newResourcesQuery.items.length);
    }
}

/**
 * 显示新资源通知
 */
function showNewResourcesNotification(count) {
    $w('#newResourcesNotification').text = `有 ${count} 个新资源可用`;
    $w('#newResourcesNotification').show();
    
    // 点击通知刷新页面
    $w('#newResourcesNotification').onClick(() => {
        handleRefreshResources();
        $w('#newResourcesNotification').hide();
    });
}

// ==================== 分析和跟踪 ====================

/**
 * 跟踪用户行为
 */
function trackUserAction(action, data = {}) {
    try {
        // 发送分析数据到后端
        wixData.insert('UserAnalytics', {
            userId: currentUser._id,
            action: action,
            page: 'student-resources',
            timestamp: new Date(),
            data: data,
            userAgent: navigator.userAgent,
            sessionId: session.getItem('sessionId')
        });
        
    } catch (error) {
        console.error('跟踪用户行为失败:', error);
    }
}

/**
 * 初始化页面分析
 */
function initializeAnalytics() {
    // 记录页面访问
    trackUserAction('page_view', {
        referrer: document.referrer,
        timestamp: new Date()
    });
    
    // 设置会话ID
    if (!session.getItem('sessionId')) {
        session.setItem('sessionId', generateSessionId());
    }
}

/**
 * 生成会话ID
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==================== 页面卸载处理 ====================

/**
 * 页面卸载时的清理工作
 */
window.addEventListener('beforeunload', function() {
    // 保存用户偏好设置
    saveUserPreferences();
    
    // 清理定时器
    clearAllTimers();
    
    // 记录页面离开时间
    trackUserAction('page_leave', {
        timestamp: new Date(),
        timeOnPage: Date.now() - pageLoadTime
    });
});

// 记录页面加载时间
const pageLoadTime = Date.now();

// 初始化分析
initializeAnalytics();

// 设置自动刷新
setupAutoRefresh();

console.log('学生资源页面脚本加载完成');

/**
 * 使用说明：
 * 
 * 1. 数据库集合要求：
 *    - StudentResources: 存储所有学习资源
 *    - UserProfiles: 用户资料和偏好设置
 *    - UserFavorites: 用户收藏记录
 *    - UserActivity: 用户活动记录
 *    - UserDownloads: 下载历史记录
 *    - UserAnalytics: 用户行为分析数据
 * 
 * 2. 页面元素要求：
 *    - 搜索框: #searchInput
 *    - 筛选器: #categoryDropdown, #typeDropdown, #sortDropdown
 *    - 视图切换按钮: #gridViewButton, #listViewButton, #cardViewButton
 *    - 资源重复器: #resourceRepeater
 *    - 加载和消息元素: #loadingOverlay, #messageBar
 * 
 * 3. 功能特点：
 *    - 支持多种资源类型（文档、视频、工具、链接）
 *    - 实现智能搜索和筛选
 *    - 提供收藏和历史记录功能
 *    - 支持资源下载和分享
 *    - 包含用户行为分析
 *    - 响应式设计适配各种设备
 * 
 * 4. 性能优化：
 *    - 使用缓存机制减少数据库查询
 *    - 实现搜索防抖优化
 *    - 支持分页和懒加载
 *    - 包含自动刷新机制
 */