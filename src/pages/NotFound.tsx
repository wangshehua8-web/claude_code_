import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, Search, Compass } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
          <Compass className="w-16 h-16 text-stone-300" />
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-rose-500">404</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-stone-900 mb-4">
        哎呀，页面走丢了
      </h1>

      <p className="text-stone-600 text-lg max-w-md mb-8">
        你访问的页面可能已被移动、删除，或者暂时不可用。
        别担心，让我们带你回到正轨。
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link to="/">
          <Button className="rounded-xl bg-sage-500 hover:bg-sage-600 px-8">
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        <Link to="/applications">
          <Button variant="outline" className="rounded-xl px-8">
            <Search className="w-4 h-4 mr-2" />
            查看投递看板
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/applications">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 hover:border-sage-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">投递看板</h3>
              <p className="text-sm text-stone-500">
                管理所有岗位投递进度
              </p>
            </div>
          </Link>

          <Link to="/profile">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 hover:border-sage-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">个人档案</h3>
              <p className="text-sm text-stone-500">
                管理简历版本和基本信息
              </p>
            </div>
          </Link>

          <Link to="/settings">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 hover:border-sage-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Compass className="w-6 h-6 text-sage-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">设置</h3>
              <p className="text-sm text-stone-500">
                配置应用和AI参数
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound