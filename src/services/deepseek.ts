import { apiKeyStorage } from '@/lib/storage'

export interface DeepSeekMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  max_tokens?: number
  temperature?: number
  stream?: boolean
  system?: string
}

export interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 调用 DeepSeek API
 * Base URL: https://api.deepseek.com
 * 模型: deepseek-chat
 */
export async function callDeepSeek(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = apiKeyStorage.get()

  if (!apiKey) {
    throw new Error('未设置 DeepSeek API Key，请前往设置页面配置')
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API 请求失败: ${response.status} - ${errorText}`)
    }

    const data: DeepSeekResponse = await response.json()

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content
    } else {
      throw new Error('DeepSeek API 返回格式异常')
    }
  } catch (error) {
    console.error('调用 DeepSeek API 失败:', error)
    throw error
  }
}

/**
 * 解析 AI 返回的 JSON 内容
 * 包含错误处理和降级
 */
export function parseAIJson<T>(aiResponse: string): T {
  try {
    // 尝试直接解析
    return JSON.parse(aiResponse) as T
  } catch (error) {
    // 如果失败，尝试提取 JSON 部分
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                      aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                      aiResponse.match(/{[\s\S]*}/)

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]) as T
      } catch (e) {
        throw new Error('AI 返回内容格式异常，无法解析 JSON')
      }
    }

    throw new Error('AI 返回内容格式异常，无法解析 JSON')
  }
}

/**
 * 生成面试题库
 * 根据 PRD 6.1
 */
export async function generateInterviewQuestions(
  jdText: string,
  resumeRawText: string,
  department: string
) {
  const systemPrompt = `你是一位专业的校招面试官，擅长根据岗位要求和候选人简历设计面试题目。
请严格按照 JSON 格式返回，不要输出任何其他内容。`

  const userMessage = `请根据以下信息生成面试题库：

【岗位要求】
${jdText}

【候选人简历】
${resumeRawText}

【业务线】
${department}

请生成以下四类题目，每类 3-5 题：
1. 行为题（用 STAR 结构回答的经历类问题）
2. 专业技能题（与岗位直接相关的技术/能力考察）
3. 业务理解题（对该业务/行业的理解）
4. 反问题（候选人可以问面试官的好问题）

返回 JSON 格式：
{
  "examProfile": "该岗位的综合考察偏向（2-3句话）",
  "questions": [
    {
      "content": "题目内容",
      "category": "行为题|专业技能题|业务理解题|反问题",
      "examIntent": "考察意图（1句话）"
    }
  ]
}`

  const response = await callDeepSeek(systemPrompt, userMessage, 3000)
  return parseAIJson<{
    examProfile: string
    questions: Array<{
      content: string
      category: string
      examIntent: string
    }>
  }>(response)
}

/**
 * 解析面经
 * 根据 PRD 6.2
 */
export async function parseInterviewExperience(
  rawText: string,
  company: string,
  position: string,
  department: string
) {
  const systemPrompt = `你是一位求职辅导专家。请从面试经验贴中提取结构化信息，严格按 JSON 格式返回，不输出其他内容。`

  const userMessage = `请解析以下面试经验贴，提取关键信息：

【面经原文】
${rawText}

【对应岗位】${company} - ${position} - ${department}

返回 JSON 格式：
{
  "examProfile": "从面经中总结出的该公司该岗位考察特点（2-3句话）",
  "questions": [
    {
      "content": "提取或整理的题目",
      "round": "一面|二面|三面|HR面（如果能判断）",
      "category": "行为题|专业技能题|业务理解题|反问题|其他"
    }
  ]
}`

  const response = await callDeepSeek(systemPrompt, userMessage, 3000)
  return parseAIJson<{
    examProfile: string
    questions: Array<{
      content: string
      round?: string
      category: string
    }>
  }>(response)
}

/**
 * 模拟回答 AI 评分
 * 根据 PRD 6.4
 */
export async function evaluateMockAnswer(
  questionContent: string,
  examIntent: string,
  company: string,
  position: string,
  answerText: string
) {
  const userMessage = `请评估以下面试回答：

【题目】${questionContent}
【考察意图】${examIntent}
【岗位背景】${company} - ${position}

【候选人回答】
${answerText}

请从三个维度评分（1-5分）并给出具体反馈：
返回 JSON：
{
  "score": 综合评分(1-5),
  "structure": "结构性评价",
  "relevance": "与岗位匹配度评价",
  "clarity": "表达清晰度评价",
  "suggestion": "最重要的一条改进建议"
}`

  const response = await callDeepSeek(userMessage, userMessage, 2000)
  return parseAIJson<{
    score: number
    structure: string
    relevance: string
    clarity: string
    suggestion: string
  }>(response)
}

/**
 * 分析简历与岗位匹配亮点
 * 根据 PRD 6.5
 */
export async function analyzeResumeHighlights(
  jdText: string,
  department: string,
  resumeRawText: string
) {
  const userMessage = `请分析以下候选人简历与岗位要求的匹配情况：

【岗位要求】
${jdText}

【业务线】${department}

【候选人简历】
${resumeRawText}

请找出候选人与该岗位最匹配的 5 个亮点（按匹配度排序，方便候选人从中选 3 个），每个亮点需要：
1. 一句话概括亮点
2. 从简历中找到支撑该亮点的具体经历

返回 JSON：
{
  "highlights": [
    {
      "point": "亮点概括（10字以内）",
      "evidence": "对应的简历经历（30-50字）"
    }
  ]
}`

  const response = await callDeepSeek(userMessage, userMessage, 2500)
  return parseAIJson<{
    highlights: Array<{
      point: string
      evidence: string
    }>
  }>(response)
}

/**
 * 生成自我介绍初稿
 * 根据 PRD 6.6
 */
export async function generateSelfIntroduction(
  company: string,
  position: string,
  department: string,
  scenario: string,
  targetDuration: number,
  highlights: Array<{ point: string; evidence: string }>,
  resumeRawText: string
) {
  const userMessage = `请根据以下信息生成一篇自我介绍：

【岗位】${company} - ${position} - ${department}
【场景】${scenario}
【目标时长】${targetDuration}秒（约${Math.round(targetDuration / 60 * 200)}字）

【三个核心亮点及经历】
${highlights.map((h, i) => `亮点${i + 1}：${h.point}\n经历：${h.evidence}`).join('\n\n')}

【完整简历内容】
${resumeRawText}

要求：
1. 开头简短介绍学校/专业背景（不超过2句）
2. 重点展开三个亮点，每个亮点结合具体经历数据
3. 结尾表达对该岗位/业务的兴趣
4. 语言自然流畅，避免念稿感
5. 控制在${Math.round(targetDuration / 60 * 200)}字左右

直接输出自我介绍正文，不需要任何解释。`

  return await callDeepSeek('你是一位专业的求职辅导顾问，擅长帮助应届生准备面试自我介绍。', userMessage, 2500)
}

/**
 * 审阅用户修改的自我介绍
 * 根据 PRD 6.7
 */
export async function reviewSelfIntroduction(
  position: string,
  department: string,
  targetDuration: number,
  draftText: string
) {
  const userMessage = `用户对 AI 生成的自我介绍进行了修改，请审阅：

【岗位】${position} - ${department}
【目标时长】${targetDuration}秒

【修改后的自我介绍】
${draftText}

请给出审阅反馈，返回 JSON：
{
  "strengths": ["改得好的地方1", "改得好的地方2"],
  "suggestions": [
    { "sentence": "建议调整的句子（引用原文）", "reason": "调整原因" }
  ],
  "scores": {
    "rhythm": 节奏感评分(1-5),
    "relevance": 岗位匹配度评分(1-5),
    "clarity": 亮点清晰度评分(1-5)
  }
}`

  const response = await callDeepSeek(userMessage, userMessage, 2000)
  return parseAIJson<{
    strengths: string[]
    suggestions: Array<{ sentence: string; reason: string }>
    scores: {
      rhythm: number
      relevance: number
      clarity: number
    }
  }>(response)
}

/**
 * 解析岗位JD内容，提取结构化信息
 * 专门针对暑期实习JD宽泛的特点进行优化
 */
export async function parseJobDescription(
  jdContent: string,
  url?: string,
  title?: string
): Promise<{
  company: string;
  position: string;
  department: string;
  responsibilities: string[];
  requirements: string[];
  summary: string;
  confidence: number;
}> {
  const systemPrompt = `你是一位专业的招聘专家，擅长从岗位描述中提取结构化信息。
请严格按照 JSON 格式返回，不要输出任何其他内容。

特别注意：
1. 暑期实习的JD通常比较宽泛，请尽量提取具体信息
2. 如果信息不明确，可以合理推断或留空
3. 职责和要求要分开提取
4. 公司、岗位、业务线信息优先从标题和内容中提取

返回格式：
{
  "company": "公司名称（如：字节跳动）",
  "position": "岗位名称（如：产品经理实习生）",
  "department": "业务线/部门（如：抖音电商）",
  "responsibilities": ["职责1", "职责2", "职责3"],
  "requirements": ["要求1", "要求2", "要求3"],
  "summary": "JD内容摘要（2-3句话）",
  "confidence": 0.8 // 解析置信度 0-1
}`;

  const userMessage = `请解析以下岗位描述：

【URL】${url || '无'}
【标题】${title || '无'}

【JD内容】
${jdContent}

请提取结构化信息，特别注意暑期实习JD通常比较宽泛，请尽量提取具体信息。`;

  const response = await callDeepSeek(systemPrompt, userMessage, 2000);
  return parseAIJson<{
    company: string;
    position: string;
    department: string;
    responsibilities: string[];
    requirements: string[];
    summary: string;
    confidence: number;
  }>(response);
}