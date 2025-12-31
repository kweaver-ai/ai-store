import { Tooltip } from 'antd'
import clsx from 'classnames'
import type { SiderMenuItemData } from './types'

export interface BottomLinkItemProps {
  /** 菜单项数据 */
  item: SiderMenuItemData
  /** 是否折叠 */
  collapsed: boolean
  /** 点击回调 */
  onClick: () => void
}

/** 底部链接项 */
export const BottomLinkItem = ({
  item,
  collapsed,
  onClick,
}: BottomLinkItemProps) => {
  const content = (
    <button
      type="button"
      className={clsx(
        'flex items-center h-10 rounded-md mx-1.5 hover:bg-[--dip-hover-bg-color] cursor-pointer',
        collapsed ? 'justify-center' : 'gap-2 px-2.5'
      )}
      onClick={onClick}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {item.icon}
      </span>
      <span
        className={clsx('text-sm text-[#000] truncate', collapsed && 'hidden')}
      >
        {item.label}
      </span>
    </button>
  )
  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {content}
    </Tooltip>
  ) : (
    content
  )
}
