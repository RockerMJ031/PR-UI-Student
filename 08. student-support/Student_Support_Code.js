/**
 * Purple Ruler Academy - Student Support Page
 * 
 * 功能描述：
 * 这个页面为学生提供全面的支持服务，包括技术支持、学术支持、
 * 心理健康支持、财务支持等多种支持类型。学生可以提交支持请求、
 * 查看请求状态、获取自助资源、预约咨询服务等。
 * 
 * 主要功能：
 * 1. 支持请求管理 - 创建、查看、跟踪支持票据
 * 2. 多种支持类型 - 技术、学术、心理健康、财务等
 * 3. 实时聊天支持 - 即时在线客服
 * 4. 知识库搜索 - 常见问题和解决方案
 * 5. 预约系统 - 预约一对一咨询
 * 6. 资源中心 - 自助服务资源
 * 7. 紧急支持 - 24/7紧急联系方式
 * 8. 反馈系统 - 服务质量评价
 * 
 * 作者：Purple Ruler Academy 开发团队
 * 创建日期：2024年1月
 * 最后更新：2024年1月
 */

// 导入必要的 Wix Velo 模块
import { currentMember } from 'wix-members';
import { query } from 'wix-data';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { local, session } from 'wix-storage';
import wixWindow from 'wix-window';
import { timeline } from 'wix-animations';
import { fetch } from 'wix-fetch';

// 全局变量定义
let currentUser = null;
let supportTickets = [];
let knowledgeBase = [];
let supportAgents = [];
let chatSession = null;
let currentTicket = null;
let searchResults = [];
let userPreferences = {};
let notificationSettings = {};
let supportCategories = [];
let urgencyLevels = [];
let ticketStatuses = [];
let appointmentSlots = [];
let feedbackData = [];

// 页面加载时的初始化函数
$w.onReady(function () {
    console.log('Student Support page loaded');
    initializePage();
});

// 页面初始化
async function initializePage() {
    try {
        // 显示加载状态
        showLoading(true);
        
        // 检查用户认证
        await checkUserAuthentication();
        
        // 设置事件处理器
        setupEventHandlers();
        
        // 加载初始数据
        await loadInitialData();
        
        // 初始化UI组件
        initializeUIComponents();
        
        // 设置实时更新
        setupRealTimeUpdates();
        
        // 隐藏加载状态
        showLoading(false);
        
        console.log('Student Support page initialized successfully');
    } catch (error) {
        console.error('Error initializing page:', error);
        showMessage('页面初始化失败，请刷新重试', 'error');
        showLoading(false);
    }
}

// 设置事件处理器
function setupEventHandlers() {
    // 支持请求相关
    $w('#createTicketButton').onClick(handleCreateTicket);
    $w('#submitTicketButton').onClick(handleSubmitTicket);
    $w('#cancelTicketButton').onClick(handleCancelTicket);
    
    // 票据管理
    $w('#ticketsList').onItemReady(setupTicketItem);
    $w('#refreshTicketsButton').onClick(handleRefreshTickets);
    $w('#filterTicketsDropdown').onChange(handleTicketFilter);
    $w('#sortTicketsDropdown').onChange(handleTicketSort);
    
    // 知识库搜索
    $w('#knowledgeSearchInput').onInput(handleKnowledgeSearch);
    $w('#searchButton').onClick(handleSearchSubmit);
    $w('#clearSearchButton').onClick(handleClearSearch);
    $w('#knowledgeList').onItemReady(setupKnowledgeItem);
    
    // 实时聊天
    $w('#startChatButton').onClick(handleStartChat);
    $w('#endChatButton').onClick(handleEndChat);
    $w('#sendMessageButton').onClick(handleSendMessage);
    $w('#chatInput').onEnterPressed(handleSendMessage);
    
    // 预约系统
    $w('#bookAppointmentButton').onClick(handleBookAppointment);
    $w('#appointmentDatePicker').onChange(handleDateChange);
    $w('#appointmentTimeSlots').onItemReady(setupTimeSlot);
    $w('#confirmAppointmentButton').onClick(handleConfirmAppointment);
    $w('#cancelAppointmentButton').onClick(handleCancelAppointment);
    
    // 紧急支持
    $w('#emergencyCallButton').onClick(handleEmergencyCall);
    $w('#emergencyEmailButton').onClick(handleEmergencyEmail);
    $w('#emergencyChatButton').onClick(handleEmergencyChat);
    
    // 反馈系统
    $w('#submitFeedbackButton').onClick(handleSubmitFeedback);
    $w('#feedbackRating').onChange(handleRatingChange);
    
    // 导航和视图
    $w('#ticketsTab').onClick(() => switchView('tickets'));
    $w('#knowledgeTab').onClick(() => switchView('knowledge'));
    $w('#chatTab').onClick(() => switchView('chat'));
    $w('#appointmentsTab').onClick(() => switchView('appointments'));
    $w('#resourcesTab').onClick(() => switchView('resources'));
    
    // 设置和偏好
    $w('#settingsButton').onClick(handleOpenSettings);
    $w('#saveSettingsButton').onClick(handleSaveSettings);
    $w('#notificationToggle').onChange(handleNotificationToggle);
    
    // 文件上传
    $w('#attachmentUpload').onChange(handleFileUpload);
    $w('#removeAttachmentButton').onClick(handleRemoveAttachment);
    
    // 响应式设计
    wixWindow.viewportEnter('mobile', () => {
        adjustMobileLayout();
    });
    
    wixWindow.viewportLeave('mobile', () => {
        adjustDesktopLayout();
    });
}

// 检查用户认证
async function checkUserAuthentication() {
    try {
        currentUser = await currentMember.getMember();
        
        if (!currentUser) {
            // 重定向到登录页面
            wixLocation.to('/login');
            return;
        }
        
        // 更新用户界面
        updateUserInterface();
        
        console.log('User authenticated:', currentUser.loginEmail);
    } catch (error) {
        console.error('Authentication error:', error);
        wixLocation.to('/login');
    }
}

