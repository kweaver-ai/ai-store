import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Popover, Spin } from 'antd'
import clsx from 'clsx'
import type React from 'react'
import { useMemo, useState } from 'react'
import type { AgentInfo } from '@/apis/applications'
import { getApplicationsAgents } from '@/apis/applications'
import IconFont from '@/components/IconFont'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import SearchInput from '@/components/SearchInput'
import styles from './index.module.less'

const MetricView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, editor, selected } = props
  const { id, name } = node.attrs
  const [metricOptions, setMetricOptions] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // 获取指标列表
  const fetchMetrics = async () => {
    if (loading) return // 防止重复请求
    setLoading(true)
    setError(null)
    try {
      // TODO: 需要传入应用ID，这里暂时使用0作为占位符，后续需要根据实际情况调整
      // TODO: 需要替换为获取指标的 API
      const result = await getApplicationsAgents(0)
      setMetricOptions(result)
    } catch (error) {
      setMetricOptions([])
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  // Popover 打开时获取数据
  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open)
    if (open && !loading) {
      fetchMetrics()
    }
  }

  // 过滤后的选项列表
  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) {
      return metricOptions
    }
    const keyword = searchValue.trim().toLowerCase()
    return metricOptions.filter((item) => item.name?.toLowerCase().includes(keyword))
  }, [metricOptions, searchValue])

  // 选择指标
  const handleSelect = (item: AgentInfo) => {
    updateAttributes({
      id: item.id,
      name: item.name,
    })
    setPopoverOpen(false)
    setSearchValue('')
  }

  // Popover 内容
  const popoverContent = (
    <div className="w-[352px] flex flex-col gap-y-2">
      {/* 搜索框 */}
      <div className="px-4">
        <SearchInput
          variant="outlined"
          className="w-full"
          placeholder="搜索指标"
          onSearch={(value) => setSearchValue(value)}
        />
      </div>

      {/* 列表 */}
      <ScrollBarContainer className="max-h-[200px] overflow-y-auto px-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spin />
          </div>
        ) : error ? (
          <div className="mx-auto text-sm text-[rgba(0,0,0,0.45)] text-center py-4">暂无数据</div>
        ) : filteredOptions.length === 0 ? (
          <div className="mx-auto text-sm text-[rgba(0,0,0,0.45)] text-center py-4">
            抱歉，没有找到相关内容
          </div>
        ) : (
          <div className="space-y-1">
            {filteredOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelect(item)
                  }
                }}
                className={`w-full h-8 text-left px-3 rounded cursor-pointer transition-colors ${
                  id === item.id ? 'bg-[rgba(18,110,227,0.06)]' : 'hover:bg-[rgba(0,0,0,0.04)]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </ScrollBarContainer>
    </div>
  )

  // 展示视图
  const displayView = (
    <div
      className={clsx(
        'flex h-8 w-fit items-center py-1 px-2 border rounded-md text-muted-foreground text-sm gap-x-2',
        !id ? 'border-dashed' : 'bg-[#779EEA1A] border-[#779EEA8C]',
        selected && editor.isEditable && 'border-[--dip-link-color]',
      )}
    >
      <IconFont type="icon-a-zhibiaomoxing1" className="text-lg" />
      {!id ? <span className="text-[rgba(0,0,0,0.65)]">暂无指标</span> : <span>{name}</span>}
    </div>
  )
  return (
    <NodeViewWrapper className="max-w-full">
      {editor.isEditable ? (
        <Popover
          content={popoverContent}
          trigger="click"
          open={popoverOpen}
          onOpenChange={handlePopoverOpenChange}
          placement="bottomLeft"
          arrow={false}
          classNames={{
            container: styles['dip-node-metric-popover'],
          }}
        >
          <button
            type="button"
            className="w-fit text-left cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              setPopoverOpen(!popoverOpen)
            }}
            // onKeyDown={(e) => {
            //   if (e.key === 'Enter' || e.key === ' ') {
            //     e.preventDefault()
            //     setPopoverOpen(!popoverOpen)
            //   }
            // }}
          >
            {displayView}
          </button>
        </Popover>
      ) : (
        <div>{displayView}</div>
      )}
    </NodeViewWrapper>
  )
}

export default ReactNodeViewRenderer(MetricView)
