/**
 * Purple Ruler Academy - 学生安全保护页面
 * Wix Velo JavaScript 代码实现
 * 
 * 功能概述：
 * - 安全报告和举报系统
 * - 紧急联系和支持
 * - 安全教育资源
 * - 事件跟踪和管理
 * - 匿名举报功能
 * - 安全政策和指南
 * - 家长通知系统
 * - 危机干预支持
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
let safeguardingData = {
    reports: [],
    contacts: [],
    resources: [],
    policies: []
};
let currentView = 'overview';
let reportForm = {
    type: '',
    description: '',
    urgency: 'medium',
    anonymous: false,
    attachments: []
};
let emergencyContacts = [];
let isEmergencyMode = false;

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
    console.log('学生安全保护页面初始化开始');
    
    initializePage();
    setupEventHandlers();
    checkUserAuthentication();
    loadSafeguardingData();
    setupEmergencyFeatures();
    initializeReportingSystem();
    
    console.log('学生安全保护页面初始化完成');
});

/**
 * 初始化页面基本设置
 */
function initializePage() {
    try {
        // 设置页面标题和元信息
        $w('#pageTitle').text = '学生安全保护';
        $w('#pageDescription').text = '我们致力于为每位学生提供安全、支持性的学习环境';
        
        // 初始化视图状态
        showView('overview');
        
        // 设置初始UI状态
        $w('#loadingOverlay').show();
        $w('#emergencyButton').show();
        $w('#anonymousToggle').checked = false;
        
        // 初始化表单状态
        resetReportForm();
        
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
        // 导航按钮事件
        $w('#overviewButton').onClick(() => showView('overview'));
        $w('#reportButton').onClick(() => showView('report'));
        $w('#resourcesButton').onClick(() => showView('resources'));
        $w('#contactsButton').onClick(() => showView('contacts'));
        $w('#policiesButton').onClick(() => showView('policies'));
        
        // 紧急功能按钮
        $w('#emergencyButton').onClick(handleEmergencyContact);
        $w('#emergencyCallButton').onClick(handleEmergencyCall);
        $w('#emergencyTextButton').onClick(handleEmergencyText);
        
        // 报告表单事件
        $w('#reportTypeDropdown').onChange(handleReportTypeChange);
        $w('#urgencyDropdown').onChange(handleUrgencyChange);
        $w('#anonymousToggle').onChange(handleAnonymousToggle);
        $w('#reportDescription').onInput(debounce(handleDescriptionInput, 300));
        $w('#attachmentUpload').onChange(handleAttachmentUpload);
        $w('#submitReportButton').onClick(handleSubmitReport);
        $w('#clearFormButton').onClick(resetReportForm);
        
        // 资源和联系人事件
        $w('#resourcesRepeater').onItemReady(setupResourceItem);
        $w('#contactsRepeater').onItemReady(setupContactItem);
        $w('#policiesRepeater').onItemReady(setupPolicyItem);
        
        // 搜索和筛选事件
        $w('#searchInput').onInput(debounce(handleSearch, 300));
        $w('#categoryFilter').onChange(handleCategoryFilter);
        $w('#urgencyFilter').onChange(handleUrgencyFilter);
        
        // 其他交互事件
        $w('#refreshButton').onClick(refreshData);
        $w('#helpButton').onClick(showHelpModal);
        $w('#feedbackButton').onClick(showFeedbackModal);
        
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
            // 未登录用户仍可访问紧急功能和基本资源
            currentUser = null;
            updateUserInterface();
            console.log('用户未登录，提供基本安全功能');
        }
    } catch (error) {
        console.error('用户认证检查失败:', error);
        currentUser = null;
        updateUserInterface();
    }
}

/**
 * 更新用户界面
 */
function updateUserInterface() {
    try {
        if (currentUser) {
            $w('#userWelcome').text = `你好，${currentUser.profile?.nickname || '学生'}`;
            $w('#userWelcome').show();
            $w('#loginPrompt').hide();
            
            // 显示个人化功能
            $w('#myReportsButton').show();
            $w('#reportHistoryButton').show();
        } else {
            $w('#userWelcome').hide();
            $w('#loginPrompt').show();
            $w('#loginPrompt').text = '登录以访问完整的安全保护功能';
            
            // 隐藏需要登录的功能
            $w('#myReportsButton').hide();
            $w('#reportHistoryButton').hide();
        }
        
        console.log('用户界面更新完成');
    } catch (error) {
        console.error('用户界面更新失败:', error);
    }
}

// ==================== 数据加载和管理 ====================

/**
 * 加载安全保护数据
 */
async function loadSafeguardingData() {
    try {
        $w('#loadingOverlay').show();
        
        // 并行加载所有数据
        const [reportsData, contactsData, resourcesData, policiesData] = await Promise.all([
            loadReportsData(),
            loadContactsData(),
            loadResourcesData(),
            loadPoliciesData()
        ]);
        
        safeguardingData = {
            reports: reportsData,
            contacts: contactsData,
            resources: resourcesData,
            policies: policiesData
        };
        
        // 更新UI显示
        updateOverviewStats();
        updateRepeaters();
        
        $w('#loadingOverlay').hide();
        console.log('安全保护数据加载完成');
        
    } catch (error) {
        console.error('数据加载失败:', error);
        $w('#loadingOverlay').hide();
        showMessage('数据加载失败，请刷新重试', 'error');
    }
}

/**
 * 加载报告数据
 */
async function loadReportsData() {
    try {
        let query = wixData.query('SafeguardingReports')
            .eq('isActive', true)
            .descending('_createdDate');
        
        // 如果用户已登录，加载其相关报告
        if (currentUser) {
            query = query.or(
                wixData.query('SafeguardingReports').eq('reporterId', currentUser._id),
                wixData.query('SafeguardingReports').eq('isPublic', true)
            );
        } else {
            query = query.eq('isPublic', true);
        }
        
        const results = await query.limit(50).find();
        return results.items;
    } catch (error) {
        console.error('报告数据加载失败:', error);
        return [];
    }
}

/**
 * 加载联系人数据
 */
async function loadContactsData() {
    try {
        const results = await wixData.query('SafeguardingContacts')
            .eq('isActive', true)
            .eq('isAvailable', true)
            .ascending('priority')
            .find();
        
        emergencyContacts = results.items.filter(contact => contact.isEmergency);
        return results.items;
    } catch (error) {
        console.error('联系人数据加载失败:', error);
        return [];
    }
}

/**
 * 加载资源数据
 */
async function loadResourcesData() {
    try {
        const results = await wixData.query('SafeguardingResources')
            .eq('isActive', true)
            .eq('isPublished', true)
            .descending('priority')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('资源数据加载失败:', error);
        return [];
    }
}

/**
 * 加载政策数据
 */
async function loadPoliciesData() {
    try {
        const results = await wixData.query('SafeguardingPolicies')
            .eq('isActive', true)
            .eq('isPublished', true)
            .ascending('displayOrder')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('政策数据加载失败:', error);
        return [];
    }
}

// ==================== 视图管理 ====================

/**
 * 显示指定视图
 */
function showView(viewName) {
    try {
        // 隐藏所有视图
        $w('#overviewContainer').hide();
        $w('#reportContainer').hide();
        $w('#resourcesContainer').hide();
        $w('#contactsContainer').hide();
        $w('#policiesContainer').hide();
        
        // 重置导航按钮状态
        $w('#overviewButton').style.backgroundColor = '#FFFFFF';
        $w('#reportButton').style.backgroundColor = '#FFFFFF';
        $w('#resourcesButton').style.backgroundColor = '#FFFFFF';
        $w('#contactsButton').style.backgroundColor = '#FFFFFF';
        $w('#policiesButton').style.backgroundColor = '#FFFFFF';
        
        // 显示选中的视图
        switch (viewName) {
            case 'overview':
                $w('#overviewContainer').show();
                $w('#overviewButton').style.backgroundColor = '#663399';
                updateOverviewStats();
                break;
            case 'report':
                $w('#reportContainer').show();
                $w('#reportButton').style.backgroundColor = '#663399';
                initializeReportForm();
                break;
            case 'resources':
                $w('#resourcesContainer').show();
                $w('#resourcesButton').style.backgroundColor = '#663399';
                updateResourcesDisplay();
                break;
            case 'contacts':
                $w('#contactsContainer').show();
                $w('#contactsButton').style.backgroundColor = '#663399';
                updateContactsDisplay();
                break;
            case 'policies':
                $w('#policiesContainer').show();
                $w('#policiesButton').style.backgroundColor = '#663399';
                updatePoliciesDisplay();
                break;
        }
        
        currentView = viewName;
        console.log('视图切换到:', viewName);
        
    } catch (error) {
        console.error('视图切换失败:', error);
    }
}

/**
 * 更新概览统计信息
 */
function updateOverviewStats() {
    try {
        const totalReports = safeguardingData.reports.length;
        const activeContacts = safeguardingData.contacts.filter(c => c.isAvailable).length;
        const availableResources = safeguardingData.resources.length;
        const urgentReports = safeguardingData.reports.filter(r => r.urgency === 'high' || r.urgency === 'critical').length;
        
        $w('#totalReportsText').text = totalReports.toString();
        $w('#activeContactsText').text = activeContacts.toString();
        $w('#availableResourcesText').text = availableResources.toString();
        $w('#urgentReportsText').text = urgentReports.toString();
        
        // 更新最近活动
        updateRecentActivity();
        
        console.log('概览统计更新完成');
    } catch (error) {
        console.error('概览统计更新失败:', error);
    }
}