// 加载初始数据
async function loadInitialData() {
    try {
        // 并行加载所有数据
        const [tickets, knowledge, agents, categories, preferences] = await Promise.all([
            loadSupportTickets(),
            loadKnowledgeBase(),
            loadSupportAgents(),
            loadSupportCategories(),
            loadUserPreferences()
        ]);
        
        supportTickets = tickets;
        knowledgeBase = knowledge;
        supportAgents = agents;
        supportCategories = categories;
        userPreferences = preferences;
        
        // 更新UI显示
        updateTicketsDisplay();
        updateKnowledgeDisplay();
        updateStatistics();
        
        console.log('Initial data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
    }
}

// 加载支持票据
async function loadSupportTickets() {
    try {
        const results = await wixData.query('SupportTickets')
            .eq('studentId', currentUser._id)
            .descending('_createdDate')
            .limit(50)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading support tickets:', error);
        return [];
    }
}

// 加载知识库
async function loadKnowledgeBase() {
    try {
        const results = await wixData.query('KnowledgeBase')
            .eq('status', 'published')
            .descending('popularity')
            .limit(100)
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        return [];
    }
}

// 加载支持代理
async function loadSupportAgents() {
    try {
        const results = await wixData.query('SupportAgents')
            .eq('status', 'available')
            .ascending('name')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading support agents:', error);
        return [];
    }
}

// 加载支持类别
async function loadSupportCategories() {
    try {
        const results = await wixData.query('SupportCategories')
            .eq('active', true)
            .ascending('order')
            .find();
        
        return results.items;
    } catch (error) {
        console.error('Error loading support categories:', error);
        return [];
    }
}

// 加载用户偏好
async function loadUserPreferences() {
    try {
        const results = await wixData.query('UserPreferences')
            .eq('userId', currentUser._id)
            .find();
        
        return results.items.length > 0 ? results.items[0] : {};
    } catch (error) {
        console.error('Error loading user preferences:', error);
        return {};
    }
}

// 初始化UI组件
function initializeUIComponents() {
    // 设置支持类别下拉菜单
    const categoryOptions = supportCategories.map(cat => ({
        label: cat.name,
        value: cat._id
    }));
    $w('#supportCategoryDropdown').options = categoryOptions;
    
    // 设置紧急程度选项
    const urgencyOptions = [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
        { label: '紧急', value: 'urgent' }
    ];
    $w('#urgencyDropdown').options = urgencyOptions;
    
    // 设置票据状态过滤器
    const statusOptions = [
        { label: '全部', value: 'all' },
        { label: '待处理', value: 'pending' },
        { label: '处理中', value: 'in-progress' },
        { label: '等待回复', value: 'waiting-reply' },
        { label: '已解决', value: 'resolved' },
        { label: '已关闭', value: 'closed' }
    ];
    $w('#filterTicketsDropdown').options = statusOptions;
    
    // 设置排序选项
    const sortOptions = [
        { label: '最新创建', value: 'newest' },
        { label: '最早创建', value: 'oldest' },
        { label: '最后更新', value: 'updated' },
        { label: '优先级', value: 'priority' }
    ];
    $w('#sortTicketsDropdown').options = sortOptions;
    
    // 初始化聊天界面
    initializeChatInterface();
    
    // 设置默认视图
    switchView('tickets');
}

// 初始化聊天界面
function initializeChatInterface() {
    $w('#chatMessages').html = '<div class="chat-welcome">欢迎使用在线客服！点击开始聊天按钮开始对话。</div>';
    $w('#chatInput').disable();
    $w('#sendMessageButton').disable();
    $w('#endChatButton').disable();
}

// 设置实时更新
function setupRealTimeUpdates() {
    // 每30秒检查票据更新
    setInterval(async () => {
        if ($w('#ticketsContainer').isVisible) {
            await refreshTicketsData();
        }
    }, 30000);
    
    // 聊天消息实时更新
    if (chatSession) {
        setInterval(async () => {
            await updateChatMessages();
        }, 5000);
    }
}

// 事件处理器实现

// 处理创建票据
function handleCreateTicket() {
    // 重置表单
    $w('#ticketTitleInput').value = '';
    $w('#ticketDescriptionInput').value = '';
    $w('#supportCategoryDropdown').value = undefined;
    $w('#urgencyDropdown').value = 'medium';
    $w('#attachmentUpload').value = [];
    
    // 显示创建票据模态框
    $w('#createTicketModal').show();
    
    // 记录用户行为
    trackUserAction('create_ticket_started');
}

// 处理提交票据
async function handleSubmitTicket() {
    try {
        // 验证表单
        if (!validateTicketForm()) {
            return;
        }
        
        // 显示提交状态
        $w('#submitTicketButton').disable();
        $w('#submitTicketButton').label = '提交中...';
        
        // 准备票据数据
        const ticketData = {
            title: $w('#ticketTitleInput').value,
            description: $w('#ticketDescriptionInput').value,
            category: $w('#supportCategoryDropdown').value,
            urgency: $w('#urgencyDropdown').value,
            studentId: currentUser._id,
            studentEmail: currentUser.loginEmail,
            status: 'pending',
            attachments: await processAttachments()
        };
        
        // 保存到数据库
        const result = await wixData.save('SupportTickets', ticketData);
        
        // 发送通知邮件
        await sendTicketNotification(result);
        
        // 更新本地数据
        supportTickets.unshift(result);
        updateTicketsDisplay();
        
        // 关闭模态框
        $w('#createTicketModal').hide();
        
        // 显示成功消息
        showMessage('支持请求已成功提交，我们会尽快处理', 'success');
        
        // 记录用户行为
        trackUserAction('ticket_created', { ticketId: result._id });
        
    } catch (error) {
        console.error('Error submitting ticket:', error);
        showMessage('提交失败，请重试', 'error');
    } finally {
        // 恢复按钮状态
        $w('#submitTicketButton').enable();
        $w('#submitTicketButton').label = '提交请求';
    }
}

// 处理取消票据
function handleCancelTicket() {
    $w('#createTicketModal').hide();
    trackUserAction('create_ticket_cancelled');
}

// 验证票据表单
function validateTicketForm() {
    const title = $w('#ticketTitleInput').value.trim();
    const description = $w('#ticketDescriptionInput').value.trim();
    const category = $w('#supportCategoryDropdown').value;
    
    if (!title) {
        showMessage('请输入问题标题', 'error');
        $w('#ticketTitleInput').focus();
        return false;
    }
    
    if (title.length < 5) {
        showMessage('标题至少需要5个字符', 'error');
        $w('#ticketTitleInput').focus();
        return false;
    }
    
    if (!description) {
        showMessage('请详细描述您的问题', 'error');
        $w('#ticketDescriptionInput').focus();
        return false;
    }
    
    if (description.length < 10) {
        showMessage('问题描述至少需要10个字符', 'error');
        $w('#ticketDescriptionInput').focus();
        return false;
    }
    
    if (!category) {
        showMessage('请选择支持类别', 'error');
        $w('#supportCategoryDropdown').focus();
        return false;
    }
    
    return true;
}

// 处理文件上传
async function handleFileUpload() {
    try {
        const files = $w('#attachmentUpload').value;
        
        if (files.length > 0) {
            // 验证文件大小和类型
            for (let file of files) {
                if (file.size > 10 * 1024 * 1024) { // 10MB限制
                    showMessage('文件大小不能超过10MB', 'error');
                    $w('#attachmentUpload').value = [];
                    return;
                }
                
                const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword'];
                if (!allowedTypes.some(type => file.type.startsWith(type))) {
                    showMessage('不支持的文件类型', 'error');
                    $w('#attachmentUpload').value = [];
                    return;
                }
            }
            
            // 显示文件信息
            updateAttachmentDisplay(files);
        }
    } catch (error) {
        console.error('Error handling file upload:', error);
        showMessage('文件上传失败', 'error');
    }
}

// 更新附件显示
function updateAttachmentDisplay(files) {
    if (files.length > 0) {
        const fileNames = files.map(file => file.name).join(', ');
        $w('#attachmentInfo').text = `已选择文件: ${fileNames}`;
        $w('#attachmentInfo').show();
        $w('#removeAttachmentButton').show();
    } else {
        $w('#attachmentInfo').hide();
        $w('#removeAttachmentButton').hide();
    }
}

// 处理移除附件
function handleRemoveAttachment() {
    $w('#attachmentUpload').value = [];
    updateAttachmentDisplay([]);
}

// 处理票据过滤
function handleTicketFilter() {
    const filterValue = $w('#filterTicketsDropdown').value;
    applyTicketFilters(filterValue);
    trackUserAction('tickets_filtered', { filter: filterValue });
}

// 处理票据排序
function handleTicketSort() {
    const sortValue = $w('#sortTicketsDropdown').value;
    applySortToTickets(sortValue);
    trackUserAction('tickets_sorted', { sort: sortValue });
}

// 应用票据过滤器
function applyTicketFilters(filterValue) {
    let filteredTickets = [...supportTickets];
    
    if (filterValue !== 'all') {
        filteredTickets = supportTickets.filter(ticket => ticket.status === filterValue);
    }
    
    // 更新显示
    updateTicketsDisplay(filteredTickets);
    
    // 更新计数
    $w('#filteredTicketsCount').text = `显示 ${filteredTickets.length} 个票据`;
}

// 应用票据排序
function applySortToTickets(sortValue) {
    let sortedTickets = [...supportTickets];
    
    switch (sortValue) {
        case 'newest':
            sortedTickets.sort((a, b) => new Date(b._createdDate) - new Date(a._createdDate));
            break;
        case 'oldest':
            sortedTickets.sort((a, b) => new Date(a._createdDate) - new Date(b._createdDate));
            break;
        case 'updated':
            sortedTickets.sort((a, b) => new Date(b._updatedDate) - new Date(a._updatedDate));
            break;
        case 'priority':
            const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
            sortedTickets.sort((a, b) => priorityOrder[b.urgency] - priorityOrder[a.urgency]);
            break;
    }
    
    updateTicketsDisplay(sortedTickets);
}

// 处理刷新票据
async function handleRefreshTickets() {
    try {
        $w('#refreshTicketsButton').disable();
        await refreshTicketsData();
        showMessage('票据列表已更新', 'success');
    } catch (error) {
        console.error('Error refreshing tickets:', error);
        showMessage('刷新失败，请重试', 'error');
    } finally {
        $w('#refreshTicketsButton').enable();
    }
}

// 刷新票据数据
async function refreshTicketsData() {
    const newTickets = await loadSupportTickets();
    supportTickets = newTickets;
    updateTicketsDisplay();
    updateStatistics();
}

// 处理知识库搜索
function handleKnowledgeSearch() {
    const searchTerm = $w('#knowledgeSearchInput').value.trim();
    
    if (searchTerm.length >= 2) {
        // 延迟搜索以避免过多请求
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            performKnowledgeSearch(searchTerm);
        }, 300);
    } else if (searchTerm.length === 0) {
        // 显示所有知识库文章
        updateKnowledgeDisplay(knowledgeBase);
    }
}

