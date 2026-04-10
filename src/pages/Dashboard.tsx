import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const Dashboard = () => {
  // 模拟数据
  const stats = [
    { label: '投递总数', value: '12', icon: FileText, color: 'bg-sage-100 text-sage-700' },
    { label: '本周面试', value: '3', icon: Calendar, color: 'bg-orange-100 text-orange-700' },
    { label: '进行中', value: '8', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
    { label: '已完成', value: '4', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  ]

  const upcomingInterviews = [
    { id: '1', company: '字节跳动', position: '产品经理', interviewAt: '2026-04-12T14:30:00', days: '2天后' },
    { id: '2', company: '腾讯', position: '用户体验设计师', interviewAt: '2026-04-15T10:00:00', days: '5天后' },
    { id: '3', company: '阿里巴巴', position: '前端开发工程师', interviewAt: '2026-04-18T15:00:00', days: '8天后' },
  ]

  const pendingUpdates = [
    { id: '4', company: '美团', position: '商业分析师', appliedAt: '2026-03-28', days: '13天' },
    { id: '5', company: '滴滴', position: '数据科学家', appliedAt: '2026-03-30', days: '11天' },
  ]

  return (
    <div>
      {/* 欢迎语 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sage-800">下午好，求职者 👋</h1>
        <p className="text-stone-600 mt-2">今日宜投递，忌拖延。看看你的求职进展吧～</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="rounded-2xl border border-stone-200 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-500">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-xl', stat.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 近期面试提醒 */}
        <Card className="rounded-2xl border border-stone-200 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">🎯 近期面试提醒</CardTitle>
              <Calendar className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-sm text-stone-500">接下来要准备的面试场次</p>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <Link
                    key={interview.id}
                    to={`/applications/${interview.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
                          <span className="text-sage-700 font-semibold">
                            {interview.company.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-stone-900 group-hover:text-sage-700">
                            {interview.company} · {interview.position}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {new Date(interview.interviewAt).toLocaleDateString('zh-CN', {
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                      {interview.days}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">暂时没有即将到来的面试</p>
                <p className="text-sm text-stone-400 mt-1">继续努力投递吧！</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 待更新进度 */}
        <Card className="rounded-2xl border border-stone-200 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">⏰ 待更新进度</CardTitle>
              <Clock className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-sm text-stone-500">超过7天未更新的投递记录</p>
          </CardHeader>
          <CardContent>
            {pendingUpdates.length > 0 ? (
              <div className="space-y-3">
                {pendingUpdates.map((item) => (
                  <Link
                    key={item.id}
                    to={`/applications/${item.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                          <span className="text-stone-700 font-semibold">
                            {item.company.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-stone-900 group-hover:text-sage-700">
                            {item.company} · {item.position}
                          </h3>
                          <p className="text-sm text-stone-500">
                            投递于 {new Date(item.appliedAt).toLocaleDateString('zh-CN')} · 已等待 {item.days}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm font-medium text-sage-700 hover:bg-sage-50 rounded-lg transition-colors">
                      去跟进
                    </button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-stone-500">太棒了！所有投递都有及时跟进</p>
                <p className="text-sm text-stone-400 mt-1">继续保持良好的求职节奏</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 空状态提示 - 治愈系微文案 */}
      {upcomingInterviews.length === 0 && pendingUpdates.length === 0 && (
        <div className="mt-12 text-center">
          <div className="inline-block p-6 rounded-2xl bg-stone-50">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-stone-600 text-lg">这里还空空如也，不如我们今天先投递一个心仪的岗位开启好运？</p>
            <p className="text-stone-400 text-sm mt-2">每一个伟大的职业生涯都从第一步开始</p>
            <Link
              to="/applications/new"
              className="inline-block mt-6 px-6 py-3 bg-sage-500 text-white font-medium rounded-xl hover:bg-sage-600 transition-colors"
            >
              开始第一个投递
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard