import type { EmailAccount, EmailCheckResult, EmailParseResult, Application } from '@/types'
import { emailConfigStorage, applicationStorage } from '@/lib/storage'
import { callDeepSeek } from './deepseek'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 检查单个邮箱账户的邮件
 */
export async function checkEmailAccount(account: EmailAccount): Promise<EmailCheckResult[]> {
  try {
    // 准备请求数据（注意：密码在前端是加密的，需要后端解密）
    const requestData = {
      accountId: account.id,
      email: account.config.email,
      encryptedPassword: account.config.password, // 加密后的密码
      provider: account.config.provider,
      imapConfig: account.config.imapConfig,
      keywords: account.config.keywords,
      lastChecked: account.lastChecked
    }

    // 调用后端 API 检查邮件
    const response = await fetch(`${API_BASE_URL}/check-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const results: EmailCheckResult[] = await response.json()

    // 更新最后检查时间
    emailConfigStorage.updateLastChecked(account.id)

    // 如果有邮件，尝试解析面试信息并更新应用状态
    if (results.length > 0) {
      await processEmailResults(results, account.id)
    }

    // 更新账户状态为 active
    emailConfigStorage.updateStatus(account.id, 'active')

    return results
  } catch (error: any) {
    console.error(`检查邮箱账户 ${account.name} 失败:`, error)
    // 更新账户状态为 error
    emailConfigStorage.updateStatus(account.id, 'error')
    throw error
  }
}

/**
 * 处理邮件结果，解析面试信息并更新应用状态
 */
async function processEmailResults(results: EmailCheckResult[], _accountId: string): Promise<void> {
  for (const result of results) {
    if (!result.isInterview) {
      continue
    }

    try {
      // 使用 AI 解析邮件内容
      const parsedInfo = await parseEmailWithAI(result.content, result.subject)

      if (parsedInfo) {
        // 尝试匹配现有投递记录
        const matchedApplication = await matchApplication(parsedInfo)

        if (matchedApplication) {
          // 更新面试时间
          await updateApplicationWithInterview(matchedApplication.id, parsedInfo)
        } else {
          // 如果没有匹配的投递记录，可以创建一个新的或记录到日志
          console.log('发现新的面试邀请，但未找到匹配的投递记录:', parsedInfo)
        }
      }
    } catch (error) {
      console.error('处理邮件结果失败:', error)
    }
  }
}

/**
 * 使用 AI 解析邮件内容
 */
async function parseEmailWithAI(content: string, subject: string): Promise<EmailParseResult | null> {
  try {
    const systemPrompt = `你是一个邮件解析助手，专门从面试邀请邮件中提取结构化信息。
请从邮件内容中提取以下信息：
1. 公司名称 (company)
2. 岗位名称 (position)
3. 面试时间 (interviewTime) - 转换为 ISO 8601 格式
4. 面试链接 (interviewLink) - 如果有的话
5. 面试官 (interviewer) - 如果有的话
6. 面试轮次 (round) - 如：一面、二面、HR面等
7. 面试地点 (location) - 线上或线下具体地址
8. 特别说明 (notes)

请以 JSON 格式返回，只返回 JSON 对象，不要有其他内容。如果某项信息不存在，请设为 null。

邮件主题: ${subject}
邮件内容: ${content.substring(0, 1000)}`

    const aiResponse = await callDeepSeek(systemPrompt, '请解析这封邮件')

    // 尝试解析 JSON 响应
    try {
      // 提取 JSON 部分（AI 响应可能包含额外文本）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as EmailParseResult
        return parsed
      }
    } catch (parseError) {
      console.error('解析 AI 响应失败:', parseError)
    }

    return null
  } catch (error) {
    console.error('AI 解析邮件失败:', error)
    return null
  }
}

/**
 * 根据解析的信息匹配现有投递记录
 */
async function matchApplication(parsedInfo: EmailParseResult): Promise<Application | null> {
  const applications = applicationStorage.getAll()

  if (!parsedInfo.company && !parsedInfo.position) {
    return null
  }

  // 尝试按公司名和岗位名匹配
  for (const app of applications) {
    // 简单匹配逻辑：公司名包含或岗位名包含
    const companyMatch = parsedInfo.company && app.company.includes(parsedInfo.company)
    const positionMatch = parsedInfo.position && app.position.includes(parsedInfo.position)

    if (companyMatch || positionMatch) {
      return app
    }
  }

  return null
}

/**
 * 更新投递记录的面试信息
 */
async function updateApplicationWithInterview(applicationId: string, parsedInfo: EmailParseResult): Promise<void> {
  const updates: Partial<Application> = {}

  if (parsedInfo.interviewTime) {
    updates.interviewAt = parsedInfo.interviewTime
  }

  if (parsedInfo.round) {
    // 根据面试轮次更新状态
    const roundToStatus: Record<string, Application['status']> = {
      '一面': '一面邀请',
      '二面': '二面邀请',
      '三面': '三面邀请',
      'hr面': 'HR面',
      'hr': 'HR面',
      '终面': 'HR面'
    }

    const lowerRound = parsedInfo.round.toLowerCase()
    for (const [key, status] of Object.entries(roundToStatus)) {
      if (lowerRound.includes(key)) {
        updates.status = status
        break
      }
    }
  }

  if (parsedInfo.interviewLink) {
    updates.notes = `面试链接: ${parsedInfo.interviewLink}\n${parsedInfo.notes || ''}`
  } else if (parsedInfo.notes) {
    updates.notes = parsedInfo.notes
  }

  // 应用更新
  if (Object.keys(updates).length > 0) {
    applicationStorage.update(applicationId, updates)
  }
}

/**
 * 检查所有启用的邮箱账户
 */
export async function checkAllEnabledAccounts(): Promise<Map<string, EmailCheckResult[]>> {
  const accounts = emailConfigStorage.getEnabledAccounts()
  const results = new Map<string, EmailCheckResult[]>()

  for (const account of accounts) {
    try {
      const accountResults = await checkEmailAccount(account)
      results.set(account.id, accountResults)
    } catch (error) {
      console.error(`检查邮箱账户 ${account.name} 失败:`, error)
      results.set(account.id, [])
    }
  }

  return results
}

/**
 * 获取邮箱监控状态
 */
export function getEmailMonitorStatus() {
  const accounts = emailConfigStorage.getAll()
  const enabledAccounts = emailConfigStorage.getEnabledAccounts()

  return {
    totalAccounts: accounts.length,
    enabledAccounts: enabledAccounts.length,
    accounts: accounts.map(account => ({
      id: account.id,
      name: account.name,
      email: account.config.email,
      status: account.status,
      lastChecked: account.lastChecked,
      enabled: account.config.enabled,
      pollingInterval: account.config.pollingInterval
    }))
  }
}