// 执行知识库搜索
function performKnowledgeSearch(searchTerm) {
    const results = knowledgeBase.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        const contentMatch = article.content.toLowerCase().includes(searchTerm.toLowerCase());
        const tagsMatch = article.tags && article.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return titleMatch || contentMatch || tagsMatch;
    });
    
    searchResults = results;
    updateKnowledgeDisplay(results);
    
    // 更新搜索结果计数
    $w('#searchResultsCount').text = `找到 ${results.length} 个结果`;
    $w('#searchResultsCount').show();
    
    // 记录搜索行为
    trackUserAction('knowledge_searched', { term: searchTerm, results: results.length });
}

// 处理搜索提交
function handleSearchSubmit() {
    const searchTerm = $w('#knowledgeSearchInput').value.trim();
    if (searchTerm) {
        performKnowledgeSearch(searchTerm);
    }
}

// 处理清除搜索
function handleClearSearch() {
    $w('#knowledgeSearchInput').value = '';
    updateKnowledgeDisplay(knowledgeBase);
    $w('#searchResultsCount').hide();
    trackUserAction('knowledge_search_cleared');
}

// 处理开始聊天
async function handleStartChat() {
    try {
        $w('#startChatButton').disable();
        $w('#startChatButton').label = '连接中...';
        
        // 创建聊天会话
        chatSession = await createChatSession();
        
        if (chatSession) {
            // 启用聊天界面
            $w('#chatInput').enable();
            $w('#sendMessageButton').enable();
            $w('#endChatButton').enable();
            $w('#startChatButton').hide();
            
            // 显示欢迎消息
            addChatMessage('system', '客服代表已连接，请问有什么可以帮助您的？');
            
            // 开始实时更新
            startChatUpdates();
            
            trackUserAction('chat_started');
        } else {
            showMessage('暂时无法连接客服，请稍后重试', 'error');
        }
    } catch (error) {
        console.error('Error starting chat:', error);
        showMessage('连接失败，请重试', 'error');
    } finally {
        $w('#startChatButton').enable();
        $w('#startChatButton').label = '开始聊天';
    }
}