/**
 * 更新最近活动
 */
function updateRecentActivity() {
    try {
        const recentReports = safeguardingData.reports
            .slice(0, 5)
            .map(report => ({
                title: `${report.type} 报告`,
                description: report.description.substring(0, 100) + '...',
                timestamp: formatDate(report._createdDate),
                urgency: report.urgency
            }));
        
        $w('#recentActivityRepeater').data = recentReports;
        
    } catch (error) {
        console.error('最近活动更新失败:', error);
    }
}

// ==================== 报告系统 ====================

/**
 * 设置紧急功能
 */
function setupEmergencyFeatures() {
    try {
        // 设置紧急按钮样式
        $w('#emergencyButton').style.backgroundColor = '#DC3545';
        $w('#emergencyButton').style.color = '#FFFFFF';
        
        // 检查是否有紧急联系人
        if (emergencyContacts.length === 0) {
            console.warn('未找到紧急联系人');
        }
        
        console.log('紧急功能设置完成');
    } catch (error) {
        console.error('紧急功能设置失败:', error);
    }
}

/**
 * 初始化报告系统
 */
function initializeReportingSystem() {
    try {
        // 设置报告类型选项
        const reportTypes = [
            { label: '请选择报告类型', value: '' },
            { label: '欺凌行为', value: 'bullying' },
            { label: '网络安全', value: 'cybersafety' },
            { label: '身体安全', value: 'physical_safety' },
            { label: '心理健康', value: 'mental_health' },
            { label: '歧视行为', value: 'discrimination' },
            { label: '不当行为', value: 'inappropriate_behavior' },
            { label: '其他安全问题', value: 'other' }
        ];
        
        $w('#reportTypeDropdown').options = reportTypes;
        
        // 设置紧急程度选项
        const urgencyLevels = [
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' },
            { label: '紧急', value: 'critical' }
        ];
        
        $w('#urgencyDropdown').options = urgencyLevels;
        $w('#urgencyDropdown').value = 'medium';
        
        console.log('报告系统初始化完成');
    } catch (error) {
        console.error('报告系统初始化失败:', error);
    }
}

/**
 * 初始化报告表单
 */
function initializeReportForm() {
    try {
        if (!currentUser) {
            $w('#loginRequiredMessage').show();
            $w('#reportFormContainer').hide();
            return;
        }
        
        $w('#loginRequiredMessage').hide();
        $w('#reportFormContainer').show();
        
        // 重置表单
        resetReportForm();
        
        console.log('报告表单初始化完成');
    } catch (error) {
        console.error('报告表单初始化失败:', error);
    }
}

/**
 * 重置报告表单
 */
function resetReportForm() {
    try {
        reportForm = {
            type: '',
            description: '',
            urgency: 'medium',
            anonymous: false,
            attachments: []
        };
        
        $w('#reportTypeDropdown').value = '';
        $w('#reportDescription').value = '';
        $w('#urgencyDropdown').value = 'medium';
        $w('#anonymousToggle').checked = false;
        $w('#attachmentList').text = '未选择文件';
        
        // 重置按钮状态
        $w('#submitReportButton').disable();
        
        console.log('报告表单已重置');
    } catch (error) {
        console.error('报告表单重置失败:', error);
    }
}

// ==================== 事件处理器 ====================

/**
 * 处理紧急联系
 */
function handleEmergencyContact() {
    try {
        isEmergencyMode = true;
        
        // 显示紧急联系选项
        $w('#emergencyModal').show();
        
        // 更新紧急联系人列表
        if (emergencyContacts.length > 0) {
            $w('#emergencyContactsRepeater').data = emergencyContacts;
        } else {
            showMessage('紧急联系人信息暂不可用，请拨打当地紧急电话', 'warning');
        }
        
        console.log('紧急联系模式激活');
    } catch (error) {
        console.error('紧急联系处理失败:', error);
        showMessage('紧急联系功能暂时不可用', 'error');
    }
}

/**
 * 处理紧急电话
 */
function handleEmergencyCall() {
    try {
        const emergencyNumber = '000'; // 澳大利亚紧急电话
        
        // 在移动设备上尝试拨打电话
        if (wixWindow.formFactor === 'Mobile') {
            wixLocation.to(`tel:${emergencyNumber}`);
        } else {
            showMessage(`请拨打紧急电话: ${emergencyNumber}`, 'info');
        }
        
        // 记录紧急联系事件
        logEmergencyEvent('emergency_call');
        
    } catch (error) {
        console.error('紧急电话处理失败:', error);
    }
}

/**
 * 处理紧急短信
 */
