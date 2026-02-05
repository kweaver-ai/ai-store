import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import clsx from 'clsx'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { MetricModelType } from '@/apis'
import IconFont from '@/components/IconFont'
import MetricSelector from '@/components/MetricSelector'

/** 简化的指标类型，只包含 id 和 name */
export interface SimplifiedMetricType {
  id: string
  name: string
}

const MetricView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, editor, selected, extension } = props
  const { metrics } = node.attrs
  const metricsArray: Array<SimplifiedMetricType> = Array.isArray(metrics) ? metrics : []
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditable, setIsEditable] = useState(editor.isEditable)

  // 监听编辑器编辑状态变化
  useEffect(() => {
    const updateEditableState = () => {
      setIsEditable(editor.isEditable)
    }

    // 初始化状态
    updateEditableState()

    // 监听编辑器状态变化
    editor.on('update', updateEditableState)
    editor.on('transaction', updateEditableState)

    return () => {
      editor.off('update', updateEditableState)
      editor.off('transaction', updateEditableState)
    }
  }, [editor])

  // 选择指标确认 - 只保存 id 和 name
  const handleConfirm = (selectedMetrics: Array<MetricModelType>) => {
    const simplified = selectedMetrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
    }))
    updateAttributes({
      metrics: simplified,
    })
    setModalOpen(false)
  }

  // 将简化的指标转换为 MetricModelType 格式（用于传递给 MetricSelector）
  // MetricSelector 通过 id 匹配已选中的项，所以只需要 id 和 name 即可
  const convertToMetricModelType = (simplified: SimplifiedMetricType[]): Array<MetricModelType> => {
    return simplified.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
        }) as MetricModelType,
    )
  }

  // 取消选择
  const handleCancel = () => {
    setModalOpen(false)
  }

  // 展示视图
  const displayView = (
    <div
      className={clsx(
        'flex min-h-8 h-fit w-fit max-w-full flex-wrap items-center py-1 px-2 border rounded-md text-muted-foreground text-sm gap-x-3 gap-y-1',
        metricsArray.length === 0 ? 'border-dashed' : 'bg-[#779EEA1A] border-[#779EEA8C]',
        selected && isEditable && 'border-[--dip-link-color]',
      )}
    >
      {metricsArray.length === 0 ? (
        <>
          <IconFont type="icon-dip-color-metric" className="text-lg" />
          <span className="text-[rgba(0,0,0,0.65)]">暂无{extension.options.dictionary.name}</span>
        </>
      ) : (
        metricsArray.map((metric) => (
          <div key={metric.id} className="max-w-full flex items-center gap-x-2">
            <IconFont type="icon-dip-color-metric" className="text-lg" />
            <span className="truncate w-fit max-w-full">{metric.name}</span>
          </div>
        ))
      )}
    </div>
  )
  return (
    <NodeViewWrapper className="max-w-full">
      {isEditable ? (
        <>
          <button
            type="button"
            className="w-fit max-w-full text-left"
            onClick={(e) => {
              e.preventDefault()
              setModalOpen(true)
            }}
          >
            {displayView}
          </button>
          {modalOpen && (
            <MetricSelector
              initialSelectedMetrics={convertToMetricModelType(metricsArray)}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </>
      ) : (
        <div>{displayView}</div>
      )}
    </NodeViewWrapper>
  )
}

export default ReactNodeViewRenderer(MetricView)
