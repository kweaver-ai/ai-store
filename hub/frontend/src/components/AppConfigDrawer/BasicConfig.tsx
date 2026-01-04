import { Spin } from 'antd'
import { memo, useEffect, useState } from 'react'
import type { ApplicationBasicInfo } from '@/apis/applications'
import { getApplicationsBasicInfo } from '@/apis/applications'

interface BasicConfigProps {
  /** 应用 ID */
  appId?: number
}

const BasicConfig = ({ appId }: BasicConfigProps) => {
  const [loading, setLoading] = useState(false)
  const [basicInfo, setBasicInfo] = useState<ApplicationBasicInfo | null>(null)

  useEffect(() => {
    let mounted = true

    const loadBasicInfo = async () => {
      if (!appId) return
      setLoading(true)
      try {
        const data = await getApplicationsBasicInfo(appId)
        if (mounted) {
          setBasicInfo(data)
        }
      } catch (error) {
        // 这里简单打印错误即可，具体错误交由外层处理
        console.error('获取基本信息失败:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // 如果有 appId，则再拉一次最新数据
    if (appId) {
      loadBasicInfo()
    }

    return () => {
      mounted = false
    }
  }, [appId])

  if (loading) {
    return (
      <div className="absolute inset-0 left-40 flex items-center justify-center">
        <Spin />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="text-sm font-medium text-[--dip-text-color]">基本信息</div>
      <div className="flex flex-col rounded-xl border border-[#E3E8EF] p-3 text-sm text-[--dip-text-color] gap-2">
        {/* 应用名称：告警与故障分析 */}
        <div className="flex flex-1">
          <span className="text-[--dip-text-color-45] mr-1">应用名称：</span>
          <span>{basicInfo?.name ?? '--'}</span>
        </div>

        {/* 应用描述：... */}
        <div className="flex flex-1">
          <span className="text-[--dip-text-color-45] mr-1 align-top">应用描述：</span>
          <span className="inline-block flex-1 align-top break-words">
            {basicInfo?.description ?? '--'}
          </span>
        </div>

        {/* 版本号：v1.0.0.0.0 */}
        <div className="flex flex-1">
          <span className="text-[--dip-text-color-45] mr-1">版本号：</span>
          <span>{basicInfo?.version ?? '--'}</span>
        </div>
      </div>
    </div>
  )
}

export default memo(BasicConfig)
