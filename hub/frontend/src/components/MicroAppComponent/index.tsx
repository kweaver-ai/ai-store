import { useEffect, useRef, useState, useMemo } from 'react'
import { loadMicroApp, type MicroApp as QiankunMicroApp } from 'qiankun'
import { message, Spin } from 'antd'
import { useAuthStore, useMicroAppStore } from '../../stores'
import { useLanguageStore } from '../../stores/languageStore'
import { httpConfig, getAccessToken } from '../../utils/http/token-config'
import {
  setMicroAppGlobalState,
  onMicroAppGlobalStateChange,
} from '../../utils/micro-app/globalState'

interface MicroAppComponentProps {
  // TODO: 类型待定
  app: any
}

const MicroAppComponent = ({ app }: MicroAppComponentProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const microAppRef = useRef<QiankunMicroApp | null>(null)
  const [loading, setLoading] = useState(true)
  const { userInfo } = useAuthStore()
  const { language } = useLanguageStore()
  const { currentMicroApp } = useMicroAppStore()

  // 构建标准化的微应用 props（所有微应用统一使用此结构）
  const microAppProps = useMemo<any>(
    () => ({
      // ========== 认证相关 ==========
      token: {
        accessToken: getAccessToken(),
        refreshToken:
          httpConfig.refreshToken || (async () => ({ accessToken: '' })),
      },

      // ========== 路由信息 ==========
      route: {
        basename: currentMicroApp?.routeBasename || `/application/${app.name}`,
      },

      // ========== 用户信息 ==========
      user: {
        id: userInfo?.id || '',
        name: userInfo?.name || userInfo?.username || '',
        loginName: userInfo?.username || '',
        role: userInfo?.role,
      },

      // ========== 语言 ==========
      language,

      // ========== Copilot ==========
      onCopilotClick: () => {
        console.log('Copilot 点击按钮')
      },

      // ========== 全局状态管理 ==========
      setMicroAppState: (state: Record<string, any>) => {
        // 微应用调用时，只允许更新 allowedFields 中的字段
        return setMicroAppGlobalState(state)
      },
      onMicroAppStateChange: (
        callback: (state: any, prev: any) => void,
        fireImmediately?: boolean
      ) => {
        return onMicroAppGlobalStateChange(callback, fireImmediately)
      },
    }),
    [app.name, app.entry, userInfo, language, currentMicroApp?.routeBasename]
  )

  // 只在应用配置变化时重新加载微应用
  useEffect(() => {
    console.log('app', app)
    let isMounted = true
    let microAppInstance: QiankunMicroApp | null = null

    // 加载微应用
    if (!containerRef.current) {
      return
    }

    // 如果已经存在微应用实例，先卸载
    if (microAppRef.current) {
      // 同步卸载，避免竞态条件
      microAppRef.current
        .unmount()
        .then(() => {
          microAppRef.current = null
        })
        .catch((err) => {
          console.warn('卸载旧微应用实例时出错:', err)
          microAppRef.current = null
        })
    }

    // 处理 entry 路径：移除路由 hash（qiankun 的 entry 不能包含 #）
    let entryUrl = app.entry
    const hashIndex = entryUrl.indexOf('#')
    if (hashIndex !== -1) {
      entryUrl = entryUrl.substring(0, hashIndex)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'entry 包含路由 hash，已自动移除:',
          app.entry,
          '->',
          entryUrl
        )
      }
    }

    // 确保 container 存在
    if (!containerRef.current) {
      console.error('Container element not found')
      setLoading(false)
      return
    }

    // 开发环境：调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('加载微应用:', { name: app.name, entry: entryUrl })
    }

    // 加载微应用
    microAppInstance = loadMicroApp({
      name: app.name,
      entry: entryUrl,
      container: containerRef.current,
      props: { ...microAppProps, container: containerRef.current },
    })

    microAppRef.current = microAppInstance

    // 监听微应用加载状态
    microAppInstance.mountPromise
      .then(() => {
        if (isMounted) {
          setLoading(false)
          if (process.env.NODE_ENV === 'development') {
            console.log('微应用加载成功:', app.name)
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoading(false)
          console.error('微应用加载失败:', {
            name: app.name,
            entry: entryUrl,
            error: err,
          })
          message.error(
            `微应用 "${app.name}" 加载失败。请检查：1) 微应用是否正确导出生命周期函数；2) 微应用的 UMD 库名是否与配置的 name 一致；3) entry 路径是否正确`
          )
        }
      })

    // 清理函数：只在组件真正卸载或 app 配置变化时执行
    return () => {
      isMounted = false
      setLoading(true)

      if (microAppInstance) {
        // 异步卸载微应用，避免阻塞
        microAppInstance
          .unmount()
          .then(() => {
            // 只有当前实例才清空 ref
            if (microAppRef.current === microAppInstance) {
              microAppRef.current = null
            }
          })
          .catch((err) => {
            console.warn('微应用卸载时出错:', err)
            if (microAppRef.current === microAppInstance) {
              microAppRef.current = null
            }
          })
      }
    }
    // 只依赖应用配置和 props 的核心字段
  }, [app.name, app.entry, microAppProps])

  return (
    <>
      <div
        ref={containerRef}
        className="h-full w-full"
        id={`micro-app-container-${app.name}`}
      />
      {loading && (
        <Spin
          size="large"
          className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white rounded-md z-10"
        />
      )}
    </>
  )
}

export default MicroAppComponent
