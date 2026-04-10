import * as CryptoJS from 'crypto-js';
import type { EmailConfig } from '@/types';

/**
 * 简单加密工具类
 * 使用AES加密算法，前端存储敏感信息时使用
 * 注意：前端加密不是绝对安全的，但可以增加基本保护
 */
export class SimpleEncryption {
  private static getKey(): string {
    // 从环境变量获取加密密钥，开发时使用默认值
    return import.meta.env.VITE_ENCRYPTION_KEY || 'default-32-char-encryption-key-here';
  }

  /**
   * 加密文本
   * @param text 要加密的明文
   * @returns 加密后的密文，格式为 "iv:encryptedText"（十六进制）
   */
  static encrypt(text: string): string {
    try {
      // 使用CryptoJS AES加密，生成随机IV
      const encrypted = CryptoJS.AES.encrypt(text, this.getKey());

      // 提取IV和密文（十六进制格式）
      const iv = encrypted.iv.toString(CryptoJS.enc.Hex);
      const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

      return `${iv}:${ciphertext}`;
    } catch (error) {
      console.error('加密失败:', error);
      throw new Error('加密失败');
    }
  }

  /**
   * 解密密文
   * @param ciphertext 要解密的密文，格式为 "iv:encryptedText"（十六进制）
   * @returns 解密后的明文
   */
  static decrypt(ciphertext: string): string {
    try {
      // 解析IV和密文
      const parts = ciphertext.split(':');
      if (parts.length !== 2) {
        throw new Error('无效的密文格式');
      }

      const iv = CryptoJS.enc.Hex.parse(parts[0]);
      const encryptedText = CryptoJS.enc.Hex.parse(parts[1]);

      // 创建CipherParams对象
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: encryptedText,
        iv: iv
      });

      // 解密
      const decrypted = CryptoJS.AES.decrypt(cipherParams, this.getKey());
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

      if (!plaintext) {
        throw new Error('解密失败：结果为空');
      }

      return plaintext;
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('解密失败');
    }
  }

  /**
   * 加密对象（先序列化为JSON）
   * @param obj 要加密的对象
   * @returns 加密后的密文
   */
  static encryptObject<T>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * 解密密文为对象
   * @param ciphertext 加密的密文
   * @returns 解密后的对象
   */
  static decryptObject<T>(ciphertext: string): T {
    const decrypted = this.decrypt(ciphertext);
    try {
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('JSON解析失败:', error);
      throw new Error('解密对象失败');
    }
  }

  /**
   * 验证加密密钥是否有效
   * @returns 密钥是否有效
   */
  static validateKey(): boolean {
    try {
      const testText = 'test-encryption';
      const encrypted = this.encrypt(testText);
      const decrypted = this.decrypt(encrypted);
      return decrypted === testText;
    } catch {
      return false;
    }
  }
}

/**
 * 邮箱配置加密工具
 * 专门用于邮箱配置的加密操作
 */
export class EmailConfigEncryption {
  /**
   * 加密邮箱配置
   * @param config 邮箱配置
   * @returns 加密后的配置（密码字段已加密）
   */
  static encryptConfig(config: EmailConfig): EmailConfig {
    return {
      ...config,
      password: SimpleEncryption.encrypt(config.password),
    };
  }

  /**
   * 解密邮箱配置
   * @param config 加密的邮箱配置
   * @returns 解密后的配置
   */
  static decryptConfig(config: EmailConfig): EmailConfig {
    return {
      ...config,
      password: SimpleEncryption.decrypt(config.password),
    };
  }

  /**
   * 准备传输的配置（整体加密）
   * @param config 邮箱配置
   * @returns 整体加密后的字符串
   */
  static prepareForTransport(config: EmailConfig): string {
    const encryptedConfig = this.encryptConfig(config);
    return SimpleEncryption.encryptObject(encryptedConfig);
  }

  /**
   * 解析传输的配置
   * @param encryptedString 整体加密的字符串
   * @returns 解密后的邮箱配置
   */
  static parseFromTransport(encryptedString: string): EmailConfig {
    const encryptedConfig = SimpleEncryption.decryptObject<EmailConfig>(encryptedString);
    return this.decryptConfig(encryptedConfig);
  }
}