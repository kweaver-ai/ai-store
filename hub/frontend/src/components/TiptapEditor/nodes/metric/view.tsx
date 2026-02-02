import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import clsx from 'clsx'
import type React from 'react'
import { useState } from 'react'
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
        'flex h-8 w-fit items-center py-1 px-2 border rounded-md text-muted-foreground text-sm gap-x-2',
        metricsArray.length === 0 ? 'border-dashed' : 'bg-[#779EEA1A] border-[#779EEA8C]',
        selected && editor.isEditable && 'border-[--dip-link-color]',
      )}
    >
      <IconFont type="icon-a-zhibiaomoxing1" className="text-lg" />
      {metricsArray.length === 0 ? (
        <span className="text-[rgba(0,0,0,0.65)]">暂无{extension.options.dictionary.name}</span>
      ) : (
        <span>
          {metricsArray.length === 1
            ? metricsArray[0].name
            : `已选择 ${metricsArray.length} 个指标`}
        </span>
      )}
    </div>
  )
  return (
    <NodeViewWrapper className="max-w-full">
      {editor.isEditable ? (
        <>
          <button
            type="button"
            className="w-fit text-left cursor-pointer"
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