// 创建聊天会话
async function createChatSession() {
    try {
        const sessionData = {
            studentId: currentUser._id,
            studentEmail: currentUser.loginEmail,
            status: 'active',
            startTime: new Date()
        };
        
        const result = await wixData.save('ChatSessions', sessionData);
        return result;
    } catch (error) {
        console.error('Error creating chat session:', error);
        return null;
    }
}

// 处理发送消息
async function handleSendMessage() {
    const message = $w('#chatInput').value.trim();
    
    if (!message || !chatSession) {
        return;
    }
    
    try {
        // 添加用户消息到界面
        addChatMessage('user', message);
        
        // 清空输入框
        $w('#chatInput').value = '';
        
        // 保存消息到数据库
        await saveChatMessage(message, 'user');
        
        // 发送给客服系统
        await sendMessageToSupport(message);
        
        trackUserAction('chat_message_sent');
    } catch (error) {
        console.error('Error sending message:', error);
        showMessage('消息发送失败', 'error');
    }
}

// 添加聊天消息到界面
function addChatMessage(sender, message) {
    const timestamp = formatTime(new Date());
    const messageClass = sender === 'user' ? 'user-message' : 'agent-message';
    const senderName = sender === 'user' ? '您' : '客服';
    
    const messageHtml = `
        <div class="chat-message ${messageClass}">
            <div class="message-header">
                <span class="sender">${senderName}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${message}</div>
        </div>
    `;
    
    const currentHtml = $w('#chatMessages').html;
    $w('#chatMessages').html = currentHtml + messageHtml;
    
    // 滚动到底部
    $w('#chatMessages').scrollTo();
}

// 保存聊天消息
async function saveChatMessage(message, sender) {
    try {
        const messageData = {
            sessionId: chatSession._id,
            message: message,
            sender: sender,
            timestamp: new Date()
        };
        
        await wixData.save('ChatMessages', messageData);
    } catch (error) {
        console.error('Error saving chat message:', error);
    }
}

// 处理结束聊天
async function handleEndChat() {
    try {
        if (chatSession) {
            // 更新会话状态
            await wixData.update('ChatSessions', {
                ...chatSession,
                status: 'ended',
                endTime: new Date()
            });
            
            // 停止实时更新
            stopChatUpdates();
            
            // 重置聊天界面
            resetChatInterface();
            
            // 显示反馈请求
            showChatFeedbackModal();
            
            trackUserAction('chat_ended');
        }
    } catch (error) {
        console.error('Error ending chat:', error);
    }
}

// 重置聊天界面
function resetChatInterface() {
    chatSession = null;
    $w('#chatInput').disable();
    $w('#sendMessageButton').disable();
    $w('#endChatButton').disable();
    $w('#startChatButton').show();
    $w('#chatMessages').html = '<div class="chat-welcome">聊天已结束。感谢您的使用！</div>';
}

// 处理预约预约
function handleBookAppointment() {
    // 显示预约模态框
    $w('#appointmentModal').show();
    
    // 加载可用时间段
    loadAvailableSlots();
    
    trackUserAction('appointment_booking_started');
}

// 加载可用时间段
async function loadAvailableSlots() {
    try {
        const selectedDate = $w('#appointmentDatePicker').value;
        
        if (!selectedDate) {
            return;
        }
        
        // 查询该日期的可用时间段
        const results = await wixData.query('AppointmentSlots')
            .eq('date', selectedDate)
            .eq('available', true)
            .ascending('startTime')
            .find();
        
        appointmentSlots = results.items;
        updateTimeSlotsDisplay();
    } catch (error) {
        console.error('Error loading appointment slots:', error);
        showMessage('加载时间段失败', 'error');
    }
}

// 处理日期变更
function handleDateChange() {
    loadAvailableSlots();
}

// 更新时间段显示
function updateTimeSlotsDisplay() {
    $w('#appointmentTimeSlots').data = appointmentSlots.map(slot => ({
        _id: slot._id,
        timeDisplay: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
        duration: slot.duration,
        type: slot.type
    }));
}

// 设置时间段项目
function setupTimeSlot($item, itemData) {
    $item('#timeSlotButton').label = itemData.timeDisplay;
    $item('#timeSlotButton').onClick(() => selectTimeSlot(itemData._id));
    
    if (itemData.type) {
        $item('#slotTypeText').text = itemData.type;
        $item('#slotTypeText').show();
    } else {
        $item('#slotTypeText').hide();
    }
}

// 选择时间段
function selectTimeSlot(slotId) {
    // 更新选中状态
    $w('#appointmentTimeSlots').forEachItem(($item, itemData) => {
        if (itemData._id === slotId) {
            $item('#timeSlotButton').style.backgroundColor = '#663399';
            $item('#timeSlotButton').style.color = '#FFFFFF';
        } else {
            $item('#timeSlotButton').style.backgroundColor = '#FFFFFF';
            $item('#timeSlotButton').style.color = '#663399';
        }
    });
    
    // 保存选中的时间段
    session.setItem('selectedTimeSlot', slotId);
    
    // 启用确认按钮
    $w('#confirmAppointmentButton').enable();
}

// 处理确认预约
async function handleConfirmAppointment() {
    try {
        const selectedSlotId = session.getItem('selectedTimeSlot');
        const appointmentType = $w('#appointmentTypeDropdown').value;
        const notes = $w('#appointmentNotesInput').value;
        
        if (!selectedSlotId || !appointmentType) {
            showMessage('请选择时间段和预约类型', 'error');
            return;
        }
        
        $w('#confirmAppointmentButton').disable();
        $w('#confirmAppointmentButton').label = '预约中...';
        
        // 创建预约记录
        const appointmentData = {
            studentId: currentUser._id,
            slotId: selectedSlotId,
            type: appointmentType,
            notes: notes,
            status: 'confirmed'
        };
        
        const result = await wixData.save('Appointments', appointmentData);
        
        // 更新时间段状态
        await wixData.update('AppointmentSlots', {
            _id: selectedSlotId,
            available: false,
            bookedBy: currentUser._id
        });
        
        // 发送确认邮件
        await sendAppointmentConfirmation(result);
        
        // 关闭模态框
        $w('#appointmentModal').hide();
        
        // 显示成功消息
        showMessage('预约成功！确认邮件已发送', 'success');
        
        // 刷新预约列表
        await refreshAppointments();
        
        trackUserAction('appointment_booked', { appointmentId: result._id });
        
    } catch (error) {
        console.error('Error confirming appointment:', error);
        showMessage('预约失败，请重试', 'error');
    } finally {
        $w('#confirmAppointmentButton').enable();
        $w('#confirmAppointmentButton').label = '确认预约';
    }
}

