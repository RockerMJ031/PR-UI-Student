/**
 * Wix 学生进度页面 - 完整 Velo JavaScript 代码
 * 
 * 项目描述：
 * 这是一个全面的学生进度跟踪页面，为学生提供详细的学习进度分析、
 * 成绩统计、目标设置和进度可视化功能。页面包含多种图表展示、
 * 详细的进度分析和个性化的学习建议。
 * 
 * 主要功能：
 * - 综合进度仪表板
 * - 多维度进度分析
 * - 成绩趋势图表
 * - 学习目标管理
 * - 进度比较分析
 * - 详细的统计报告
 * - 个性化学习建议
 * - 进度分享功能
 * 
 * 技术栈：
 * - Wix Velo (JavaScript)
 * - Wix Data API
 * - Chart.js (图表库)
 * - 响应式设计
 * - 实时数据更新
 * 
 * 作者：Purple Ruler Academy 开发团队
 * 创建日期：2024年
 * 最后更新：2024年
 */

// ==================== 模块导入 ====================
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';
import { local } from 'wix-storage';
import wixWindow from 'wix-window';

// ==================== 全局变量 ====================
let currentUser = null;
let userProgress = null;
let progressCharts = {};
let refreshInterval = null;
let isLoading = false;

// 配置常量
const CONFIG = {
    REFRESH_INTERVAL: 300000, // 5分钟自动刷新
    CHART_COLORS: {
        primary: '#663399',
        secondary: '#8A2BE2',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8'
    },
    PROGRESS_THRESHOLDS: {
        excellent: 90,
        good: 75,
        average: 60,
        needsImprovement: 40
    }
};

// ==================== 页面初始化 ====================
$w.onReady(function () {
    console.log('学生进度页面初始化开始');
    
    // 初始化页面
    initializePage();
    
    // 设置事件处理器
    setupEventHandlers();
    
    // 设置响应式设计
    setupResponsiveDesign();
    
    console.log('学生进度页面初始化完成');
});

// ==================== 用户认证检查 ====================
async function checkUserAuthentication() {
    try {
        const user = wixUsers.currentUser;
        
        if (!user.loggedIn) {
            console.log('用户未登录，重定向到登录页面');
            wixLocation.to('/login');
            return false;
        }
        
        currentUser = {
            id: user.id,
            email: await user.getEmail(),
            role: await user.getRole()
        };
        
        console.log('用户认证成功:', currentUser.email);
        return true;
    } catch (error) {
        console.error('用户认证检查失败:', error);
        showMessage('认证失败，请重新登录', 'error');
        return false;
    }
}

// ==================== 页面初始化函数 ====================
async function initializePage() {
    try {
        // 显示加载状态
        showLoadingState(true);
        
        // 检查用户认证
        const isAuthenticated = await checkUserAuthentication();
        if (!isAuthenticated) return;
        
        // 加载用户资料
        await loadUserProfile();
        
        // 加载进度数据
        await loadProgressData();
        
        // 初始化图表
        await initializeCharts();
        
        // 加载学习目标
        await loadLearningGoals();
        
        // 设置自动刷新
        setupAutoRefresh();
        
        // 隐藏加载状态
        showLoadingState(false);
        
    } catch (error) {
        console.error('页面初始化失败:', error);
        showMessage('页面加载失败，请刷新重试', 'error');
        showLoadingState(false);
    }
}

// ==================== 事件处理器设置 ====================
function setupEventHandlers() {
    // 时间范围选择器
    $w('#timeRangeDropdown').onChange(handleTimeRangeChange);
    
    // 科目筛选器
    $w('#subjectFilter').onChange(handleSubjectFilterChange);
    
    // 图表类型切换
    $w('#chartTypeToggle').onChange(handleChartTypeChange);
    
    // 目标设置按钮
    $w('#setGoalButton').onClick(openGoalSettingModal);
    
    // 详细报告按钮
    $w('#detailedReportButton').onClick(generateDetailedReport);
    
    // 分享进度按钮
    $w('#shareProgressButton').onClick(shareProgress);
    
    // 刷新按钮
    $w('#refreshButton').onClick(refreshProgressData);
    
    // 导出数据按钮
    $w('#exportDataButton').onClick(exportProgressData);
    
    // 比较分析按钮
    $w('#compareAnalysisButton').onClick(openComparisonAnalysis);
    
    // 学习建议按钮
    $w('#learningTipsButton').onClick(showLearningTips);
}

