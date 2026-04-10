import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Application, ApplicationStatus } from '@/types'
import { applicationStorage } from '@/lib/storage'

const Applications = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')

  // 获取所有投递记录
  const applications = applicationStorage.getAll()

  // 状态列定义
  const statusColumns: { status: ApplicationStatus; label: string; color: string }[] = [
    { status: '已投递', label: '已投递', color: 'bg-stone-100 text-stone-800' },
    { status: '简历筛选中', label: '筛选中', color: 'bg-blue-100 text-blue-800' },
    { status: '笔试邀请', label: '笔试', color: 'bg-purple-100 text-purple-800' },
    { status: '一面邀请', label: '一面', color: 'bg-indigo-100 text-indigo-800' },
    { status: '二面邀请', label: '二面', color: 'bg-indigo-100 text-indigo-800' },
    { status: '三面邀请', label: '三面', color: 'bg-indigo-100 text-indigo-800' },
    { status: 'HR面', label: 'HR面', color: 'bg-orange-100 text-orange-800' },
    { status: 'Offer', label: 'Offer', color: 'bg-emerald-100 text-emerald-800' },
    { status: '已拒绝', label: '已结束', color: 'bg-rose-100 text-rose-800' },
    { status: '已放弃', label: '已放弃', color: 'bg-stone-100 text-stone-500' },
  ]

  // 按状态分组
  const groupedApplications = statusColumns.reduce((acc, column) => {
    acc[column.status] = applications.filter(app => app.status === column.status)
    return acc
  }, {} as Record<ApplicationStatus, Application[]>)

  // 表格视图列
  const tableColumns = [
    { key: 'company', label: '公司' },
    { key: 'position', label: '岗位' },
    { key: 'department', label: '业务线' },
    { key: 'status', label: '状态' },
    { key: 'appliedAt', label: '投递时间' },
    { key: 'deadline', label: '截止时间' },
    { key: 'actions', label: '操作' },
  ]

  return (
    <div>
      {/* 页面标题和操作区 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sage-800">投递看板</h1>
          <p className="text-stone-600 mt-2">跟踪所有岗位投递进度，不错过任何机会</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/applications/new">
            <Button className="rounded-xl bg-sage-500 hover:bg-sage-600">
              <Plus className="w-4 h-4 mr-2" />
              新增投递
            </Button>
          </Link>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <Card className="rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input
                placeholder="搜索公司或岗位名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
                  className="pl-10 pr-4 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="all">所有状态</option>
                  {statusColumns.map((column) => (
                    <option key={column.status} value={column.status}>
                      {column.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex border border-stone-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    'px-4 py-2 flex items-center gap-2',
                    viewMode === 'kanban'
                      ? 'bg-sage-50 text-sage-700'
                      : 'bg-white text-stone-600 hover:bg-stone-50'
                  )}
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">看板</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'px-4 py-2 flex items-center gap-2',
                    viewMode === 'table'
                      ? 'bg-sage-50 text-sage-700'
                      : 'bg-white text-stone-600 hover:bg-stone-50'
                  )}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">表格</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 空状态 */}
      {applications.length === 0 ? (
        <Card className="rounded-2xl text-center py-12">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">还没有投递记录</h3>
            <p className="text-stone-500 mb-6">开始你的第一个投递，让求职之旅正式启程</p>
            <Link to="/applications/new">
              <Button className="rounded-xl bg-sage-500 hover:bg-sage-600">
                <Plus className="w-4 h-4 mr-2" />
                添加第一个投递
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        /* Kanban 视图 */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {statusColumns.map((column) => {
              const columnApps = groupedApplications[column.status] || []
              return (
                <div key={column.status} className="w-72 flex-shrink-0">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('px-3 py-1 rounded-full text-sm font-medium', column.color)}>
                          {column.label}
                        </div>
                        <span className="text-stone-500 text-sm">{columnApps.length}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {columnApps.map((app) => (
                      <Link
                        key={app.id}
                        to={`/applications/${app.id}`}
                        className="block p-4 bg-white rounded-xl border border-stone-200 shadow-soft hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-stone-900">{app.company}</h3>
                            <p className="text-sm text-stone-600">{app.position}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            className="p-1 hover:bg-stone-100 rounded"
                          >
                            <MoreVertical className="w-5 h-5 text-stone-400" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {app.department && (
                            <p className="text-sm text-stone-500">{app.department}</p>
                          )}
                          <div className="flex items-center text-sm text-stone-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(app.appliedAt).toLocaleDateString('zh-CN')}
                          </div>
                          {app.deadline && (
                            <div className={cn(
                              'text-sm px-2 py-1 rounded',
                              new Date(app.deadline) < new Date()
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            )}>
                              截止: {new Date(app.deadline).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                    {columnApps.length === 0 && (
                      <div className="p-8 text-center border border-dashed border-stone-300 rounded-xl">
                        <p className="text-stone-400 text-sm">暂无记录</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* 表格视图 */
        <Card className="rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column.key}
                      className="text-left py-3 px-4 text-sm font-medium text-stone-600"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/applications/${app.id}`}
                        className="font-medium text-stone-900 hover:text-sage-700"
                      >
                        {app.company}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-stone-700">{app.position}</td>
                    <td className="py-3 px-4 text-stone-600">{app.department || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={cn('px-3 py-1 rounded-full text-sm', getStatusColor(app.status))}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {new Date(app.appliedAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      {app.deadline ? (
                        <span className={cn(
                          'px-2 py-1 rounded text-sm',
                          new Date(app.deadline) < new Date()
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        )}>
                          {new Date(app.deadline).toLocaleDateString('zh-CN')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/applications/${app.id}`}
                          className="text-sage-600 hover:text-sage-700 text-sm font-medium"
                        >
                          查看
                        </Link>
                        <button className="text-stone-400 hover:text-stone-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// 获取状态颜色
function getStatusColor(status: ApplicationStatus): string {
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

export default Applications