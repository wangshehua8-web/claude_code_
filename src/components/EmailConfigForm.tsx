import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Mail, Key, RefreshCw, Trash2, Save, AlertCircle } from 'lucide-react'
import { emailConfigStorage } from '@/lib/storage'
import type { EmailAccount, EmailConfig } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface EmailConfigFormProps {
  account?: EmailAccount
  onSave?: (account: EmailAccount) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
}

// 默认邮箱配置
const DEFAULT_CONFIG: EmailConfig = {
  email: '',
  password: '',
  provider: 'qq',
  imapConfig: {
    host: 'imap.qq.com',
    port: 993,
    tls: true
  },
  enabled: true,
  pollingInterval: 15, // 分钟
  keywords: ['面试', 'interview', '邀请', 'invitation']
}

// 邮箱提供商配置
const PROVIDERS = [
  { value: 'qq', label: 'QQ邮箱', host: 'imap.qq.com', port: 993 },
  { value: '163', label: '163邮箱', host: 'imap.163.com', port: 993 },
  { value: 'gmail', label: 'Gmail', host: 'imap.gmail.com', port: 993 },
  { value: 'outlook', label: 'Outlook', host: 'outlook.office365.com', port: 993 }
]

export function EmailConfigForm({ account, onSave, onCancel, onDelete }: EmailConfigFormProps) {
  const isEditing = !!account

  // 表单状态
  const [name, setName] = useState(account?.name || '')
  const [email, setEmail] = useState(account?.config.email || '')
  const [password, setPassword] = useState('') // 不显示已保存的密码
  const [provider, setProvider] = useState<EmailConfig['provider']>(account?.config.provider || 'qq')
  const [enabled, setEnabled] = useState(account?.config.enabled ?? true)
  const [pollingInterval, setPollingInterval] = useState(account?.config.pollingInterval || 15)
  const [keywords, setKeywords] = useState(account?.config.keywords.join(', ') || '面试, interview, 邀请')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 根据提供商更新IMAP配置
  const updateImapConfig = (providerValue: EmailConfig['provider']) => {
    const providerConfig = PROVIDERS.find(p => p.value === providerValue)
    if (providerConfig) {
      // IMAP配置会自动使用提供商默认值
      return
    }
  }

  // 处理提供商变更
  const handleProviderChange = (value: EmailConfig['provider']) => {
    setProvider(value)
    updateImapConfig(value)
  }

  // 验证表单
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('请输入账户名称')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      setError('请输入有效的邮箱地址')
      return false
    }
    if (!password.trim() && !isEditing) {
      setError('请输入邮箱授权码')
      return false
    }
    if (pollingInterval < 5 || pollingInterval > 1440) {
      setError('轮询间隔应在5分钟到24小时之间')
      return false
    }
    return true
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 解析关键词
      const keywordArray = keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)

      // 获取提供商配置
      const providerConfig = PROVIDERS.find(p => p.value === provider) || PROVIDERS[0]

      // 构建配置
      const config: EmailConfig = {
        email: email.trim(),
        password: password || account?.config.password || '', // 编辑时如果没有输入新密码，使用原密码
        provider,
        imapConfig: {
          host: providerConfig.host,
          port: providerConfig.port,
          tls: true
        },
        enabled,
        pollingInterval,
        keywords: keywordArray.length > 0 ? keywordArray : DEFAULT_CONFIG.keywords
      }

      // 构建账户对象
      const emailAccount: EmailAccount = {
        id: account?.id || uuidv4(),
        name: name.trim(),
        config,
        lastChecked: account?.lastChecked || new Date().toISOString(),
        status: account?.status || 'active'
      }

      // 保存到存储
      emailConfigStorage.save(emailAccount)

      // 回调
      if (onSave) {
        onSave(emailAccount)
      }

      setSuccess(true)

      // 如果不是编辑模式，重置表单
      if (!isEditing) {
        setName('')
        setEmail('')
        setPassword('')
        setProvider('qq')
        setEnabled(true)
        setPollingInterval(15)
        setKeywords('面试, interview, 邀请')
      }

      // 3秒后清除成功消息
      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      console.error('保存邮箱配置失败:', err)
      setError(err.message || '保存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除账户
  const handleDelete = () => {
    if (!account || !onDelete) return

    if (confirm(`确定要删除邮箱账户 "${account.name}" 吗？`)) {
      onDelete(account.id)
    }
  }

  // 测试连接（占位符，实际功能在后续实现）
  const handleTestConnection = () => {
    alert('测试连接功能将在后续版本中实现')
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {isEditing ? '编辑邮箱账户' : '添加邮箱账户'}
        </CardTitle>
        <CardDescription>
          配置邮箱账户以自动监控面试邀请邮件
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 错误/成功消息 */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
              邮箱配置保存成功！
            </div>
          )}

          {/* 基础信息 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-700">基础信息</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 账户名称 */}
              <div className="space-y-2">
                <Label htmlFor="name">账户名称 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：求职主邮箱"
                  required
                  className="rounded-xl"
                />
                <p className="text-xs text-stone-500">用于标识此邮箱账户</p>
              </div>

              {/* 邮箱提供商 */}
              <div className="space-y-2">
                <Label htmlFor="provider">邮箱提供商 *</Label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value as EmailConfig['provider'])}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 邮箱地址 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址 *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`${provider === 'qq' ? 'username@qq.com' : 'username@example.com'}`}
                required
                className="rounded-xl"
              />
            </div>

            {/* 授权码/密码 */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditing ? '新授权码 (留空保持不变)' : '授权码 *'}
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? '输入新授权码，留空保持不变' : '输入邮箱授权码（IMAP/SMTP）'}
                  required={!isEditing}
                  className="pl-10 rounded-xl"
                />
              </div>
              <p className="text-xs text-stone-500">
                {provider === 'qq' && '需要在QQ邮箱设置中生成授权码'}
                {provider === '163' && '需要在163邮箱设置中开启IMAP并设置授权码'}
                {provider === 'gmail' && '需要使用Google账户的App密码'}
                {provider === 'outlook' && '需要使用Microsoft账户的应用密码'}
              </p>
            </div>
          </div>

          <Separator />

          {/* 监控设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-700">监控设置</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 启用状态 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">启用监控</Label>
                  <p className="text-xs text-stone-500">启用后会自动监控此邮箱</p>
                </div>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              {/* 轮询间隔 */}
              <div className="space-y-2">
                <Label htmlFor="pollingInterval">轮询间隔（分钟）*</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pollingInterval"
                    type="number"
                    min="5"
                    max="1440"
                    value={pollingInterval}
                    onChange={(e) => setPollingInterval(Number(e.target.value))}
                    className="rounded-xl"
                  />
                  <span className="text-sm text-stone-500 whitespace-nowrap">分钟</span>
                </div>
                <p className="text-xs text-stone-500">建议15-30分钟，太频繁可能被限制</p>
              </div>
            </div>

            {/* 关键词 */}
            <div className="space-y-2">
              <Label htmlFor="keywords">面试邀请关键词 *</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="用逗号分隔关键词，例如：面试, interview, 邀请"
                className="rounded-xl"
              />
              <p className="text-xs text-stone-500">
                邮件主题或内容包含这些关键词时会被识别为面试邀请
              </p>
            </div>
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-sage-500 hover:bg-sage-600 flex-1"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? '更新配置' : '保存配置'}
                </>
              )}
            </Button>

            {isEditing && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  className="rounded-xl flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  测试连接
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除账户
                </Button>
              </>
            )}

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="rounded-xl flex-1"
              >
                取消
              </Button>
            )}
          </div>

          {/* 安全提示 */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">安全提示</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>授权码会加密存储在本地浏览器中</li>
                  <li>授权码仅用于读取邮件，不会发送邮件或修改邮箱设置</li>
                  <li>建议使用专门为JobReady生成的授权码</li>
                  <li>定期更新授权码以确保安全</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}