// ==================== 用户资料加载 ====================
async function loadUserProfile() {
    try {
        console.log('加载用户资料...');
        
        const userProfile = await wixData.query('Students')
            .eq('userId', currentUser.id)
            .find();
        
        if (userProfile.items.length > 0) {
            const profile = userProfile.items[0];
            
            // 更新用户信息显示
            $w('#userNameText').text = profile.fullName || '学生';
            $w('#userEmailText').text = currentUser.email;
            $w('#userGradeText').text = profile.grade || '未设置';
            $w('#userSchoolText').text = profile.school || '未设置';
            
            // 设置用户头像
            if (profile.avatar) {
                $w('#userAvatarImage').src = profile.avatar;
            }
            
            console.log('用户资料加载完成');
        } else {
            console.warn('未找到用户资料');
        }
        
    } catch (error) {
        console.error('用户资料加载失败:', error);
        throw error;
    }
}

// ==================== 进度数据加载 ====================
async function loadProgressData() {
    try {
        console.log('加载进度数据...');
        
        // 获取时间范围
        const timeRange = $w('#timeRangeDropdown').value || 'month';
        const dateRange = getDateRange(timeRange);
        
        // 获取科目筛选
        const selectedSubject = $w('#subjectFilter').value;
        
        // 构建查询
        let query = wixData.query('StudentProgress')
            .eq('studentId', currentUser.id)
            .ge('date', dateRange.start)
            .le('date', dateRange.end)
            .ascending('date');
        
        if (selectedSubject && selectedSubject !== 'all') {
            query = query.eq('subject', selectedSubject);
        }
        
        const progressData = await query.find();
        
        // 查询同一时间段的测验数据
        let quizQuery = wixData.query('StudentQuizzes')
            .eq('studentId', currentUser.id)
            .ge('date', dateRange.start)
            .le('date', dateRange.end)
            .ascending('date');
            
        // 应用科目筛选到测验数据
        if (selectedSubject && selectedSubject !== 'all') {
            quizQuery = quizQuery.eq('subject', selectedSubject);
        }
        
        const quizResults = await quizQuery.find();
        
        // 处理进度数据
        userProgress = processProgressData(progressData.items);
        
        // 处理测验数据
        if (quizResults.items.length > 0) {
            processQuizData(quizResults.items);
        }
        
        // 更新进度统计
        updateProgressStatistics();
        
        // 更新进度图表
        updateProgressCharts();
        
        // 更新成绩分析
        updateGradeAnalysis();
        
        console.log('进度数据加载完成');
        
    } catch (error) {
        console.error('进度数据加载失败:', error);
        throw error;
    }
}

