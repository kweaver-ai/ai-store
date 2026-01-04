import { ReloadOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { ApplicationInfo } from '@/apis/applications'
import AppList from '@/components/AppList'
import { ModeEnum } from '@/components/AppList/types'
import Empty from '@/components/Empty'
import SearchInput from '@/components/SearchInput'
import { useApplicationsService } from '@/hooks/useApplicationsService'
import { usePreferenceStore } from '@/stores'
import { getFullPath } from '@/utils/config'
import { MyAppActionEnum } from './types'

const MyApp = () => {
  const { apps, loading, error, searchValue, handleSearch, handleRefresh } =
    useApplicationsService()
  const { togglePin } = usePreferenceStore()
  const [hasLoadedData, setHasLoadedData] = useState(false) // 记录是否已经成功加载过数据（有数据的情况）
  const hasEverHadDataRef = useRef(false) // 使用 ref 追踪是否曾经有过数据，避免循环依赖
  const prevSearchValueRef = useRef('') // 追踪上一次的搜索值，用于判断是否是从搜索状态清空

  // 当数据加载完成且有数据时，标记为已加载过数据；数据清空后重置
  useEffect(() => {
    // 在开始处理前，先保存上一次的搜索值用于判断
    const wasSearching = prevSearchValueRef.current !== ''

    if (!loading) {
      if (apps.length > 0) {
        // 有数据时，设置为 true 并记录
        setHasLoadedData(true)
        hasEverHadDataRef.current = true
      } else if (!searchValue && hasEverHadDataRef.current) {
        // 没有数据且没有搜索值且之前有过数据时，需要判断是否是从搜索状态清空
        // 只有当上一次也没有搜索值（说明不是从搜索状态清空，而是真正的空状态）时，才重置
        if (!wasSearching) {
          // 不是从搜索状态清空，说明是真正的空状态，重置
          setHasLoadedData(false)
          hasEverHadDataRef.current = false
        }
        // 如果是从搜索状态清空（wasSearching === true），保持 hasLoadedData 不变
        // 因为数据会重新加载，如果原来有数据，加载后 apps.length > 0，hasLoadedData 会保持 true
      }
      // 如果有搜索值但 apps.length === 0，保持 hasLoadedData 不变（显示搜索框）
    }

    // 更新上一次的搜索值（在 useEffect 结束时更新，确保下次执行时能正确判断）
    prevSearchValueRef.current = searchValue
  }, [loading, apps.length, searchValue])

  /** 处理卡片菜单操作 */
  const handleMenuClick = useCallback(
    async (action: string, _app: ApplicationInfo) => {
      try {
        switch (action) {
          case MyAppActionEnum.Fix:
            await togglePin(_app.key)
            message.success('已固定')
            handleRefresh()
            break
          case MyAppActionEnum.Unfix:
            await togglePin(_app.key)
            message.success('已取消固定')
            handleRefresh()
            break
          case MyAppActionEnum.Use:
            window.open(getFullPath(`/application/${_app.id}`), '_blank')
            break
          default:
            break
        }
      } catch (err) {
        console.error('Failed to handle app action:', err)
      }
    },
    [handleRefresh, togglePin],
  )

  /** 渲染状态内容（loading/error/empty） */
  const renderStateContent = () => {
    if (loading) {
      return <Spin size="large" />
    }

    if (error) {
      return (
        <Empty type="failed" desc="加载失败">
          <Button type="primary" onClick={handleRefresh}>
            重试
          </Button>
        </Empty>
      )
    }

    if (apps.length === 0) {
      if (searchValue) {
        return <Empty type="search" desc="抱歉，没有找到相关内容" />
      }
      return (
        <Empty
          desc="暂无可用应用"
          subDesc="您当前没有任何应用的访问权限。这可能是因为管理员尚未为您分配权限，或者应用尚未部署。"
        />
      )
    }

    return null
  }

  /** 渲染内容区域 */
  const renderContent = () => {
    const stateContent = renderStateContent()

    if (stateContent) {
      return <div className="absolute inset-0 flex items-center justify-center">{stateContent}</div>
    }

    return <AppList mode={ModeEnum.MyApp} apps={apps} onMenuClick={handleMenuClick} />
  }

  return (
    <div className="h-full p-6 flex flex-col relative overflow-auto">
      <div className="flex justify-between mb-4 flex-shrink-0 z-20">
        <div className="flex flex-col gap-y-3">
          <span className="text-[32px] font-bold">探索企业级 AI 应用</span>
          <span className="text-base">查找具备专业能力的应用，帮你解决业务上的复杂问题</span>
        </div>
        {(hasLoadedData || searchValue) && (
          <div className="flex items-center gap-x-2">
            <SearchInput onSearch={handleSearch} placeholder="搜索应用" />
            <Button type="text" icon={<ReloadOutlined />} onClick={handleRefresh} />
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  )
}

export default memo(MyApp)
