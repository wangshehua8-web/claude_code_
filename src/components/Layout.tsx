import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Briefcase, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const Layout = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/applications', label: '投递看板', icon: Briefcase },
    { path: '/profile', label: '个人档案', icon: User },
    { path: '/settings', label: '设置', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-paper">
      {/* 顶部导航栏 - 移动端 */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-sage-600">JobReady</h1>
            <div className="text-sm text-stone-500">
              {location.pathname === '/' && '求职避风港'}
              {location.pathname.startsWith('/applications') && '投递管理'}
              {location.pathname.startsWith('/profile') && '个人档案'}
              {location.pathname.startsWith('/settings') && '设置'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 - 桌面端 */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
          <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto bg-white border-r border-border">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-sage-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-sage-700">JobReady</h1>
                <p className="text-xs text-stone-500">智能校招助手</p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200',
                      isActive
                        ? 'bg-sage-50 text-sage-700 shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* 安全感背书文案，根据PRD */}
            <div className="px-6 pt-6 mt-6 border-t border-border">
              <p className="text-xs text-stone-500 leading-relaxed">
                ✨ 所有简历与投递数据均加密保存在本地浏览器，请放心使用。
              </p>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 lg:pl-64">
          <div className="pt-16 lg:pt-8 pb-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="rounded-2xl bg-white p-6 lg:p-8 shadow-soft">
                <Outlet />
              </div>
            </div>
          </div>
        </main>

        {/* 底部导航栏 - 移动端 */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
          <div className="flex justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 rounded-2xl transition-all',
                    isActive ? 'text-sage-600' : 'text-stone-500'
                  )}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Layout