import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Mic,
  MicOff,
  Star,
  Clock,
  Filter,
  BookOpen,
  Target,
  Volume2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Loader2,
  Trash2,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  generateInterviewQuestions,
  parseInterviewExperience,
  evaluateMockAnswer
} from '@/services/deepseek'
import {
  extractWebContent,
  isValidUrl
} from '@/services/jina'

const InterviewPrep = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [activeTab, setActiveTab] = useState<'ai' | 'experience'>('ai')
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Step 3 新增状态
  const [urlInput, setUrlInput] = useState('')
  const [isParsingUrl, setIsParsingUrl] = useState(false)
  const [parsedContent, setParsedContent] = useState<string>('')
  const [parsedTitle, setParsedTitle] = useState<string>('')
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isParsingExperience, setIsParsingExperience] = useState(false)
  const [experienceText, setExperienceText] = useState<string>('')
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [parsedExperienceQuestions, setParsedExperienceQuestions] = useState<any[]>([])
  const [aiFeedback, setAiFeedback] = useState<any>(null)
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false)
  const [showUrlParser, setShowUrlParser] = useState(false)
  const [showExperienceParser, setShowExperienceParser] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // 模拟题库数据
  const questions = {
    ai: [
      { id: '1', content: '请介绍一个你主导的成功项目，你在其中扮演了什么角色？', category: '行为题', difficulty: '中等' },
      { id: '2', content: '如果让你设计一个校园招聘系统，你会考虑哪些核心功能？', category: '专业技能题', difficulty: '中等' },
      { id: '3', content: '你认为我们公司的业务在接下来三年会面临哪些挑战？', category: '业务理解题', difficulty: '困难' },
      { id: '4', content: '你对这个岗位最感兴趣的是什么？有什么问题想问我们？', category: '反问题', difficulty: '简单' },
    ],
    experience: [
      { id: '5', content: '在字节跳动的面试中，面试官问到了哪些关于产品设计的问题？', category: '真题', difficulty: '中等', source: '小红书' },
      { id: '6', content: '腾讯的一面问了哪些关于用户体验的问题？', category: '真题', difficulty: '中等', source: '牛客' },
    ]
  }

  // 开始/停止录音
  const handleToggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // 模拟语音识别
      setTimeout(() => {
        setAnswer(prev => prev + ' 这是一个模拟的语音输入回答。')
        setIsRecording(false)
      }, 2000)
    }
  }

  // ========== Step 3 功能实现 ==========

  // 1. URL 解析功能
  const handleParseUrl = async () => {
    if (!urlInput.trim()) {
      setErrorMessage('请输入有效的 URL')
      return
    }

    if (!isValidUrl(urlInput)) {
      setErrorMessage('请输入有效的 URL 格式 (http:// 或 https://)')
      return
    }

    setIsParsingUrl(true)
    setErrorMessage('')

    try {
      const result = await extractWebContent(urlInput)
      setParsedContent(result.content)
      setParsedTitle(result.title || '')
      setShowUrlParser(true)
    } catch (error) {
      setErrorMessage(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsParsingUrl(false)
    }
  }

  // 2. AI 题库生成功能
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true)
    setErrorMessage('')

    try {
      // 这里需要从应用数据中获取 JD 和简历信息
      // 暂时使用模拟数据
      const jdText = '我们正在寻找一位有热情的产品经理，需要具备用户调研、产品设计、数据分析能力，有实习经验者优先。'
      const resumeText = '厦门大学计算机科学专业，腾讯产品经理实习经验，主导用户调研项目...'
      const department = '微信支付-风控'

      const result = await generateInterviewQuestions(jdText, resumeText, department)
      setGeneratedQuestions(result.questions)
      setActiveTab('ai')
    } catch (error) {
      setErrorMessage(`生成题库失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  // 3. 面经解析功能
  const handleParseExperience = async () => {
    if (!experienceText.trim()) {
      setErrorMessage('请输入面经内容')
      return
    }

    setIsParsingExperience(true)
    setErrorMessage('')

    try {
      const company = '腾讯'
      const position = '产品经理'
      const department = '微信支付-风控'

      const result = await parseInterviewExperience(experienceText, company, position, department)
      setParsedExperienceQuestions(result.questions)
      setActiveTab('experience')
      setShowExperienceParser(false)
    } catch (error) {
      setErrorMessage(`解析面经失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsParsingExperience(false)
    }
  }

  // 4. 模拟回答评分功能
  const handleEvaluateAnswer = async () => {
    if (!answer.trim()) {
      setErrorMessage('请输入回答内容')
      return
    }

    const selectedQuestionData = [...questions.ai, ...questions.experience].find(q => q.id === selectedQuestion)
    if (!selectedQuestionData) {
      setErrorMessage('请先选择题目')
      return
    }

    setIsEvaluatingAnswer(true)
    setErrorMessage('')

    try {
      const company = '腾讯'
      const position = '产品经理'
      const examIntent = selectedQuestionData.category === '行为题' ? '考察候选人的项目经验和解决问题能力' :
                        selectedQuestionData.category === '专业技能题' ? '考察候选人的专业知识和技能水平' :
                        '考察候选人的业务理解和思考深度'

      const result = await evaluateMockAnswer(
        selectedQuestionData.content,
        examIntent,
        company,
        position,
        answer
      )

      setAiFeedback(result)
      setShowFeedback(true)
    } catch (error) {
      setErrorMessage(`评估失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsEvaluatingAnswer(false)
    }
  }

  // 复制解析内容到面经输入框
  const handleCopyToExperience = () => {
    if (parsedContent) {
      setExperienceText(parsedContent)
      setShowExperienceParser(true)
    }
  }

  // 清空URL解析内容
  const handleClearParsedContent = () => {
    setParsedContent('')
    setParsedTitle('')
    setShowUrlParser(false)
    setUrlInput('')
  }

  // 清空面经内容
  const handleClearExperience = () => {
    setExperienceText('')
    setParsedExperienceQuestions([])
    setShowExperienceParser(false)
  }


  return (
    <div>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to={`/applications/${applicationId}`}>
            <Button variant="ghost" className="mb-4 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回岗位详情
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-sage-800">面试备战</h1>
          <p className="text-stone-600 mt-2">模拟真实面试场景，提前准备，轻松应对</p>
        </div>
        <div className="flex items-center gap-3">
          {/* URL 一键解析器 */}
          <div className="relative">
            <div className="flex items-center">
              <Input
                placeholder="粘贴岗位JD链接..."
                value={urlInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrlInput(e.target.value)}
                className="rounded-xl w-64"
              />
              <Button
                onClick={handleParseUrl}
                disabled={isParsingUrl || !urlInput.trim()}
                variant="outline"
                className="ml-2 rounded-xl"
              >
                {isParsingUrl ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                {isParsingUrl ? '解析中...' : '一键解析'}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuestions}
            disabled={isGeneratingQuestions}
            variant="outline"
            className="rounded-xl"
          >
            {isGeneratingQuestions ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGeneratingQuestions ? '生成中...' : '生成题库'}
          </Button>
          <Button
            onClick={() => setShowExperienceParser(!showExperienceParser)}
            className="rounded-xl bg-sage-500 hover:bg-sage-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            录入面经
          </Button>
        </div>
      </div>

      {/* 错误消息 */}
      {errorMessage && (
        <div className="mb-6">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-rose-700">{errorMessage}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setErrorMessage('')}
                className="ml-auto text-rose-600 hover:bg-rose-100"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* URL 解析结果 */}
      {showUrlParser && parsedContent && (
        <Card className="mb-6 rounded-2xl border-sage-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-sage-600" />
                URL 解析结果
                {parsedTitle && (
                  <span className="ml-2 text-sm font-normal text-stone-500"> - {parsedTitle}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToExperience}
                  className="rounded-lg"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  转为面经
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearParsedContent}
                  className="rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                value={parsedContent}
                readOnly
                rows={8}
                className="rounded-xl bg-stone-50 resize-none font-mono text-sm"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-stone-500">
                  字符数: {parsedContent.length}
                </span>
                <span className="text-sm text-sage-600">
                  ✓ 解析成功
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 面经解析器 */}
      {showExperienceParser && (
        <Card className="mb-6 rounded-2xl border-sage-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-sage-600" />
                面经解析
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleParseExperience}
                  disabled={isParsingExperience || !experienceText.trim()}
                  className="rounded-lg"
                >
                  {isParsingExperience ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {isParsingExperience ? '解析中...' : '解析面经'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearExperience}
                  className="rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">粘贴面经原文</Label>
                <Textarea
                  placeholder="粘贴你收集到的面试经验（牛客、小红书、知乎等平台的内容）..."
                  value={experienceText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExperienceText(e.target.value)}
                  rows={8}
                  className="rounded-xl resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-stone-500">
                    字符数: {experienceText.length}
                  </span>
                  {parsedContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExperienceText(parsedContent)}
                      className="text-sage-600 hover:text-sage-700"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      使用URL解析结果
                    </Button>
                  )}
                </div>
              </div>

              {/* 解析结果预览 */}
              {parsedExperienceQuestions.length > 0 && (
                <div className="border-t border-stone-200 pt-4">
                  <h4 className="font-medium text-stone-700 mb-3">已解析题目 ({parsedExperienceQuestions.length}个)</h4>
                  <div className="space-y-3">
                    {parsedExperienceQuestions.slice(0, 3).map((q, index) => (
                      <div key={index} className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <p className="text-sm font-medium text-stone-900">{q.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {q.category && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {q.category}
                            </span>
                          )}
                          {q.round && (
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                              {q.round}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {parsedExperienceQuestions.length > 3 && (
                      <p className="text-sm text-stone-500 text-center">
                        还有 {parsedExperienceQuestions.length - 3} 个题目...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：题库管理 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 题库来源切换 */}
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">题库管理</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'ai' | 'experience')}>
                <TabsList className="grid grid-cols-2 mb-6 rounded-2xl p-1 bg-stone-100">
                  <TabsTrigger value="ai" className="rounded-xl data-[state=active]:bg-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 生成题库
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="rounded-xl data-[state=active]:bg-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    面经录入
                  </TabsTrigger>
                </TabsList>

                {/* AI 题库 Tab */}
                <TabsContent value="ai" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-stone-600">
                        基于岗位要求生成的个性化题目
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Filter className="w-4 h-4 mr-2" />
                        筛选
                      </Button>
                    </div>
                  </div>

                  {isGeneratingQuestions ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 text-sage-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-stone-700 mb-2">正在生成题库...</h3>
                      <p className="text-stone-500">
                        AI 正在分析岗位要求和简历，生成个性化面试题目
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {generatedQuestions.length > 0 ? (
                        <>
                          {generatedQuestions.map((q, index) => (
                            <div
                              key={index}
                              className={cn(
                                "p-4 rounded-xl border cursor-pointer transition-all",
                                selectedQuestion === `ai-${index}`
                                  ? "border-sage-300 bg-sage-50"
                                  : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                              )}
                              onClick={() => {
                                setSelectedQuestion(`ai-${index}`)
                                setShowFeedback(false)
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                      "px-2 py-1 rounded text-xs font-medium",
                                      q.category === '行为题' && "bg-blue-100 text-blue-800",
                                      q.category === '专业技能题' && "bg-purple-100 text-purple-800",
                                      q.category === '业务理解题' && "bg-indigo-100 text-indigo-800",
                                      q.category === '反问题' && "bg-amber-100 text-amber-800"
                                    )}>
                                      {q.category}
                                    </span>
                                    <span className="text-xs text-sage-600 bg-sage-100 px-2 py-1 rounded">
                                      AI生成
                                    </span>
                                    <span className="text-xs text-stone-500">推荐</span>
                                  </div>
                                  <p className="font-medium text-stone-900">{q.content}</p>
                                  {q.examIntent && (
                                    <p className="text-xs text-stone-500 mt-2">
                                      考察意图：{q.examIntent}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg"
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation()
                                    setSelectedQuestion(`ai-${index}`)
                                    setShowFeedback(false)
                                  }}
                                >
                                  练习
                                </Button>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {questions.ai.map((q) => (
                            <div
                              key={q.id}
                              className={cn(
                                "p-4 rounded-xl border cursor-pointer transition-all",
                                selectedQuestion === q.id
                                  ? "border-sage-300 bg-sage-50"
                                  : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                              )}
                              onClick={() => {
                                setSelectedQuestion(q.id)
                                setShowFeedback(false)
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                      "px-2 py-1 rounded text-xs font-medium",
                                      q.category === '行为题' && "bg-blue-100 text-blue-800",
                                      q.category === '专业技能题' && "bg-purple-100 text-purple-800",
                                      q.category === '业务理解题' && "bg-indigo-100 text-indigo-800",
                                      q.category === '反问题' && "bg-amber-100 text-amber-800"
                                    )}>
                                      {q.category}
                                    </span>
                                    <span className="text-xs text-stone-500">{q.difficulty}</span>
                                    <span className="text-xs text-sage-600 bg-sage-100 px-2 py-1 rounded">
                                      AI生成
                                    </span>
                                  </div>
                                  <p className="font-medium text-stone-900">{q.content}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg"
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation()
                                    setSelectedQuestion(q.id)
                                    setShowFeedback(false)
                                  }}
                                >
                                  练习
                                </Button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* 面经 Tab */}
                <TabsContent value="experience" className="space-y-4">
                  {isParsingExperience ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 text-sage-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-stone-700 mb-2">正在解析面经...</h3>
                      <p className="text-stone-500">
                        AI 正在分析面经内容，提取结构化面试题目
                      </p>
                    </div>
                  ) : parsedExperienceQuestions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-stone-600">
                            从面经中提取的题目
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Filter className="w-4 h-4 mr-2" />
                            筛选
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {parsedExperienceQuestions.map((q, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-4 rounded-xl border cursor-pointer transition-all",
                              selectedQuestion === `exp-${index}`
                                ? "border-sage-300 bg-sage-50"
                                : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                            )}
                            onClick={() => {
                              setSelectedQuestion(`exp-${index}`)
                              setShowFeedback(false)
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    q.category === '行为题' && "bg-blue-100 text-blue-800",
                                    q.category === '专业技能题' && "bg-purple-100 text-purple-800",
                                    q.category === '业务理解题' && "bg-indigo-100 text-indigo-800",
                                    q.category === '反问题' && "bg-amber-100 text-amber-800",
                                    q.category === '真题' && "bg-rose-100 text-rose-800",
                                    (!q.category || q.category === '其他') && "bg-stone-100 text-stone-800"
                                  )}>
                                    {q.category || '其他'}
                                  </span>
                                  {q.round && (
                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                      {q.round}
                                    </span>
                                  )}
                                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                                    面经提取
                                  </span>
                                </div>
                                <p className="font-medium text-stone-900">{q.content}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation()
                                  setSelectedQuestion(`exp-${index}`)
                                  setShowFeedback(false)
                                }}
                              >
                                练习
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-stone-700 mb-2">录入真实面经</h3>
                      <p className="text-stone-500 mb-4">
                        分享你在面试中遇到的实际问题，AI 将帮你整理分析
                      </p>
                      <Button
                        onClick={() => setShowExperienceParser(true)}
                        className="rounded-xl bg-sage-500 hover:bg-sage-600"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        添加面经
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：模拟作答区 */}
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-sage-600" />
                模拟作答
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedQuestion ? (
                <div className="space-y-6">
                  {/* 题目显示 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm font-medium rounded-full">
                        当前题目
                      </span>
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span className="text-sm text-stone-500">建议用时: 3分钟</span>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl">
                      <p className="font-medium text-stone-900">
                        {(() => {
                          // 从所有可能的来源查找题目
                          if (selectedQuestion.startsWith('ai-')) {
                            const index = parseInt(selectedQuestion.replace('ai-', ''))
                            return generatedQuestions[index]?.content || '题目内容加载中...'
                          } else if (selectedQuestion.startsWith('exp-')) {
                            const index = parseInt(selectedQuestion.replace('exp-', ''))
                            return parsedExperienceQuestions[index]?.content || '题目内容加载中...'
                          } else {
                            // 原始模拟数据
                            return [...questions.ai, ...questions.experience].find(q => q.id === selectedQuestion)?.content || '题目内容加载中...'
                          }
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* 作答区 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">你的回答</Label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleToggleRecording}
                          className={cn(
                            "p-2 rounded-lg",
                            isRecording
                              ? "bg-rose-100 text-rose-600"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          )}
                        >
                          {isRecording ? (
                            <MicOff className="w-5 h-5" />
                          ) : (
                            <Mic className="w-5 h-5" />
                          )}
                        </button>
                        <span className="text-xs text-stone-500">
                          {isRecording ? '录音中...' : '语音输入'}
                        </span>
                      </div>
                    </div>
                    <Textarea
                      placeholder="输入你的回答，或使用语音输入..."
                      value={answer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                      rows={8}
                      className="rounded-xl resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-stone-500">
                        字数: {answer.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setAnswer('')}
                      >
                        清空
                      </Button>
                    </div>
                  </div>

                  {/* 获取反馈按钮 */}
                  <Button
                    onClick={handleEvaluateAnswer}
                    className="w-full rounded-xl bg-sage-500 hover:bg-sage-600"
                    disabled={!answer.trim() || isEvaluatingAnswer}
                  >
                    {isEvaluatingAnswer ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        评估中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        获取 AI 反馈
                      </>
                    )}
                  </Button>

                  {/* 反馈结果 */}
                  {showFeedback && aiFeedback && (
                    <div className="space-y-4">
                      <div className="border-t border-stone-200 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-stone-900">AI 反馈</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-5 h-5",
                                  i < aiFeedback.score
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-stone-300"
                                )}
                              />
                            ))}
                            <span className="ml-2 font-medium">{aiFeedback.score}/5</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-stone-700">结构性</p>
                              <p className="text-sm text-stone-600">{aiFeedback.structure}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-stone-700">岗位匹配度</p>
                              <p className="text-sm text-stone-600">{aiFeedback.relevance}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Volume2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-stone-700">表达清晰度</p>
                              <p className="text-sm text-stone-600">{aiFeedback.clarity}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-stone-700">改进建议</p>
                              <p className="text-sm text-stone-600">{aiFeedback.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 rounded-xl">
                          <XCircle className="w-4 h-4 mr-2" />
                          标记为待练
                        </Button>
                        <Button
                          className="flex-1 rounded-xl bg-sage-500 hover:bg-sage-600"
                          onClick={() => {
                            setSelectedQuestion(null)
                            setAnswer('')
                            setShowFeedback(false)
                            setAiFeedback(null)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          下一题
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-stone-700 mb-2">选择题目开始练习</h3>
                  <p className="text-stone-500">
                    从左侧题库中选择一道题目，开始模拟面试
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 掌握程度统计 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">掌握程度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: '未练习', count: 12, color: 'bg-stone-100' },
                  { label: '待练', count: 8, color: 'bg-amber-100' },
                  { label: '掌握', count: 15, color: 'bg-emerald-100' },
                  { label: '重点', count: 5, color: 'bg-rose-100' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-stone-700">{item.label}</span>
                    </div>
                    <span className="font-medium">{item.count} 题</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


export default InterviewPrep