// 处理取消预约
function handleCancelAppointment() {
    $w('#appointmentModal').hide();
    session.removeItem('selectedTimeSlot');
    trackUserAction('appointment_booking_cancelled');
}

// 处理紧急支持
function handleEmergencyCall() {
    // 显示紧急电话号码
    const phoneNumber = '+1-800-EMERGENCY';
    $w('#emergencyPhoneModal').show();
    $w('#emergencyPhoneNumber').text = phoneNumber;
    
    trackUserAction('emergency_call_accessed');
}

function handleEmergencyEmail() {
    // 打开邮件客户端
    const emailAddress = 'emergency@purpleruler.academy';
    wixLocation.to(`mailto:${emailAddress}?subject=紧急支持请求`);
    
    trackUserAction('emergency_email_accessed');
}

function handleEmergencyChat() {
    // 启动紧急聊天
    $w('#emergencyChatModal').show();
    
    trackUserAction('emergency_chat_accessed');
}

// 处理提交反馈
async function handleSubmitFeedback() {
    try {
        const rating = $w('#feedbackRating').value;
        const comments = $w('#feedbackComments').value;
        const category = $w('#feedbackCategory').value;
        
        if (!rating) {
            showMessage('请选择评分', 'error');
            return;
        }
        
        $w('#submitFeedbackButton').disable();
        $w('#submitFeedbackButton').label = '提交中...';
        
        const feedbackData = {
            studentId: currentUser._id,
            rating: rating,
            comments: comments,
            category: category,
            submittedDate: new Date()
        };
        
        await wixData.save('SupportFeedback', feedbackData);
        
        // 重置表单
        $w('#feedbackRating').value = undefined;
        $w('#feedbackComments').value = '';
        $w('#feedbackCategory').value = undefined;
        
        showMessage('感谢您的反馈！', 'success');
        
        trackUserAction('feedback_submitted', { rating: rating });
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showMessage('提交失败，请重试', 'error');
    } finally {
        $w('#submitFeedbackButton').enable();
        $w('#submitFeedbackButton').label = '提交反馈';
    }
}

// 处理评分变更
function handleRatingChange() {
    const rating = $w('#feedbackRating').value;
    
    // 根据评分显示不同的提示
    if (rating <= 2) {
        $w('#feedbackHint').text = '我们很抱歉没有达到您的期望，请告诉我们如何改进。';
    } else if (rating <= 3) {
        $w('#feedbackHint').text = '感谢您的反馈，请告诉我们如何做得更好。';
    } else {
        $w('#feedbackHint').text = '感谢您的好评！如有其他建议，请告诉我们。';
    }
    
    $w('#feedbackHint').show();
}

// 视图切换
function switchView(viewName) {
    // 隐藏所有视图
    $w('#ticketsContainer').hide();
    $w('#knowledgeContainer').hide();
    $w('#chatContainer').hide();
    $w('#appointmentsContainer').hide();
    $w('#resourcesContainer').hide();
    
    // 重置所有标签样式
    $w('#ticketsTab').style.backgroundColor = '#FFFFFF';
    $w('#knowledgeTab').style.backgroundColor = '#FFFFFF';
    $w('#chatTab').style.backgroundColor = '#FFFFFF';
    $w('#appointmentsTab').style.backgroundColor = '#FFFFFF';
    $w('#resourcesTab').style.backgroundColor = '#FFFFFF';
    
    // 显示选中的视图
    switch (viewName) {
        case 'tickets':
            $w('#ticketsContainer').show();
            $w('#ticketsTab').style.backgroundColor = '#663399';
            break;
        case 'knowledge':
            $w('#knowledgeContainer').show();
            $w('#knowledgeTab').style.backgroundColor = '#663399';
            break;
        case 'chat':
            $w('#chatContainer').show();
            $w('#chatTab').style.backgroundColor = '#663399';
            break;
        case 'appointments':
            $w('#appointmentsContainer').show();
            $w('#appointmentsTab').style.backgroundColor = '#663399';
            loadAppointments();
            break;
        case 'resources':
            $w('#resourcesContainer').show();
            $w('#resourcesTab').style.backgroundColor = '#663399';
            loadSupportResources();
            break;
    }
    
    // 记录视图切换
    trackUserAction('view_switched', { view: viewName });
}

// UI更新函数

// 更新用户界面
function updateUserInterface() {
    if (currentUser) {
        $w('#userWelcome').text = `欢迎，${currentUser.profile?.nickname || currentUser.loginEmail}`;
        $w('#userEmail').text = currentUser.loginEmail;
    }
}

// 更新票据显示
function updateTicketsDisplay(tickets = supportTickets) {
    $w('#ticketsList').data = tickets.map(ticket => ({
        _id: ticket._id,
        title: ticket.title,
        status: ticket.status,
        urgency: ticket.urgency,
        category: ticket.category,
        createdDate: ticket._createdDate,
        updatedDate: ticket._updatedDate,
        statusDisplay: getStatusDisplay(ticket.status),
        urgencyDisplay: getUrgencyDisplay(ticket.urgency),
        dateDisplay: formatDate(ticket._createdDate)
    }));
    
    // 更新计数
    $w('#totalTicketsCount').text = tickets.length;
}

