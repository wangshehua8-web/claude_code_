import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { applicationStorage } from '@/lib/storage'
import { Application, ApplicationStatus } from '@/types'
import { extractWebContent, isValidUrl, inferChannelFromUrl, extractCompanyFromTitle, extractPositionFromTitle } from '@/services/jina'
import { parseJobDescription } from '@/services/deepseek'

const NewApplication = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parseSuccess, setParseSuccess] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState<Partial<Application>>({
    company: '',
    position: '',
    department: '',
    channel: '官网',
    status: '已投递' as ApplicationStatus,
    appliedAt: new Date().toISOString().split('T')[0],
    deadline: '',
    interviewAt: '',
    jdText: '',
    jdUrl: '',
    resumeId: '',
    notes: '',
  })

  // 投递渠道选项
  const channelOptions = ['官网', '内推', '猎聘', 'Boss直聘', '其他']

  // 状态选项
  const statusOptions: ApplicationStatus[] = [
    '已投递',
    '简历筛选中',
    '笔试邀请',
    '一面邀请',
    '二面邀请',
    '三面邀请',
    'HR面',
    'Offer',
    '已拒绝',
    '已放弃',
  ]

  // 处理表单变化
  const handleChange = (field: keyof Application, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 解析JD链接
  const handleParseJD = async () => {
    if (!formData.jdUrl?.trim()) {
      setParseError('请输入JD链接')
      return
    }

    if (!isValidUrl(formData.jdUrl)) {
      setParseError('请输入有效的URL格式 (http:// 或 https://)')
      return
    }

    setIsParsing(true)
    setParseError('')
    setParseSuccess(false)

    try {
      // 步骤1: 提取网页内容
      const { content, title } = await extractWebContent(formData.jdUrl)

      // 步骤2: 从URL推断渠道
      const inferredChannel = inferChannelFromUrl(formData.jdUrl)

      // 步骤3: 尝试从标题提取基本信息
      const extractedCompany = extractCompanyFromTitle(title || '')
      const extractedPosition = extractPositionFromTitle(title || '')

      // 步骤4: 使用AI解析JD内容
      const parsedResult = await parseJobDescription(content, formData.jdUrl, title)

      // 步骤5: 更新表单数据
      setFormData(prev => ({
        ...prev,
        company: extractedCompany || parsedResult.company || prev.company,
        position: extractedPosition || parsedResult.position || prev.position,
        department: parsedResult.department || prev.department,
        channel: inferredChannel !== '其他' ? inferredChannel : prev.channel,
        jdText: [
          `【岗位职责】`,
          ...parsedResult.responsibilities.map(r => `• ${r}`),
          `\n【任职要求】`,
          ...parsedResult.requirements.map(r => `• ${r}`),
          `\n【摘要】${parsedResult.summary}`
        ].join('\n')
      }))

      setParseSuccess(true)

      // 自动滚动到顶部显示成功消息
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('解析JD失败:', error)
      setParseError(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsParsing(false)
    }
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 生成唯一ID
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      // 创建完整的投递记录
      const newApplication: Application = {
        id,
        company: formData.company || '',
        position: formData.position || '',
        department: formData.department || '',
        channel: formData.channel || '官网',
        status: formData.status || '已投递',
        appliedAt: formData.appliedAt || now,
        deadline: formData.deadline || undefined,
        interviewAt: formData.interviewAt || undefined,
        jdText: formData.jdText || undefined,
        jdUrl: formData.jdUrl || undefined,
        resumeId: formData.resumeId || undefined,
        notes: formData.notes || undefined,
        createdAt: now,
        updatedAt: now,
      }

      // 保存到存储
      applicationStorage.save(newApplication)

      // 显示成功消息并跳转
      setTimeout(() => {
        navigate(`/applications/${id}`)
      }, 500)

    } catch (error) {
      console.error('保存投递记录失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/applications')}
            className="mb-4 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回投递看板
          </Button>
          <h1 className="text-3xl font-bold text-sage-800">新建投递</h1>
          <p className="text-stone-600 mt-2">记录新的岗位投递，开始追踪求职进度</p>
        </div>
      </div>

      {/* 解析状态提示 */}
      {parseError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-rose-700">{parseError}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParseError('')}
              className="ml-auto text-rose-600 hover:bg-rose-100"
            >
              关闭
            </Button>
          </div>
        </div>
      )}

      {parseSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-emerald-700 font-medium">解析成功！</p>
              <p className="text-emerald-600 text-sm mt-1">
                已自动填充公司、岗位等信息，请检查并编辑
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParseSuccess(false)}
              className="ml-auto text-emerald-600 hover:bg-emerald-100"
            >
              关闭
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本公司信息 */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Building className="w-5 h-5 mr-2 text-sage-600" />
                  公司信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="mb-2 block">
                      公司名称 *
                    </Label>
                    <Input
                      id="company"
                      placeholder="例如：字节跳动"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position" className="mb-2 block">
                      岗位名称 *
                    </Label>
                    <Input
                      id="position"
                      placeholder="例如：产品经理"
                      value={formData.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department" className="mb-2 block">
                      业务线/部门
                    </Label>
                    <Input
                      id="department"
                      placeholder="例如：微信支付-风控"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="channel" className="mb-2 block">
                      投递渠道
                    </Label>
                    <select
                      id="channel"
                      value={formData.channel}
                      onChange={(e) => handleChange('channel', e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                    >
                      {channelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JD 信息 */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-sage-600" />
                  岗位要求 (JD)
                  <span className="ml-2 text-sm font-normal text-stone-500">
                    （填写后可使用 AI 功能）
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jdUrl" className="mb-2 block">
                    JD 链接
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="jdUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.jdUrl}
                      onChange={(e) => handleChange('jdUrl', e.target.value)}
                      className="rounded-xl flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      disabled={!formData.jdUrl || isParsing}
                      onClick={handleParseJD}
                    >
                      {isParsing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {isParsing ? '解析中...' : 'AI 解析'}
                    </Button>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    输入链接后可使用 AI 一键解析功能
                  </p>
                </div>

                <div>
                  <Label htmlFor="jdText" className="mb-2 block">
                    JD 原文
                  </Label>
                  <Textarea
                    id="jdText"
                    placeholder="粘贴岗位要求、职责描述等..."
                    value={formData.jdText}
                    onChange={(e) => handleChange('jdText', e.target.value)}
                    rows={8}
                    className="rounded-xl resize-none"
                  />
                  <p className="text-sm text-stone-500 mt-1">
                    填写后可使用 AI 题库生成、自我介绍生成等功能
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 备注 */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">备注</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="记录面试官姓名、特别注意事项、后续计划等..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧状态和时间信息 */}
          <div className="space-y-6">
            {/* 状态和时间 */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-sage-600" />
                  状态与时间
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status" className="mb-2 block">
                    当前状态
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as ApplicationStatus)}
                    className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="appliedAt" className="mb-2 block">
                    投递时间
                  </Label>
                  <Input
                    id="appliedAt"
                    type="date"
                    value={formData.appliedAt}
                    onChange={(e) => handleChange('appliedAt', e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline" className="mb-2 block">
                    截止时间
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {['一面邀请', '二面邀请', '三面邀请', 'HR面'].includes(formData.status || '') && (
                  <div>
                    <Label htmlFor="interviewAt" className="mb-2 block">
                      面试时间
                    </Label>
                    <Input
                      id="interviewAt"
                      type="datetime-local"
                      value={formData.interviewAt}
                      onChange={(e) => handleChange('interviewAt', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 关联简历 */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-sage-600" />
                  关联简历
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 border-2 border-dashed border-stone-300 rounded-xl hover:border-sage-300 hover:bg-sage-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-stone-400" />
                  </div>
                  <p className="text-sm text-stone-600 mb-2">
                    暂无已上传简历
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => navigate('/profile')}
                  >
                    去上传简历
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 提交按钮 */}
            <Card className="rounded-2xl bg-sage-50 border-sage-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-sage-600" />
                    </div>
                    <div>
                      <p className="text-sm text-sage-700">
                        填写完整信息后，即可使用 AI 题库生成、自我介绍定制等高级功能
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => navigate('/applications')}
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl bg-sage-500 hover:bg-sage-600"
                      disabled={isSubmitting || !formData.company || !formData.position}
                    >
                      {isSubmitting ? '保存中...' : '保存投递记录'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

export default NewApplication