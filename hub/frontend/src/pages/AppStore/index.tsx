import { useState, useCallback, memo, useEffect } from 'react'
import { Spin, Button, message, Modal } from 'antd'
import { ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons'
import GradientContainer from '@/components/GradientContainer'
import AppList from '@/components/AppList'
import Empty from '@/components/Empty'
import { ModeEnum } from '@/components/AppList/types'
import { AppStoreActionEnum } from './types'
import { type ApplicationInfo } from '@/apis/dip-hub'
import SearchInput from '@/components/SearchInput'
import IconFont from '@/components/IconFont'
import { useApplicationsService } from '@/hooks/useApplicationsService'
import AppConfigDrawer from '@/components/AppConfigDrawer'
import { deleteApplications } from '@/apis/dip-hub/applications'
import UploadAppModal from '@/components/UploadAppModal'
import styles from './index.module.less'

const AppStore = () => {
  const { apps, loading, error, searchValue, handleSearch, handleRefresh } =
    useApplicationsService()
  const [installModalVisible, setInstallModalVisible] = useState(false)
  const [configModalVisible, setConfigModalVisible] = useState(false)
  const [selectedApp, setSelectedApp] = useState<ApplicationInfo | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false) // 记录是否已经成功加载过数据（有数据的情况）

  // 当数据加载完成且有数据时，标记为已加载过数据
  useEffect(() => {
    if (!loading && apps.length > 0) {
      setHasLoadedData(true)
    }
  }, [loading, apps.length])

  /** 处理卡片菜单操作 */
  const handleMenuClick = useCallback(
    async (action: string, _app: ApplicationInfo) => {
      try {
        switch (action) {
          /** 卸载应用 */
          case AppStoreActionEnum.Uninstall:
            Modal.confirm({
              title: '确认卸载',
              icon: <ExclamationCircleFilled />,
              content:
                '卸载应用后，相关配置和数据将被清除，用户将无法使用应用。是否继续?',
              okText: '确定',
              okType: 'primary',
              okButtonProps: { danger: true },
              cancelText: '取消',
              footer: (_, { OkBtn, CancelBtn }) => (
                <>
                  <OkBtn />
                  <CancelBtn />
                </>
              ),
              onOk: async () => {
                try {
                  await deleteApplications(_app.key)
                  message.success('卸载成功')
                  handleRefresh()
                } catch (err: any) {
                  if (err?.description) {
                    message.error(err.description)
                    return
                  }
                }
              },
            })
            break

          /** 配置应用 */
          case AppStoreActionEnum.Config:
            setSelectedApp(_app)
            setConfigModalVisible(true)
            break

          /** 运行应用 */
          case AppStoreActionEnum.Run:
            window.open(`/application/${_app.micro_app.name}`, '_blank')
            break

          /** 授权管理 */
          case AppStoreActionEnum.Auth:
            // TODO: 跳转授权管理
            break

          default:
            break
        }
      } catch (err: any) {
        if (err?.description) {
          message.error(err.description)
          return
        }
        console.error('Failed to handle app action:', err)
      }
    },
    [handleRefresh]
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
        return <Empty type="search" subDesc="抱歉，没有找到相关内容" />
      }
      return (
        <Empty
          desc="暂无应用"
          subDesc="当前应用市场空空如也，您可以点击下方按钮安装第一个企业应用。"
        >
          <Button
            className="mt-2"
            type="primary"
            icon={<IconFont type="icon-dip-upload" />}
            onClick={() => {
              setInstallModalVisible(true)
            }}
          >
            安装应用
          </Button>
        </Empty>
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
          <span className="text-base font-bold text-[--dip-text-color]">
            应用商店
          </span>
          <span className="text-sm text-[--dip-text-color-65]">
            管理企业应用市场，安装或卸载应用
          </span>
        </div>
        {hasLoadedData && (
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
        )}
      </div>
      {renderContent()}
      <AppConfigDrawer
        appData={selectedApp ?? undefined}
        open={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
      />
      <UploadAppModal
        open={installModalVisible}
        onCancel={() => setInstallModalVisible(false)}
        onSuccess={(appInfo) => {
          setInstallModalVisible(false)
          handleRefresh()
          // 显示成功提示
          const key = `upload-success-${Date.now()}`
          message.success({
            key,
            className: styles.uploadSuccessMessage,
            content: (
              <div className="flex items-center gap-2">
                <span>
                  应用"
                  <span className="inline-block max-w-md truncate align-bottom">
                    {appInfo.name}
                  </span>
                  "上传成功，请完成配置以启用服务。
                  <a
                    href=""
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedApp(appInfo)
                      setConfigModalVisible(true)
                      message.destroy(key)
                    }}
                    className="text-[--dip-primary-color]"
                  >
                    去配置
                  </a>
                </span>
              </div>
            ),
          })
        }}
      />
    </GradientContainer>
  )
}

export default memo(AppStore)
