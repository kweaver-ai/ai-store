import { Avatar, Button } from 'antd'
import type { ReactNode } from 'react'
import IconFont from '@/components/IconFont'
import type { BreadcrumbItem } from '@/utils/micro-app/globalState'

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  onNavigate?: (item: BreadcrumbItem) => void
}

/**
 * 渲染面包屑图标
 */
const renderIcon = (icon: string | ReactNode) => {
  if (!icon) return <Avatar size={24} className="shrink-0" />

  if (typeof icon === 'string') {
    return (
      <img
        src={`data:image/png;base64,${icon}`}
        alt=""
        className="w-4 h-4 rounded-full shrink-0"
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
    onNavigate?.(item ?? {})
  }

  // 所有面包屑项（包含首页）
  const allItems: Array<BreadcrumbItem> = [
    { key: 'main-home', name: '', path: '/' },
    ...items,
  ]

  return (
    <div className="h-6 flex items-center">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const isHome = index === 0
        const isRootItem = !isHome && 'icon' in item
        // 使用 item.key、item.path 或组合值作为 key，避免使用数组索引
        const itemKey = item.key || `breadcrumb-${index}`

        return (
          <div key={itemKey} className="flex items-center">
            {/* 首页图标 */}
            {isHome ? (
              <button
                type="button"
                className="cursor-pointer flex items-center justify-center w-7 h-7 rounded-md text-[--dip-text-color] hover:bg-[--dip-hover-bg-color]"
                onClick={(e) => handleNavigate(item, e)}
              >
                <IconFont type="icon-dip-back" className="!text-base" />
              </button>
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
                    className="h-7 font-medium hover:!bg-transparent hover:!cursor-default"
                  >
                    {isRootItem && renderIcon(item.icon)}
                    {item.name}
                  </Button>
                ) : (
                  <Button
                    size="small"
                    className="h-7"
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
