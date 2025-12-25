import { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { useParams } from 'react-router-dom'
import {
  getApplicationsBasicInfo,
  type ApplicationBasicInfo,
} from '@/apis/applications'
import MicroAppComponent from '../../components/MicroAppComponent'
import { useMicroAppStore } from '../../stores/microAppStore'
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'
import { getFullPath } from '@/utils/config'
import Empty from '@/components/Empty'

const MicroAppContainer = () => {
  const { appName } = useParams<{ appName: string }>()
  const [appBasicInfo, setAppBasicInfo] = useState<ApplicationBasicInfo | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentMicroApp, clearCurrentMicroApp } = useMicroAppStore()

  useEffect(() => {
    const fetchApp = async () => {
      if (!appName) {
        setError('应用不存在')
        setLoading(false)
        return
      }

      try {
        const appData = await getApplicationsBasicInfo({ packageName: appName })
        if (!appData) {
          setError('获取应用配置失败')
        } else {
          setAppBasicInfo(appData)
          // 设置微应用信息到 store
          // routeBasename 需要包含 BASE_PATH 前缀，因为微应用的路由系统是独立的
          // 需要知道浏览器中的完整路径才能正确匹配路由
          setCurrentMicroApp({
            ...appData,
            routeBasename: getFullPath(
              `/application/${appData.micro_app.name}`
            ),
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
  }, [appName])

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
