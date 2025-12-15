import { useState, useEffect } from 'react'
import { Spin, Result, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { getMicroAppById } from '../../apis/micro-app'
import type { MicroAppConfig } from '../../utils/micro-app/type'
import MicroAppComponent from '../../components/MicroAppComponent'
import { useMicroAppStore } from '../../stores/microAppStore'
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'

const MicroAppContainer = () => {
  const { name: appId } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [app, setApp] = useState<MicroAppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentMicroApp, clearCurrentMicroApp } = useMicroAppStore()

  useEffect(() => {
    const fetchApp = async () => {
      if (!appId) {
        setError('应用 ID 不存在')
        setLoading(false)
        return
      }

      try {
        const appData = await getMicroAppById(appId)
        if (!appData) {
          setError('应用不存在')
        } else {
          setApp(appData)
          // 设置微应用信息到 store
          setCurrentMicroApp({
            name: appData.name,
            displayName: appData.name,
            routeBasename: `/app/${appId}`,
          })
        }
      } catch (err) {
        setError('加载应用失败')
        console.error('Failed to load app:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchApp()

    // 清理函数
    return () => {
      setApp(null)
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
  }, [appId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Result
          status="error"
          title="Application Error"
          subTitle={error || 'Application not found'}
          extra={
            <Button size="small" onClick={() => navigate('/home')}>
              返回首页
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-auto">
      <MicroAppComponent app={app} />
    </div>
  )
}

export default MicroAppContainer
