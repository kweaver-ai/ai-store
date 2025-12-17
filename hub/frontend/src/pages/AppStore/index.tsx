import { useState, useEffect, useCallback, memo } from 'react'
import { Spin, Button, message } from 'antd'
import GradientContainer from '@/components/GradientContainer'
import AppList from '@/components/AppList'
import Empty from '@/components/Empty'
import { ModeEnum } from '@/components/AppList/types'
import { AppStoreActionEnum } from './types'
import { getApplications, type Application } from '@/apis/dip-hub'
import SearchInput from '@/components/SearchInput'
import { ReloadOutlined } from '@ant-design/icons'
import IconFont from '@/components/IconFont'

const AppStore = () => {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [installModalVisible, setInstallModalVisible] = useState(false)

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

      setApps(response.entries)
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
          case AppStoreActionEnum.Install:
            // TODO: 调用安装接口
            message.success('安装成功')
            handleRefresh()
            break
          case AppStoreActionEnum.Uninstall:
            // TODO: 调用卸载接口
            message.success('卸载成功')
            handleRefresh()
            break
          case AppStoreActionEnum.Config:
            // TODO: 跳转配置页面
            break
          case AppStoreActionEnum.Run:
            // TODO: 运行应用
            break
          case AppStoreActionEnum.Auth:
            // TODO: 跳转授权管理
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
        mode={ModeEnum.AppStore}
        apps={apps}
        onMenuClick={handleMenuClick}
      />
    )
  }

  return (
    <GradientContainer className="h-full p-6 flex flex-col">
      <div className="flex justify-between mb-6 flex-shrink-0 z-20">
        <div className="flex flex-col gap-y-3">
          <span className="text-base font-bold">应用商店</span>
          <span className="text-sm">管理企业应用市场，安装或卸载应用</span>
        </div>
        <div className="flex items-center gap-x-2">
          <SearchInput onSearch={handleSearch} placeholder="搜索应用" />
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          />
          <Button
            type="primary"
            icon={<IconFont type="icon-dip-upload" />}
            onClick={() => setInstallModalVisible(true)}
          >
            安装应用
          </Button>
        </div>
      </div>
      {renderContent()}
    </GradientContainer>
  )
}

export default memo(AppStore)
