import type { BreadcrumbItem } from '../../../types'
import { HomeFilled } from '@ant-design/icons'
import type { ReactNode } from 'react'

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  /**
   * 如果提供此函数，将使用它进行路由跳转
   */
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
    return (
      <img
        src={icon}
        alt={alt || ''}
        className="w-[16px] h-[16px] object-contain"
      />
    )
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
    if (item.key === 'main-home') {
      window.location.href = '/'
    } else if (onNavigate) {
      onNavigate(item)
    }
  }

  // 所有面包屑项（包含首页）
  const allItems: Array<BreadcrumbItem> = [
    { key: 'main-home', name: '', path: '/' },
    ...items,
  ]

  return (
    <nav className="flex items-center" aria-label="面包屑导航">
      <ol className="flex items-center gap-2 list-none m-0 p-0">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = index === 0
          const isRootItem = !isHome && 'icon' in item

          return (
            <li key={index} className="flex items-center">
              {/* 首页图标 */}
              {isHome ? (
                <button
                  onClick={(e) => handleNavigate(item, e)}
                  className={`flex items-center justify-center w-[24px] h-[24px] text-black/60 rounded-[4px] cursor-pointer bg-transparent p-0 ${HOVER_STYLE}`}
                  aria-label="首页"
                >
                  <HomeFilled />
                </button>
              ) : (
                <>
                  {/* 分隔符 */}
                  {index > 0 && (
                    <span className="text-sm font-medium text-black/25 mx-[8px] mt-[2px]">
                      /
                    </span>
                  )}
                  {/* 面包屑项 */}
                  {isLast ? (
                    <span className="flex items-center gap-x-[8px] text-base font-normal text-black/85 px-[4px] py-[2px]">
                      {isRootItem && renderIcon(item.icon)}
                      {item.name}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleNavigate(item, e)}
                      className={`flex items-center gap-x-[8px] text-base font-normal text-black/85 rounded-[4px] px-[4px] py-[2px] cursor-pointer bg-transparent ${HOVER_STYLE}`}
                    >
                      {isRootItem && renderIcon(item.icon)}
                      {item.name}
                    </button>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