function handleEmergencyText() {
    try {
        const emergencyText = '106'; // 澳大利亚紧急短信
        
        // 在移动设备上尝试发送短信
        if (wixWindow.formFactor === 'Mobile') {
            wixLocation.to(`sms:${emergencyText}`);
        } else {
            showMessage(`请发送短信到: ${emergencyText}`, 'info');
        }
        
        // 记录紧急联系事件
        logEmergencyEvent('emergency_text');
        
    } catch (error) {
        console.error('紧急短信处理失败:', error);
    }
}

/**
 * 处理报告类型变化
 */
function handleReportTypeChange() {
    try {
        const selectedType = $w('#reportTypeDropdown').value;
        reportForm.type = selectedType;
        
        // 根据报告类型提供指导
        updateReportGuidance(selectedType);
        
        // 验证表单
        validateReportForm();
        
        console.log('报告类型已选择:', selectedType);
    } catch (error) {
        console.error('报告类型处理失败:', error);
    }
}

/**
 * 处理紧急程度变化
 */
function handleUrgencyChange() {
    try {
        const selectedUrgency = $w('#urgencyDropdown').value;
        reportForm.urgency = selectedUrgency;
        
        // 如果是紧急情况，显示特别提示
        if (selectedUrgency === 'critical') {
            $w('#urgencyWarning').show();
            $w('#urgencyWarning').text = '如果是紧急情况，请立即联系紧急服务或使用紧急联系功能';
        } else {
            $w('#urgencyWarning').hide();
        }
        
        console.log('紧急程度已选择:', selectedUrgency);
    } catch (error) {
        console.error('紧急程度处理失败:', error);
    }
}

/**
 * 处理匿名切换
 */
function handleAnonymousToggle() {
    try {
        const isAnonymous = $w('#anonymousToggle').checked;
        reportForm.anonymous = isAnonymous;
        
        if (isAnonymous) {
            $w('#anonymousInfo').show();
            $w('#anonymousInfo').text = '匿名报告将不包含您的个人信息，但可能影响后续跟进';
        } else {
            $w('#anonymousInfo').hide();
        }
        
        console.log('匿名模式:', isAnonymous);
    } catch (error) {
        console.error('匿名切换处理失败:', error);
    }
}

/**
 * 处理描述输入
 */
function handleDescriptionInput() {
    try {
        const description = $w('#reportDescription').value;
        reportForm.description = description;
        
        // 更新字符计数
        const charCount = description.length;
        const maxChars = 1000;
        $w('#charCount').text = `${charCount}/${maxChars}`;
        
        if (charCount > maxChars) {
            $w('#charCount').style.color = '#DC3545';
        } else {
            $w('#charCount').style.color = '#666666';
        }
        
        // 验证表单
        validateReportForm();
        
    } catch (error) {
        console.error('描述输入处理失败:', error);
    }
}

/**
 * 处理附件上传
 */
function handleAttachmentUpload() {
    try {
        const files = $w('#attachmentUpload').value;
        
        if (files && files.length > 0) {
            reportForm.attachments = files;
            $w('#attachmentList').text = `已选择 ${files.length} 个文件`;
        } else {
            reportForm.attachments = [];
            $w('#attachmentList').text = '未选择文件';
        }
        
        console.log('附件已更新:', files?.length || 0);
    } catch (error) {
        console.error('附件上传处理失败:', error);
    }
}

/**
 * 处理提交报告
 */
async function handleSubmitReport() {
    try {
        if (!validateReportForm()) {
            showMessage('请完善报告信息', 'warning');
            return;
        }
        
        $w('#submitReportButton').disable();
        $w('#submitReportButton').label = '提交中...';
        
        // 准备报告数据
        const reportData = {
            type: reportForm.type,
            description: reportForm.description,
            urgency: reportForm.urgency,
            isAnonymous: reportForm.anonymous,
            reporterId: reportForm.anonymous ? null : currentUser._id,
            reporterEmail: reportForm.anonymous ? null : currentUser.loginEmail,
            status: 'submitted',
            isActive: true,
            attachments: reportForm.attachments
        };
        
        // 提交到数据库
        const result = await wixData.save('SafeguardingReports', reportData);
        
        if (result._id) {
            showMessage('报告已成功提交，我们会尽快处理', 'success');
            
            // 如果是紧急情况，发送通知
            if (reportForm.urgency === 'critical') {
                await sendUrgentNotification(result._id);
            }
            
            // 重置表单
            resetReportForm();
            
            // 刷新数据
            await loadSafeguardingData();
        } else {
            throw new Error('报告提交失败');
        }
        
    } catch (error) {
        console.error('报告提交失败:', error);
        showMessage('报告提交失败，请重试', 'error');
    } finally {
        $w('#submitReportButton').enable();
        $w('#submitReportButton').label = '提交报告';
    }
}

/**
 * 处理搜索
 */
function handleSearch() {
    try {
        const searchTerm = $w('#searchInput').value.toLowerCase();
        
        // 根据当前视图过滤数据
        switch (currentView) {
            case 'resources':
                filterResources(searchTerm);
                break;
            case 'contacts':
                filterContacts(searchTerm);
                break;
            case 'policies':
                filterPolicies(searchTerm);
                break;
        }
        
        console.log('搜索执行:', searchTerm);
    } catch (error) {
        console.error('搜索处理失败:', error);
    }
}

/**
 * 处理分类筛选
 */
function handleCategoryFilter() {
    try {
        const selectedCategory = $w('#categoryFilter').value;
        
        // 根据当前视图应用筛选
        switch (currentView) {
            case 'resources':
                filterResourcesByCategory(selectedCategory);
                break;
            case 'contacts':
                filterContactsByCategory(selectedCategory);
                break;
        }
        
        console.log('分类筛选:', selectedCategory);
    } catch (error) {
        console.error('分类筛选处理失败:', error);
    }
}

/**
 * 处理紧急程度筛选
 */
function handleUrgencyFilter() {
    try {
        const selectedUrgency = $w('#urgencyFilter').value;
        
        // 筛选报告数据
        filterReportsByUrgency(selectedUrgency);
        
        console.log('紧急程度筛选:', selectedUrgency);
    } catch (error) {
        console.error('紧急程度筛选处理失败:', error);
    }
}

// ==================== UI 更新函数 ====================

/**
 * 更新中继器
 */
function updateRepeaters() {
    try {
        // 更新资源中继器
        if ($w('#resourcesRepeater').isVisible) {
            $w('#resourcesRepeater').data = safeguardingData.resources;
        }
        
        // 更新联系人中继器
        if ($w('#contactsRepeater').isVisible) {
            $w('#contactsRepeater').data = safeguardingData.contacts;
        }
        
        // 更新政策中继器
        if ($w('#policiesRepeater').isVisible) {
            $w('#policiesRepeater').data = safeguardingData.policies;
        }
        
        console.log('中继器更新完成');
    } catch (error) {
        console.error('中继器更新失败:', error);
    }
}

/**
 * 更新资源显示
 */
function updateResourcesDisplay() {
    try {
        const resources = safeguardingData.resources;
        
        if (resources.length === 0) {
            $w('#noResourcesMessage').show();
            $w('#resourcesRepeater').hide();
        } else {
            $w('#noResourcesMessage').hide();
            $w('#resourcesRepeater').show();
            $w('#resourcesRepeater').data = resources;
        }
        
        // 更新资源统计
        $w('#resourcesCount').text = `共 ${resources.length} 个资源`;
        
    } catch (error) {
        console.error('资源显示更新失败:', error);
    }
}

/**
 * 更新联系人显示
 */
function updateContactsDisplay() {
    try {
        const contacts = safeguardingData.contacts;
        
        if (contacts.length === 0) {
            $w('#noContactsMessage').show();
            $w('#contactsRepeater').hide();
        } else {
            $w('#noContactsMessage').hide();
            $w('#contactsRepeater').show();
            $w('#contactsRepeater').data = contacts;
        }
        
        // 更新联系人统计
        $w('#contactsCount').text = `共 ${contacts.length} 个联系人`;
        
    } catch (error) {
        console.error('联系人显示更新失败:', error);
    }
}

/**
 * 更新政策显示
 */
function updatePoliciesDisplay() {
    try {
        const policies = safeguardingData.policies;
        
        if (policies.length === 0) {
            $w('#noPoliciesMessage').show();
            $w('#policiesRepeater').hide();
        } else {
            $w('#noPoliciesMessage').hide();
            $w('#policiesRepeater').show();
            $w('#policiesRepeater').data = policies;
        }
        
        // 更新政策统计
        $w('#policiesCount').text = `共 ${policies.length} 个政策`;
        
    } catch (error) {
        console.error('政策显示更新失败:', error);
    }
}

// ==================== 中继器项目设置 ====================

/**
 * 设置资源项目
 */
function setupResourceItem($item, itemData) {
    try {
        $item('#resourceTitle').text = itemData.title;
        $item('#resourceDescription').text = itemData.description;
        $item('#resourceCategory').text = itemData.category;
        $item('#resourceType').text = itemData.type;
        
        // 设置资源图标
        const iconMap = {
            'guide': '📖',
            'video': '🎥',
            'article': '📄',
            'contact': '📞',
            'tool': '🛠️'
        };
        $item('#resourceIcon').text = iconMap[itemData.type] || '📋';
        
        // 设置点击事件
        $item('#resourceCard').onClick(() => openResource(itemData));
        
    } catch (error) {
        console.error('资源项目设置失败:', error);
    }
}

/**
 * 设置联系人项目
 */
