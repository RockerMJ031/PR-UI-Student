# CMS 数据库配置补充指南

本文档是对现有 `CMS_数据库配置指南.md` 的补充，主要添加学生端专用功能和安全合规所需的数据库集合。

## 补充集合概览

### 学生端专用集合
- [Assignments](#assignments-集合) - 作业管理
- [Resources](#resources-集合) - 学习资源
- [SafeguardingIncidents](#safeguardingincidents-集合) - 安全事件记录
- [WellbeingData](#wellbeingdata-集合) - 心理健康数据
- [StudentSchedule](#studentschedule-集合) - 学生个人日程

### 通信系统集合
- [ChatMessages](#chatmessages-集合) - 实时聊天消息
- [EmailLogs](#emaillogs-集合) - 邮件发送日志
- [PushNotifications](#pushnotifications-集合) - 推送通知记录

### 文件管理集合
- [FileUploads](#fileuploads-集合) - 文件上传记录

### 安全合规集合
- [SecurityEvents](#securityevents-集合) - 安全事件记录
- [DataProcessingLogs](#dataprocessinglogs-集合) - 数据处理日志
- [Permissions](#permissions-集合) - 细粒度权限管理

---

## 学生端专用集合

### Assignments 集合
**使用页面**: 学生作业页面、导师仪表盘  
**代码调用**: `wixData.query('Assignments')`

```javascript
{
  _id: "string",
  assignmentId: "string", // 作业编号
  title: "string", // 作业标题
  description: "text", // 作业描述
  courseId: "string", // 关联Courses
  mentorId: "string", // 关联Mentors
  studentId: "string", // 关联Students（个人作业）
  students: ["string"], // 关联Students（小组作业）
  subjectId: "string", // 关联Subjects
  assignmentType: "string", // individual, group, project, quiz, essay
  difficulty: "string", // easy, medium, hard
  maxScore: "number", // 满分
  passingScore: "number", // 及格分
  dueDate: "datetime", // 截止时间
  assignedDate: "datetime", // 分配时间
  estimatedTime: "number", // 预计完成时间（分钟）
  instructions: "text", // 作业说明
  materials: ["string"], // 参考材料URL
  attachments: ["string"], // 附件URL
  submissionFormat: "string", // file, text, link, video
  allowLateSubmission: "boolean", // 是否允许迟交
  latePenalty: "number", // 迟交扣分百分比
  status: "string", // draft, assigned, in_progress, submitted, graded
  isVisible: "boolean", // 是否对学生可见
  rubric: "text", // JSON格式的评分标准
  tags: ["string"], // 标签
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### AssignmentSubmissions 集合
**使用页面**: 学生作业页面、导师评分页面  
**代码调用**: `wixData.query('AssignmentSubmissions')`

```javascript
{
  _id: "string",
  submissionId: "string", // 提交编号
  assignmentId: "string", // 关联Assignments
  studentId: "string", // 关联Students
  submissionDate: "datetime", // 提交时间
  isLate: "boolean", // 是否迟交
  submissionType: "string", // file, text, link, video
  content: "text", // 文本内容
  fileUrls: ["string"], // 文件URL列表
  links: ["string"], // 链接列表
  wordCount: "number", // 字数统计
  timeSpent: "number", // 花费时间（分钟）
  status: "string", // submitted, under_review, graded, returned
  score: "number", // 得分
  feedback: "text", // 反馈
  gradedBy: "string", // 评分人ID
  gradedDate: "datetime", // 评分时间
  rubricScores: "text", // JSON格式的详细评分
  plagiarismScore: "number", // 查重分数
  version: "number", // 版本号（支持重新提交）
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### Resources 集合
**使用页面**: 学生资源页面、导师资源管理  
**代码调用**: `wixData.query('Resources')`

```javascript
{
  _id: "string",
  resourceId: "string", // 资源编号
  title: "string", // 资源标题
  description: "text", // 资源描述
  category: "string", // textbook, video, article, tool, website, document
  subjectId: "string", // 关联Subjects
  level: "string", // beginner, intermediate, advanced
  resourceType: "string", // internal, external, purchased, free
  url: "string", // 资源链接
  fileUrl: "string", // 文件URL（内部资源）
  thumbnailUrl: "string", // 缩略图URL
  author: "string", // 作者
  publisher: "string", // 出版商
  publishDate: "date", // 发布日期
  language: "string", // 语言
  duration: "number", // 时长（分钟，适用于视频）
  pageCount: "number", // 页数（适用于文档）
  fileSize: "number", // 文件大小（字节）
  accessLevel: "string", // public, student, mentor, premium
  cost: "number", // 费用
  rating: "number", // 评分 1-5
  downloadCount: "number", // 下载次数
  viewCount: "number", // 查看次数
  isActive: "boolean", // 是否激活
  tags: ["string"], // 标签
  uploadedBy: "string", // 上传者ID
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### SafeguardingIncidents 集合
**使用页面**: 学生安全保护页面、管理员面板  
**代码调用**: `wixData.query('SafeguardingIncidents')`

```javascript
{
  _id: "string",
  incidentId: "string", // 事件编号
  studentId: "string", // 关联Students
  reportedBy: "string", // 报告人ID
  incidentType: "string", // bullying, harassment, safety_concern, welfare_issue, online_safety
  severity: "string", // low, medium, high, critical
  status: "string", // reported, investigating, resolved, escalated
  incidentDate: "datetime", // 事件发生时间
  reportedDate: "datetime", // 报告时间
  location: "string", // 事件地点
  description: "text", // 事件描述
  witnesses: ["string"], // 目击者ID列表
  evidenceUrls: ["string"], // 证据文件URL
  actionsTaken: "text", // 已采取的行动
  followUpRequired: "boolean", // 是否需要跟进
  followUpDate: "datetime", // 跟进日期
  assignedTo: "string", // 负责人ID
  parentNotified: "boolean", // 是否已通知家长
  parentNotificationDate: "datetime", // 家长通知时间
  externalAgencies: ["string"], // 涉及的外部机构
  resolution: "text", // 解决方案
  resolvedDate: "datetime", // 解决时间
  isConfidential: "boolean", // 是否机密
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### WellbeingData 集合
**使用页面**: 学生心理健康页面、导师关怀面板  
**代码调用**: `wixData.query('WellbeingData')`

```javascript
{
  _id: "string",
  wellbeingId: "string", // 记录编号
  studentId: "string", // 关联Students
  recordDate: "date", // 记录日期
  moodRating: "number", // 情绪评分 1-10
  stressLevel: "number", // 压力水平 1-10
  sleepHours: "number", // 睡眠时间
  sleepQuality: "number", // 睡眠质量 1-5
  exerciseMinutes: "number", // 运动时间（分钟）
  socialInteraction: "number", // 社交互动评分 1-5
  academicStress: "number", // 学业压力 1-10
  familySupport: "number", // 家庭支持 1-5
  friendSupport: "number", // 朋友支持 1-5
  teacherSupport: "number", // 老师支持 1-5
  concerns: ["string"], // 关注点列表
  goals: ["string"], // 目标列表
  achievements: ["string"], // 成就列表
  notes: "text", // 备注
  assessmentType: "string", // daily, weekly, monthly, assessment
  assessmentScore: "number", // 评估总分
  riskLevel: "string", // low, medium, high
  interventionRequired: "boolean", // 是否需要干预
  counselorNotes: "text", // 咨询师备注
  parentAware: "boolean", // 家长是否知情
  followUpDate: "date", // 跟进日期
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### StudentSchedule 集合
**使用页面**: 学生日程页面、导师日程管理  
**代码调用**: `wixData.query('StudentSchedule')`

```javascript
{
  _id: "string",
  scheduleId: "string", // 日程编号
  studentId: "string", // 关联Students
  title: "string", // 事件标题
  description: "text", // 事件描述
  eventType: "string", // session, assignment, exam, meeting, personal, reminder
  startTime: "datetime", // 开始时间
  endTime: "datetime", // 结束时间
  isAllDay: "boolean", // 是否全天事件
  location: "string", // 地点
  meetingLink: "string", // 会议链接
  relatedId: "string", // 关联的实体ID（如sessionId, assignmentId）
  relatedType: "string", // 关联实体类型
  priority: "string", // low, normal, high, urgent
  status: "string", // scheduled, in_progress, completed, cancelled
  reminder: "number", // 提醒时间（分钟前）
  reminderSent: "boolean", // 是否已发送提醒
  isRecurring: "boolean", // 是否重复事件
  recurringPattern: "text", // JSON格式的重复模式
  attendees: ["string"], // 参与者ID列表
  createdBy: "string", // 创建者ID
  isVisible: "boolean", // 是否可见
  color: "string", // 显示颜色
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

---

## 通信系统集合

### ChatMessages 集合
**使用页面**: 实时聊天功能、学生支持页面  
**代码调用**: `wixData.query('ChatMessages')`

```javascript
{
  _id: "string",
  messageId: "string", // 消息编号
  conversationId: "string", // 会话ID
  senderId: "string", // 发送者ID
  receiverId: "string", // 接收者ID（私聊）
  receiverIds: ["string"], // 接收者ID列表（群聊）
  messageType: "string", // text, image, file, audio, video, system
  content: "text", // 消息内容
  fileUrl: "string", // 文件URL
  fileName: "string", // 文件名
  fileSize: "number", // 文件大小
  thumbnailUrl: "string", // 缩略图URL
  isRead: "boolean", // 是否已读
  readDate: "datetime", // 阅读时间
  isDelivered: "boolean", // 是否已送达
  deliveredDate: "datetime", // 送达时间
  isEdited: "boolean", // 是否已编辑
  editedDate: "datetime", // 编辑时间
  originalContent: "text", // 原始内容（编辑前）
  isDeleted: "boolean", // 是否已删除
  deletedDate: "datetime", // 删除时间
  replyToMessageId: "string", // 回复的消息ID
  priority: "string", // normal, high, urgent
  metadata: "text", // JSON格式的额外信息
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### EmailLogs 集合
**使用页面**: 系统管理、通信记录  
**代码调用**: `wixData.query('EmailLogs')`

```javascript
{
  _id: "string",
  emailId: "string", // 邮件编号
  fromEmail: "string", // 发送者邮箱
  toEmails: ["string"], // 接收者邮箱列表
  ccEmails: ["string"], // 抄送邮箱列表
  bccEmails: ["string"], // 密送邮箱列表
  subject: "string", // 邮件主题
  content: "text", // 邮件内容
  htmlContent: "text", // HTML格式内容
  attachments: [{
    fileName: "string",
    fileUrl: "string",
    fileSize: "number"
  }],
  emailType: "string", // welcome, notification, reminder, report, marketing
  templateId: "string", // 模板ID
  status: "string", // queued, sent, delivered, failed, bounced
  sentDate: "datetime", // 发送时间
  deliveredDate: "datetime", // 送达时间
  openedDate: "datetime", // 打开时间
  clickedDate: "datetime", // 点击时间
  bounceReason: "string", // 退信原因
  errorMessage: "string", // 错误信息
  provider: "string", // 邮件服务提供商
  messageId: "string", // 服务商消息ID
  priority: "string", // low, normal, high
  retryCount: "number", // 重试次数
  userId: "string", // 关联用户ID
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### PushNotifications 集合
**使用页面**: 移动端推送、通知管理  
**代码调用**: `wixData.query('PushNotifications')`

```javascript
{
  _id: "string",
  notificationId: "string", // 通知编号
  userId: "string", // 关联Users
  deviceToken: "string", // 设备令牌
  platform: "string", // ios, android, web
  title: "string", // 通知标题
  body: "string", // 通知内容
  icon: "string", // 图标URL
  image: "string", // 图片URL
  sound: "string", // 声音文件
  badge: "number", // 角标数字
  data: "text", // JSON格式的额外数据
  actionUrl: "string", // 点击跳转URL
  category: "string", // assignment, session, payment, system, emergency
  priority: "string", // low, normal, high, urgent
  status: "string", // queued, sent, delivered, failed, clicked
  sentDate: "datetime", // 发送时间
  deliveredDate: "datetime", // 送达时间
  clickedDate: "datetime", // 点击时间
  errorMessage: "string", // 错误信息
  retryCount: "number", // 重试次数
  expiryDate: "datetime", // 过期时间
  isScheduled: "boolean", // 是否定时发送
  scheduledDate: "datetime", // 计划发送时间
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

---

## 文件管理集合

### FileUploads 集合
**使用页面**: 所有涉及文件上传的页面  
**代码调用**: `wixData.query('FileUploads')`

```javascript
{
  _id: "string",
  fileId: "string", // 文件编号
  originalName: "string", // 原始文件名
  fileName: "string", // 存储文件名
  fileUrl: "string", // 文件URL
  thumbnailUrl: "string", // 缩略图URL
  fileType: "string", // image, document, video, audio, archive
  mimeType: "string", // MIME类型
  fileSize: "number", // 文件大小（字节）
  fileHash: "string", // 文件哈希值
  uploadedBy: "string", // 上传者ID
  uploadDate: "datetime", // 上传时间
  relatedEntity: "string", // 关联实体类型
  relatedEntityId: "string", // 关联实体ID
  isPublic: "boolean", // 是否公开
  accessLevel: "string", // public, private, restricted
  allowedUsers: ["string"], // 允许访问的用户ID列表
  downloadCount: "number", // 下载次数
  lastAccessed: "datetime", // 最后访问时间
  isVirus: "boolean", // 是否包含病毒
  scanDate: "datetime", // 扫描日期
  scanResult: "string", // 扫描结果
  isArchived: "boolean", // 是否已归档
  archivedDate: "datetime", // 归档日期
  expiryDate: "datetime", // 过期日期
  tags: ["string"], // 标签
  metadata: "text", // JSON格式的元数据
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

---

## 安全合规集合

### SecurityEvents 集合
**使用页面**: 系统安全管理、审计日志  
**代码调用**: `wixData.query('SecurityEvents')`

```javascript
{
  _id: "string",
  eventId: "string", // 事件编号
  eventType: "string", // login_attempt, failed_login, password_change, permission_change, data_access, suspicious_activity
  severity: "string", // low, medium, high, critical
  status: "string", // detected, investigating, resolved, false_positive
  userId: "string", // 关联Users（如果适用）
  ipAddress: "string", // IP地址
  userAgent: "string", // 用户代理
  location: "string", // 地理位置
  description: "text", // 事件描述
  details: "text", // JSON格式的详细信息
  riskScore: "number", // 风险评分 1-100
  isBlocked: "boolean", // 是否已阻止
  actionTaken: "string", // 采取的行动
  investigatedBy: "string", // 调查人员ID
  investigationNotes: "text", // 调查备注
  resolvedDate: "datetime", // 解决时间
  notificationSent: "boolean", // 是否已发送通知
  relatedEvents: ["string"], // 相关事件ID列表
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### DataProcessingLogs 集合
**使用页面**: GDPR合规管理、数据审计  
**代码调用**: `wixData.query('DataProcessingLogs')`

```javascript
{
  _id: "string",
  logId: "string", // 日志编号
  userId: "string", // 数据主体ID
  dataType: "string", // personal_data, sensitive_data, academic_data, financial_data
  operation: "string", // create, read, update, delete, export, anonymize
  purpose: "string", // service_provision, legal_obligation, legitimate_interest, consent
  legalBasis: "string", // GDPR法律依据
  dataFields: ["string"], // 涉及的数据字段
  processedBy: "string", // 处理人员ID
  processedDate: "datetime", // 处理时间
  retentionPeriod: "number", // 保留期限（天）
  isAutomated: "boolean", // 是否自动化处理
  consentGiven: "boolean", // 是否已获得同意
  consentDate: "datetime", // 同意时间
  consentWithdrawn: "boolean", // 是否撤回同意
  withdrawalDate: "datetime", // 撤回时间
  dataSource: "string", // 数据来源
  dataDestination: "string", // 数据去向
  isThirdPartySharing: "boolean", // 是否与第三方共享
  thirdParties: ["string"], // 第三方列表
  encryptionUsed: "boolean", // 是否使用加密
  accessReason: "string", // 访问原因
  ipAddress: "string", // IP地址
  userAgent: "string", // 用户代理
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

### Permissions 集合
**使用页面**: 权限管理、角色配置  
**代码调用**: `wixData.query('Permissions')`

```javascript
{
  _id: "string",
  permissionId: "string", // 权限编号
  userId: "string", // 关联Users
  role: "string", // admin, mentor, student, parent, staff
  resource: "string", // 资源名称（集合名或功能模块）
  action: "string", // create, read, update, delete, execute
  scope: "string", // all, own, assigned, none
  conditions: "text", // JSON格式的条件限制
  isGranted: "boolean", // 是否授权
  grantedBy: "string", // 授权人ID
  grantedDate: "datetime", // 授权时间
  expiryDate: "datetime", // 过期时间
  isTemporary: "boolean", // 是否临时权限
  reason: "string", // 授权原因
  isActive: "boolean", // 是否激活
  lastUsed: "datetime", // 最后使用时间
  usageCount: "number", // 使用次数
  ipRestrictions: ["string"], // IP限制列表
  timeRestrictions: "text", // JSON格式的时间限制
  _createdDate: "datetime",
  _updatedDate: "datetime"
}
```

---

## 现有集合字段扩展建议

### Users 集合扩展
```javascript
// 在现有Users集合中添加以下字段：
{
  // ... 现有字段
  passwordHash: "string", // 密码哈希
  passwordSalt: "string", // 密码盐值
  resetToken: "string", // 重置令牌
  resetTokenExpiry: "datetime", // 重置令牌过期时间
  emailVerified: "boolean", // 邮箱是否已验证
  emailVerificationToken: "string", // 邮箱验证令牌
  twoFactorEnabled: "boolean", // 是否启用双因子认证
  twoFactorSecret: "string", // 双因子认证密钥
  deviceTokens: ["string"], // 设备推送令牌列表
  loginAttempts: "number", // 登录尝试次数
  lockoutUntil: "datetime", // 锁定到期时间
  gdprConsent: "boolean", // GDPR同意
  gdprConsentDate: "datetime", // GDPR同意时间
  dataRetentionPeriod: "number" // 数据保留期限（天）
}
```

### Students 集合扩展
```javascript
// 在现有Students集合中添加以下字段：
{
  // ... 现有字段
  learningStyle: "string", // 学习风格
  learningGoals: ["string"], // 学习目标
  interests: ["string"], // 兴趣爱好
  strengths: ["string"], // 优势领域
  challenges: ["string"], // 挑战领域
  accommodations: ["string"], // 学习调整
  timezone: "string", // 时区
  preferredLanguage: "string", // 首选语言
  parentalConsent: "boolean", // 家长同意
  photoConsent: "boolean", // 照片使用同意
  marketingConsent: "boolean" // 营销信息同意
}
```

### Sessions 集合扩展
```javascript
// 在现有Sessions集合中添加以下字段：
{
  // ... 现有字段
  recordingUrl: "string", // 录制视频URL
  recordingEnabled: "boolean", // 是否启用录制
  breakoutRooms: ["string"], // 分组讨论室
  pollResults: "text", // JSON格式的投票结果
  whiteboardData: "text", // 白板数据
  chatTranscript: "text", // 聊天记录
  screenShareEnabled: "boolean", // 是否启用屏幕共享
  attendanceRequired: "boolean", // 是否必须出勤
  makeupSessionId: "string", // 补课会话ID
  sessionSeries: "string", // 系列课程ID
  preparationMaterials: ["string"], // 预习材料
  followUpTasks: ["string"] // 后续任务
}
```

---

## 索引优化补充

### 新增集合索引建议

#### Assignments 集合
- `assignmentId` (唯一索引)
- `courseId`
- `studentId`
- `dueDate`
- `status`
- 复合索引: `studentId + dueDate`
- 复合索引: `courseId + status`

#### ChatMessages 集合
- `messageId` (唯一索引)
- `conversationId`
- `senderId`
- `receiverId`
- `_createdDate`
- 复合索引: `conversationId + _createdDate`
- 复合索引: `senderId + receiverId`

#### FileUploads 集合
- `fileId` (唯一索引)
- `uploadedBy`
- `relatedEntityId`
- `fileHash`
- 复合索引: `relatedEntity + relatedEntityId`

#### SecurityEvents 集合
- `eventId` (唯一索引)
- `userId`
- `eventType`
- `severity`
- `_createdDate`
- 复合索引: `eventType + severity`
- 复合索引: `userId + _createdDate`

---

## 部署建议

1. **分阶段部署**: 优先部署核心学生功能集合，然后是安全合规集合
2. **数据迁移**: 制定现有数据向新结构迁移的计划
3. **权限测试**: 彻底测试新的权限配置
4. **性能监控**: 监控新索引对查询性能的影响
5. **备份策略**: 更新备份策略以包含新集合
6. **文档更新**: 更新API文档和开发者指南

---

**最后更新**: 2024年1月  
**版本**: 1.0  
**维护者**: 系统管理员  
**状态**: 补充配置 ✅