import { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToImap, searchEmails, fetchEmailDetails } from './imap-client'
import { parseEmailContent } from './email-parser'
import { decryptPassword } from './utils/crypto'

interface CheckEmailRequest {
  accountId: string
  email: string
  encryptedPassword: string  // 前端加密的密码
  provider: 'qq' | '163' | 'gmail' | 'outlook'
  imapConfig: {
    host: string
    port: number
    tls: boolean
  }
  keywords: string[]
  lastChecked?: string  // ISO 字符串，上次检查时间
}

interface CheckEmailResponse {
  success: boolean
  results: Array<{
    messageId: string
    subject: string
    from: string
    date: string
    content: string
    parsedInfo?: any
    isInterview: boolean
  }>
  error?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const requestData: CheckEmailRequest = req.body

    // 验证必要字段
    if (!requestData.email || !requestData.encryptedPassword || !requestData.imapConfig) {
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }

    // 解密密码（使用环境变量中的加密密钥）
    const decryptedPassword = decryptPassword(requestData.encryptedPassword)

    // 连接到 IMAP 服务器
    const connection = await connectToImap({
      imap: {
        user: requestData.email,
        password: decryptedPassword,
        host: requestData.imapConfig.host,
        port: requestData.imapConfig.port,
        tls: requestData.imapConfig.tls,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
      }
    })

    // 搜索邮件
    const searchCriteria = buildSearchCriteria(requestData.keywords, requestData.lastChecked)
    const emailUids = await searchEmails(connection, searchCriteria)

    const results = []

    // 获取邮件详情
    for (const uid of emailUids.slice(0, 10)) { // 限制最多处理10封邮件
      try {
        const emailDetails = await fetchEmailDetails(connection, uid)

        // 解析邮件内容
        const parsedInfo = await parseEmailContent(emailDetails.subject, emailDetails.text)

        // 判断是否为面试邀请
        const isInterview = isInterviewEmail(emailDetails, requestData.keywords)

        results.push({
          messageId: emailDetails.messageId,
          subject: emailDetails.subject,
          from: emailDetails.from,
          date: emailDetails.date,
          content: emailDetails.text.substring(0, 500), // 只返回前500字符
          parsedInfo: isInterview ? parsedInfo : undefined,
          isInterview
        })
      } catch (error) {
        console.error(`处理邮件 UID ${uid} 失败:`, error)
        // 继续处理其他邮件
      }
    }

    // 关闭连接
    await connection.close()

    // 返回结果
    const response: CheckEmailResponse = {
      success: true,
      results
    }

    res.status(200).json(response)

  } catch (error: any) {
    console.error('检查邮件失败:', error)

    const response: CheckEmailResponse = {
      success: false,
      results: [],
      error: error.message || 'Internal server error'
    }

    res.status(500).json(response)
  }
}

/**
 * 构建搜索条件
 */
function buildSearchCriteria(keywords: string[], lastChecked?: string): any[] {
  const criteria: any[] = ['UNSEEN'] // 只搜索未读邮件

  // 如果有上次检查时间，只搜索该时间之后的邮件
  if (lastChecked) {
    criteria.push(['SINCE', new Date(lastChecked)])
  }

  // 添加关键词搜索（主题或正文）
  if (keywords.length > 0) {
    const keywordCriteria = keywords.map(keyword => ['OR', ['SUBJECT', keyword], ['BODY', keyword]])

    if (keywordCriteria.length === 1) {
      criteria.push(...keywordCriteria[0])
    } else if (keywordCriteria.length > 1) {
      let combinedCriteria = keywordCriteria[0]
      for (let i = 1; i < keywordCriteria.length; i++) {
        combinedCriteria = ['OR', combinedCriteria, keywordCriteria[i]]
      }
      criteria.push(combinedCriteria)
    }
  }

  return criteria
}

/**
 * 判断是否为面试邀请邮件
 */
function isInterviewEmail(emailDetails: any, keywords: string[]): boolean {
  const subject = emailDetails.subject.toLowerCase()
  const text = emailDetails.text.toLowerCase()

  // 检查是否包含关键词
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase()
    if (subject.includes(lowerKeyword) || text.includes(lowerKeyword)) {
      return true
    }
  }

  // 额外检查：是否包含常见面试相关词汇
  const interviewTerms = ['interview', '面试', 'invitation', '邀请', 'schedule', '安排', 'calendar', '日程']
  for (const term of interviewTerms) {
    if (subject.includes(term) || text.includes(term)) {
      return true
    }
  }

  return false
}