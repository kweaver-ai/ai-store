import { useState, useEffect, useCallback, memo } from 'react'
import { Spin, Button, message } from 'antd'
import GradientContainer from '@/components/GradientContainer'
import AppList from '@/components/AppList'
import Empty from '@/components/Empty'
import { ModeEnum } from '@/components/AppList/types'
import { MyAppActionEnum } from './types'
import SearchInput from '@/components/SearchInput'
import { getApplications, type Application } from '@/apis/dip-hub'
import { ReloadOutlined } from '@ant-design/icons'
import { usePreferenceStore } from '@/stores'

const MyApp = () => {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const { togglePin } = usePreferenceStore()

  /** 获取应用列表数据 */
  const fetchAppList = useCallback(async (keyword: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getApplications({
        keyword,
        offset: 1,
        limit: 1000,
      })

      setApps(response.entries || [])
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      if (err?.description) {
        message.error(err.description)
      }
      setError('获取数据时发生错误')
    } finally {
      setLoading(false)
    }
  }, [])

  /** 刷新数据 */
  const handleRefresh = useCallback(() => {
    fetchAppList(searchValue)
  }, [fetchAppList, searchValue])

  /** 处理搜索 */
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  /** 处理卡片菜单操作 */
  const handleMenuClick = useCallback(
    async (action: string, _app: Application) => {
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
            window.open(`/application/${_app.key}`, '_blank')
            break
          default:
            break
        }
      } catch (err) {
        console.error('Failed to handle app action:', err)
        message.error('操作失败')
      }
    },
    [handleRefresh]
  )

  // 初始化和搜索时加载数据
  useEffect(() => {
    fetchAppList(searchValue)
  }, [searchValue])

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
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          {stateContent}
        </div>
      )
    }

    return (
      <AppList
        mode={ModeEnum.MyApp}
        apps={apps}
        onMenuClick={handleMenuClick}
      />
    )
  }

  return (
    <GradientContainer className="h-full p-6 flex flex-col overflow-auto">
      <div className="flex justify-between mb-4 flex-shrink-0 z-20">
        <div className="flex flex-col gap-y-3">
          <span className="text-[32px] font-bold">探索企业级 AI 应用</span>
          <span className="text-base">
            查找具备专业能力的应用，帮你解决业务上的复杂问题
          </span>
        </div>
        <div className="flex items-center gap-x-2">
          <SearchInput onSearch={handleSearch} placeholder="搜索应用" />
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          />
        </div>
      </div>
      {renderContent()}
    </GradientContainer>
  )
}

export default memo(MyApp)
