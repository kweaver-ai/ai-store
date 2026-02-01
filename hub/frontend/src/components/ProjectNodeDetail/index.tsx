import { Descriptions, message, Switch, Tabs } from 'antd'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import {
  getDevModeNodeId,
  isNodeInDevMode,
  setDevModeNodeId,
} from '@/pages/ProjectManagement/devMode'
import { objectTypeNameMap } from '@/pages/ProjectManagement/utils'
import { useProjectStore } from '@/stores'
import { formatTime } from '@/utils/handle-function/FormatTime'
import { flattenTree } from '../ProjectSider/utils'
import ScrollBarContainer from '../ScrollBarContainer'
import TiptapEditor from '../TiptapEditor'
import styles from './index.module.less'
import { NodeDetailTabKey } from './types'

interface ProjectNodeDetailProps {
  nodeId: string
  projectId: string
}

/** 项目节点详情组件 */
const ProjectNodeDetail = ({ nodeId, projectId }: ProjectNodeDetailProps) => {
  const { getNodeInfo, treeData } = useProjectStore()
  const [messageApi, messageContextHolder] = message.useMessage()
  const nodeInfo = getNodeInfo(nodeId)
  const [devModeLoading, setDevModeLoading] = useState(false)
  const [devMode, setDevMode] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<NodeDetailTabKey>(NodeDetailTabKey.Detail)
  const [content, setContent] = useState(`# Welcome to Tiptap Editor

This is a **rich text editor** built with [Tiptap 3.0](https://tiptap.dev/).
    
## Features
    
- ✨ **Markdown Support**: Write in markdown and see it rendered
- 🎨 **Rich Formatting**: Bold, *italic*, ~~strikethrough~~, and more
- 📝 **Lists**: Bullet lists, numbered lists, and task lists
- 🔗 **Links**: [Add links](https://tiptap.dev) easily
- 💻 **Code Blocks**: With syntax highlighting
    
\`\`\`typescript
const hello = "world";
console.log(hello);
\`\`\`
    
:::mermaid
graph TD
A[Start] --> B[Stop]
:::
    
## Try it out!
    
Start typing below or use the \`/\` command to insert blocks.
    
- [ ] Try the task list
- [ ] Use the floating menu to format text
- [ ] Insert a table or image
    
`)
  const [markdown, setMarkdown] = useState(content)

  // 计算节点是否可以编辑（与 ProjectSider 中的逻辑保持一致）
  const canEdit = useMemo(() => {
    if (!nodeInfo) return false
    // 扁平化树数据以检查开发模式
    const flattenedItems = flattenTree(treeData)
    // 检查节点是否处于开发模式（包括继承）
    const isInDevMode = isNodeInDevMode(projectId, nodeId, flattenedItems)
    return !isInDevMode
  }, [nodeId, projectId, treeData, nodeInfo])

  const handleUpdate = (newMarkdown: string) => {
    setMarkdown(newMarkdown)
  }

  // const handleCopy = () => {
  //   navigator.clipboard.writeText(markdown)
  //   messageApi.success('Markdown copied to clipboard!')
  // }

  // const handleClear = () => {
  //   setContent('')
  //   setMarkdown('')
  //   messageApi.info('Editor cleared')
  // }

  useEffect(() => {
    if (nodeInfo) {
      setActiveTab(NodeDetailTabKey.Detail)
    }
  }, [nodeInfo])

  // 从 localStorage 读取开发模式状态
  useEffect(() => {
    const currentDevModeNodeId = getDevModeNodeId(projectId)
    setDevMode(currentDevModeNodeId === nodeId)

    // 监听开发模式变化事件
    const handleDevModeChange = (event: CustomEvent) => {
      if (event.detail.projectId === projectId) {
        setDevMode(event.detail.nodeId === nodeId)
      }
    }

    window.addEventListener('devModeChanged', handleDevModeChange as EventListener)
    return () => {
      window.removeEventListener('devModeChanged', handleDevModeChange as EventListener)
    }
  }, [projectId, nodeId])

  /** 处理开发模式切换 */
  const handleDevModeChange = (checked: boolean) => {
    try {
      setDevModeLoading(true)

      if (checked) {
        // 开启开发模式：设置当前节点为开发模式节点（会自动关闭之前的）
        setDevModeNodeId(projectId, nodeId)
        messageApi.success('已开启开发模式')
      } else {
        // 关闭开发模式
        setDevModeNodeId(projectId, null)
        messageApi.success('已关闭开发模式')
      }

      setDevMode(checked)
    } catch {
      messageApi.error('切换开发模式失败')
    } finally {
      setDevModeLoading(false)
    }
  }

  /** 获取节点详情tabs */
  const tabItems = useMemo(() => {
    if (nodeInfo?.type === 'function') {
      return [
        { label: '详情', key: NodeDetailTabKey.Detail },
        { label: '设计文档', key: NodeDetailTabKey.Document },
      ]
    }
    return [{ label: '详情', key: NodeDetailTabKey.Detail }]
  }, [nodeInfo?.type])

  if (!nodeInfo) {
    return (
      <div className="flex items-center justify-center h-full text-[--dip-text-color-65]">
        节点信息不存在
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {messageContextHolder}
      {/* 顶部标题区域 */}
      <div className="flex justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <div className="text-base font-medium text-[--dip-text-color]">{nodeInfo.name}</div>
          <div className="border-[#BAE0FF] border text-[#1677FF] rounded bg-[#E6F4FF] text-xs flex justify-center items-center px-2 h-6 shrink-0">
            {objectTypeNameMap(nodeInfo.type)}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 items-center h-6">
          <span className="text-sm text-[--dip-text-color-65]">开发模式</span>
          <Switch
            checked={devMode}
            loading={devModeLoading}
            onChange={handleDevModeChange}
            size="small"
          />
        </div>
      </div>

      {/* 详情区域 */}
      <Tabs
        className={styles.tabs}
        items={tabItems}
        activeKey={activeTab}
        size="small"
        onChange={(key) => setActiveTab(key as NodeDetailTabKey)}
      />
      <div
        className={clsx(
          'border border-[--dip-border-color] overflow-hidden',
          styles.editorContainer,
        )}
      >
        <ScrollBarContainer className="h-full px-6 tiptap-scroll-container relative">
          {activeTab === NodeDetailTabKey.Detail && (
            <Descriptions
              className="py-6"
              column={1}
              size="small"
              items={[
                {
                  label: '描述',
                  children: nodeInfo.description || '暂无描述',
                },
                {
                  label: '创建者',
                  children: nodeInfo.creator || '--',
                },
                {
                  label: '创建时间',
                  children: nodeInfo.created_at ? formatTime(nodeInfo.created_at) : '--',
                },
                {
                  label: '编辑者',
                  children: nodeInfo.editor || '--',
                },
                {
                  label: '编辑时间',
                  children: nodeInfo.edited_at ? formatTime(nodeInfo.edited_at) : '--',
                },
              ]}
              styles={{
                label: { minWidth: 80 },
                content: { color: 'var(--dip-text-color)', lineHeight: '28px', fontWeight: 500 },
              }}
            />
          )}
          {activeTab === NodeDetailTabKey.Document && (
            <TiptapEditor
              content={content}
              onUpdate={handleUpdate}
              readOnly={!canEdit}
              placeholder="Type / to see commands..."
            />
          )}
        </ScrollBarContainer>
      </div>
    </div>
  )
}

export default ProjectNodeDetail
