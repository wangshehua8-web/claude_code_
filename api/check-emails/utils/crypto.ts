import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!'

// 确保密钥长度为32字节（AES-256）
function getValidKey(key: string): string {
  if (key.length >= 32) {
    return key.substring(0, 32)
  } else {
    // 填充到32字节
    return key.padEnd(32, '0')
  }
}

/**
 * 解密密码
 * 前端使用 crypto-js AES 加密，后端使用 Node.js crypto 解密
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    // 前端加密的格式：iv:encryptedText
    const parts = encryptedPassword.split(':')
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted password format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = Buffer.from(parts[1], 'hex')
    const key = Buffer.from(getValidKey(ENCRYPTION_KEY), 'utf-8')

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf-8')
  } catch (error) {
    console.error('解密密码失败:', error)
    throw new Error('Failed to decrypt password')
  }
}

/**
 * 加密密码（用于测试）
 */
export function encryptPassword(password: string): string {
  try {
    const key = Buffer.from(getValidKey(ENCRYPTION_KEY), 'utf-8')
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(password, 'utf-8')
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`
  } catch (error) {
    console.error('加密密码失败:', error)
    throw new Error('Failed to encrypt password')
  }
}

/**
 * 生成随机加密密钥（用于初始化）
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}