// ==================== 进度数据处理 ====================
function processProgressData(rawData) {
    const processed = {
        overall: {
            totalCourses: 0,
            completedCourses: 0,
            averageProgress: 0,
            totalStudyTime: 0,
            averageGrade: 0
        },
        subjects: {},
        timeline: [],
        grades: [],
        achievements: []
    };
    
    // 按科目分组数据
    const subjectGroups = {};
    
    rawData.forEach(item => {
        const subject = item.subject;
        
        if (!subjectGroups[subject]) {
            subjectGroups[subject] = {
                courses: [],
                totalProgress: 0,
                totalGrades: 0,
                studyTime: 0,
                count: 0
            };
        }
        
        subjectGroups[subject].courses.push(item);
        subjectGroups[subject].totalProgress += item.progress || 0;
        subjectGroups[subject].totalGrades += item.grade || 0;
        subjectGroups[subject].studyTime += item.studyTime || 0;
        subjectGroups[subject].count++;
        
        // 添加到时间线
        processed.timeline.push({
            date: item.date,
            subject: subject,
            progress: item.progress,
            grade: item.grade,
            activity: item.activity
        });
        
        // 添加成绩记录
        if (item.grade) {
            processed.grades.push({
                date: item.date,
                subject: subject,
                grade: item.grade,
                courseName: item.courseName
            });
        }
    });
    
    // 计算科目统计
    Object.keys(subjectGroups).forEach(subject => {
        const group = subjectGroups[subject];
        processed.subjects[subject] = {
            averageProgress: group.totalProgress / group.count,
            averageGrade: group.totalGrades / group.count,
            totalStudyTime: group.studyTime,
            courseCount: group.count,
            completedCourses: group.courses.filter(c => c.progress >= 100).length
        };
    });
    
    // 计算总体统计
    const allCourses = rawData.length;
    const completedCourses = rawData.filter(item => item.progress >= 100).length;
    const totalProgress = rawData.reduce((sum, item) => sum + (item.progress || 0), 0);
    const totalGrades = rawData.filter(item => item.grade).reduce((sum, item) => sum + item.grade, 0);
    const gradeCount = rawData.filter(item => item.grade).length;
    const totalStudyTime = rawData.reduce((sum, item) => sum + (item.studyTime || 0), 0);
    
    processed.overall = {
        totalCourses: allCourses,
        completedCourses: completedCourses,
        averageProgress: allCourses > 0 ? totalProgress / allCourses : 0,
        totalStudyTime: totalStudyTime,
        averageGrade: gradeCount > 0 ? totalGrades / gradeCount : 0
    };
    
    return processed;
}

// ==================== 进度统计更新 ====================
function updateProgressStatistics() {
    if (!userProgress) return;
    
    const stats = userProgress.overall;
    
    // 更新总体统计卡片
    $w('#totalCoursesText').text = stats.totalCourses.toString();
    $w('#completedCoursesText').text = stats.completedCourses.toString();
    $w('#averageProgressText').text = `${Math.round(stats.averageProgress)}%`;
    $w('#totalStudyTimeText').text = formatStudyTime(stats.totalStudyTime);
    $w('#averageGradeText').text = stats.averageGrade.toFixed(1);
    
    // 更新进度条
    const completionRate = stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0;
    $w('#overallProgressBar').value = completionRate;
    $w('#overallProgressText').text = `${Math.round(completionRate)}%`;
    
    // 更新科目统计
    updateSubjectStatistics();
}

// ==================== 科目统计更新 ====================
function updateSubjectStatistics() {
    if (!userProgress || !userProgress.subjects) return;
    
    const subjectData = [];
    
    Object.keys(userProgress.subjects).forEach(subject => {
        const stats = userProgress.subjects[subject];
        subjectData.push({
            _id: subject,
            subject: subject,
            averageProgress: Math.round(stats.averageProgress),
            averageGrade: stats.averageGrade.toFixed(1),
            studyTime: formatStudyTime(stats.totalStudyTime),
            courseCount: stats.courseCount,
            completedCourses: stats.completedCourses
        });
    });
    
    // 更新科目统计表格
    $w('#subjectStatsRepeater').data = subjectData;
}

// ==================== 测验数据处理 ====================
function processQuizData(quizItems) {
    console.log('处理测验数据...');
    
    // 计算测验统计数据
    const totalQuizzes = quizItems.length;
    let totalScore = 0;
    let perfectScores = 0;
    
    // 获取即将到来的测验（计划在未来）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingQuizzes = quizItems.filter(quiz => new Date(quiz.scheduledDate) > today).length;
    
    // 计算平均分数和满分次数
    quizItems.forEach(quiz => {
        if (quiz.completed) {
            totalScore += quiz.score;
            if (quiz.score === 100) {
                perfectScores++;
            }
        }
    });
    
    // 计算平均分数（仅针对已完成的测验）
    const completedQuizzes = quizItems.filter(quiz => quiz.completed).length;
    const averageScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0;
    
    // 更新测验概览统计
    $w('#completedQuizzesText').text = completedQuizzes.toString();
    $w('#averageScoreText').text = `${averageScore}%`;
    $w('#perfectScoresText').text = perfectScores.toString();
    $w('#upcomingQuizzesText').text = upcomingQuizzes.toString();
    
    // 更新最近测验结果
    updateRecentQuizResults(quizItems);
    
    console.log('测验数据处理完成');
}

