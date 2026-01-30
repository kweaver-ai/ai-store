import { HolderOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import React, { CSSProperties, forwardRef, type HTMLAttributes } from 'react'
import type { NodeType } from '@/apis/projects'
import IconFont from '@/components/IconFont'
import styles from './index.module.less'

export interface TreeItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  childCount?: number
  clone?: boolean
  collapsed?: boolean
  depth: number
  disableInteraction?: boolean
  ghost?: boolean
  handleProps?: any
  indentationWidth: number
  id: string
  name: string
  type: NodeType
  selected?: boolean
  canAddChild?: boolean
  onCollapse?(): void
  onAddChild?(): void
  onSelect?(): void
  wrapperRef?(node: HTMLDivElement): void
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      childCount,
      clone,
      depth,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      collapsed,
      onCollapse,
      onAddChild,
      onSelect,
      style,
      id,
      name,
      type,
      selected,
      canAddChild,
      wrapperRef,
      ...props
    },
    ref,
  ) => {
    /** 获取图标 */
    const getIcon = () => {
      switch (type) {
        case 'application':
          return <IconFont type="icon-dip-lujing" />
        case 'page':
          return <IconFont type="icon-dip-cepingshujuji" />
        case 'function':
          return <IconFont type="icon-dip-yewuyuguanli" />
        default:
          return null
      }
    }

    const getPaddingLeft = () => {
      if (depth === 0) return 10
      if (depth === 1) return 38
      return 53
    }

    return (
      <div
        className={clsx(
          styles.treeItem,
          clone && styles.clone,
          ghost && styles.ghost,
          disableInteraction && styles.disableInteraction,
          selected && styles.selected,
        )}
        ref={wrapperRef}
        style={style}
        {...props}
      >
        {!clone && (
          <div
            {...handleProps}
            ref={ref}
            className={styles.drag}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <HolderOutlined />
          </div>
        )}
        <div
          className={styles.content}
          style={{
            marginLeft: clone ? 0 : `${getPaddingLeft()}px`,
          }}
          onClick={onSelect}
        >
          {!clone && (
            <div
              className={clsx(styles['content-collapse'], collapsed && styles.collapsed)}
              style={{
                visibility: onCollapse ? 'visible' : 'hidden',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onCollapse?.()
              }}
            >
              {collapsed ? <PlusOutlined /> : <MinusOutlined />}
            </div>
          )}
          <div className={styles['content-icon']}>{getIcon()}</div>
          <div className={styles['content-nameWrap']}>
            <span className={styles['content-nameWrap-name']} title={name}>
              {name}
            </span>
          </div>
          {!clone && canAddChild && (
            <button
              type="button"
              className={styles['content-addBtn']}
              onClick={(e) => {
                e.stopPropagation()
                onAddChild?.()
              }}
              title={`新建${type === 'application' ? '页面' : '功能'}`}
            >
              <IconFont type="icon-dip-add" className="!text-xs" />
            </button>
          )}
          {clone && childCount && childCount > 1 ? (
            <span className={styles['content-count']}>{childCount}</span>
          ) : null}
        </div>
      </div>
    )
  },
)

TreeItem.displayName = 'TreeItem'
