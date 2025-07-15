/**
 * 文件处理服务
 * 处理文件上传、下载、验证、存储等功能
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');

class FileService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedTypes = {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      archives: ['application/zip', 'application/x-rar-compressed'],
      videos: ['video/mp4', 'video/avi', 'video/mov']
    };
    
    this.initializeUploadDir();
  }

  /**
   * 初始化上传目录
   */
  async initializeUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 配置multer中间件
   * @param {string} category - 文件类别
   * @returns {Object} multer配置
   */
  getMulterConfig(category = 'general') {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const categoryDir = path.join(this.uploadDir, category);
        try {
          await fs.access(categoryDir);
        } catch (error) {
          await fs.mkdir(categoryDir, { recursive: true });
        }
        cb(null, categoryDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        if (this.isFileTypeAllowed(file.mimetype, category)) {
          cb(null, true);
        } else {
          cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
        }
      }
    });
  }

  /**
   * 检查文件类型是否允许
   * @param {string} mimetype - 文件MIME类型
   * @param {string} category - 文件类别
   * @returns {boolean} 是否允许
   */
  isFileTypeAllowed(mimetype, category) {
    if (category === 'general') {
      return Object.values(this.allowedTypes).flat().includes(mimetype);
    }
    
    return this.allowedTypes[category]?.includes(mimetype) || false;
  }

  /**
   * 上传单个文件
   * @param {Object} file - 文件对象
   * @param {string} userId - 用户ID
   * @param {string} category - 文件类别
   * @returns {Object} 上传结果
   */
  async uploadFile(file, userId, category = 'general') {
    try {
      // 验证文件
      const validation = await this.validateFile(file);
      if (!validation.success) {
        return validation;
      }

      // 生成文件信息
      const fileInfo = {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        category,
        userId,
        uploadedAt: new Date(),
        hash: await this.generateFileHash(file.path)
      };

      // 如果是图片，生成缩略图
      if (this.allowedTypes.images.includes(file.mimetype)) {
        fileInfo.thumbnail = await this.generateThumbnail(file.path);
      }

      return {
        success: true,
        data: fileInfo
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 上传多个文件
   * @param {Array} files - 文件数组
   * @param {string} userId - 用户ID
   * @param {string} category - 文件类别
   * @returns {Object} 上传结果
   */
  async uploadMultipleFiles(files, userId, category = 'general') {
    const results = [];
    const errors = [];

    for (const file of files) {
      const result = await this.uploadFile(file, userId, category);
      if (result.success) {
        results.push(result.data);
      } else {
        errors.push({
          filename: file.originalname,
          error: result.message
        });
      }
    }

    return {
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 验证文件
   * @param {Object} file - 文件对象
   * @returns {Object} 验证结果
   */
  async validateFile(file) {
    try {
      // 检查文件大小
      if (file.size > this.maxFileSize) {
        return {
          success: false,
          message: `文件大小超过限制 (${this.maxFileSize / 1024 / 1024}MB)`
        };
      }

      // 检查文件是否存在
      try {
        await fs.access(file.path);
      } catch (error) {
        return {
          success: false,
          message: '文件不存在'
        };
      }

      // 病毒扫描（简单示例，实际应用中应使用专业的反病毒软件）
      const virusScan = await this.scanForVirus(file.path);
      if (!virusScan.success) {
        return virusScan;
      }

      return {
        success: true,
        message: '文件验证通过'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 生成文件哈希值
   * @param {string} filePath - 文件路径
   * @returns {string} 哈希值
   */
  async generateFileHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * 生成图片缩略图
   * @param {string} imagePath - 图片路径
   * @returns {string} 缩略图路径
   */
  async generateThumbnail(imagePath) {
    try {
      const ext = path.extname(imagePath);
      const thumbnailPath = imagePath.replace(ext, '_thumb' + ext);
      
      await sharp(imagePath)
        .resize(200, 200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      return thumbnailPath;
    } catch (error) {
      console.error('生成缩略图失败:', error);
      return null;
    }
  }

  /**
   * 下载文件
   * @param {string} fileId - 文件ID
   * @param {string} userId - 用户ID
   * @returns {Object} 下载结果
   */
  async downloadFile(fileId, userId) {
    try {
      // 这里应该从数据库获取文件信息
      // const fileInfo = await this.getFileInfo(fileId);
      
      // 验证用户权限
      // if (!this.hasDownloadPermission(fileInfo, userId)) {
      //   return {
      //     success: false,
      //     message: '没有下载权限'
      //   };
      // }

      // 检查文件是否存在
      // await fs.access(fileInfo.path);

      return {
        success: true,
        // data: fileInfo
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 删除文件
   * @param {string} filePath - 文件路径
   * @returns {Object} 删除结果
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      
      // 如果有缩略图，也删除缩略图
      const ext = path.extname(filePath);
      const thumbnailPath = filePath.replace(ext, '_thumb' + ext);
      
      try {
        await fs.access(thumbnailPath);
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // 缩略图不存在，忽略错误
      }

      return {
        success: true,
        message: '文件删除成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 简单的病毒扫描（示例）
   * @param {string} filePath - 文件路径
   * @returns {Object} 扫描结果
   */
  async scanForVirus(filePath) {
    try {
      // 这里应该集成专业的反病毒引擎
      // 目前只是一个简单的示例
      
      const fileBuffer = await fs.readFile(filePath);
      const content = fileBuffer.toString('utf8', 0, Math.min(1000, fileBuffer.length));
      
      // 检查一些简单的恶意模式
      const maliciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload=/gi,
        /onerror=/gi
      ];
      
      for (const pattern of maliciousPatterns) {
        if (pattern.test(content)) {
          return {
            success: false,
            message: '检测到潜在的恶意内容'
          };
        }
      }
      
      return {
        success: true,
        message: '文件安全'
      };
    } catch (error) {
      return {
        success: true,
        message: '无法扫描文件，但允许上传'
      };
    }
  }

  /**
   * 获取文件信息
   * @param {string} filePath - 文件路径
   * @returns {Object} 文件信息
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath);
      const basename = path.basename(filePath, ext);
      
      return {
        success: true,
        data: {
          path: filePath,
          name: basename,
          extension: ext,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
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
   * 清理过期文件
   * @param {number} days - 保留天数
   * @returns {Object} 清理结果
   */
  async cleanupOldFiles(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const files = await this.getFilesOlderThan(cutoffDate);
      let deletedCount = 0;
      
      for (const file of files) {
        const result = await this.deleteFile(file.path);
        if (result.success) {
          deletedCount++;
        }
      }
      
      return {
        success: true,
        message: `清理了 ${deletedCount} 个过期文件`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 获取指定日期之前的文件
   * @param {Date} cutoffDate - 截止日期
   * @returns {Array} 文件列表
   */
  async getFilesOlderThan(cutoffDate) {
    // 这里应该从数据库查询
    // 目前返回空数组作为示例
    return [];
  }
}

module.exports = FileService;