// ==================== 最近测验结果更新 ====================
function updateRecentQuizResults(quizItems) {
    // 按日期排序（最近的优先）并仅获取已完成的测验
    const completedQuizzes = quizItems
        .filter(quiz => quiz.completed)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3); // 仅显示最近的3次测验
    
    if (completedQuizzes.length === 0) {
        // 如果没有已完成的测验，显示一条消息
        $w('#recentQuizzesRepeater').hide();
        $w('#noQuizzesMessage').show();
        return;
    }
    
    // 准备测验数据用于重复器
    const quizData = completedQuizzes.map(quiz => ({
        _id: quiz._id,
        title: `${quiz.subject}: ${quiz.title}`,
        date: formatDate(new Date(quiz.date)),
        score: `${quiz.score}%`,
        scoreColor: getScoreColor(quiz.score)
    }));
    
    // 更新重复器数据
    $w('#recentQuizzesRepeater').data = quizData;
    $w('#recentQuizzesRepeater').show();
    $w('#noQuizzesMessage').hide();
}

// 根据分数获取颜色
function getScoreColor(score) {
    if (score >= 90) return CONFIG.CHART_COLORS.success;
    if (score >= 70) return CONFIG.CHART_COLORS.primary;
    if (score >= 60) return CONFIG.CHART_COLORS.warning;
    return CONFIG.CHART_COLORS.danger;
}

// ==================== 图表初始化 ====================
async function initializeCharts() {
    try {
        console.log('初始化图表...');
        
        // 初始化进度趋势图
        await initializeProgressTrendChart();
        
        // 初始化成绩分布图
        await initializeGradeDistributionChart();
        
        // 初始化科目比较图
        await initializeSubjectComparisonChart();
        
        // 初始化学习时间图
        await initializeStudyTimeChart();
        
        console.log('图表初始化完成');
        
    } catch (error) {
        console.error('图表初始化失败:', error);
    }
}

// ==================== 进度趋势图 ====================
async function initializeProgressTrendChart() {
    const chartData = prepareProgressTrendData();
    
    const chartConfig = {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '学习进度',
                data: chartData.progress,
                borderColor: CONFIG.CHART_COLORS.primary,
                backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '学习进度趋势'
                },
                legend: {
                    display: false
                }
            }
        }
    };
    
    // 使用 HTML 组件显示图表
    const chartHtml = generateChartHtml('progressTrendChart', chartConfig);
    $w('#progressTrendChartHtml').postMessage(chartHtml);
}