// 设置票据项目
function setupTicketItem($item, itemData) {
    $item('#ticketTitle').text = itemData.title;
    $item('#ticketStatus').text = itemData.statusDisplay;
    $item('#ticketUrgency').text = itemData.urgencyDisplay;
    $item('#ticketDate').text = itemData.dateDisplay;
    
    // 设置状态颜色
    const statusColors = {
        'pending': '#FFC107',
        'in-progress': '#17A2B8',
        'waiting-reply': '#FF6B35',
        'resolved': '#28A745',
        'closed': '#6C757D'
    };
    
    $item('#ticketStatus').style.color = statusColors[itemData.status] || '#6C757D';
    
    // 设置紧急程度颜色
    const urgencyColors = {
        'low': '#28A745',
        'medium': '#FFC107',
        'high': '#FF6B35',
        'urgent': '#DC3545'
    };
    
    $item('#ticketUrgency').style.color = urgencyColors[itemData.urgency] || '#6C757D';
    
    // 点击事件
    $item('#ticketCard').onClick(() => openTicketDetails(itemData._id));
}

// 打开票据详情
function openTicketDetails(ticketId) {
    const ticket = supportTickets.find(t => t._id === ticketId);
    
    if (ticket) {
        currentTicket = ticket;
        
        // 填充详情模态框
        $w('#ticketDetailTitle').text = ticket.title;
        $w('#ticketDetailDescription').text = ticket.description;
        $w('#ticketDetailStatus').text = getStatusDisplay(ticket.status);
        $w('#ticketDetailUrgency').text = getUrgencyDisplay(ticket.urgency);
        $w('#ticketDetailCategory').text = ticket.category;
        $w('#ticketDetailCreated').text = formatDateTime(ticket._createdDate);
        $w('#ticketDetailUpdated').text = formatDateTime(ticket._updatedDate);
        
        // 加载票据回复
        loadTicketReplies(ticketId);
        
        // 显示模态框
        $w('#ticketDetailModal').show();
        
        trackUserAction('ticket_viewed', { ticketId: ticketId });
    }
}

// 加载票据回复
async function loadTicketReplies(ticketId) {
    try {
        const results = await wixData.query('TicketReplies')
            .eq('ticketId', ticketId)
            .ascending('_createdDate')
            .find();
        
        updateTicketRepliesDisplay(results.items);
    } catch (error) {
        console.error('Error loading ticket replies:', error);
    }
}

// 更新票据回复显示
function updateTicketRepliesDisplay(replies) {
    $w('#ticketRepliesList').data = replies.map(reply => ({
        _id: reply._id,
        message: reply.message,
        sender: reply.sender,
        senderName: reply.senderName,
        createdDate: reply._createdDate,
        dateDisplay: formatDateTime(reply._createdDate)
    }));
}

// 更新知识库显示
function updateKnowledgeDisplay(articles = knowledgeBase) {
    $w('#knowledgeList').data = articles.map(article => ({
        _id: article._id,
        title: article.title,
        summary: article.summary,
        category: article.category,
        popularity: article.popularity,
        tags: article.tags,
        dateDisplay: formatDate(article._updatedDate)
    }));
    
    // 更新计数
    $w('#knowledgeCount').text = `${articles.length} 篇文章`;
}

// 设置知识库项目
function setupKnowledgeItem($item, itemData) {
    $item('#articleTitle').text = itemData.title;
    $item('#articleSummary').text = itemData.summary;
    $item('#articleCategory').text = itemData.category;
    $item('#articleDate').text = itemData.dateDisplay;
    
    // 显示标签
    if (itemData.tags && itemData.tags.length > 0) {
        $item('#articleTags').text = itemData.tags.join(', ');
        $item('#articleTags').show();
    } else {
        $item('#articleTags').hide();
    }
    
    // 点击事件
    $item('#articleCard').onClick(() => openArticle(itemData._id));
}

// 打开文章
function openArticle(articleId) {
    const article = knowledgeBase.find(a => a._id === articleId);
    
    if (article) {
        // 填充文章模态框
        $w('#articleModalTitle').text = article.title;
        $w('#articleModalContent').html = article.content;
        $w('#articleModalCategory').text = article.category;
        $w('#articleModalDate').text = formatDate(article._updatedDate);
        
        // 显示模态框
        $w('#articleModal').show();
        
        // 增加浏览次数
        incrementArticleViews(articleId);
        
        trackUserAction('article_viewed', { articleId: articleId });
    }
}

// 增加文章浏览次数
async function incrementArticleViews(articleId) {
    try {
        const article = await wixData.get('KnowledgeBase', articleId);
        await wixData.update('KnowledgeBase', {
            ...article,
            views: (article.views || 0) + 1
        });
    } catch (error) {
        console.error('Error incrementing article views:', error);
    }
}

// 更新统计信息
function updateStatistics() {
    const pendingTickets = supportTickets.filter(t => t.status === 'pending').length;
    const inProgressTickets = supportTickets.filter(t => t.status === 'in-progress').length;
    const resolvedTickets = supportTickets.filter(t => t.status === 'resolved').length;
    
    $w('#pendingTicketsCount').text = pendingTickets;
    $w('#inProgressTicketsCount').text = inProgressTickets;
    $w('#resolvedTicketsCount').text = resolvedTickets;
    $w('#totalTicketsCount').text = supportTickets.length;
}

// 工具函数

// 获取状态显示文本
function getStatusDisplay(status) {
    const statusMap = {
        'pending': '待处理',
        'in-progress': '处理中',
        'waiting-reply': '等待回复',
        'resolved': '已解决',
        'closed': '已关闭'
    };
    
    return statusMap[status] || status;
}

// 获取紧急程度显示文本
function getUrgencyDisplay(urgency) {
    const urgencyMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'urgent': '紧急'
    };
    
    return urgencyMap[urgency] || urgency;
}

