import type { BreadcrumbItem } from '@/utils/micro-app/globalState'
import type { ReactNode } from 'react'
import HomeIcon from '@/assets/images/home.svg?react'
import { Button } from 'antd'

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  onNavigate?: (item: BreadcrumbItem) => void
}

/**
 * 悬浮背景色公共样式
 */
const HOVER_STYLE = 'hover:bg-black/4 transition-colors duration-200'

/**
 * 渲染面包屑图标
 */
const renderIcon = (icon: string | ReactNode, alt?: string) => {
  if (!icon) return null

  if (typeof icon === 'string') {
    return <img src={icon} alt={alt || ''} className="w-4 h-4 object-contain" />
  }

  return icon
}

/**
 * 面包屑组件
 */
export const Breadcrumb = ({ items = [], onNavigate }: BreadcrumbProps) => {
  // 统一的跳转处理函数
  const handleNavigate = (item: BreadcrumbItem, e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate?.(item ?? {})
  }

  // 所有面包屑项（包含首页）
  const allItems: Array<BreadcrumbItem> = [
    { key: 'main-home', name: '', path: '/' },
    ...items,
  ]

  return (
    <div className="h-6 flex items-center" aria-label="面包屑导航">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const isHome = index === 0
        const isRootItem = !isHome && 'icon' in item

        return (
          <div key={index} className="flex items-center">
            {/* 首页图标 */}
            {isHome ? (
              <Button
                size="small"
                type="text"
                icon={<HomeIcon />}
                onClick={(e) => handleNavigate(item, e)}
              />
            ) : (
              <>
                {/* 分隔符 */}
                {index > 0 && (
                  <span className="text-sm font-medium text-black/25 mx-2">
                    /
                  </span>
                )}
                {/* 面包屑项 */}
                {isLast ? (
                  <Button
                    size="small"
                    type="text"
                    className="font-medium hover:!bg-transparent hover:!cursor-default"
                  >
                    {isRootItem && renderIcon(item.icon)}
                    {item.name}
                  </Button>
                ) : (
                  <Button
                    size="small"
                    type="text"
                    onClick={(e) => handleNavigate(item, e)}
                  >
                    {isRootItem && renderIcon(item.icon)}
                    {item.name}
                  </Button>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