// ==================== 成绩分布图 ====================
async function initializeGradeDistributionChart() {
    const chartData = prepareGradeDistributionData();
    
    const chartConfig = {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.values,
                backgroundColor: [
                    CONFIG.CHART_COLORS.success,
                    CONFIG.CHART_COLORS.info,
                    CONFIG.CHART_COLORS.warning,
                    CONFIG.CHART_COLORS.danger
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '成绩分布'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    };
    
    const chartHtml = generateChartHtml('gradeDistributionChart', chartConfig);
    $w('#gradeDistributionChartHtml').postMessage(chartHtml);
}

// ==================== 科目比较图 ====================
async function initializeSubjectComparisonChart() {
    const chartData = prepareSubjectComparisonData();
    
    const chartConfig = {
        type: 'radar',
        data: {
            labels: chartData.subjects,
            datasets: [{
                label: '平均进度',
                data: chartData.progress,
                borderColor: CONFIG.CHART_COLORS.primary,
                backgroundColor: CONFIG.CHART_COLORS.primary + '30',
                pointBackgroundColor: CONFIG.CHART_COLORS.primary
            }, {
                label: '平均成绩',
                data: chartData.grades,
                borderColor: CONFIG.CHART_COLORS.secondary,
                backgroundColor: CONFIG.CHART_COLORS.secondary + '30',
                pointBackgroundColor: CONFIG.CHART_COLORS.secondary
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '科目表现比较'
                }
            }
        }
    };
    
    const chartHtml = generateChartHtml('subjectComparisonChart', chartConfig);
    $w('#subjectComparisonChartHtml').postMessage(chartHtml);
}

// ==================== 学习时间图 ====================
async function initializeStudyTimeChart() {
    const chartData = prepareStudyTimeData();
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '学习时间 (小时)',
                data: chartData.hours,
                backgroundColor: CONFIG.CHART_COLORS.info,
                borderColor: CONFIG.CHART_COLORS.info,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '每日学习时间'
                },
                legend: {
                    display: false
                }
            }
        }
    };
    
    const chartHtml = generateChartHtml('studyTimeChart', chartConfig);
    $w('#studyTimeChartHtml').postMessage(chartHtml);
}

// ==================== 图表数据准备函数 ====================
function prepareProgressTrendData() {
    if (!userProgress || !userProgress.timeline) {
        return { labels: [], progress: [] };
    }
    
    const timeline = userProgress.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = [];
    const progress = [];
    
    // 按日期分组并计算平均进度
    const dailyProgress = {};
    
    timeline.forEach(item => {
        const date = formatDate(item.date, 'MM/DD');
        if (!dailyProgress[date]) {
            dailyProgress[date] = { total: 0, count: 0 };
        }
        dailyProgress[date].total += item.progress || 0;
        dailyProgress[date].count++;
    });
    
    Object.keys(dailyProgress).forEach(date => {
        labels.push(date);
        progress.push(Math.round(dailyProgress[date].total / dailyProgress[date].count));
    });
    
    return { labels, progress };
}

function prepareGradeDistributionData() {
    if (!userProgress || !userProgress.grades) {
        return { labels: [], values: [] };
    }
    
    const distribution = {
        '优秀 (90-100)': 0,
        '良好 (75-89)': 0,
        '及格 (60-74)': 0,
        '不及格 (<60)': 0
    };
    
    userProgress.grades.forEach(grade => {
        const score = grade.grade;
        if (score >= 90) distribution['优秀 (90-100)']++;
        else if (score >= 75) distribution['良好 (75-89)']++;
        else if (score >= 60) distribution['及格 (60-74)']++;
        else distribution['不及格 (<60)']++;
    });
    
    return {
        labels: Object.keys(distribution),
        values: Object.values(distribution)
    };
}

function prepareSubjectComparisonData() {
    if (!userProgress || !userProgress.subjects) {
        return { subjects: [], progress: [], grades: [] };
    }
    
    const subjects = Object.keys(userProgress.subjects);
    const progress = subjects.map(subject => userProgress.subjects[subject].averageProgress);
    const grades = subjects.map(subject => userProgress.subjects[subject].averageGrade);
    
    return { subjects, progress, grades };
}

function prepareStudyTimeData() {
    if (!userProgress || !userProgress.timeline) {
        return { labels: [], hours: [] };
    }
    
    const timeline = userProgress.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    const dailyStudyTime = {};
    
    timeline.forEach(item => {
        const date = formatDate(item.date, 'MM/DD');
        if (!dailyStudyTime[date]) {
            dailyStudyTime[date] = 0;
        }
        dailyStudyTime[date] += item.studyTime || 0;
    });
    
    const labels = Object.keys(dailyStudyTime).slice(-7); // 最近7天
    const hours = labels.map(date => Math.round(dailyStudyTime[date] / 60 * 10) / 10); // 转换为小时
    
    return { labels, hours };
}

