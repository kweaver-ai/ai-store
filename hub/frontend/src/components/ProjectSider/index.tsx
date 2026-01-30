import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  defaultDropAnimation,
  MeasuringStrategy,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MenuProps } from 'antd'
import { Menu, message, Tooltip } from 'antd'
import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { NodeType } from '@/apis/projects'
import DictionaryIcon from '@/assets/images/project/dictionary.svg?react'
import { useProjectStore } from '@/stores'
import styles from './index.module.less'
import { SortableTreeItem } from './SortableTreeItem'
import {
  buildTree,
  type FlattenedItem,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  setProperty,
  type TreeItem,
  type TreeItems,
} from './utils'

interface ProjectSiderProps {
  /** 是否折叠 */
  collapsed: boolean
  /** 折叠状态改变回调 */
  onCollapse: (collapsed: boolean) => void
  /** 项目 ID */
  projectId: string
}

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }: { transform: { initial: any; final: any } }) {
    return [
      {
        opacity: 1,
        transform: CSS.Transform.toString(transform.initial),
      },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ]
  },
  easing: 'ease-out',
  sideEffects({ active }: { active: any }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    })
  },
}

const adjustTranslate: Modifier = ({ transform }: { transform: any }) => {
  return {
    ...transform,
    y: transform.y - 25,
  }
}

const indentationWidth = 24

/**
 * 项目侧边栏（ProjectSider）
 * 用于项目详情页面的侧边栏
 */