// 处理附件
async function processAttachments() {
    const files = $w('#attachmentUpload').value;
    const attachments = [];
    
    for (let file of files) {
        try {
            // 上传文件到Wix媒体管理器
            const uploadResult = await file.uploadTo('attachments');
            attachments.push({
                name: file.name,
                url: uploadResult.url,
                size: file.size,
                type: file.type
            });
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
    
    return attachments;
}

// 发送票据通知
async function sendTicketNotification(ticket) {
    try {
        // 这里应该调用后端API发送邮件通知
        console.log('Sending ticket notification for:', ticket._id);
    } catch (error) {
        console.error('Error sending ticket notification:', error);
    }
}

// 发送消息给支持系统
async function sendMessageToSupport(message) {
    try {
        // 这里应该调用支持系统API
        console.log('Sending message to support:', message);
    } catch (error) {
        console.error('Error sending message to support:', error);
    }
}

// 开始聊天更新
function startChatUpdates() {
    if (chatSession) {
        window.chatUpdateInterval = setInterval(async () => {
            await updateChatMessages();
        }, 5000);
    }
}

// 停止聊天更新
function stopChatUpdates() {
    if (window.chatUpdateInterval) {
        clearInterval(window.chatUpdateInterval);
        window.chatUpdateInterval = null;
    }
}

// 更新聊天消息
async function updateChatMessages() {
    try {
        if (!chatSession) return;
        
        const results = await wixData.query('ChatMessages')
            .eq('sessionId', chatSession._id)
            .ascending('timestamp')
            .find();
        
        // 检查是否有新消息
        const lastMessageTime = session.getItem('lastChatMessageTime');
        const newMessages = results.items.filter(msg => 
            !lastMessageTime || new Date(msg.timestamp) > new Date(lastMessageTime)
        );
        
        // 添加新消息到界面
        newMessages.forEach(msg => {
            if (msg.sender !== 'user') {
                addChatMessage('agent', msg.message);
            }
        });
        
        // 更新最后消息时间
        if (results.items.length > 0) {
            const latestMessage = results.items[results.items.length - 1];
            session.setItem('lastChatMessageTime', latestMessage.timestamp);
        }
    } catch (error) {
        console.error('Error updating chat messages:', error);
    }
}

// 显示聊天反馈模态框
function showChatFeedbackModal() {
    $w('#chatFeedbackModal').show();
}

// 发送预约确认
async function sendAppointmentConfirmation(appointment) {
    try {
        // 这里应该调用后端API发送确认邮件
        console.log('Sending appointment confirmation for:', appointment._id);
    } catch (error) {
        console.error('Error sending appointment confirmation:', error);
    }
}

// 刷新预约列表
async function refreshAppointments() {
    try {
        const results = await wixData.query('Appointments')
            .eq('studentId', currentUser._id)
            .descending('_createdDate')
            .find();
        
        updateAppointmentsDisplay(results.items);
    } catch (error) {
        console.error('Error refreshing appointments:', error);
    }
}

// 更新预约显示
function updateAppointmentsDisplay(appointments) {
    $w('#appointmentsList').data = appointments.map(apt => ({
        _id: apt._id,
        type: apt.type,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        notes: apt.notes,
        dateDisplay: formatDate(apt.date),
        timeDisplay: formatTime(apt.time)
    }));
}

// 加载预约
async function loadAppointments() {
    try {
        await refreshAppointments();
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// 加载支持资源
async function loadSupportResources() {
    try {
        const results = await wixData.query('SupportResources')
            .eq('active', true)
            .ascending('category')
            .find();
        
        updateResourcesDisplay(results.items);
    } catch (error) {
        console.error('Error loading support resources:', error);
    }
}

// 更新资源显示
function updateResourcesDisplay(resources) {
    $w('#resourcesList').data = resources.map(resource => ({
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        type: resource.type,
        url: resource.url
    }));
}

// 处理设置
function handleOpenSettings() {
    // 加载当前设置
    loadCurrentSettings();
    
    // 显示设置模态框
    $w('#settingsModal').show();
}

// 加载当前设置
function loadCurrentSettings() {
    // 从用户偏好中加载设置
    $w('#emailNotifications').checked = userPreferences.emailNotifications !== false;
    $w('#smsNotifications').checked = userPreferences.smsNotifications === true;
    $w('#pushNotifications').checked = userPreferences.pushNotifications !== false;
    $w('#autoRefresh').checked = userPreferences.autoRefresh !== false;
}

// 处理保存设置
async function handleSaveSettings() {
    try {
        const settings = {
            emailNotifications: $w('#emailNotifications').checked,
            smsNotifications: $w('#smsNotifications').checked,
            pushNotifications: $w('#pushNotifications').checked,
            autoRefresh: $w('#autoRefresh').checked
        };
        
        // 保存到数据库
        await saveUserPreferences(settings);
        
        // 更新本地偏好
        userPreferences = { ...userPreferences, ...settings };
        
        // 关闭模态框
        $w('#settingsModal').hide();
        
        showMessage('设置已保存', 'success');
        
        trackUserAction('settings_saved');
    } catch (error) {
        console.error('Error saving settings:', error);
        showMessage('保存失败，请重试', 'error');
    }
}

// 保存用户偏好
async function saveUserPreferences(preferences) {
    try {
        const existingPrefs = await wixData.query('UserPreferences')
            .eq('userId', currentUser._id)
            .find();
        
        if (existingPrefs.items.length > 0) {
            // 更新现有偏好
            await wixData.update('UserPreferences', {
                ...existingPrefs.items[0],
                ...preferences
            });
        } else {
            // 创建新偏好
            await wixData.save('UserPreferences', {
                userId: currentUser._id,
                ...preferences
            });
        }
    } catch (error) {
        console.error('Error saving user preferences:', error);
        throw error;
    }
}

// 处理通知切换
function handleNotificationToggle() {
    const enabled = $w('#notificationToggle').checked;
    
    if (enabled) {
        // 请求通知权限
        requestNotificationPermission();
    }
    
    trackUserAction('notifications_toggled', { enabled: enabled });
}

// 请求通知权限
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showMessage('通知已启用', 'success');
            } else {
                showMessage('通知权限被拒绝', 'warning');
                $w('#notificationToggle').checked = false;
            }
        });
    }
}

// 响应式设计函数
function adjustMobileLayout() {
    // 调整移动端布局
    $w('#sidebarPanel').collapse();
    $w('#mainContentArea').expand();
    
    // 调整按钮大小
    $w('#createTicketButton').style.width = '100%';
    $w('#startChatButton').style.width = '100%';
}

function adjustDesktopLayout() {
    // 调整桌面端布局
    $w('#sidebarPanel').expand();
    $w('#mainContentArea').expand();
    
    // 恢复按钮大小
    $w('#createTicketButton').style.width = 'auto';
    $w('#startChatButton').style.width = 'auto';
}

// 显示加载状态
function showLoading(show) {
    if (show) {
        $w('#loadingOverlay').show();
        $w('#supportContainer').hide();
    } else {
        $w('#loadingOverlay').hide();
        $w('#supportContainer').show();
    }
}

