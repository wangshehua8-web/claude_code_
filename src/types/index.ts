// 3.1 简历（Resume）
export interface Resume {
  id: string                    // uuid
  name: string                  // 版本名称，如"通用版"、"产品岗专版"
  uploadedAt: string            // ISO 时间
  rawText: string               // PDF 解析后的纯文本，用于 AI 调用
  fileData: string              // base64，存 IndexedDB
  parsed: {
    education: string           // 教育背景段落
    internships: string         // 实习经历段落
    projects: string            // 项目经历段落
    skills: string              // 技能段落
  }
}

// 3.2 投递记录（Application）
export type ApplicationStatus =
  | '已投递'
  | '简历筛选中'
  | '笔试邀请'
  | '一面邀请'
  | '二面邀请'
  | '三面邀请'
  | 'HR面'
  | 'Offer'
  | '已拒绝'
  | '已放弃'

export interface Application {
  id: string
  company: string               // 公司名
  position: string              // 岗位名
  department: string            // 业务线/部门，如"微信支付-风控"
  channel: string               // 投递渠道：官网/内推/猎聘/Boss 等
  status: ApplicationStatus
  appliedAt: string             // 投递时间 ISO
  deadline?: string             // 截止时间 ISO（可选）
  interviewAt?: string          // 面试时间 ISO（可选）
  jdText?: string               // 粘贴的 JD 原文
  jdUrl?: string                // JD 链接（可选）
  resumeId?: string             // 使用的简历版本 id
  notes?: string                // 备注
  createdAt: string
  updatedAt: string
}

// 3.3 面经（InterviewExperience）
export interface InterviewExperience {
  id: string
  applicationId: string         // 关联的投递记录 id
  source: string                // 来源平台，如"小红书"、"牛客"
  sourceUrl?: string            // 原帖链接（可选）
  sourceYear?: string           // 面经年份，如"2024秋招"
  rawText: string               // 粘贴的原文
  parsedQuestions: ParsedQuestion[]  // AI 解析后的题目列表
  examProfile?: string          // AI 综合分析的考察画像（文本）
  createdAt: string
}

export interface ParsedQuestion {
  id: string
  content: string               // 题目内容
  round?: string                // 面试轮次，如"一面"、"二面"
  category: QuestionCategory
  isFromExperience: boolean     // true = 来自面经，false = AI 生成
  source?: string               // 面经来源标识（isFromExperience=true 时）
}

export type QuestionCategory = '行为题' | '专业技能题' | '业务理解题' | '反问题' | '其他'

// 3.4 模拟面试记录（MockAnswer）
export interface MockAnswer {
  id: string
  applicationId: string
  questionId: string
  questionContent: string
  answerText: string            // 用户回答文本
  inputMethod: 'text' | 'voice'
  aiFeedback?: {
    score: number               // 1-5
    structure: string           // 结构性评价
    relevance: string           // 与岗位匹配度评价
    clarity: string             // 表达清晰度评价
    suggestion: string          // 改进建议
  }
  masteryLevel: '未练习' | '待练' | '掌握' | '重点'
  createdAt: string
}

// 3.5 自我介绍（SelfIntro）
export interface SelfIntro {
  id: string
  applicationId: string
  step: 1 | 2 | 3              // 当前完成到哪一步
  // Step 1 输入
  jdText: string
  department: string
  scenario: '电话面' | '视频面' | '现场面'
  targetDuration: 60 | 90 | 120 // 秒
  resumeId: string
  // Step 2 匹配分析
  highlights: Highlight[]       // 3 个亮点
  // Step 3 生成结果
  draftText: string             // 生成/编辑后的草稿
  aiFeedback?: IntroFeedback
  createdAt: string
  updatedAt: string
}

export interface Highlight {
  id: string
  point: string                 // 亮点描述，如"数据分析能力"
  evidence: string              // 对应简历中的具体经历
  isConfirmed: boolean          // 用户是否确认
  isCustomEdited: boolean       // 用户是否手动修改过
}

export interface IntroFeedback {
  strengths: string[]           // 改得好的地方
  suggestions: { sentence: string; reason: string }[]  // 建议调整的句子
  scores: {
    rhythm: number              // 节奏感 1-5
    relevance: number           // 岗位匹配度 1-5
    clarity: number             // 亮点清晰度 1-5
  }
}

// localStorage 键名规范
export const STORAGE_KEYS = {
  RESUMES: 'jobready_resumes',
  APPLICATIONS: 'jobready_applications',
  EXPERIENCES: 'jobready_experiences',
  MOCK_ANSWERS: 'jobready_mock_answers',
  SELF_INTROS: 'jobready_self_intros',
  DEEPSEEK_API_KEY: 'jobready_deepseek_api_key',
} as const