const ProjectSider = ({ collapsed, onCollapse, projectId }: ProjectSiderProps) => {
  const { selectedNode, setSelectedNode } = useProjectStore()
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)
  const [timer, setTimer] = useState<{ id: string | null; interval?: NodeJS.Timeout } | null>(null)

  // 示例数据，实际应该从 props 或 API 获取
  const [treeData, setTreeData] = useState<TreeItems>([
    {
      id: 'app-1',
      name: '应用结构',
      type: 'application',
      children: [
        {
          id: 'page-1',
          name: '用户管理页',
          type: 'page',
          children: [
            {
              id: 'function-1',
              name: '列表查询功能',
              type: 'function',
              children: [],
            },
          ],
        },
      ],
    },
  ])

  // 从 store 同步选中状态
  useEffect(() => {
    if (selectedNode && selectedNode.projectId === projectId) {
      setSelectedKey(selectedNode.nodeId)
    } else {
      setSelectedKey('')
    }
  }, [selectedNode, projectId])

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(treeData)
    const collapsedItems: string[] = []
    for (const item of flattenedTree) {
      if (item.collapsed && item.children.length) {
        collapsedItems.push(item.id)
      }
    }

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    )
  }, [activeId, treeData])

  const projected =
    activeId && overId
      ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth)
      : null

  const sensors = useSensors(useSensor(PointerSensor))

  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems])
  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null

  /** 验证拖拽是否符合层级规则 */
  const validateDrag = useCallback(
    (dragNode: FlattenedItem, targetParentId: string | null): boolean => {
      // 如果拖拽到根节点（null），只允许 application 类型
      if (!targetParentId) {
        return dragNode.type === 'application'
      }

      // 找到目标父节点
      const targetParent = targetParentId
        ? flattenedItems.find((item) => item.id === targetParentId)
        : null

      if (!targetParent) {
        return dragNode.type === 'application'
      }

      // 层级规则：
      // application 只能在根节点下（targetParentId 为 null）
      // page 只能在 application 下
      // function 只能在 page 下
      if (dragNode.type === 'application') {
        return false // application 不能作为子节点
      }
      if (dragNode.type === 'page') {
        return targetParent.type === 'application'
      }
      if (dragNode.type === 'function') {
        return targetParent.type === 'page'
      }

      return false
    },
    [flattenedItems],
  )

  /** 处理新建子级 */
  const handleAddChild = useCallback(
    (parentId: string, parentType: NodeType, e?: React.MouseEvent) => {
      e?.stopPropagation()
      const newItemType: NodeType = parentType === 'application' ? 'page' : 'function'
      const newItem: TreeItem = {
        id: `${newItemType}-${Date.now()}`,
        name: `新建${newItemType === 'page' ? '页面' : '功能'}`,
        type: newItemType,
        children: [],
      }

      setTreeData((info) => {
        setProperty(info, parentId, 'collapsed', () => false)
        return setProperty(info, parentId, 'children', (value) => [newItem, ...value])
      })
    },
    [],
  )

  /** 处理节点选择 */
  const handleSelect = useCallback(
    (item: FlattenedItem) => {
      setSelectedKey(item.id)
      setSelectedNode({
        nodeId: item.id,
        nodeType: item.type,
        nodeName: item.name,
        projectId,
      })
    },
    [projectId, setSelectedNode],
  )

  /** 处理展开/折叠 */
  const handleCollapse = useCallback((id: string) => {
    setTreeData((info) => setProperty(info, id, 'collapsed', (value) => !value))
  }, [])

  const menuItems = useMemo<MenuProps['items']>(() => {
    return [
      {
        type: 'group',
        label: '项目配置',
      },
      {
        key: 'data-dictionary',
        label: '数据字典',
        icon: <DictionaryIcon className="!text-base" />,
        onClick: () => {
          setSelectedKey('data-dictionary')
          setSelectedNode({
            nodeId: 'data-dictionary',
            nodeType: 'dictionary',
            nodeName: '数据字典',
            projectId,
          })
        },
      },
      { type: 'divider' },
    ]
  }, [projectId, setSelectedNode])

  return (
    <div
      className={clsx('flex flex-col h-full px-0 pt-4 pb-2 overflow-hidden', styles.projectSider)}
    >
      {/* 菜单内容 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden dip-hideScrollbar">
        {/* 项目配置菜单 */}
        <Menu
          mode="inline"
          selectedKeys={selectedKey.startsWith('data-dictionary') ? [selectedKey] : []}
          items={menuItems}
          inlineCollapsed={collapsed}
          selectable={true}
        />
        {/* 项目结构树 */}
        {!collapsed && (
          <div className="px-0 mt-2">
            {flattenedItems.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[--dip-text-color-65]">
                暂无数据
              </div>
            ) : (
              <div className={styles.treeContainer}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  measuring={measuring}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                    {flattenedItems.map((item) => {
                      const { id, children, collapsed, depth } = item
                      const dp = id === activeId && projected ? projected.depth : depth
                      const isSelected = selectedKey === id

                      return (
                        <SortableTreeItem
                          key={id}
                          id={id}
                          name={item.name}
                          type={item.type}
                          depth={dp}
                          indentationWidth={indentationWidth}
                          collapsed={Boolean(collapsed && children.length)}
                          selected={isSelected}
                          canAddChild={item.type !== 'function'}
                          onCollapse={children.length ? () => handleCollapse(id) : undefined}
                          onAddChild={() => handleAddChild(id, item.type)}
                          onSelect={() => handleSelect(item)}
                        />
                      )
                    })}
                    {createPortal(
                      <DragOverlay
                        dropAnimation={dropAnimationConfig}
                        modifiers={[adjustTranslate]}
                        zIndex={1001}
                      >
                        {activeId && activeItem ? (
                          <SortableTreeItem
                            id={activeId}
                            name={activeItem.name}
                            type={activeItem.type}
                            depth={activeItem.depth}
                            clone
                            childCount={getChildCount(treeData, activeId) + 1}
                            indentationWidth={indentationWidth}
                          />
                        ) : null}
                      </DragOverlay>,
                      document.body,
                    )}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 分割线 */}
      <div className="h-px bg-[--dip-border-color] my-2 shrink-0" />

      {/* 底部收缩按钮 */}
      <div
        className={clsx(
          'flex items-center',
          collapsed ? 'justify-center' : 'justify-between pl-2 pr-2',
        )}
      >
        <Tooltip title={collapsed ? '展开' : '收起'} placement="right">
          <button
            type="button"
            className="text-sm cursor-pointer flex items-center justify-center w-8 h-8 rounded-md text-[--dip-text-color] hover:text-[--dip-primary-color]"
            onClick={() => onCollapse(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Tooltip>
      </div>
    </div>
  )

  function handleDragStart({ active: { id: actId } }: DragStartEvent) {
    setActiveId(actId as string)
    setOverId(actId as string)
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x)
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (over?.id && activeId) {
      const { parentId } = getProjection(
        flattenedItems,
        activeId,
        `${over.id}`,
        offsetLeft,
        indentationWidth,
      )
      if (timer?.interval) {
        clearTimeout(timer.interval)
      }
      const interval = setTimeout(() => {
        if (timer?.id) {
          setTreeData((info) => setProperty(info, timer.id as string, 'collapsed', () => false))
        }
      }, 600)
      setTimer({ id: parentId, interval })
    }
    setOverId((over?.id as string) ?? null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState()

    if (projected && over && activeItem) {
      const { depth, parentId } = projected
      const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(treeData)))
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id)
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id)
      const activeTreeItem = clonedItems[activeIndex]

      if (activeTreeItem) {
        // 验证拖拽规则
        if (!validateDrag(activeTreeItem, parentId)) {
          message.warning('不符合层级规则：页面只能在应用下，功能只能在页面下')
          return
        }

        clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId }

        const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)
        const newItems = buildTree(sortedItems)

        if (!(overIndex === activeIndex && parentId === activeItem.parentId)) {
          setTreeData(newItems)
          // TODO: 调用 API 更新节点位置
          // moveNode({ node_id: active.id.toString(), target_parent_id: parentId })
        }
      }
    }
  }

  function handleDragCancel() {
    resetState()
  }

  function resetState() {
    setOverId(null)
    setActiveId(null)
    setOffsetLeft(0)

    document.body.style.setProperty('cursor', '')
  }
}

export default ProjectSider
