// 本地类型定义，避免路径问题
interface EmailParseResult {
  company?: string
  position?: string
  interviewTime?: string
  interviewLink?: string
  interviewer?: string
  round?: string
  location?: string
  notes?: string
}

/**
 * 解析邮件内容，提取面试信息
 */
export async function parseEmailContent(subject: string, text: string): Promise<EmailParseResult | null> {
  try {
    // 先尝试使用规则解析
    const ruleBasedResult = parseWithRules(subject, text)

    // 如果规则解析找到足够信息，直接返回
    if (ruleBasedResult && (ruleBasedResult.company || ruleBasedResult.interviewTime)) {
      return ruleBasedResult
    }

    // 否则，可以调用 AI API 进行更智能的解析
    // 注意：这里需要根据实际部署环境决定是否调用 AI
    // 在 Vercel 函数中调用 AI API 可能会增加延迟和成本
    // 暂时返回规则解析的结果，即使信息不全
    return ruleBasedResult

  } catch (error) {
    console.error('解析邮件内容失败:', error)
    return null
  }
}

/**
 * 使用规则解析邮件
 */
function parseWithRules(subject: string, text: string): EmailParseResult {
  const result: EmailParseResult = {}

  // 提取公司名称（常见模式）
  result.company = extractCompany(subject, text)

  // 提取岗位名称
  result.position = extractPosition(subject, text)

  // 提取面试时间
  result.interviewTime = extractInterviewTime(text)

  // 提取面试链接
  result.interviewLink = extractInterviewLink(text)

  // 提取面试官
  result.interviewer = extractInterviewer(text)

  // 提取面试轮次
  result.round = extractInterviewRound(subject, text)

  // 提取面试地点
  result.location = extractInterviewLocation(text)

  // 提取特别说明
  result.notes = extractSpecialNotes(text)

  return result
}

/**
 * 提取公司名称
 */
function extractCompany(subject: string, text: string): string | undefined {
  // 常见模式：公司名 + "面试邀请"
  const patterns = [
    /【(.+?)】面试邀请/,
    /(.+?)面试邀请/,
    /邀请参加(.+?)的面试/,
    /Interview Invitation from (.+?)[\s,]/i,
    /(.+?) - Interview/
  ]

  for (const pattern of patterns) {
    const match = subject.match(pattern) || text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // 尝试从发件人邮箱提取公司域名
  const emailMatch = text.match(/发件人:.+?@(.+?)\.com/)
  if (emailMatch && emailMatch[1]) {
    return emailMatch[1].trim()
  }

  return undefined
}

/**
 * 提取岗位名称
 */
function extractPosition(subject: string, text: string): string | undefined {
  const patterns = [
    /岗位[：:]\s*(.+?)[\s,]/,
    /职位[：:]\s*(.+?)[\s,]/,
    /position[：:]\s*(.+?)[\s,]/i,
    /for the (.+?) position/i,
    /招聘岗位：(.+?)[\n,]/
  ]

  for (const pattern of patterns) {
    const match = subject.match(pattern) || text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * 提取面试时间
 */
function extractInterviewTime(text: string): string | undefined {
  // 匹配常见的时间格式
  const timePatterns = [
    /时间[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/,
    /时间[：:]\s*(\d{4}年\d{2}月\d{2}日\s+\d{2}:\d{2})/,
    /time[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/i,
    /schedule[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/i,
    /interview at\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/i,
    /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/ // 通用格式
  ]

  for (const pattern of timePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const timeStr = match[1].trim()
      try {
        // 尝试转换为 ISO 格式
        const date = new Date(timeStr)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      } catch (e) {
        // 转换失败，继续尝试其他模式
      }
    }
  }

  return undefined
}

/**
 * 提取面试链接
 */
function extractInterviewLink(text: string): string | undefined {
  // 匹配常见的视频会议链接
  const linkPatterns = [
    /(https?:\/\/[^\s]+zoom\.us\/[^\s]+)/i,
    /(https?:\/\/[^\s]+teams\.microsoft\.com\/[^\s]+)/i,
    /(https?:\/\/[^\s]+tencent\.com\/[^\s]+)/i,
    /(https?:\/\/meeting\.tencent\.com\/[^\s]+)/i,
    /链接[：:]\s*(https?:\/\/[^\s]+)/,
    /link[：:]\s*(https?:\/\/[^\s]+)/i,
    /join here:\s*(https?:\/\/[^\s]+)/i
  ]

  for (const pattern of linkPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * 提取面试官
 */
function extractInterviewer(text: string): string | undefined {
  const patterns = [
    /面试官[：:]\s*(.+?)[\s,]/,
    /interviewer[：:]\s*(.+?)[\s,]/i,
    /with\s+(.+?)[\s,]/i,
    /联系人[：:]\s*(.+?)[\s,]/
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * 提取面试轮次
 */
function extractInterviewRound(subject: string, text: string): string | undefined {
  const rounds = ['一面', '二面', '三面', '四面', '终面', 'HR面', '技术面', '业务面', '群面']
  const englishRounds = ['first round', 'second round', 'third round', 'final round', 'hr round', 'technical']

  // 检查中文轮次
  for (const round of rounds) {
    if (subject.includes(round) || text.includes(round)) {
      return round
    }
  }

  // 检查英文轮次
  for (const round of englishRounds) {
    if (subject.toLowerCase().includes(round) || text.toLowerCase().includes(round)) {
      return round
    }
  }

  return undefined
}

/**
 * 提取面试地点
 */
function extractInterviewLocation(text: string): string | undefined {
  const patterns = [
    /地点[：:]\s*(.+?)[\s,]/,
    /location[：:]\s*(.+?)[\s,]/i,
    /地址[：:]\s*(.+?)[\s,]/
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const location = match[1].trim()
      // 判断是线上还是线下
      if (location.includes('线上') || location.includes('online') || location.includes('zoom') || location.includes('teams')) {
        return `线上: ${location}`
      } else {
        return `线下: ${location}`
      }
    }
  }

  return undefined
}

/**
 * 提取特别说明
 */
function extractSpecialNotes(text: string): string | undefined {
  const notePatterns = [
    /说明[：:]\s*(.+?)[\n\r]/,
    /notes[：:]\s*(.+?)[\n\r]/i,
    /注意事项[：:]\s*(.+?)[\n\r]/,
    /请准备[：:]\s*(.+?)[\n\r]/,
    /please prepare[：:]\s*(.+?)[\n\r]/i
  ]

  for (const pattern of notePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * 使用 AI 解析邮件（如果需要更精确的解析）
 */
export async function parseEmailWithAI(subject: string, text: string): Promise<EmailParseResult | null> {
  // 这里可以集成 AI 解析逻辑
  // 由于 Vercel 函数可能不适合直接调用外部 AI API（会增加延迟和成本）
  // 可以考虑在前端进行 AI 解析，或者使用更轻量的 NLP 服务
  return null
}