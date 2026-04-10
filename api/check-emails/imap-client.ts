import imaps from 'imap-simple'
import type { Connection, ImapSimpleOptions, Message } from 'imap-simple'

export interface EmailDetails {
  messageId: string
  subject: string
  from: string
  date: string
  text: string
  html?: string
}

/**
 * 连接到 IMAP 服务器
 */
export async function connectToImap(config: ImapSimpleOptions): Promise<Connection> {
  try {
    const connection = await imaps.connect(config)
    console.log(`成功连接到 IMAP 服务器: ${config.imap.host}`)
    return connection
  } catch (error) {
    console.error('连接 IMAP 服务器失败:', error)
    throw new Error(`连接失败: ${error.message}`)
  }
}

/**
 * 搜索邮件
 */
export async function searchEmails(connection: Connection, criteria: any[]): Promise<number[]> {
  try {
    await connection.openBox('INBOX')

    const searchResults = await connection.search(criteria, { bodies: [] })
    const uids = searchResults.map(result => result.attributes.uid)

    console.log(`找到 ${uids.length} 封匹配的邮件`)
    return uids
  } catch (error) {
    console.error('搜索邮件失败:', error)
    throw new Error(`搜索失败: ${error.message}`)
  }
}

/**
 * 获取邮件详情
 */
export async function fetchEmailDetails(connection: Connection, uid: number): Promise<EmailDetails> {
  try {
    const fetchOptions = {
      bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)', 'TEXT'],
      struct: true,
      markSeen: false // 不要自动标记为已读，由前端决定
    }

    const messages: Message[] = await connection.getPartData(
      await connection.fetch([uid], fetchOptions),
      'TEXT'
    )

    if (!messages || messages.length === 0) {
      throw new Error(`未找到邮件 UID: ${uid}`)
    }

    const message = messages[0]
    const header = message.parts.find(part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)')
    const textPart = message.parts.find(part => part.which === 'TEXT')

    if (!header || !textPart) {
      throw new Error(`邮件格式异常 UID: ${uid}`)
    }

    // 解析邮件头
    const headers = header.body
    const subject = headers.subject ? headers.subject[0] : '(无主题)'
    const from = headers.from ? headers.from[0] : '(未知发件人)'
    const date = headers.date ? headers.date[0] : new Date().toISOString()
    const messageId = headers['message-id'] ? headers['message-id'][0] : `uid-${uid}`

    // 获取邮件正文
    let text = textPart.body || ''

    // 如果是base64编码，需要解码
    if (typeof text === 'string' && text.startsWith('base64:')) {
      text = Buffer.from(text.substring(7), 'base64').toString('utf-8')
    }

    // 清理文本：移除多余的空格和换行
    text = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim()

    // 尝试提取纯文本部分（如果有HTML）
    const plainText = extractPlainText(text)

    return {
      messageId,
      subject,
      from,
      date,
      text: plainText || text
    }
  } catch (error) {
    console.error(`获取邮件详情失败 UID ${uid}:`, error)
    throw new Error(`获取邮件失败: ${error.message}`)
  }
}

/**
 * 从HTML中提取纯文本
 */
function extractPlainText(content: string): string {
  // 如果是HTML，尝试提取文本
  if (content.includes('<html') || content.includes('<body') || content.includes('<div')) {
    // 简单移除HTML标签（对于简单的HTML邮件足够）
    let text = content
      .replace(/<[^>]*>/g, ' ') // 移除HTML标签
      .replace(/\s+/g, ' ')     // 合并空格
      .trim()

    // 解码HTML实体
    text = decodeHtmlEntities(text)

    return text
  }

  return content
}

/**
 * 解码HTML实体
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  }

  return text.replace(/&[a-z]+;|&#\d+;/g, match => entities[match] || match)
}

/**
 * 测试连接
 */
export async function testImapConnection(config: ImapSimpleOptions): Promise<boolean> {
  let connection: Connection | null = null

  try {
    connection = await connectToImap(config)
    await connection.openBox('INBOX')
    return true
  } catch (error) {
    console.error('IMAP 连接测试失败:', error)
    return false
  } finally {
    if (connection) {
      await connection.close()
    }
  }
}