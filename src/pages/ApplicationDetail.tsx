import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit,
  Calendar,
  FileText,
  Globe,
  Briefcase,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  User,
  MessageSquare,
  Video,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { applicationStorage } from '@/lib/storage'
import { ApplicationStatus } from '@/types'

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // 获取投递记录
  const application = applicationStorage.getById(id || '')

  if (!application) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-stone-400" />
        </div>
        <h3 className="text-xl font-semibold text-stone-700 mb-2">未找到投递记录</h3>
        <p className="text-stone-500 mb-6">该投递记录可能已被删除或不存在</p>
        <Button onClick={() => navigate('/applications')} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回投递看板
        </Button>
      </div>
    )
  }

  // 状态徽章颜色
  const getStatusColor = (status: ApplicationStatus): string => {
    const colors: Record<ApplicationStatus, string> = {
      '已投递': 'bg-stone-100 text-stone-800',
      '简历筛选中': 'bg-blue-100 text-blue-800',
      '笔试邀请': 'bg-purple-100 text-purple-800',
      '一面邀请': 'bg-indigo-100 text-indigo-800',
      '二面邀请': 'bg-indigo-100 text-indigo-800',
      '三面邀请': 'bg-indigo-100 text-indigo-800',
      'HR面': 'bg-orange-100 text-orange-800',
      'Offer': 'bg-emerald-100 text-emerald-800',
      '已拒绝': 'bg-rose-100 text-rose-800',
      '已放弃': 'bg-stone-100 text-stone-500',
    }
    return colors[status]
  }

  return (
    <div>
      {/* 面包屑导航 */}
      <div className="flex items-center text-sm text-stone-500 mb-6">
        <Link to="/applications" className="hover:text-sage-600">
          投递看板
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-stone-900">{application.company}</span>
      </div>

      {/* 顶部信息 */}
      <Card className="rounded-2xl mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
                      <Building className="w-6 h-6 text-sage-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-stone-900">{application.company}</h1>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center text-stone-600">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {application.position}
                        </div>
                        {application.department && (
                          <div className="flex items-center text-stone-500">
                            <User className="w-4 h-4 mr-1" />
                            {application.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('px-4 py-2 rounded-full font-medium', getStatusColor(application.status))}>
                    {application.status}
                  </span>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-stone-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-stone-400 mr-3" />
                  <div>
                    <p className="text-sm text-stone-500">投递时间</p>
                    <p className="font-medium">
                      {new Date(application.appliedAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {application.deadline && (
                  <div className="flex items-center p-3 bg-amber-50 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm text-amber-600">截止时间</p>
                      <p className="font-medium text-amber-700">
                        {new Date(application.deadline).toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {application.interviewAt && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                    <Video className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">面试时间</p>
                      <p className="font-medium text-blue-700">
                        {new Date(application.interviewAt).toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab 导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 rounded-2xl p-1 bg-stone-100">
          <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-2" />
            概览
          </TabsTrigger>
          <TabsTrigger value="prep" className="rounded-xl data-[state=active]:bg-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            面试备战
          </TabsTrigger>
          <TabsTrigger value="intro" className="rounded-xl data-[state=active]:bg-white">
            <User className="w-4 h-4 mr-2" />
            自我介绍
          </TabsTrigger>
        </TabsList>

        {/* 概览 Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* JD 原文 */}
          {application.jdText && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-sage-600" />
                  岗位要求 (JD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-stone max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-stone-700 bg-stone-50 p-4 rounded-xl">
                    {application.jdText}
                  </pre>
                </div>
                {application.jdUrl && (
                  <div className="mt-4 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-stone-400" />
                    <a
                      href={application.jdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage-600 hover:text-sage-700 text-sm"
                    >
                      {application.jdUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 状态时间线 */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-sage-600" />
                进度时间线
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">投递成功</p>
                    <p className="text-sm text-stone-500">
                      {new Date(application.appliedAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {application.updatedAt !== application.createdAt && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">状态更新</p>
                      <p className="text-sm text-stone-500">
                        更新为 {application.status} ·{' '}
                        {new Date(application.updatedAt).toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 面试备战 Tab */}
        <TabsContent value="prep">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">面试备战</CardTitle>
              <p className="text-stone-500 text-sm">
                为这次面试做好准备，生成题库、录入面经、模拟练习
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to={`/prep/${application.id}`}>
                  <Card className="rounded-xl border-2 border-dashed border-stone-300 hover:border-sage-300 hover:bg-sage-50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-6 h-6 text-sage-600" />
                      </div>
                      <h3 className="font-semibold text-stone-900 mb-2">AI 题库生成</h3>
                      <p className="text-sm text-stone-500 mb-4">
                        基于 JD 和简历生成个性化面试题库
                      </p>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        开始准备
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Card className="rounded-xl border-2 border-dashed border-stone-300 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-stone-900 mb-2">面经录入</h3>
                    <p className="text-sm text-stone-500 mb-4">
                      录入真实面经，了解公司考察偏好
                    </p>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      录入面经
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自我介绍 Tab */}
        <TabsContent value="intro">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">自我介绍工坊</CardTitle>
              <p className="text-stone-500 text-sm">
                三步生成个性化自我介绍，针对岗位量身定制
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-sage-600" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  打造完美自我介绍
                </h3>
                <p className="text-stone-600 mb-6 max-w-md mx-auto">
                  基于你的简历和岗位要求，AI 将帮你生成专业、有亮点的自我介绍
                </p>
                <Link to={`/intro/${application.id}`}>
                  <Button className="rounded-xl bg-sage-500 hover:bg-sage-600 px-8">
                    开始生成
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApplicationDetail