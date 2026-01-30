import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Card, Modal } from 'antd'
import type React from 'react'
import { useState } from 'react'

const KnowledgeView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, editor } = props
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { id, title, description, icon: nodeIcon } = node.attrs

  const handleClick = () => {
    if (editor.isEditable) {
      setIsModalVisible(true)
    }
  }

  const handleSelect = (data: { id: string; title: string; description: string; icon: string }) => {
    updateAttributes(data)
    setIsModalVisible(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <NodeViewWrapper className="dip-knowledge-node-wrapper">
      <button
        className="dip-knowledge-node"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        type="button"
        tabIndex={0}
      >
        {!id ? (
          <div className="dip-knowledge-placeholder">
            <span
              className="dip-prose-mirror-icon dip-prose-mirror-icon-knowledge"
              style={{ fontSize: '24px', marginRight: '8px' }}
            />
            <span>点击选择知识网络</span>
          </div>
        ) : (
          <Card
            hoverable
            className="dip-knowledge-card"
            size="small"
            title={
              <div className="dip-knowledge-card-title">
                {nodeIcon && (
                  <span
                    className={`dip-prose-mirror-icon ${nodeIcon}`}
                    style={{ marginRight: '8px' }}
                  />
                )}
                <span>{title}</span>
              </div>
            }
          >
            <div className="dip-knowledge-card-description">{description}</div>
          </Card>
        )}
      </button>

      <Modal
        title="选择知识网络"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <div className="dip-knowledge-selector-list">
          {[
            {
              id: '1',
              title: '项目架构指南',
              description: '关于 DIP 项目的技术选型、目录结构和核心模块说明。',
              icon: 'dip-prose-mirror-icon-orderedList',
            },
            {
              id: '2',
              title: '组件库文档',
              description: '内部 Antd 组件封装及业务组件库的使用说明。',
              icon: 'dip-prose-mirror-icon-bulletList',
            },
          ].map((item) => (
            <Card
              key={item.id}
              hoverable
              className="dip-knowledge-selector-item"
              onClick={() => handleSelect(item)}
              style={{ marginBottom: '12px' }}
            >
              <Card.Meta
                avatar={
                  <span
                    className={`dip-prose-mirror-icon ${item.icon}`}
                    style={{ fontSize: '20px' }}
                  />
                }
                title={item.title}
                description={item.description}
              />
            </Card>
          ))}
        </div>
      </Modal>
    </NodeViewWrapper>
  )
}

export default ReactNodeViewRenderer(KnowledgeView)
