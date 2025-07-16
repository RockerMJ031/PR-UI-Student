/**
 * 通信服务
 * 处理邮件发送、短信通知、实时聊天、推送通知等通信功能
 */

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const socketIo = require('socket.io');
const webpush = require('web-push');

class CommunicationService {
  constructor() {
    this.emailTransporter = null;
    this.twilioClient = null;
    this.io = null;
    this.activeConnections = new Map();
    
    this.initializeServices();
  }

  /**
   * 初始化通信服务
   */
  async initializeServices() {
    await this.initializeEmail();
    await this.initializeSMS();
    await this.initializePushNotifications();
  }

  /**
   * 初始化邮件服务
   */
  async initializeEmail() {
    try {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // 验证邮件配置
      await this.emailTransporter.verify();
      console.log('邮件服务初始化成功');
    } catch (error) {
      console.error('邮件服务初始化失败:', error);
    }
  }

  /**
   * 初始化短信服务
   */
  async initializeSMS() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('短信服务初始化成功');
      }
    } catch (error) {
      console.error('短信服务初始化失败:', error);
    }
  }

  /**
   * 初始化推送通知服务
   */
  async initializePushNotifications() {
    try {
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:admin@yoursite.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        console.log('推送通知服务初始化成功');
      }
    } catch (error) {
      console.error('推送通知服务初始化失败:', error);
    }
  }

  /**
   * 初始化Socket.IO
   * @param {Object} server - HTTP服务器实例
   */
  initializeSocketIO(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('用户连接:', socket.id);
      
      // 用户加入房间
      socket.on('join-room', (data) => {
        const { userId, roomId } = data;
        socket.join(roomId);
        this.activeConnections.set(socket.id, { userId, roomId });
        console.log(`用户 ${userId} 加入房间 ${roomId}`);
      });

      // 处理聊天消息
      socket.on('chat-message', async (data) => {
        const { roomId, message, userId } = data;
        
        // 保存消息到数据库
        const savedMessage = await this.saveChatMessage({
          roomId,
          userId,
          message,
          timestamp: new Date()
        });

        // 广播消息到房间内所有用户
        this.io.to(roomId).emit('new-message', savedMessage);
      });

      // 处理断开连接
      socket.on('disconnect', () => {
        const connection = this.activeConnections.get(socket.id);
        if (connection) {
          console.log(`用户 ${connection.userId} 断开连接`);
          this.activeConnections.delete(socket.id);
        }
      });
    });
  }

  /**
   * 发送邮件
   * @param {Object} emailData - 邮件数据
   * @returns {Object} 发送结果
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, text, html, attachments } = emailData;
      
      if (!this.emailTransporter) {
        throw new Error('邮件服务未初始化');
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
        attachments
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        message: '邮件发送成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 发送模板邮件
   * @param {string} template - 模板名称
   * @param {Object} data - 模板数据
   * @returns {Object} 发送结果
   */
  async sendTemplateEmail(template, data) {
    try {
      const templates = {
        welcome: {
          subject: '欢迎加入学生管理系统',
          html: `
            <h2>欢迎，${data.firstName}！</h2>
            <p>您的账户已成功创建。</p>
            <p>学号：${data.studentId}</p>
            <p>请使用您的邮箱和密码登录系统。</p>
          `
        },
        passwordReset: {
          subject: '密码重置请求',
          html: `
            <h2>密码重置</h2>
            <p>您请求重置密码。</p>
            <p>请点击以下链接重置密码：</p>
            <a href="${data.resetLink}">重置密码</a>
            <p>此链接将在1小时后过期。</p>
          `
        },
        appointmentReminder: {
          subject: '预约提醒',
          html: `
            <h2>预约提醒</h2>
            <p>您有一个即将到来的预约：</p>
            <p>时间：${data.appointmentTime}</p>
            <p>地点：${data.location}</p>
            <p>请准时参加。</p>
          `
        },
        emergencyAlert: {
          subject: '紧急警报',
          html: `
            <h2>紧急警报</h2>
            <p>学生 ${data.studentName} 触发了紧急支持请求。</p>
            <p>时间：${data.timestamp}</p>
            <p>请立即处理。</p>
          `
        }
      };

      const templateConfig = templates[template];
      if (!templateConfig) {
        throw new Error(`未找到模板: ${template}`);
      }

      return await this.sendEmail({
        to: data.email,
        subject: templateConfig.subject,
        html: templateConfig.html
      });
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 发送短信
   * @param {Object} smsData - 短信数据
   * @returns {Object} 发送结果
   */
  async sendSMS(smsData) {
    try {
      const { to, message } = smsData;
      
      if (!this.twilioClient) {
        throw new Error('短信服务未初始化');
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      return {
        success: true,
        sid: result.sid,
        message: '短信发送成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 发送推送通知
   * @param {Object} pushData - 推送数据
   * @returns {Object} 发送结果
   */
  async sendPushNotification(pushData) {
    try {
      const { subscription, payload } = pushData;
      
      if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        throw new Error('推送通知服务未配置');
      }
      
      const result = await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );

      return {
        success: true,
        message: '推送通知发送成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 发送实时消息
   * @param {string} roomId - 房间ID
   * @param {Object} message - 消息内容
   */
  sendRealTimeMessage(roomId, message) {
    if (this.io) {
      this.io.to(roomId).emit('new-message', message);
    }
  }

  /**
   * 保存聊天消息
   * @param {Object} messageData - 消息数据
   * @returns {Object} 保存的消息
   */
  async saveChatMessage(messageData) {
    try {
      // 这里应该保存到数据库
      // const savedMessage = await ChatMessage.create(messageData);
      
      // 临时返回消息数据
      return {
        id: Date.now().toString(),
        ...messageData
      };
    } catch (error) {
      console.error('保存聊天消息失败:', error);
      return null;
    }
  }

  /**
   * 获取聊天历史
   * @param {string} roomId - 房间ID
   * @param {number} limit - 消息数量限制
   * @returns {Array} 聊天历史
   */
  async getChatHistory(roomId, limit = 50) {
    try {
      // 这里应该从数据库查询
      // const messages = await ChatMessage.find({ roomId })
      //   .sort({ timestamp: -1 })
      //   .limit(limit);
      
      // 临时返回空数组
      return [];
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      return [];
    }
  }

  /**
   * 批量发送通知
   * @param {Array} recipients - 接收者列表
   * @param {Object} notification - 通知内容
   * @param {string} type - 通知类型 (email, sms, push)
   * @returns {Object} 发送结果
   */
  async sendBulkNotification(recipients, notification, type = 'email') {
    const results = {
      success: [],
      failed: []
    };

    for (const recipient of recipients) {
      try {
        let result;
        
        switch (type) {
          case 'email':
            result = await this.sendEmail({
              to: recipient.email,
              ...notification
            });
            break;
          case 'sms':
            result = await this.sendSMS({
              to: recipient.phone,
              message: notification.message
            });
            break;
          case 'push':
            result = await this.sendPushNotification({
              subscription: recipient.pushSubscription,
              payload: notification
            });
            break;
          default:
            throw new Error(`不支持的通知类型: ${type}`);
        }

        if (result.success) {
          results.success.push(recipient);
        } else {
          results.failed.push({ recipient, error: result.message });
        }
      } catch (error) {
        results.failed.push({ recipient, error: error.message });
      }
    }

    return {
      success: results.failed.length === 0,
      successCount: results.success.length,
      failedCount: results.failed.length,
      details: results
    };
  }

  /**
   * 获取在线用户列表
   * @param {string} roomId - 房间ID
   * @returns {Array} 在线用户列表
   */
  getOnlineUsers(roomId) {
    const onlineUsers = [];
    
    for (const [socketId, connection] of this.activeConnections) {
      if (connection.roomId === roomId) {
        onlineUsers.push(connection.userId);
      }
    }
    
    return [...new Set(onlineUsers)]; // 去重
  }

  /**
   * 关闭通信服务
   */
  async close() {
    if (this.emailTransporter) {
      this.emailTransporter.close();
    }
    
    if (this.io) {
      this.io.close();
    }
    
    this.activeConnections.clear();
  }
}

module.exports = CommunicationService;