// ==================== 图表HTML生成 ====================
function generateChartHtml(chartId, config) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body { margin: 0; padding: 10px; font-family: 'Segoe UI', sans-serif; }
                canvas { max-width: 100%; height: 300px !important; }
            </style>
        </head>
        <body>
            <canvas id="${chartId}"></canvas>
            <script>
                const ctx = document.getElementById('${chartId}').getContext('2d');
                new Chart(ctx, ${JSON.stringify(config)});
            </script>
        </body>
        </html>
    `;
}

// ==================== 学习目标管理 ====================
async function loadLearningGoals() {
    try {
        console.log('加载学习目标...');
        
        const goals = await wixData.query('LearningGoals')
            .eq('studentId', currentUser.id)
            .eq('isActive', true)
            .find();
        
        if (goals.items.length > 0) {
            displayLearningGoals(goals.items);
        } else {
            showEmptyGoalsState();
        }
        
    } catch (error) {
        console.error('学习目标加载失败:', error);
    }
}

function displayLearningGoals(goals) {
    const goalData = goals.map(goal => ({
        _id: goal._id,
        title: goal.title,
        description: goal.description,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        progress: Math.round((goal.currentValue / goal.targetValue) * 100),
        deadline: formatDate(goal.deadline),
        status: getGoalStatus(goal)
    }));
    
    $w('#learningGoalsRepeater').data = goalData;
    $w('#emptyGoalsContainer').hide();
    $w('#goalsContainer').show();
}

function showEmptyGoalsState() {
    $w('#goalsContainer').hide();
    $w('#emptyGoalsContainer').show();
}

function getGoalStatus(goal) {
    const progress = (goal.currentValue / goal.targetValue) * 100;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) return 'completed';
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 7) return 'urgent';
    return 'active';
}

// ==================== 事件处理器 ====================
async function handleTimeRangeChange() {
    const timeRange = $w('#timeRangeDropdown').value;
    console.log('时间范围变更:', timeRange);
    
    showLoadingState(true);
    await loadProgressData();
    showLoadingState(false);
}

async function handleSubjectFilterChange() {
    const subject = $w('#subjectFilter').value;
    console.log('科目筛选变更:', subject);
    
    showLoadingState(true);
    await loadProgressData();
    showLoadingState(false);
}

async function handleChartTypeChange() {
    const chartType = $w('#chartTypeToggle').value;
    console.log('图表类型变更:', chartType);
    
    await updateProgressCharts();
}

function openGoalSettingModal() {
    $w('#goalSettingLightbox').show();
}

async function generateDetailedReport() {
    try {
        showLoadingState(true);
        
        const reportData = {
            student: currentUser,
            progress: userProgress,
            generatedAt: new Date(),
            timeRange: $w('#timeRangeDropdown').value
        };
        
        // 生成报告
        const reportUrl = await generateProgressReport(reportData);
        
        // 打开报告
        wixWindow.openLightbox('progressReportLightbox', { reportUrl });
        
        showLoadingState(false);
        
    } catch (error) {
        console.error('生成详细报告失败:', error);
        showMessage('报告生成失败，请重试', 'error');
        showLoadingState(false);
    }
}

async function shareProgress() {
    try {
        const shareData = {
            title: '我的学习进度',
            text: `我在 Purple Ruler Academy 的学习进度：平均进度 ${Math.round(userProgress.overall.averageProgress)}%`,
            url: wixLocation.url
        };
        
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // 复制到剪贴板
            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            showMessage('分享链接已复制到剪贴板', 'success');
        }
        
    } catch (error) {
        console.error('分享失败:', error);
        showMessage('分享失败，请重试', 'error');
    }
}

async function refreshProgressData() {
    console.log('手动刷新进度数据');
    
    showLoadingState(true);
    await loadProgressData();
    await loadLearningGoals();
    showLoadingState(false);
    
    showMessage('数据已刷新', 'success');
}

async function exportProgressData() {
    try {
        const exportData = {
            student: currentUser.email,
            exportDate: new Date().toISOString(),
            timeRange: $w('#timeRangeDropdown').value,
            overallStats: userProgress.overall,
            subjectStats: userProgress.subjects,
            timeline: userProgress.timeline,
            grades: userProgress.grades
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `progress-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showMessage('数据导出成功', 'success');
        
    } catch (error) {
        console.error('数据导出失败:', error);
        showMessage('数据导出失败，请重试', 'error');
    }
}