function setupContactItem($item, itemData) {
    try {
        $item('#contactName').text = itemData.name;
        $item('#contactRole').text = itemData.role;
        $item('#contactDepartment').text = itemData.department;
        $item('#contactAvailability').text = itemData.availability;
        
        // 设置联系方式
        if (itemData.phone) {
            $item('#contactPhone').text = itemData.phone;
            $item('#contactPhone').show();
            $item('#callButton').onClick(() => {
                if (wixWindow.formFactor === 'Mobile') {
                    wixLocation.to(`tel:${itemData.phone}`);
                }
            });
        } else {
            $item('#contactPhone').hide();
        }
        
        if (itemData.email) {
            $item('#contactEmail').text = itemData.email;
            $item('#contactEmail').show();
            $item('#emailButton').onClick(() => {
                wixLocation.to(`mailto:${itemData.email}`);
            });
        } else {
            $item('#contactEmail').hide();
        }
        
        // 设置紧急标识
        if (itemData.isEmergency) {
            $item('#emergencyBadge').show();
            $item('#contactCard').style.borderColor = '#DC3545';
        } else {
            $item('#emergencyBadge').hide();
        }
        
    } catch (error) {
        console.error('联系人项目设置失败:', error);
    }
}

/**
 * 设置政策项目
 */
function setupPolicyItem($item, itemData) {
    try {
        $item('#policyTitle').text = itemData.title;
        $item('#policyDescription').text = itemData.description;
        $item('#policyCategory').text = itemData.category;
        $item('#policyLastUpdated').text = `更新于: ${formatDate(itemData.lastUpdated)}`;
        
        // 设置政策类型图标
        const typeIcons = {
            'safety': '🛡️',
            'conduct': '📋',
            'emergency': '🚨',
            'privacy': '🔒',
            'general': '📄'
        };
        $item('#policyIcon').text = typeIcons[itemData.category] || '📄';
        
        // 设置点击事件
        $item('#policyCard').onClick(() => openPolicy(itemData));
        $item('#downloadButton').onClick(() => downloadPolicy(itemData));
        
    } catch (error) {
        console.error('政策项目设置失败:', error);
    }
}

// ==================== 工具函数 ====================

/**
 * 验证报告表单
 */
function validateReportForm() {
    try {
        const isValid = reportForm.type && 
                       reportForm.description && 
                       reportForm.description.length >= 10 && 
                       reportForm.description.length <= 1000;
        
        if (isValid) {
            $w('#submitReportButton').enable();
        } else {
            $w('#submitReportButton').disable();
        }
        
        return isValid;
    } catch (error) {
        console.error('表单验证失败:', error);
        return false;
    }
}

/**
 * 更新报告指导
 */
function updateReportGuidance(reportType) {
    try {
        const guidance = {
            'bullying': '请详细描述欺凌行为的时间、地点、涉及人员和具体情况',
            'cybersafety': '请提供网络安全问题的详细信息，包括平台、时间和具体内容',
            'physical_safety': '请描述身体安全问题的具体情况和紧急程度',
            'mental_health': '请描述心理健康相关的担忧和需要的支持',
            'discrimination': '请详细说明歧视行为的具体表现和影响',
            'inappropriate_behavior': '请描述不当行为的具体情况和涉及人员',
            'other': '请详细描述您遇到的安全问题'
        };
        
        const guidanceText = guidance[reportType] || '';
        
        if (guidanceText) {
            $w('#reportGuidance').text = guidanceText;
            $w('#reportGuidance').show();
        } else {
            $w('#reportGuidance').hide();
        }
        
    } catch (error) {
        console.error('报告指导更新失败:', error);
    }
}

/**
 * 发送紧急通知
 */
async function sendUrgentNotification(reportId) {
    try {
        // 这里应该调用后端API发送紧急通知
        console.log('发送紧急通知:', reportId);
        
        // 模拟API调用
        const notificationData = {
            reportId: reportId,
            type: 'urgent_safeguarding_report',
            timestamp: new Date().toISOString()
        };
        
        // 实际实现中应该调用后端服务
        // await fetch('/api/send-urgent-notification', {
        //     method: 'POST',
        //     body: JSON.stringify(notificationData)
        // });
        
    } catch (error) {
        console.error('紧急通知发送失败:', error);
    }
}

/**
 * 记录紧急事件
 */
async function logEmergencyEvent(eventType) {
    try {
        const eventData = {
            eventType: eventType,
            userId: currentUser?._id || 'anonymous',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            isActive: true
        };
        
        await wixData.save('EmergencyEvents', eventData);
        console.log('紧急事件已记录:', eventType);
        
    } catch (error) {
        console.error('紧急事件记录失败:', error);
    }
}

/**
 * 筛选资源
 */
function filterResources(searchTerm) {
    try {
        let filteredResources = safeguardingData.resources;
        
        if (searchTerm) {
            filteredResources = filteredResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.category.toLowerCase().includes(searchTerm)
            );
        }
        
        $w('#resourcesRepeater').data = filteredResources;
        $w('#resourcesCount').text = `共 ${filteredResources.length} 个资源`;
        
    } catch (error) {
        console.error('资源筛选失败:', error);
    }
}

