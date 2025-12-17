import { useState, useEffect } from 'react'
import { Spin, Result, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { getApplicationsConfig } from '@/apis/dip-hub'
import MicroAppComponent from '../../components/MicroAppComponent'
import { useMicroAppStore } from '../../stores/microAppStore'
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'

const MicroAppContainer = () => {
  const { appKey } = useParams<{ appKey: string }>()
  const navigate = useNavigate()
  const [app, setApp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentMicroApp, clearCurrentMicroApp } = useMicroAppStore()

  useEffect(() => {
    const fetchApp = async () => {
      if (!appKey) {
        setError('应用 Key 不存在')
        console.error('Failed to load app:', '应用 Key 不存在')
        setLoading(false)
        return
      }

      try {
        // const appData = await getApplicationsConfig(appKey, 'config')
        // if (!appData) {
        //   setError('应用不存在')
        // } else {
        //   setApp(appData)
        //   // 设置微应用信息到 store
        //   setCurrentMicroApp({
        //     ...appData,
        //     routeBasename: `/application/${appKey}`,
        //   })
        // }
        setApp({
          id: 1,
          key: 'micro-app-two',
          name: 'micro-app-two',
          entry: 'http://localhost:1101',
          routeBasename: `/application/micro-app-two`,
        })
        setCurrentMicroApp({
          id: 1,
          key: 'micro-app-two',
          name: 'micro-app-two',
          icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIxOXB4IiB2aWV3Qm94PSIwIDAgMjAgMTkiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+5b2i54q2PC90aXRsZT4KICAgIDxnIGlkPSLmj5Dpl64iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLnlLvmnb8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zNTkwLjAwMDAwMCwgLTIzNjUuMDAwMDAwKSIgZmlsbD0iIzEyNkVFMyIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPGcgaWQ9Iue8lue7hC0xMuWkh+S7vS04IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMjU5LjAwMDAwMCwgMTMyNS4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSLnvJbnu4QtMjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ3LjAwMDAwMCwgNzMyLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIGlkPSJmYXNvbmctNeWkh+S7vS0yIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODQuMDAwMDAwLCAzMDguMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik00LjczMjg0NDkzLDguOTA0MTYyMjMgTDEwLjYwOTI3OTYsOC45MDQxNjIyMyBDMTAuOTg0MzcxMiw4LjkwNDE2MjIzIDExLjIzNDQzMjIsOS4xNTkxMDAzNiAxMS4yMzQ0MzIyLDkuNTQxNTA3NTUgQzExLjIzNDQzMjIsOS45MjM5MTQ3NCAxMC45ODQzNzEyLDEwLjE3ODg1MjkgMTAuNjA5Mjc5NiwxMC4xNzg4NTI5IEw0LjczMjg0NDkzLDEwLjE3ODg1MjkgQzQuNzMyODQ0OTMsMTAuMzA2MzIxOSA0LjYwNzgxNDQsMTAuNDMzNzkxIDQuNjA3ODE0NDEsMTAuNjg4NzI5MSBMMS4yMzE5OTAyNCwxNy44MjY5OTY3IEwxOC43MzYyNjM3LDkuNTQxNTA3NTUgTDEuMjMxOTkwMjQsMS4yNTYwMTg0MiBMNC42MDc4MTQ0MSw4LjM5NDI4NTk3IEM0LjczMjg0NDk1LDguNjQ5MjI0MSA0LjczMjg0NDk1LDguNzc2NjkzMTYgNC43MzI4NDQ5Myw4LjkwNDE2MjIzIFogTTE5LjIzNjM4NTgsMTAuNjg4NzI5MSBMMS43MzIxMTIzMywxOC45NzQyMTgyIEMxLjEwNjk1OTcxLDE5LjIyOTE1NjQgMC4zNTY3NzY1NTcsMTguOTc0MjE4MiAwLjEwNjcxNTUxMywxOC4zMzY4NzI5IEMtMC4wMTgzMTUwMTgzLDE3Ljk1NDQ2NTcgLTAuMDE4MzE1MDE4MywxNy41NzIwNTg2IDAuMTA2NzE1NTEzLDE3LjE4OTY1MTQgTDMuNDgyNTM5NjksMTAuMDUxMzgzOCBDMy42MDc1NzAyMiw5LjY2ODk3NjYyIDMuNjA3NTcwMjIsOS4yODY1Njk0MyAzLjQ4MjUzOTY5LDguOTA0MTYyMjMgTDAuMTA2NzE1NTEzLDEuNzY1ODk0NjYgQy0wLjE0MzM0NTU0OSwxLjEyODU0OTM1IDAuMTA2NzE1NTEzLDAuMzYzNzM0OTY1IDAuNzMxODY4MTMyLDAuMTA4Nzk2ODQ0IEMwLjk4MTkyOTE3NiwtMC4wMTg2NzIyMjYxIDEuNDgyMDUxMjgsLTAuMDE4NjcyMjI2MSAxLjczMjExMjMzLDAuMTA4Nzk2ODQ0IEwxOS4yMzYzODU4LDguMzk0Mjg1OTcgQzE5Ljg2MTUzODUsOC42NDkyMjQxIDIwLjExMTU5OTUsOS40MTQwMzg0OCAxOS44NjE1Mzg1LDEwLjA1MTM4MzggQzE5LjczNjUwNzksMTAuMzA2MzIxOSAxOS40ODY0NDY5LDEwLjU2MTI2MDEgMTkuMjM2Mzg1OCwxMC42ODg3MjkxIFoiIGlkPSLlvaLnirYiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==',
          routeBasename: `/application/micro-app-two`,
        })
      } catch (err) {
        setError('获取应用配置失败')
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
  }, [appKey])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      )
    }
    if (error || !app) {
      return (
        <div className="flex justify-center items-center h-full">
          <Result
            status="404"
            title="Application Error"
            subTitle="Application not found"
            extra={
              <Button type="primary" onClick={() => navigate('/')}>
                返回首页
              </Button>
            }
          />
        </div>
      )
    }
    return <MicroAppComponent app={app} />
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      {renderContent()}
    </div>
  )
}

export default MicroAppContainer