function openComparisonAnalysis() {
    wixWindow.openLightbox('comparisonAnalysisLightbox', {
        studentProgress: userProgress
    });
}

function showLearningTips() {
    const tips = generateLearningTips();
    wixWindow.openLightbox('learningTipsLightbox', { tips });
}

// ==================== UI更新函数 ====================
function updateProgressCharts() {
    // 重新初始化所有图表
    initializeCharts();
}

function updateGradeAnalysis() {
    if (!userProgress || !userProgress.grades) return;
    
    const recentGrades = userProgress.grades.slice(-10); // 最近10次成绩
    const averageGrade = recentGrades.reduce((sum, g) => sum + g.grade, 0) / recentGrades.length;
    const trend = calculateGradeTrend(recentGrades);
    
    $w('#recentAverageGradeText').text = averageGrade.toFixed(1);
    $w('#gradeTrendText').text = trend.direction;
    $w('#gradeTrendIcon').src = trend.icon;
    
    // 更新成绩趋势颜色
    const trendColor = trend.direction === '上升' ? CONFIG.CHART_COLORS.success : 
                      trend.direction === '下降' ? CONFIG.CHART_COLORS.danger : 
                      CONFIG.CHART_COLORS.info;
    $w('#gradeTrendText').style.color = trendColor;
}

function calculateGradeTrend(grades) {
    if (grades.length < 2) {
        return { direction: '稳定', icon: '/images/trend-stable.svg' };
    }
    
    const firstHalf = grades.slice(0, Math.floor(grades.length / 2));
    const secondHalf = grades.slice(Math.floor(grades.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, g) => sum + g.grade, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, g) => sum + g.grade, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 2) {
        return { direction: '上升', icon: '/images/trend-up.svg' };
    } else if (difference < -2) {
        return { direction: '下降', icon: '/images/trend-down.svg' };
    } else {
        return { direction: '稳定', icon: '/images/trend-stable.svg' };
    }
}

// ==================== 响应式设计 ====================
function setupResponsiveDesign() {
    // 监听窗口大小变化
    wixWindow.viewportEnter('mobile', () => {
        adjustMobileLayout();
    });
    
    wixWindow.viewportEnter('tablet', () => {
        adjustTabletLayout();
    });
    
    wixWindow.viewportEnter('desktop', () => {
        adjustDesktopLayout();
    });
}

function adjustMobileLayout() {
    // 移动端布局调整
    $w('#statisticsContainer').style.gridTemplateColumns = '1fr';
    $w('#chartsContainer').style.gridTemplateColumns = '1fr';
    $w('#subjectStatsContainer').hide();
    $w('#mobileStatsToggle').show();
}

function adjustTabletLayout() {
    // 平板端布局调整
    $w('#statisticsContainer').style.gridTemplateColumns = 'repeat(2, 1fr)';
    $w('#chartsContainer').style.gridTemplateColumns = 'repeat(2, 1fr)';
    $w('#subjectStatsContainer').show();
    $w('#mobileStatsToggle').hide();
}

function adjustDesktopLayout() {
    // 桌面端布局调整
    $w('#statisticsContainer').style.gridTemplateColumns = 'repeat(4, 1fr)';
    $w('#chartsContainer').style.gridTemplateColumns = 'repeat(2, 1fr)';
    $w('#subjectStatsContainer').show();
    $w('#mobileStatsToggle').hide();
}

// ==================== 工具函数 ====================
function getDateRange(timeRange) {
    const now = new Date();
    const start = new Date();
    
    switch (timeRange) {
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            start.setMonth(now.getMonth() - 1);
    }
    
    return { start, end: now };
}

