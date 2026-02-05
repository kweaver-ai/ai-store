import { Button, Descriptions, message, Popover, Spin, Switch, Tabs } from 'antd'
import clsx from 'clsx'
import jsonpatch from 'fast-json-patch'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDocument, putDocument } from '@/apis/dip-studio'
import {
  getDevModeNodeId,
  isNodeInDevMode,
  setDevModeNodeId,
} from '@/pages/ProjectManagement/devMode'
import { objectTypeNameMap } from '@/pages/ProjectManagement/utils'
import { useProjectStore } from '@/stores'
import { LoadStatus } from '@/types/enums'
import { formatTime } from '@/utils/handle-function/FormatTime'
import Empty from '../Empty'
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
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.Empty)
  const [initialContent, setInitialContent] = useState<any>({})
  const [content, setContent] = useState<any>({})
  const contentRef = useRef(content)
  contentRef.current = content

  /** 节点是否处于开发模式 */
  const nodeInDevMode = useMemo(() => {
    if (!nodeInfo) return false
    // 扁平化树数据以检查开发模式
    const flattenedItems = flattenTree(treeData)
    // 检查节点是否处于开发模式（包括继承）
    return isNodeInDevMode(projectId, nodeId, flattenedItems)
  }, [nodeId, projectId, treeData, nodeInfo])

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
    const handleDevModeChanged = (event: CustomEvent) => {
      if (event.detail.projectId === projectId) {
        setDevMode(event.detail.nodeId === nodeId)
      }
    }

    window.addEventListener('devModeChanged', handleDevModeChanged as EventListener)
    return () => {
      window.removeEventListener('devModeChanged', handleDevModeChanged as EventListener)
    }
  }, [projectId, nodeId])

  const fetchDocument = useCallback(async () => {
    if (loadStatus === LoadStatus.Loading) return
    const documentId = nodeInfo?.document_id
    if (!documentId) {
      setContent({})
      setInitialContent({})
      setLoadStatus(LoadStatus.Normal)
      return
    }
    try {
      setLoadStatus(LoadStatus.Loading)
      const res = await getDocument(documentId)
      setContent(res || {})
      setInitialContent(res || {})
    } catch {
      setLoadStatus(LoadStatus.Failed)
    } finally {
      setLoadStatus(LoadStatus.Normal)
    }
  }, [nodeId, nodeInfo?.document_id])

  useEffect(() => {
    if (!nodeInfo || nodeInfo.node_type !== 'function') return
    fetchDocument()
  }, [nodeId, nodeInfo, fetchDocument])

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

  const saveDocument = useCallback(
    async (newContent: any) => {
      if (nodeInDevMode) return
      const documentId = nodeInfo?.document_id
      if (!documentId) return
      const baseContent = contentRef.current
      const patches = jsonpatch.compare(baseContent || {}, newContent)
      if (patches.length === 0) return

      const maxRetries = 3
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await putDocument(documentId, patches as any)
          setContent(newContent)
          return
        } catch {
          if (attempt === maxRetries) {
            messageApi.error('保存失败，请稍后重试')
          } else {
            await new Promise((r) => setTimeout(r, 500 * attempt))
          }
        }
      }
    },
    [nodeInDevMode, nodeInfo?.document_id, messageApi],
  )

  const scheduleSaveDocument = useMemo(
    () =>
      debounce((newContent: any) => {
        saveDocument(newContent)
      }, 800),
    [saveDocument],
  )

  useEffect(() => {
    return () => {
      scheduleSaveDocument.flush()
      scheduleSaveDocument.cancel()
    }
  }, [scheduleSaveDocument])

  const handleUpdate = (newContent: any) => {
    // /** 如果初始内容为空，则保存初始内容 */
    // if (!initialContent.current?.type) {
    //   initialContent.current = newContent
    //   saveDocument(newContent)
    //   return
    // }
    /** 如果初始内容不为空，则进行差分保存 */
    scheduleSaveDocument(newContent)
  }

  /** 获取节点详情tabs */
  const tabItems = useMemo(() => {
    if (nodeInfo?.node_type === 'function') {
      return [
        { label: '详情', key: NodeDetailTabKey.Detail },
        { label: '设计文档', key: NodeDetailTabKey.Document },
      ]
    }
    return [{ label: '详情', key: NodeDetailTabKey.Detail }]
  }, [nodeInfo?.node_type])

  if (!nodeInfo) {
    return (
      <div className="flex items-center justify-center h-full text-[--dip-text-color-65]">
        节点信息不存在
      </div>
    )
  }

  const prompt = `读取当前 DIP Studio 节点下的设计文档和上下文，完成下面的开发任务。

node_id: ${nodeId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
    messageApi.success('复制成功')
  }

  /** Promot 弹窗内容 */
  const promotContent = () => (
    <div className="w-[360px]">
      <div className="mb-2 text-base font-medium">复制Prompt</div>
      <div className="mb-3 text-[13px] leading-5 text-[--dip-text-color-45]">
        将以下 Prompt 复制到开发 Agent 中，即可快速读取当前页面的设计文档。
      </div>
      <div className="text-xs leading-5 text-[--dip-text-color] bg-[#779EEA1A] border border-dashed border-[#779EEA] px-2.5 py-2 mb-6">
        {prompt}
      </div>
      <div className="flex justify-end">
        <Button type="primary" onClick={handleCopy}>
          一键复制
        </Button>
      </div>
    </div>
  )

  /** 渲染状态内容（loading/error/empty） */
  const renderStateContent = () => {
    if (loadStatus === LoadStatus.Loading) {
      return <Spin />
    }

    if (loadStatus === LoadStatus.Failed) {
      return (
        <Empty type="failed" title="加载失败">
          <Button className="mt-1" type="primary" onClick={fetchDocument}>
            重试
          </Button>
        </Empty>
      )
    }

    return null
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {messageContextHolder}
      {/* 顶部标题区域 */}
      <div className="flex justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <div className="text-base font-medium text-[--dip-text-color]">{nodeInfo.name}</div>
          <div className="border-[#BAE0FF] border text-[#1677FF] rounded bg-[#E6F4FF] text-xs flex justify-center items-center px-2 h-6 shrink-0">
            {objectTypeNameMap(nodeInfo.node_type)}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 items-center h-6">
          {nodeInDevMode && (
            <Popover
              content={promotContent}
              trigger="click"
              placement="bottom"
              arrow={false}
              styles={{ container: { padding: '20px 24px' } }}
            >
              <button
                type="button"
                className="h-full text-sm text-[--dip-white] bg-[#4096FF] rounded px-2"
              >
                查看Promot
              </button>
            </Popover>
          )}
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
          'border border-[--dip-border-color] overflow-hidden flex-1',
          styles.editorContainer,
        )}
      >
        <ScrollBarContainer
          className={clsx(
            'h-full px-6 tiptap-scroll-container relative',
            nodeInDevMode && 'bg-[#D9D9D91A]',
          )}
        >
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
                  children: nodeInfo.creator_name || '--',
                },
                {
                  label: '创建时间',
                  children: nodeInfo.created_at ? formatTime(nodeInfo.created_at) : '--',
                },
                {
                  label: '编辑者',
                  children: nodeInfo.editor_name || '--',
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
          {activeTab === NodeDetailTabKey.Document &&
            (loadStatus === LoadStatus.Normal ? (
              <TiptapEditor
                initialContent={initialContent}
                onUpdate={handleUpdate}
                readOnly={nodeInDevMode}
                placeholder="请描述该功能...（输入/ 可引用 业务知识网络、决策智能体、指标）"
              />
            ) : (
              renderStateContent()
            ))}
        </ScrollBarContainer>
      </div>
    </div>
  )
}

export default ProjectNodeDetail
