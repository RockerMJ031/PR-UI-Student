/**
 * 用户认证服务
 * 处理用户登录、注册、会话管理等认证相关功能
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../database/models');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.saltRounds = 12;
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Object} 注册结果
   */
  async register(userData) {
    try {
      const { email, password, studentId, firstName, lastName } = userData;
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ 
        $or: [{ email }, { studentId }] 
      });
      
      if (existingUser) {
        throw new Error('用户已存在');
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      
      // 创建新用户
      const newUser = new User({
        email,
        password: hashedPassword,
        studentId,
        firstName,
        lastName,
        createdAt: new Date(),
        isActive: true
      });

      await newUser.save();
      
      return {
        success: true,
        message: '注册成功',
        userId: newUser._id
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 用户登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Object} 登录结果
   */
  async login(email, password) {
    try {
      // 查找用户
      const user = await User.findOne({ email, isActive: true });
      
      if (!user) {
        throw new Error('用户不存在或已被禁用');
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('密码错误');
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          studentId: user.studentId 
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // 更新最后登录时间
      await User.updateOne(
        { _id: user._id },
        { lastLoginAt: new Date() }
      );

      return {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          studentId: user.studentId,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 验证JWT令牌
   * @param {string} token - JWT令牌
   * @returns {Object} 验证结果
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // 检查用户是否仍然有效
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('用户无效');
      }

      return {
        success: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        message: '令牌无效'
      };
    }
  }

  /**
   * 修改密码
   * @param {string} userId - 用户ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Object} 修改结果
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证旧密码
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      
      if (!isOldPasswordValid) {
        throw new Error('旧密码错误');
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);
      
      // 更新密码
      await User.updateOne(
        { _id: userId },
        { 
          password: hashedNewPassword,
          passwordChangedAt: new Date()
        }
      );

      return {
        success: true,
        message: '密码修改成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 重置密码
   * @param {string} email - 邮箱
   * @returns {Object} 重置结果
   */
  async resetPassword(email) {
    try {
      const user = await User.findOne({ email, isActive: true });
      
      if (!user) {
        throw new Error('用户不存在');
      }

      // 生成重置令牌
      const resetToken = jwt.sign(
        { userId: user._id, type: 'password-reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // 保存重置令牌到数据库
      await User.updateOne(
        { _id: user._id },
        { 
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000) // 1小时后过期
        }
      );

      return {
        success: true,
        resetToken,
        message: '重置令牌已生成'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = AuthService;