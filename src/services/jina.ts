/**
 * Jina Reader API 服务
 * 用于一键解析网页内容，提取正文
 * API 文档: https://jina.ai/reader
 */

export interface JinaReaderResponse {
  code: number;
  data?: {
    content: string;
    title?: string;
    description?: string;
    url: string;
  };
  message?: string;
}

/**
 * 使用 Jina Reader API 提取网页内容
 * @param url 要提取内容的网页URL
 * @returns 网页正文内容
 */
export async function extractWebContent(url: string): Promise<{
  content: string;
  title?: string;
  description?: string;
}> {
  try {
    // Jina Reader API 端点
    const apiUrl = 'https://r.jina.ai/';

    // 注意：Jina Reader API 是公开的，无需API key
    // 可以通过在URL前加上 https://r.jina.ai/ 来使用
    const response = await fetch(`${apiUrl}${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; JobReady/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Jina Reader API 请求失败: ${response.status}`);
    }

    const data: JinaReaderResponse = await response.json();

    if (data.code !== 200 || !data.data) {
      throw new Error(data.message || 'Jina Reader API 返回数据异常');
    }

    return {
      content: data.data.content || '',
      title: data.data.title,
      description: data.data.description
    };
  } catch (error) {
    console.error('Jina Reader API 调用失败:', error);

    // 降级方案：尝试直接获取页面内容
    try {
      console.log('尝试降级方案：直接获取页面内容...');
      const fallbackResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!fallbackResponse.ok) {
        throw new Error(`降级方案失败: ${fallbackResponse.status}`);
      }

      const html = await fallbackResponse.text();
      // 简单的HTML清理，提取文本内容
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 10000); // 限制长度

      return {
        content: textContent || '无法提取网页内容',
        title: '提取的网页内容',
        description: '通过降级方案提取'
      };
    } catch (fallbackError) {
      console.error('降级方案也失败:', fallbackError);
      throw new Error(`无法提取网页内容: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

/**
 * 验证URL是否有效
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * 从URL中提取域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (_) {
    return url;
  }
}

/**
 * 批量解析URL内容
 */
export async function batchExtractWebContents(
  urls: string[],
  onProgress?: (progress: number, currentUrl: string) => void
): Promise<Array<{
  url: string;
  content: string;
  title?: string;
  description?: string;
  success: boolean;
  error?: string;
}>> {
  const results = [];
  const total = urls.length;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    if (onProgress) {
      onProgress(Math.round((i / total) * 100), url);
    }

    try {
      const content = await extractWebContent(url);
      results.push({
        url,
        content: content.content,
        title: content.title,
        description: content.description,
        success: true
      });
    } catch (error) {
      results.push({
        url,
        content: '',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  if (onProgress) {
    onProgress(100, '完成');
  }

  return results;
}

/**
 * 清理和格式化提取的网页内容
 */
export function cleanWebContent(content: string, maxLength: number = 5000): string {
  if (!content) return '';

  // 移除多余的空格和换行
  let cleaned = content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // 限制长度
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...（内容已截断）';
  }

  return cleaned;
}

/**
 * 从URL推断投递渠道
 */
export function inferChannelFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('nowcoder.com')) {
      return '牛客网';
    } else if (hostname.includes('zhipin.com')) {
      return 'Boss直聘';
    } else if (hostname.includes('lagou.com')) {
      return '拉勾网';
    } else if (hostname.includes('liepin.com')) {
      return '猎聘';
    } else if (hostname.includes('51job.com')) {
      return '前程无忧';
    }

    // 检查是否是公司官网
    const commonDomains = ['.com', '.cn', '.com.cn', '.net', '.org'];
    const isLikelyCompanySite = commonDomains.some(domain => hostname.endsWith(domain));

    if (isLikelyCompanySite && !hostname.includes('job') && !hostname.includes('career')) {
      return '官网';
    }

    return '其他';
  } catch (_) {
    return '其他';
  }
}

/**
 * 从标题中提取公司名称
 */
export function extractCompanyFromTitle(title: string): string {
  if (!title) return '';

  // 常见公司名称模式
  const companyPatterns = [
    /(字节跳动|ByteDance)/i,
    /(腾讯|Tencent)/i,
    /(阿里巴巴|Alibaba)/i,
    /(百度|Baidu)/i,
    /(美团|Meituan)/i,
    /(拼多多|Pinduoduo)/i,
    /(京东|JD\.com)/i,
    /(网易|NetEase)/i,
    /(小米|Xiaomi)/i,
    /(华为|Huawei)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}

/**
 * 从标题中提取岗位名称
 */
export function extractPositionFromTitle(title: string): string {
  if (!title) return '';

  // 常见实习岗位模式
  const positionPatterns = [
    /(产品经理|产品助理|产品实习生)/i,
    /(软件开发|软件工程师|开发实习生)/i,
    /(前端开发|前端工程师)/i,
    /(后端开发|后端工程师)/i,
    /(算法工程师|算法实习生)/i,
    /(数据分析|数据科学家)/i,
    /(运营实习生|运营专员)/i,
    /(市场实习生|市场营销)/i,
    /(设计实习生|UI设计师)/i,
    /(测试工程师|测试实习生)/i,
  ];

  for (const pattern of positionPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return '';
}