// 日期和时间格式化函数
function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function formatTime(time) {
    if (!time) return '';
    
    const t = new Date(time);
    const hours = String(t.getHours()).padStart(2, '0');
    const minutes = String(t.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

function formatDateTime(datetime) {
    if (!datetime) return '';
    
    const dt = new Date(datetime);
    return `${formatDate(dt)} ${formatTime(dt)}`;
}

// 生成唯一ID
function generateUniqueId() {
    return 'support_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 显示消息
function showMessage(message, type = 'info') {
    const colors = {
        'success': '#28A745',
        'error': '#DC3545',
        'warning': '#FFC107',
        'info': '#17A2B8'
    };
    
    $w('#messageText').text = message;
    $w('#messageBar').style.backgroundColor = colors[type] || colors.info;
    $w('#messageBar').show();
    
    // 3秒后自动隐藏
    setTimeout(() => {
        $w('#messageBar').hide();
    }, 3000);
}

// 自动刷新和缓存管理
function setupAutoRefresh() {
    if (userPreferences.autoRefresh !== false) {
        // 每5分钟自动刷新数据
        setInterval(async () => {
            try {
                await refreshAllData();
                console.log('Auto refresh completed');
            } catch (error) {
                console.error('Auto refresh failed:', error);
            }
        }, 5 * 60 * 1000); // 5分钟
    }
}

// 刷新所有数据
async function refreshAllData() {
    try {
        const [tickets, knowledge] = await Promise.all([
            loadSupportTickets(),
            loadKnowledgeBase()
        ]);
        
        supportTickets = tickets;
        knowledgeBase = knowledge;
        
        // 更新显示
        updateTicketsDisplay();
        updateKnowledgeDisplay();
        updateStatistics();
        
        // 更新缓存时间戳
        local.setItem('lastDataRefresh', new Date().toISOString());
    } catch (error) {
        console.error('Error refreshing all data:', error);
        throw error;
    }
}

// 缓存管理
function setupCacheManagement() {
    // 检查缓存是否过期（30分钟）
    const lastRefresh = local.getItem('lastDataRefresh');
    if (lastRefresh) {
        const refreshTime = new Date(lastRefresh);
        const now = new Date();
        const diffMinutes = (now - refreshTime) / (1000 * 60);
        
        if (diffMinutes > 30) {
            // 缓存过期，刷新数据
            refreshAllData();
        }
    }
}

// 分析和跟踪
function trackUserAction(action, data = {}) {
    try {
        const trackingData = {
            userId: currentUser?._id,
            action: action,
            data: data,
            timestamp: new Date(),
            page: 'student-support',
            userAgent: navigator.userAgent,
            url: wixLocation.url
        };
        
        // 保存到分析数据库
        wixData.save('UserAnalytics', trackingData).catch(error => {
            console.error('Error saving analytics:', error);
        });
        
        console.log('User action tracked:', action, data);
    } catch (error) {
        console.error('Error tracking user action:', error);
    }
}

// 发送使用统计
function sendUsageStatistics() {
    try {
        const stats = {
            userId: currentUser?._id,
            sessionDuration: Date.now() - window.sessionStartTime,
            ticketsViewed: window.ticketsViewed || 0,
            articlesViewed: window.articlesViewed || 0,
            chatMessagesExchanged: window.chatMessagesExchanged || 0,
            searchesPerformed: window.searchesPerformed || 0,
            timestamp: new Date()
        };
        
        wixData.save('UsageStatistics', stats).catch(error => {
            console.error('Error saving usage statistics:', error);
        });
    } catch (error) {
        console.error('Error sending usage statistics:', error);
    }
}

// 页面生命周期管理

// 页面加载完成后的初始化
$w.onReady(() => {
    // 记录会话开始时间
    window.sessionStartTime = Date.now();
    
    // 初始化统计变量
    window.ticketsViewed = 0;
    window.articlesViewed = 0;
    window.chatMessagesExchanged = 0;
    window.searchesPerformed = 0;
    
    // 设置缓存管理
    setupCacheManagement();
    
    // 设置自动刷新
    setupAutoRefresh();
    
    console.log('Student Support page lifecycle initialized');
});

// 页面卸载时的清理
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        // 发送使用统计
        sendUsageStatistics();
        
        // 清理定时器
        if (window.chatUpdateInterval) {
            clearInterval(window.chatUpdateInterval);
        }
        
        // 结束活跃的聊天会话
        if (chatSession && chatSession.status === 'active') {
            wixData.update('ChatSessions', {
                ...chatSession,
                status: 'ended',
                endTime: new Date()
            }).catch(error => {
                console.error('Error ending chat session:', error);
            });
        }
        
        console.log('Student Support page cleanup completed');
    });
}

// 导出主要函数供外部调用
export {
    initializePage,
    switchView,
    handleCreateTicket,
    handleStartChat,
    handleBookAppointment,
    refreshAllData,
    trackUserAction
};

/**
 * 使用说明：
 * 
 * 1. 页面结构要求：
 *    - 确保所有引用的元素ID在Wix编辑器中正确设置
 *    - 数据库集合需要预先创建并配置正确的权限
 *    - 中继器需要正确连接到数据集
 * 
 * 2. 数据库集合结构：
 *    - SupportTickets: 支持票据
 *    - KnowledgeBase: 知识库文章
 *    - SupportAgents: 支持代理
 *    - SupportCategories: 支持类别
 *    - ChatSessions: 聊天会话
 *    - ChatMessages: 聊天消息
 *    - Appointments: 预约记录
 *    - AppointmentSlots: 可用时间段
 *    - SupportFeedback: 反馈记录
 *    - UserPreferences: 用户偏好
 *    - UserAnalytics: 用户行为分析
 *    - UsageStatistics: 使用统计
 * 
 * 3. 权限设置：
 *    - 学生只能查看和修改自己的数据
 *    - 知识库文章对所有用户可读
 *    - 聊天和预约功能需要适当的权限控制
 * 
 * 4. 自定义功能：
 *    - 可以根据学校需求调整支持类别
 *    - 可以自定义紧急联系方式
 *    - 可以集成第三方客服系统
 *    - 可以添加更多的通知方式
 * 
 * 5. 性能优化：
 *    - 使用分页加载大量数据
 *    - 实现数据缓存机制
 *    - 优化图片和文件上传
 *    - 使用CDN加速资源加载
 * 
 * 6. 安全考虑：
 *    - 验证所有用户输入
 *    - 限制文件上传类型和大小
 *    - 实现适当的访问控制
 *    - 保护敏感信息不被泄露
 */