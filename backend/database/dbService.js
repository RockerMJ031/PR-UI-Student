/**
 * 数据库操作服务
 * 提供统一的数据库操作接口，包括CRUD操作、事务处理等
 */

const mongoose = require('mongoose');
const { 
  Student, 
  Course, 
  Assignment, 
  Notification, 
  AttendanceRecord,
  SupportTicket,
  MoodEntry,
  Assessment,
  MeditationSession,
  CounselingAppointment
} = require('./models');

class DatabaseService {
  constructor() {
    this.connection = null;
  }

  /**
   * 连接数据库
   */
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_system';
      
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('数据库连接成功');
      return true;
    } catch (error) {
      console.error('数据库连接失败:', error);
      return false;
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('数据库连接已断开');
    } catch (error) {
      console.error('断开数据库连接时出错:', error);
    }
  }

  /**
   * 通用查询方法
   * @param {string} collection - 集合名称
   * @param {Object} query - 查询条件
   * @param {Object} options - 查询选项
   * @returns {Array} 查询结果
   */
  async find(collection, query = {}, options = {}) {
    try {
      const Model = this.getModel(collection);
      let queryBuilder = Model.find(query);
      
      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }
      
      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }
      
      if (options.skip) {
        queryBuilder = queryBuilder.skip(options.skip);
      }
      
      if (options.populate) {
        queryBuilder = queryBuilder.populate(options.populate);
      }
      
      const results = await queryBuilder.exec();
      return {
        success: true,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 通用单条查询方法
   * @param {string} collection - 集合名称
   * @param {Object} query - 查询条件
   * @param {Object} options - 查询选项
   * @returns {Object} 查询结果
   */
  async findOne(collection, query, options = {}) {
    try {
      const Model = this.getModel(collection);
      let queryBuilder = Model.findOne(query);
      
      if (options.populate) {
        queryBuilder = queryBuilder.populate(options.populate);
      }
      
      const result = await queryBuilder.exec();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 通用创建方法
   * @param {string} collection - 集合名称
   * @param {Object} data - 要创建的数据
   * @returns {Object} 创建结果
   */
  async create(collection, data) {
    try {
      const Model = this.getModel(collection);
      const document = new Model(data);
      const result = await document.save();
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 通用更新方法
   * @param {string} collection - 集合名称
   * @param {Object} query - 查询条件
   * @param {Object} update - 更新数据
   * @param {Object} options - 更新选项
   * @returns {Object} 更新结果
   */
  async update(collection, query, update, options = {}) {
    try {
      const Model = this.getModel(collection);
      const defaultOptions = { new: true, runValidators: true };
      const mergedOptions = { ...defaultOptions, ...options };
      
      const result = await Model.findOneAndUpdate(query, update, mergedOptions);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 通用删除方法
   * @param {string} collection - 集合名称
   * @param {Object} query - 查询条件
   * @returns {Object} 删除结果
   */
  async delete(collection, query) {
    try {
      const Model = this.getModel(collection);
      const result = await Model.findOneAndDelete(query);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 批量操作
   * @param {string} collection - 集合名称
   * @param {Array} operations - 操作数组
   * @returns {Object} 操作结果
   */
  async bulkWrite(collection, operations) {
    try {
      const Model = this.getModel(collection);
      const result = await Model.bulkWrite(operations);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 聚合查询
   * @param {string} collection - 集合名称
   * @param {Array} pipeline - 聚合管道
   * @returns {Object} 聚合结果
   */
  async aggregate(collection, pipeline) {
    try {
      const Model = this.getModel(collection);
      const result = await Model.aggregate(pipeline);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 事务处理
   * @param {Function} operations - 事务操作函数
   * @returns {Object} 事务结果
   */
  async transaction(operations) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const result = await operations(session);
      
      await session.commitTransaction();
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      await session.abortTransaction();
      
      return {
        success: false,
        message: error.message
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * 获取模型
   * @param {string} collection - 集合名称
   * @returns {Object} Mongoose模型
   */
  getModel(collection) {
    const models = {
      'students': Student,
      'courses': Course,
      'assignments': Assignment,
      'notifications': Notification,
      'attendanceRecords': AttendanceRecord,
      'supportTickets': SupportTicket,
      'moodEntries': MoodEntry,
      'assessments': Assessment,
      'meditationSessions': MeditationSession,
      'counselingAppointments': CounselingAppointment
    };
    
    const model = models[collection];
    if (!model) {
      throw new Error(`未找到集合模型: ${collection}`);
    }
    
    return model;
  }

  /**
   * 数据验证
   * @param {string} collection - 集合名称
   * @param {Object} data - 要验证的数据
   * @returns {Object} 验证结果
   */
  async validateData(collection, data) {
    try {
      const Model = this.getModel(collection);
      const document = new Model(data);
      await document.validate();
      
      return {
        success: true,
        message: '数据验证通过'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  }

  /**
   * 获取集合统计信息
   * @param {string} collection - 集合名称
   * @returns {Object} 统计信息
   */
  async getStats(collection) {
    try {
      const Model = this.getModel(collection);
      const count = await Model.countDocuments();
      const stats = await Model.collection.stats();
      
      return {
        success: true,
        data: {
          documentCount: count,
          storageSize: stats.storageSize,
          avgObjSize: stats.avgObjSize,
          indexCount: stats.nindexes
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = DatabaseService;