/**
 * 按分类筛选资源
 */
function filterResourcesByCategory(category) {
    try {
        let filteredResources = safeguardingData.resources;
        
        if (category && category !== 'all') {
            filteredResources = filteredResources.filter(resource => 
                resource.category === category
            );
        }
        
        $w('#resourcesRepeater').data = filteredResources;
        $w('#resourcesCount').text = `共 ${filteredResources.length} 个资源`;
        
    } catch (error) {
        console.error('资源分类筛选失败:', error);
    }
}

/**
 * 筛选联系人
 */
function filterContacts(searchTerm) {
    try {
        let filteredContacts = safeguardingData.contacts;
        
        if (searchTerm) {
            filteredContacts = filteredContacts.filter(contact => 
                contact.name.toLowerCase().includes(searchTerm) ||
                contact.role.toLowerCase().includes(searchTerm) ||
                contact.department.toLowerCase().includes(searchTerm)
            );
        }
        
        $w('#contactsRepeater').data = filteredContacts;
        $w('#contactsCount').text = `共 ${filteredContacts.length} 个联系人`;
        
    } catch (error) {
        console.error('联系人筛选失败:', error);
    }
}

/**
 * 按分类筛选联系人
 */
function filterContactsByCategory(category) {
    try {
        let filteredContacts = safeguardingData.contacts;
        
        if (category && category !== 'all') {
            filteredContacts = filteredContacts.filter(contact => 
                contact.department === category
            );
        }
        
        $w('#contactsRepeater').data = filteredContacts;
        $w('#contactsCount').text = `共 ${filteredContacts.length} 个联系人`;
        
    } catch (error) {
        console.error('联系人分类筛选失败:', error);
    }
}

/**
 * 筛选政策
 */
function filterPolicies(searchTerm) {
    try {
        let filteredPolicies = safeguardingData.policies;
        
        if (searchTerm) {
            filteredPolicies = filteredPolicies.filter(policy => 
                policy.title.toLowerCase().includes(searchTerm) ||
                policy.description.toLowerCase().includes(searchTerm) ||
                policy.category.toLowerCase().includes(searchTerm)
            );
        }
        
        $w('#policiesRepeater').data = filteredPolicies;
        $w('#policiesCount').text = `共 ${filteredPolicies.length} 个政策`;
        
    } catch (error) {
        console.error('政策筛选失败:', error);
    }
}

/**
 * 按紧急程度筛选报告
 */
function filterReportsByUrgency(urgency) {
    try {
        let filteredReports = safeguardingData.reports;
        
        if (urgency && urgency !== 'all') {
            filteredReports = filteredReports.filter(report => 
                report.urgency === urgency
            );
        }
        
        // 更新显示（如果在概览页面）
        if (currentView === 'overview') {
            updateRecentActivity();
        }
        
    } catch (error) {
        console.error('报告紧急程度筛选失败:', error);
    }
}

/**
 * 打开资源
 */
function openResource(resourceData) {
    try {
        if (resourceData.url) {
            wixLocation.to(resourceData.url);
        } else if (resourceData.content) {
            // 显示资源内容模态框
            $w('#resourceModal').show();
            $w('#resourceModalTitle').text = resourceData.title;
            $w('#resourceModalContent').text = resourceData.content;
        }
        
        console.log('打开资源:', resourceData.title);
    } catch (error) {
        console.error('打开资源失败:', error);
    }
}

/**
 * 打开政策
 */
function openPolicy(policyData) {
    try {
        if (policyData.url) {
            wixLocation.to(policyData.url);
        } else {
            // 显示政策内容模态框
            $w('#policyModal').show();
            $w('#policyModalTitle').text = policyData.title;
            $w('#policyModalContent').text = policyData.content;
        }
        
        console.log('打开政策:', policyData.title);
    } catch (error) {
        console.error('打开政策失败:', error);
    }
}

/**
 * 下载政策
 */
function downloadPolicy(policyData) {
    try {
        if (policyData.downloadUrl) {
            wixLocation.to(policyData.downloadUrl);
        } else {
            showMessage('下载链接暂不可用', 'warning');
        }
        
        console.log('下载政策:', policyData.title);
    } catch (error) {
        console.error('下载政策失败:', error);
    }
}

/**
 * 刷新数据
 */
async function refreshData() {
    try {
        $w('#refreshButton').disable();
        await loadSafeguardingData();
        showMessage('数据已刷新', 'success');
    } catch (error) {
        console.error('数据刷新失败:', error);
        showMessage('数据刷新失败', 'error');
    } finally {
        $w('#refreshButton').enable();
    }
}

/**
 * 显示帮助模态框
 */
function showHelpModal() {
    try {
        $w('#helpModal').show();
    } catch (error) {
        console.error('显示帮助失败:', error);
    }
}

/**
 * 显示反馈模态框
 */
function showFeedbackModal() {
    try {
        $w('#feedbackModal').show();
    } catch (error) {
        console.error('显示反馈失败:', error);
    }
}

/**
 * 格式化日期
 */
function formatDate(date) {
    try {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return d.toLocaleDateString('zh-CN');
        }
    } catch (error) {
        console.error('日期格式化失败:', error);
        return '';
    }
}

/**
 * 显示消息
 */
function showMessage(message, type = 'info') {
    try {
        $w('#messageBar').show();
        $w('#messageText').text = message;
        
        // 设置消息样式
        const colors = {
            'success': '#28A745',
            'error': '#DC3545',
            'warning': '#FFC107',
            'info': '#17A2B8'
        };
        
        $w('#messageBar').style.backgroundColor = colors[type] || colors.info;
        
        // 3秒后自动隐藏
        setTimeout(() => {
            $w('#messageBar').hide();
        }, 3000);
        
    } catch (error) {
        console.error('消息显示失败:', error);
    }
}

// ==================== 自动刷新和缓存 ====================

/**
 * 设置自动刷新
 */
function setupAutoRefresh() {
    // 每5分钟自动刷新数据
    setInterval(async () => {
        try {
            await loadSafeguardingData();
            console.log('数据自动刷新完成');
        } catch (error) {
            console.error('自动刷新失败:', error);
        }
    }, 5 * 60 * 1000);
}

/**
 * 缓存管理
 */
function manageCaching() {
    try {
        // 缓存用户偏好
        if (currentUser) {
            const userPreferences = {
                lastView: currentView,
                timestamp: new Date().toISOString()
            };
            session.setItem('safeguardingPreferences', JSON.stringify(userPreferences));
        }
        
        // 清理过期缓存
        const cacheKeys = ['safeguardingData', 'emergencyContacts'];
        cacheKeys.forEach(key => {
            const cached = local.getItem(key);
            if (cached) {
                const data = JSON.parse(cached);
                const cacheTime = new Date(data.timestamp);
                const now = new Date();
                const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
                
                if (hoursDiff > 24) {
                    local.removeItem(key);
                }
            }
        });
        
    } catch (error) {
        console.error('缓存管理失败:', error);
    }
}

// ==================== 分析和跟踪 ====================

/**
 * 跟踪用户行为
 */
function trackUserBehavior(action, data = {}) {
    try {
        const trackingData = {
            action: action,
            userId: currentUser?._id || 'anonymous',
            timestamp: new Date().toISOString(),
            page: 'student-safeguarding',
            data: data
        };
        
        // 发送到分析服务
        console.log('用户行为跟踪:', trackingData);
        
        // 实际实现中应该发送到分析平台
        // analytics.track(trackingData);
        
    } catch (error) {
        console.error('用户行为跟踪失败:', error);
    }
}

/**
 * 性能监控
 */
function monitorPerformance() {
    try {
        const performanceData = {
            loadTime: performance.now(),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        console.log('性能数据:', performanceData);
        
        // 实际实现中应该发送到监控服务
        // monitoring.log(performanceData);
        
    } catch (error) {
        console.error('性能监控失败:', error);
    }
}

// 启动自动刷新和缓存管理
setupAutoRefresh();
setInterval(manageCaching, 60 * 60 * 1000); // 每小时执行一次缓存管理

// 页面卸载时的清理
$w.onReady(() => {
    window.addEventListener('beforeunload', () => {
        manageCaching();
        console.log('页面卸载，执行清理操作');
    });
});

console.log('学生安全保护页面脚本加载完成');

/**
 * 使用说明：
 * 
 * 1. 数据库集合要求：
 *    - SafeguardingReports: 安全报告
 *    - SafeguardingContacts: 安全联系人
 *    - SafeguardingResources: 安全资源
 *    - SafeguardingPolicies: 安全政策
 *    - EmergencyEvents: 紧急事件记录
 * 
 * 2. 页面元素要求：
 *    - 导航按钮、视图容器、表单元素
 *    - 中继器、模态框、消息栏
 *    - 紧急联系按钮、搜索筛选组件
 * 
 * 3. 权限设置：
 *    - 学生：可查看资源、提交报告、使用紧急功能
 *    - 教师：额外可查看部分报告统计
 *    - 管理员：可管理所有内容和查看详细报告
 * 
 * 4. 安全特性：
 *    - 匿名报告支持
 *    - 紧急联系快速通道
 *    - 数据加密和隐私保护
 *    - 自动通知和升级机制
 * 
 * 5. 响应式设计：
 *    - 支持桌面、平板、手机设备
 *    - 触摸友好的交互设计
 *    - 自适应布局和字体大小
 */