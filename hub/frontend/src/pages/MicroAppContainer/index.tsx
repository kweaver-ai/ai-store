import { useState, useEffect } from 'react'
import { Spin, Result, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getApplicationsBasicInfo,
  type ApplicationBasicInfo,
} from '@/apis/dip-hub'
import MicroAppComponent from '../../components/MicroAppComponent'
import { useMicroAppStore } from '../../stores/microAppStore'
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'
import Empty from '@/components/Empty'

const MicroAppContainer = () => {
  const { appName } = useParams<{ appName: string }>()
  const navigate = useNavigate()
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
          setCurrentMicroApp({
            ...appData,
            routeBasename: `/application/${appData.micro_app.name}`,
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