function formatStudyTime(minutes) {
    if (minutes < 60) {
        return `${minutes}分钟`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
}

function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch (format) {
        case 'MM/DD':
            return `${month}/${day}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return `${year}-${month}-${day}`;
    }
}

function generateLearningTips() {
    if (!userProgress) return [];
    
    const tips = [];
    const stats = userProgress.overall;
    
    // 基于进度生成建议
    if (stats.averageProgress < 50) {
        tips.push({
            type: 'progress',
            title: '提高学习进度',
            content: '建议制定每日学习计划，设定小目标逐步完成课程。',
            icon: '/images/tip-progress.svg'
        });
    }
    
    // 基于成绩生成建议
    if (stats.averageGrade < 75) {
        tips.push({
            type: 'grade',
            title: '提升学习效果',
            content: '尝试多做练习题，及时复习已学内容，寻求老师帮助。',
            icon: '/images/tip-grade.svg'
        });
    }
    
    // 基于学习时间生成建议
    if (stats.totalStudyTime < 300) { // 少于5小时
        tips.push({
            type: 'time',
            title: '增加学习时间',
            content: '建议每天至少学习30分钟，保持学习的连续性。',
            icon: '/images/tip-time.svg'
        });
    }
    
    return tips;
}

function showLoadingState(show) {
    if (show) {
        $w('#loadingContainer').show();
        $w('#mainContent').hide();
        isLoading = true;
    } else {
        $w('#loadingContainer').hide();
        $w('#mainContent').show();
        isLoading = false;
    }
}

function showMessage(message, type = 'info') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    $w('#messageText').text = message;
    $w('#messageContainer').style.backgroundColor = colors[type];
    $w('#messageContainer').show();
    
    // 3秒后自动隐藏
    setTimeout(() => {
        $w('#messageContainer').hide();
    }, 3000);
}

// ==================== 自动刷新机制 ====================
function setupAutoRefresh() {
    // 清除现有的定时器
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // 设置新的定时器
    refreshInterval = setInterval(async () => {
        if (!isLoading) {
            console.log('自动刷新进度数据');
            await loadProgressData();
        }
    }, CONFIG.REFRESH_INTERVAL);
}

// ==================== 数据库操作函数 ====================
async function generateProgressReport(reportData) {
    try {
        // 保存报告到数据库
        const report = await wixData.save('ProgressReports', {
            studentId: currentUser.id,
            reportData: reportData,
            generatedAt: new Date(),
            reportType: 'detailed'
        });
        
        return `/progress-report/${report._id}`;
        
    } catch (error) {
        console.error('保存进度报告失败:', error);
        throw error;
    }
}

// ==================== 页面清理 ====================
$w.onReady(() => {
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
});

// ==================== 分析和跟踪 ====================
function trackUserInteraction(action, details = {}) {
    try {
        // 记录用户交互用于分析
        wixData.save('UserInteractions', {
            userId: currentUser.id,
            page: 'student-progress',
            action: action,
            details: details,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('用户交互跟踪失败:', error);
    }
}

// 导出主要函数供其他模块使用
export {
    loadProgressData,
    updateProgressStatistics,
    generateProgressReport,
    refreshProgressData
};

/**
 * 使用说明：
 * 
 * 1. 页面结构要求：
 *    - 确保所有引用的元素ID在页面中存在
 *    - 设置正确的数据库集合和字段
 *    - 配置适当的权限和角色
 * 
 * 2. 数据库集合：
 *    - Students: 学生信息
 *    - StudentProgress: 学生进度记录
 *    - LearningGoals: 学习目标
 *    - ProgressReports: 进度报告
 *    - UserInteractions: 用户交互记录
 * 
 * 3. 自定义配置：
 *    - 修改 CONFIG 对象中的设置
 *    - 调整图表颜色和样式
 *    - 设置刷新间隔和阈值
 * 
 * 4. 扩展功能：
 *    - 添加更多图表类型
 *    - 实现更复杂的分析算法
 *    - 集成第三方分析工具
 * 
 * 5. 性能优化：
 *    - 实现数据缓存机制
 *    - 使用分页加载大量数据
 *    - 优化图表渲染性能
 */