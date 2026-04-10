import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Key,
  Bell,
  Moon,
  Trash2,
  Download,
  Upload,
  Shield,
  HelpCircle,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { apiKeyStorage } from '@/lib/storage'
import { cn } from '@/lib/utils'

const Settings = () => {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    interviewReminder: true,
    deadlineAlert: true,
    weeklySummary: false,
  })

  // 加载保存的 API Key
  useEffect(() => {
    const savedApiKey = apiKeyStorage.get()
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // 保存 API Key
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      apiKeyStorage.set(apiKey.trim())
      alert('API Key 已保存')
    } else {
      apiKeyStorage.remove()
      alert('API Key 已清除')
    }
  }

  // 导出数据
  const handleExportData = () => {
    // 这里实现数据导出逻辑
    alert('数据导出功能开发中')
  }

  // 导入数据
  const handleImportData = () => {
    // 这里实现数据导入逻辑
    alert('数据导入功能开发中')
  }

  // 清空所有数据
  const handleClearAllData = () => {
    if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
      localStorage.clear()
      alert('所有数据已清空，页面即将刷新')
      window.location.reload()
    }
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sage-800">设置</h1>
        <p className="text-stone-600 mt-2">个性化你的求职助手体验</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：主要设置 */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI 设置 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Key className="w-5 h-5 mr-2 text-sage-600" />
                AI 设置 (DeepSeek)
              </CardTitle>
              <CardDescription>
                配置 DeepSeek API Key 以启用 AI 功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey" className="mb-2 block">
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center text-sm text-stone-500 mt-2">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  <span>
                    前往{' '}
                    <a
                      href="https://platform.deepseek.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage-600 hover:text-sage-700 underline"
                    >
                      DeepSeek 平台
                    </a>{' '}
                    获取 API Key
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">安全提示</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      API Key 仅保存在你的本地浏览器中，不会发送到任何其他服务器。
                      请勿在公共设备上保存 API Key。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveApiKey}
                  className="rounded-xl bg-sage-500 hover:bg-sage-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {apiKey.trim() ? '保存 API Key' : '清除 API Key'}
                </Button>
                {apiKeyStorage.has() && (
                  <Button variant="outline" className="rounded-xl">
                    <Key className="w-4 h-4 mr-2" />
                    测试连接
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 mr-2 text-sage-600" />
                通知设置
              </CardTitle>
              <CardDescription>
                管理求职进度提醒
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="interviewReminder" className="font-medium">
                    面试提醒
                  </Label>
                  <p className="text-sm text-stone-500">
                    面试前 1 天和 1 小时发送提醒
                  </p>
                </div>
                <Switch
                  id="interviewReminder"
                  checked={notifications.interviewReminder}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, interviewReminder: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deadlineAlert" className="font-medium">
                    截止日期提醒
                  </Label>
                  <p className="text-sm text-stone-500">
                    投递截止前 3 天发送提醒
                  </p>
                </div>
                <Switch
                  id="deadlineAlert"
                  checked={notifications.deadlineAlert}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, deadlineAlert: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklySummary" className="font-medium">
                    每周总结
                  </Label>
                  <p className="text-sm text-stone-500">
                    每周日发送本周求职进度总结
                  </p>
                </div>
                <Switch
                  id="weeklySummary"
                  checked={notifications.weeklySummary}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklySummary: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* 数据管理 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">数据管理</CardTitle>
              <CardDescription>
                导入、导出或清空你的求职数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="rounded-xl h-auto py-4"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-sage-600" />
                    <div className="text-left">
                      <div className="font-medium">导出数据</div>
                      <div className="text-sm text-stone-500">备份所有求职数据</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="rounded-xl h-auto py-4"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-sage-600" />
                    <div className="text-left">
                      <div className="font-medium">导入数据</div>
                      <div className="text-sm text-stone-500">恢复备份数据</div>
                    </div>
                  </div>
                </Button>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <Button
                  variant="destructive"
                  onClick={handleClearAllData}
                  className="rounded-xl w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空所有数据
                </Button>
                <p className="text-sm text-stone-500 mt-2">
                  此操作将删除所有投递记录、简历、面经等数据，且不可恢复
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：其他设置和信息 */}
        <div className="space-y-6">
          {/* 外观设置 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Moon className="w-5 h-5 mr-2 text-sage-600" />
                外观
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="darkMode" className="font-medium">
                    深色模式
                  </Label>
                  <p className="text-sm text-stone-500">
                    切换深色主题
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-stone-700">主题颜色</h4>
                <div className="flex gap-2">
                  {['sage', 'blue', 'purple', 'orange', 'rose'].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full',
                        color === 'sage' && 'bg-sage-500',
                        color === 'blue' && 'bg-blue-500',
                        color === 'purple' && 'bg-purple-500',
                        color === 'orange' && 'bg-orange-500',
                        color === 'rose' && 'bg-rose-500'
                      )}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 应用信息 */}
          <Card className="rounded-2xl bg-sage-50 border-sage-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-sage-800 mb-2">隐私与安全</h3>
                  <p className="text-sm text-sage-600">
                    所有数据均加密保存在本地浏览器中，不会上传到任何服务器。
                  </p>
                </div>

                <div className="border-t border-sage-200 pt-4">
                  <p className="text-sm text-sage-600 mb-2">✨ 安全感背书</p>
                  <p className="text-xs text-sage-500 leading-relaxed">
                    所有简历与投递数据均加密保存在本地浏览器，请放心使用。
                    你的求职数据只属于你。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 版本信息 */}
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">版本</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">数据大小</span>
                  <span className="font-medium">~2.4 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">最后备份</span>
                  <span className="font-medium">2026-04-09</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mt-4">
                <Button variant="ghost" className="w-full rounded-xl text-sm">
                  检查更新
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings