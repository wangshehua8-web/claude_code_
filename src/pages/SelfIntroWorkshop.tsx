import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  User,
  FileText,
  Target,
  Clock,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Edit,
  ThumbsUp,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SelfIntroWorkshop = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Step 1 表单数据
  const [step1Data, setStep1Data] = useState({
    jdText: '我们正在寻找一位有热情的产品经理，需要具备用户调研、产品设计、数据分析能力，有实习经验者优先。',
    department: '微信支付-风控',
    scenario: '视频面' as const,
    targetDuration: 90 as 60 | 90 | 120,
    resumeId: '1',
  })

  // Step 2 亮点数据
  const [highlights, setHighlights] = useState([
    { id: '1', point: '用户调研能力', evidence: '在腾讯实习期间，主导了某功能的用户调研，访谈了50+用户，输出调研报告驱动产品迭代', isConfirmed: true, isCustomEdited: false },
    { id: '2', point: '产品设计能力', evidence: '设计了校园招聘系统的产品原型，完成PRD文档撰写，获得团队好评', isConfirmed: true, isCustomEdited: false },
    { id: '3', point: '数据分析能力', evidence: '使用SQL和Python分析用户行为数据，提出优化建议使转化率提升15%', isConfirmed: false, isCustomEdited: false },
  ])

  // Step 3 草稿数据
  const [draftText, setDraftText] = useState(`面试官您好，我是来自厦门大学计算机科学专业的应届生。\n\n在腾讯的产品经理实习中，我主导了用户调研项目，通过深度访谈50多位用户，输出了详细的调研报告，直接驱动了产品功能的优化迭代。\n\n此外，我还设计了校园招聘系统的产品原型，从0到1完成了PRD文档的撰写，获得了团队的高度认可。\n\n最后，我具备扎实的数据分析能力，能够使用SQL和Python分析用户行为，曾通过数据分析提出优化建议，帮助产品转化率提升了15%。\n\n我对贵公司的业务非常感兴趣，特别是微信支付的风控领域，希望有机会贡献自己的力量。`)

  // 处理 Step 1 数据变化
  const handleStep1Change = (field: keyof typeof step1Data, value: any) => {
    setStep1Data(prev => ({ ...prev, [field]: value }))
  }

  // 切换亮点确认状态
  const toggleHighlightConfirmation = (id: string) => {
    setHighlights(prev => prev.map(h =>
      h.id === id ? { ...h, isConfirmed: !h.isConfirmed } : h
    ))
  }

  // 替换亮点
  const replaceHighlight = (id: string) => {
    // 这里应该调用AI获取新的亮点候选
    const newHighlight = {
      id,
      point: '项目管理能力',
      evidence: '在校期间担任项目组长，协调5人团队完成毕业设计项目，按时交付并获得优秀评价',
      isConfirmed: true,
      isCustomEdited: false
    }
    setHighlights(prev => prev.map(h => h.id === id ? newHighlight : h))
  }

  // 进入下一步
  const handleNextStep = () => {
    if (currentStep < 3) {
      if (currentStep === 1) {
        // 验证Step 1数据
        if (!step1Data.jdText.trim() || !step1Data.resumeId) {
          alert('请填写完整信息')
          return
        }
        setIsGenerating(true)
        // 模拟AI分析
        setTimeout(() => {
          setIsGenerating(false)
          setCurrentStep(2)
        }, 1500)
      } else if (currentStep === 2) {
        // 验证至少确认3个亮点
        const confirmedCount = highlights.filter(h => h.isConfirmed).length
        if (confirmedCount < 3) {
          alert('请至少确认3个亮点')
          return
        }
        setIsGenerating(true)
        // 模拟AI生成
        setTimeout(() => {
          setIsGenerating(false)
          setCurrentStep(3)
        }, 2000)
      }
    }
  }

  // 上一步
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3)
    }
  }

  // 获取AI反馈
  const handleGetFeedback = () => {
    setShowFeedback(true)
  }

  // 切换语音播放
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  // 计算进度
  const progress = (currentStep - 1) * 33.33

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
          <h1 className="text-3xl font-bold text-sage-800">自我介绍工坊</h1>
          <p className="text-stone-600 mt-2">三步生成个性化自我介绍，展现最佳的自己</p>
        </div>
      </div>

      {/* 步骤进度条 */}
      <Card className="rounded-2xl mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                      currentStep === step
                        ? "bg-sage-500 text-white"
                        : currentStep > step
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-100 text-stone-400"
                    )}>
                      {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    <span className={cn(
                      "font-medium",
                      currentStep === step
                        ? "text-sage-700"
                        : currentStep > step
                        ? "text-emerald-700"
                        : "text-stone-400"
                    )}>
                      {step === 1 && '信息确认'}
                      {step === 2 && '亮点确认'}
                      {step === 3 && '生成打磨'}
                    </span>
                    {step < 3 && (
                      <ChevronRight className="w-5 h-5 text-stone-300" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-stone-500">
                进度 {Math.round(progress)}%
              </div>
            </div>
            <CustomProgress value={progress} className="h-2 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: 信息确认 */}
      {currentStep === 1 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-sage-600" />
              Step 1: 信息确认
            </CardTitle>
            <p className="text-stone-500 text-sm">
              确认岗位信息和面试场景，这是生成自我介绍的基础
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">岗位要求 (JD)</Label>
              <Textarea
                value={step1Data.jdText}
                onChange={(e) => handleStep1Change('jdText', e.target.value)}
                rows={6}
                className="rounded-xl resize-none"
                placeholder="粘贴岗位要求..."
              />
              <p className="text-sm text-stone-500 mt-1">
                填写越详细，AI 生成的自我介绍越精准
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">业务线/部门</Label>
                <Input
                  value={step1Data.department}
                  onChange={(e) => handleStep1Change('department', e.target.value)}
                  className="rounded-xl"
                  placeholder="例如：微信支付-风控"
                />
              </div>

              <div>
                <Label className="mb-2 block">面试场景</Label>
                <select
                  value={step1Data.scenario}
                  onChange={(e) => handleStep1Change('scenario', e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                >
                  <option value="电话面">电话面试</option>
                  <option value="视频面">视频面试</option>
                  <option value="现场面">现场面试</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">目标时长</Label>
                <div className="flex gap-2">
                  {[60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => handleStep1Change('targetDuration', duration)}
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-center transition-colors",
                        step1Data.targetDuration === duration
                          ? "border-sage-300 bg-sage-50 text-sage-700"
                          : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                      )}
                    >
                      {duration}秒
                    </button>
                  ))}
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  约 {Math.round(step1Data.targetDuration / 60 * 200)} 字
                </p>
              </div>

              <div>
                <Label className="mb-2 block">使用简历</Label>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-sage-600" />
                    </div>
                    <div>
                      <p className="font-medium">通用版</p>
                      <p className="text-sm text-stone-500">上传于 2026-04-01</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-xl"
              >
                取消
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={isGenerating || !step1Data.jdText.trim()}
                className="rounded-xl bg-sage-500 hover:bg-sage-600"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    下一步：分析匹配度
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: 亮点确认 */}
      {currentStep === 2 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="w-5 h-5 mr-2 text-sage-600" />
              Step 2: 亮点确认
            </CardTitle>
            <p className="text-stone-500 text-sm">
              AI 分析了你的简历与岗位匹配度，请确认要展示的亮点
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">正在分析简历与岗位匹配度...</h3>
                <p className="text-stone-500">
                  AI 正在分析你的简历，找出最匹配岗位要求的亮点
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {highlights.map((highlight) => (
                    <Card
                      key={highlight.id}
                      className={cn(
                        "rounded-xl border-2 transition-all",
                        highlight.isConfirmed
                          ? "border-sage-300 bg-sage-50"
                          : "border-stone-200"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-stone-900">
                              {highlight.point}
                            </h3>
                            <button
                              onClick={() => toggleHighlightConfirmation(highlight.id)}
                              className={cn(
                                "p-1 rounded-lg",
                                highlight.isConfirmed
                                  ? "text-emerald-600 hover:bg-emerald-100"
                                  : "text-stone-400 hover:bg-stone-100"
                              )}
                            >
                              {highlight.isConfirmed ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-stone-300 rounded-full" />
                              )}
                            </button>
                          </div>

                          <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                            {highlight.evidence}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 rounded-lg"
                              onClick={() => replaceHighlight(highlight.id)}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              换一个
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-stone-700">提示</p>
                      <p className="text-sm text-stone-600 mt-1">
                        选择最匹配岗位要求的 3 个亮点，点击"换一个"可以查看 AI 推荐的其他候选亮点。
                        点击编辑按钮可以手动修改亮点描述。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    上一步
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={highlights.filter(h => h.isConfirmed).length < 3}
                    className="rounded-xl bg-sage-500 hover:bg-sage-600"
                  >
                    下一步：生成自我介绍
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: 生成与打磨 */}
      {currentStep === 3 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-sage-600" />
              Step 3: 生成与打磨
            </CardTitle>
            <p className="text-stone-500 text-sm">
              根据确认的亮点生成的自我介绍，支持编辑和AI审阅
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">正在生成自我介绍...</h3>
                <p className="text-stone-500">
                  AI 正在为你量身定制自我介绍
                </p>
              </div>
            ) : (
              <>
                {/* 编辑区 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-medium">自我介绍草稿</Label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayback}
                        className={cn(
                          "p-2 rounded-lg",
                          isPlaying
                            ? "bg-sage-100 text-sage-600"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        )}
                      >
                        {isPlaying ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <span className="text-sm text-stone-500">
                        {isPlaying ? '播放中...' : '语音练习'}
                      </span>
                    </div>
                  </div>
                  <Textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={12}
                    className="rounded-xl resize-none font-sans text-base leading-relaxed"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-stone-500">
                      字数: {draftText.length} · 预计时长: {Math.round(draftText.length / 200 * 60)}秒
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setDraftText('')}
                    >
                      清空
                    </Button>
                  </div>
                </div>

                {/* AI 反馈区 */}
                {showFeedback ? (
                  <Card className="rounded-xl border-sage-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sage-800">AI 审阅反馈</h4>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"
                              >
                                <span className="text-xs font-medium text-emerald-700">
                                  {star}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-start gap-2 mb-2">
                            <ThumbsUp className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-emerald-700">改得好的地方</p>
                              <ul className="text-sm text-stone-600 mt-1 list-disc list-inside">
                                <li>增加了具体数据支撑，如"转化率提升15%"</li>
                                <li>开头更加简洁有力</li>
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-700">建议调整</p>
                              <div className="text-sm text-stone-600 mt-1 space-y-2">
                                <div>
                                  <p className="font-medium">"获得了团队的高度认可"</p>
                                  <p className="text-stone-500">建议改为具体成果，如"优化方案被采纳并上线"</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    onClick={handleGetFeedback}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI 审阅修改
                  </Button>
                )}

                <div className="flex justify-between pt-4">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      上一步
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        // 重新生成
                        setIsGenerating(true)
                        setTimeout(() => setIsGenerating(false), 1500)
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重新生成
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                    >
                      保存草稿
                    </Button>
                    <Button
                      className="rounded-xl bg-sage-500 hover:bg-sage-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      完成并保存
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 进度条组件
const CustomProgress = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn("w-full bg-stone-200 rounded-full overflow-hidden", className)}>
    <div
      className="h-full bg-sage-500 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
)

export default SelfIntroWorkshop