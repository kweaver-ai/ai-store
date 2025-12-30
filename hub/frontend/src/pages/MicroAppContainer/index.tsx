import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  type ApplicationBasicInfo,
  getApplicationsBasicInfo,
} from '@/apis/applications'
import Empty from '@/components/Empty'
import { getFullPath } from '@/utils/config'
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'
import MicroAppComponent from '../../components/MicroAppComponent'
import {
  useMicroAppStore,
  type CurrentMicroAppInfo,
} from '../../stores/microAppStore'

const MicroAppContainer = () => {
  const { appId } = useParams<{ appId: string }>()
  const [appBasicInfo, setAppBasicInfo] = useState<CurrentMicroAppInfo | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentMicroApp, clearCurrentMicroApp } = useMicroAppStore()

  useEffect(() => {
    const fetchApp = async () => {
      if (!appId) {
        setError('应用不存在')
        setLoading(false)
        return
      }

      try {
        const appData = await getApplicationsBasicInfo(Number(appId))
        if (!appData) {
          setError('获取应用配置失败')
        } else {
          setAppBasicInfo({
            ...appData,
            routeBasename: getFullPath(`/application/${appData.id}`),
          })
          // 设置微应用信息到 store
          // routeBasename 需要包含 BASE_PATH 前缀，因为微应用的路由系统是独立的
          // 需要知道浏览器中的完整路径才能正确匹配路由
          setCurrentMicroApp({
            ...appData,
            routeBasename: getFullPath(`/application/${appData.id}`),
          })
        }
      } catch (err: any) {
        if (err?.description) {
          setError(err.description)
        } else {
          setError('获取应用配置失败')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchApp()

    // 清理函数
    return () => {
      setAppBasicInfo(null)
      setError(null)
      setLoading(false)
      // 清理微应用信息和面包屑
      clearCurrentMicroApp()
      setMicroAppGlobalState(
        {
          breadcrumb: [],
        },
        { allowAllFields: true }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      )
    }
    if (error || !appBasicInfo) {
      return (
        <div className="flex justify-center items-center h-full">
          <Empty type="failed" desc="加载失败" subDesc={error ?? ''} />
        </div>
      )
    }
    return <MicroAppComponent appBasicInfo={appBasicInfo} />
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      {renderContent()}
    </div>
  )
}

export default MicroAppContainer
