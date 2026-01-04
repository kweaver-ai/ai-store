import { Avatar, Dropdown, Tooltip } from 'antd'
import clsx from 'classnames'
import { MaskIcon } from './GradientMaskIcon'
import type { SiderMenuItemData } from './types'

export interface SiderMenuItemProps {
  /** 菜单项数据 */
  item: SiderMenuItemData
  /** 是否折叠 */
  collapsed: boolean
  /** 选中项的键 */
  selectedKey: string
  /** 是否可选 */
  selectable?: boolean
  /** 点击回调 */
  onItemClick: (key: string) => void
}

export const SiderMenuItem = ({
  item,
  collapsed,
  selectedKey,
  selectable = true,
  onItemClick,
}: SiderMenuItemProps) => {
  const isSelected = selectable && selectedKey === item.key

  const content = (
    <button
      type="button"
      className="group relative flex items-center h-10 select-none"
      onClick={() => {
        if (item.disabled) return
        if (item.onClick) {
          item.onClick()
          return
        }
        onItemClick(item.key)
      }}
    >
      <span
        className={clsx(
          'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-sm',
          'bg-[linear-gradient(180deg,#3FA9F5_0%,#126EE3_100%)]',
          isSelected ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        className={clsx(
          'flex flex-1 h-full items-center rounded mx-1.5',
          collapsed ? 'justify-center' : 'gap-2 px-2.5',
          item.disabled
            ? 'cursor-not-allowed text-[--dip-disabled-color]'
            : 'cursor-pointer text-[#000] hover:bg-[--dip-hover-bg-color]',
          isSelected &&
            'bg-[rgba(209,230,255,0.2)] text-[--dip-primary-color] hover:!bg-[rgba(209,230,255,0.2)]',
        )}
      >
        <span className="w-4 h-4 flex items-center justify-center">
          {item.type === 'pinned' ? (
            item.icon
          ) : item.iconUrl ? (
            <MaskIcon
              url={item.iconUrl}
              className="w-4 h-4"
              background={
                isSelected ? 'linear-gradient(210deg, #1C4DFA 0%, #3FA9F5 100%)' : '#333333'
              }
            />
          ) : item.icon ? (
            <span className="text-[#333333]">{item.icon}</span>
          ) : (
            <Avatar shape="square" size={16}>
              {item.label.charAt(0)}
            </Avatar>
          )}
        </span>
        <span
          className={clsx('flex-1 truncate font-normal text-sm text-start', collapsed && 'hidden')}
        >
          {item.label}
        </span>
      </div>
    </button>
  )

  if (item.onContextMenu && !item.disabled) {
    const node = (
      <Dropdown key={item.key} menu={{ items: item.onContextMenu }} trigger={['contextMenu']}>
        {content}
      </Dropdown>
    )
    return collapsed ? (
      <Tooltip title={item.label} placement="right">
        {node}
      </Tooltip>
    ) : (
      node
    )
  }

  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {content}
    </Tooltip>
  ) : (
    content
  )
}
