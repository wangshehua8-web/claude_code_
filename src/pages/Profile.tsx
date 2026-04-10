import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Upload,
  FileText,
  Calendar,
  Eye,
  Trash2,
  Download,
  Copy,
  CheckCircle,
  Plus,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { resumeStorage } from '@/lib/storage'
import { Resume } from '@/types'

const Profile = () => {
  const [resumes, setResumes] = useState<Resume[]>(resumeStorage.getAll())
  const [isUploading, setIsUploading] = useState(false)
  const [newResumeName, setNewResumeName] = useState('')
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)

  // 模拟简历数据
  const mockResumes: Resume[] = [
    {
      id: '1',
      name: '通用版',
      uploadedAt: '2026-04-01T10:30:00',
      rawText: '教育背景：厦门大学 计算机科学硕士\n实习经历：字节跳动 前端开发实习生\n项目经历：智能招聘系统开发\n技能：React, TypeScript, Node.js',
      fileData: '',
      parsed: {
        education: '教育背景：厦门大学 计算机科学硕士',
        internships: '实习经历：字节跳动 前端开发实习生',
        projects: '项目经历：智能招聘系统开发',
        skills: '技能：React, TypeScript, Node.js'
      }
    },
    {
      id: '2',
      name: '产品岗专版',
      uploadedAt: '2026-04-05T14:20:00',
      rawText: '教育背景：厦门大学 产品设计硕士\n实习经历：腾讯 产品经理实习生\n项目经历：社交产品用户增长项目\n技能：用户调研, 原型设计, 数据分析',
      fileData: '',
      parsed: {
        education: '教育背景：厦门大学 产品设计硕士',
        internships: '实习经历：腾讯 产品经理实习生',
        projects: '项目经历：社交产品用户增长项目',
        skills: '技能：用户调研, 原型设计, 数据分析'
      }
    }
  ]

  // 如果没有简历，使用模拟数据
  const displayResumes = resumes.length > 0 ? resumes : mockResumes

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 创建新简历记录
      const newResume: Resume = {
        id: crypto.randomUUID(),
        name: newResumeName || file.name.replace('.pdf', ''),
        uploadedAt: new Date().toISOString(),
        rawText: `PDF内容解析: ${file.name}`, // 实际应该使用 pdfjs-dist 解析
        fileData: '', // 实际应该转换为 base64
        parsed: {
          education: '教育背景待解析',
          internships: '实习经历待解析',
          projects: '项目经历待解析',
          skills: '技能待解析'
        }
      }

      // 保存简历
      resumeStorage.save(newResume)
      setResumes([...resumes, newResume])
      setNewResumeName('')

      alert('简历上传成功！')
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setIsUploading(false)
      // 重置文件输入
      event.target.value = ''
    }
  }

  // 删除简历
  const handleDeleteResume = (id: string) => {
    if (confirm('确定要删除这份简历吗？')) {
      resumeStorage.delete(id)
      setResumes(resumes.filter(r => r.id !== id))
      if (selectedResume?.id === id) {
        setSelectedResume(null)
      }
    }
  }

  // 设置默认简历
  const handleSetDefault = (id: string) => {
    // 这里可以添加设置默认简历的逻辑
    alert('已设置为默认简历')
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sage-800">个人档案</h1>
        <p className="text-stone-600 mt-2">管理你的简历版本，一份好简历是求职成功的第一步</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：简历列表 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 上传简历卡片 */}
          <Card className="rounded-2xl border-2 border-dashed border-stone-300 hover:border-sage-300 transition-colors">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-sage-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">上传新简历</h3>
                <p className="text-stone-500 text-sm mb-4">
                  支持 PDF 格式，我们将自动解析文本内容
                </p>

                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <Input
                      placeholder="为简历命名，如'通用版'、'产品岗专版'"
                      value={newResumeName}
                      onChange={(e) => setNewResumeName(e.target.value)}
                      className="rounded-xl mb-2"
                    />
                    <p className="text-xs text-stone-400 text-left">
                      不填则使用文件名
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label htmlFor="resume-upload">
                      <div className={cn(
                        "flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-pointer",
                        isUploading
                          ? "bg-stone-100 text-stone-400"
                          : "bg-sage-500 hover:bg-sage-600 text-white"
                      )}>
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            上传中...
                          </>
                        ) : (
                          <>
                            <FolderOpen className="w-4 h-4" />
                            选择 PDF 文件
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <p className="text-xs text-stone-400">
                    所有简历数据仅保存在本地浏览器，请放心上传
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 简历列表 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-sage-600" />
                简历版本管理
                <span className="ml-2 text-sm font-normal text-stone-500">
                  ({displayResumes.length} 份)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayResumes.length > 0 ? (
                <div className="space-y-4">
                  {displayResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        selectedResume?.id === resume.id
                          ? "border-sage-300 bg-sage-50"
                          : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                      )}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-sage-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-stone-900">{resume.name}</h3>
                              <div className="flex items-center text-sm text-stone-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(resume.uploadedAt).toLocaleDateString('zh-CN')}
                              </div>
                            </div>
                          </div>

                          {/* 解析摘要 */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {resume.parsed.education && (
                              <div className="text-sm">
                                <span className="text-stone-500">教育: </span>
                                <span className="text-stone-700 truncate">
                                  {resume.parsed.education.substring(0, 20)}...
                                </span>
                              </div>
                            )}
                            {resume.parsed.internships && (
                              <div className="text-sm">
                                <span className="text-stone-500">实习: </span>
                                <span className="text-stone-700 truncate">
                                  {resume.parsed.internships.substring(0, 20)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetDefault(resume.id)
                            }}
                            className="p-2 text-stone-400 hover:text-sage-600 rounded-lg"
                            title="设为默认"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // 预览简历
                              setSelectedResume(resume)
                            }}
                            className="p-2 text-stone-400 hover:text-sage-600 rounded-lg"
                            title="预览"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteResume(resume.id)
                            }}
                            className="p-2 text-stone-400 hover:text-rose-600 rounded-lg"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">还没有上传过简历</p>
                  <p className="text-sm text-stone-400 mt-1">
                    上传简历后，AI 功能才能更好地为你服务
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：简历预览 */}
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">简历预览</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedResume ? (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <h3 className="font-semibold text-stone-900 mb-2">{selectedResume.name}</h3>
                    <div className="text-sm text-stone-500">
                      上传时间: {new Date(selectedResume.uploadedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedResume.parsed.education && (
                      <div>
                        <h4 className="font-medium text-stone-700 mb-2">教育背景</h4>
                        <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                          {selectedResume.parsed.education}
                        </p>
                      </div>
                    )}

                    {selectedResume.parsed.internships && (
                      <div>
                        <h4 className="font-medium text-stone-700 mb-2">实习经历</h4>
                        <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                          {selectedResume.parsed.internships}
                        </p>
                      </div>
                    )}

                    {selectedResume.parsed.projects && (
                      <div>
                        <h4 className="font-medium text-stone-700 mb-2">项目经历</h4>
                        <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                          {selectedResume.parsed.projects}
                        </p>
                      </div>
                    )}

                    {selectedResume.parsed.skills && (
                      <div>
                        <h4 className="font-medium text-stone-700 mb-2">技能</h4>
                        <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                          {selectedResume.parsed.skills}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                      <Copy className="w-4 h-4 mr-2" />
                      复制文本
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                      <Download className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">选择一份简历预览</p>
                  <p className="text-sm text-stone-400 mt-1">
                    点击左侧简历卡片查看详情
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 使用提示 */}
          <Card className="rounded-2xl bg-sage-50 border-sage-200">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-sage-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sage-800">简历使用提示</h4>
                    <p className="text-sm text-sage-600 mt-1">
                      1. 上传不同版本的简历，针对不同岗位使用
                    </p>
                    <p className="text-sm text-sage-600">
                      2. AI 功能需要简历文本来生成个性化内容
                    </p>
                    <p className="text-sm text-sage-600">
                      3. 所有数据仅保存在本地，请定期备份
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile