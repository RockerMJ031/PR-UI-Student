/**
 * 学生管理系统后端服务器
 * 主要处理API请求、数据库操作、文件上传、通信服务等
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
require('dotenv').config();

// 导入服务
const AuthService = require('./auth/authService');
const DatabaseService = require('./database/dbService');
const FileService = require('./files/fileService');
const CommunicationService = require('./communication/communicationService');

class StudentSystemServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = process.env.PORT || 3001;
    
    // 初始化服务
    this.authService = new AuthService();
    this.dbService = new DatabaseService();
    this.fileService = new FileService();
    this.communicationService = new CommunicationService();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   */
  initializeMiddleware() {
    // 安全中间件
    this.app.use(helmet());
    
    // CORS配置
    this.app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:8001',
      credentials: true
    }));
    
    // 压缩响应
    this.app.use(compression());
    
    // 请求日志
    this.app.use(morgan('combined'));
    
    // 解析JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 限制每个IP 15分钟内最多100个请求
      message: '请求过于频繁，请稍后再试'
    });
    this.app.use('/api/', limiter);
    
    // 静态文件服务
    this.app.use('/uploads', express.static('uploads'));
  }

  /**
   * 初始化路由
   */
  initializeRoutes() {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // 认证路由
    this.app.post('/api/auth/register', this.handleRegister.bind(this));
    this.app.post('/api/auth/login', this.handleLogin.bind(this));
    this.app.post('/api/auth/logout', this.authenticateToken.bind(this), this.handleLogout.bind(this));
    this.app.post('/api/auth/change-password', this.authenticateToken.bind(this), this.handleChangePassword.bind(this));
    this.app.post('/api/auth/reset-password', this.handleResetPassword.bind(this));
    
    // 学生数据路由
    this.app.get('/api/students/profile', this.authenticateToken.bind(this), this.handleGetProfile.bind(this));
    this.app.put('/api/students/profile', this.authenticateToken.bind(this), this.handleUpdateProfile.bind(this));
    this.app.get('/api/students/dashboard', this.authenticateToken.bind(this), this.handleGetDashboard.bind(this));
    
    // 课程路由
    this.app.get('/api/courses', this.authenticateToken.bind(this), this.handleGetCourses.bind(this));
    this.app.get('/api/courses/:id', this.authenticateToken.bind(this), this.handleGetCourse.bind(this));
    
    // 作业路由
    this.app.get('/api/assignments', this.authenticateToken.bind(this), this.handleGetAssignments.bind(this));
    this.app.post('/api/assignments/:id/submit', this.authenticateToken.bind(this), this.handleSubmitAssignment.bind(this));
    
    // 文件上传路由
    this.app.post('/api/files/upload', this.authenticateToken.bind(this), this.handleFileUpload.bind(this));
    this.app.get('/api/files/:id/download', this.authenticateToken.bind(this), this.handleFileDownload.bind(this));
    this.app.delete('/api/files/:id', this.authenticateToken.bind(this), this.handleFileDelete.bind(this));
    
    // 支持票据路由
    this.app.get('/api/support/tickets', this.authenticateToken.bind(this), this.handleGetTickets.bind(this));
    this.app.post('/api/support/tickets', this.authenticateToken.bind(this), this.handleCreateTicket.bind(this));
    this.app.put('/api/support/tickets/:id', this.authenticateToken.bind(this), this.handleUpdateTicket.bind(this));
    
    // 心理健康路由
    this.app.get('/api/wellbeing/mood-entries', this.authenticateToken.bind(this), this.handleGetMoodEntries.bind(this));
    this.app.post('/api/wellbeing/mood-entries', this.authenticateToken.bind(this), this.handleCreateMoodEntry.bind(this));
    this.app.post('/api/wellbeing/assessments', this.authenticateToken.bind(this), this.handleCreateAssessment.bind(this));
    this.app.post('/api/wellbeing/emergency', this.authenticateToken.bind(this), this.handleEmergencyAlert.bind(this));
    
    // 通知路由
    this.app.get('/api/notifications', this.authenticateToken.bind(this), this.handleGetNotifications.bind(this));
    this.app.put('/api/notifications/:id/read', this.authenticateToken.bind(this), this.handleMarkNotificationRead.bind(this));
    
    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({ message: '接口不存在' });
    });
  }

  /**
   * 初始化错误处理
   */
  initializeErrorHandling() {
    this.app.use((error, req, res, next) => {
      console.error('服务器错误:', error);
      
      if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ message: '请求数据格式错误' });
      }
      
      if (error.type === 'entity.too.large') {
        return res.status(413).json({ message: '请求数据过大' });
      }
      
      res.status(500).json({ 
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }

  /**
   * JWT令牌验证中间件
   */
  async authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '访问令牌缺失' });
    }
    
    const result = await this.authService.verifyToken(token);
    
    if (!result.success) {
      return res.status(403).json({ message: result.message });
    }
    
    req.user = result.user;
    next();
  }

  // 认证处理器
  async handleRegister(req, res) {
    try {
      const result = await this.authService.register(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleLogin(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(result.success ? 200 : 401).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleLogout(req, res) {
    // 在实际应用中，这里可能需要将令牌加入黑名单
    res.json({ success: true, message: '登出成功' });
  }

  async handleChangePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(req.user.userId, oldPassword, newPassword);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleResetPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await this.authService.resetPassword(email);
      
      if (result.success) {
        // 发送重置邮件
        await this.communicationService.sendTemplateEmail('passwordReset', {
          email,
          resetLink: `${process.env.CLIENT_URL}/reset-password?token=${result.resetToken}`
        });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 学生数据处理器
  async handleGetProfile(req, res) {
    try {
      const result = await this.dbService.findOne('students', { userId: req.user.userId });
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleUpdateProfile(req, res) {
    try {
      const result = await this.dbService.update(
        'students', 
        { userId: req.user.userId }, 
        req.body
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleGetDashboard(req, res) {
    try {
      // 获取仪表盘数据
      const [courses, assignments, notifications, moodEntries] = await Promise.all([
        this.dbService.find('courses', { studentId: req.user.studentId }, { limit: 5 }),
        this.dbService.find('assignments', { studentId: req.user.studentId, status: 'pending' }, { limit: 5 }),
        this.dbService.find('notifications', { userId: req.user.userId, read: false }, { limit: 5 }),
        this.dbService.find('moodEntries', { userId: req.user.userId }, { limit: 7, sort: { createdAt: -1 } })
      ]);
      
      res.json({
        success: true,
        data: {
          courses: courses.data,
          assignments: assignments.data,
          notifications: notifications.data,
          moodEntries: moodEntries.data
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 文件处理器
  async handleFileUpload(req, res) {
    try {
      const upload = this.fileService.getMulterConfig('general').single('file');
      
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        
        if (!req.file) {
          return res.status(400).json({ success: false, message: '没有文件上传' });
        }
        
        const result = await this.fileService.uploadFile(req.file, req.user.userId);
        res.json(result);
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 紧急警报处理器
  async handleEmergencyAlert(req, res) {
    try {
      const { message, location } = req.body;
      
      // 保存紧急记录
      const emergencyRecord = await this.dbService.create('emergencyAlerts', {
        userId: req.user.userId,
        message,
        location,
        timestamp: new Date(),
        status: 'active'
      });
      
      // 发送紧急通知给管理员
      await this.communicationService.sendTemplateEmail('emergencyAlert', {
        email: process.env.EMERGENCY_EMAIL,
        studentName: req.user.firstName + ' ' + req.user.lastName,
        timestamp: new Date().toLocaleString()
      });
      
      res.json({ success: true, message: '紧急警报已发送' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 其他处理器方法...
  async handleGetCourses(req, res) {
    try {
      const result = await this.dbService.find('courses', { studentId: req.user.studentId });
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleGetAssignments(req, res) {
    try {
      const result = await this.dbService.find('assignments', { studentId: req.user.studentId });
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleCreateMoodEntry(req, res) {
    try {
      const moodData = {
        ...req.body,
        userId: req.user.userId,
        createdAt: new Date()
      };
      
      const result = await this.dbService.create('moodEntries', moodData);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * 启动服务器
   */
  async start() {
    try {
      // 连接数据库
      const dbConnected = await this.dbService.connect();
      if (!dbConnected) {
        throw new Error('数据库连接失败');
      }
      
      // 创建HTTP服务器
      this.server = http.createServer(this.app);
      
      // 初始化Socket.IO
      this.communicationService.initializeSocketIO(this.server);
      
      // 启动服务器
      this.server.listen(this.port, () => {
        console.log(`服务器运行在端口 ${this.port}`);
        console.log(`健康检查: http://localhost:${this.port}/health`);
      });
      
    } catch (error) {
      console.error('服务器启动失败:', error);
      process.exit(1);
    }
  }

  /**
   * 停止服务器
   */
  async stop() {
    try {
      if (this.server) {
        this.server.close();
      }
      
      await this.dbService.disconnect();
      await this.communicationService.close();
      
      console.log('服务器已停止');
    } catch (error) {
      console.error('停止服务器时出错:', error);
    }
  }
}

// 启动服务器
if (require.main === module) {
  const server = new StudentSystemServer();
  server.start();
  
  // 优雅关闭
  process.on('SIGTERM', () => server.stop());
  process.on('SIGINT', () => server.stop());
}

module.exports = StudentSystemServer;