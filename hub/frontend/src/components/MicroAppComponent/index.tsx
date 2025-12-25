import { useEffect, useRef, useState, useMemo } from 'react'
import { loadMicroApp, type MicroApp as QiankunMicroApp } from 'qiankun'
import { message, Spin } from 'antd'
import { useUserInfoStore, useMicroAppStore } from '@/stores'
import { httpConfig, getAccessToken } from '@/utils/http/token-config'
import {
  setMicroAppGlobalState,
  onMicroAppGlobalStateChange,
} from '@/utils/micro-app/globalState'
import { AppMenu } from '../MicroAppHeader/AppMenu'
import { UserInfo } from '../MicroAppHeader/UserInfo'
import { createRoot } from 'react-dom/client'
import type { Root as ReactRoot } from 'react-dom/client'
import type { ApplicationBasicInfo } from '@/apis/applications'
import type { MicroAppProps } from '@/utils/micro-app/types'

interface MicroAppComponentProps {
  /** 应用基础信息 */
  appBasicInfo: ApplicationBasicInfo
}

const MicroAppComponent = ({ appBasicInfo }: MicroAppComponentProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const microAppRef = useRef<QiankunMicroApp | null>(null)
  const [loading, setLoading] = useState(true)
  const { userInfo } = useUserInfoStore()
  const { currentMicroApp } = useMicroAppStore()
  // 用于存储渲染根实例
  const appMenuRootRef = useRef<Map<string, ReactRoot>>(new Map())
  const userInfoRootRef = useRef<Map<string, ReactRoot>>(new Map())

  // 构建标准化的微应用 props（所有微应用统一使用此结构）
  const microAppProps: MicroAppProps = useMemo<any>(
    () => ({
      // ========== 认证相关 ==========
      token: {
        // 使用 getter，每次访问时都从 Cookie 读取最新值，无需更新 props
        get accessToken() {
          return getAccessToken()
        },
        refreshToken:
          httpConfig.refreshToken || (async () => ({ accessToken: '' })),
        onTokenExpired: httpConfig.onTokenExpired,
      },

      // ========== 路由信息 ==========
      route: {
        basename:
          currentMicroApp?.routeBasename ||
          `/application/${appBasicInfo.micro_app.name}`,
      },

      // ========== 用户信息 ==========
      user: {
        id: userInfo?.id || '',
        // 使用 getter，每次访问时都从 store 读取最新值，无需更新 props
        get vision_name() {
          return useUserInfoStore.getState().userInfo?.vision_name || ''
        },
        get account() {
          return useUserInfoStore.getState().userInfo?.account || ''
        },
      },

      // ========== UI 组件渲染函数 ==========
      // 通过 render props 模式传递组件，微应用可以调用这些函数来渲染组件
      // 注意：这些函数在主应用的 React 上下文中执行，使用 ReactDOM.createRoot 渲染到微应用指定的容器
      // 这样可以确保组件在主应用的 React 上下文中渲染，可以访问主应用的 store 和 hooks
      renderAppMenu: (container: HTMLElement | string) => {
        // 支持传入元素或元素 ID
        const targetContainer =
          typeof container === 'string'
            ? document.getElementById(container)
            : container

        if (!targetContainer) {
          console.warn('容器元素不存在:', container)
          return
        }

        // 清理旧的渲染实例
        const containerKey =
          typeof container === 'string' ? container : container.id || 'app-menu'
        const oldRoot = appMenuRootRef.current.get(containerKey)
        if (oldRoot) {
          oldRoot.unmount()
        }

        // 在主应用的 React 上下文中渲染到微应用的容器
        const root = createRoot(targetContainer)
        root.render(<AppMenu />)
        appMenuRootRef.current.set(containerKey, root)
      },
      renderUserInfo: (container: HTMLElement | string) => {
        // 支持传入元素或元素 ID
        const targetContainer =
          typeof container === 'string'
            ? document.getElementById(container)
            : container

        if (!targetContainer) {
          console.warn('容器元素不存在:', container)
          return
        }

        // 清理旧的渲染实例
        const containerKey =
          typeof container === 'string'
            ? container
            : container.id || 'user-info'
        const oldRoot = userInfoRootRef.current.get(containerKey)
        if (oldRoot) {
          oldRoot.unmount()
        }

        // 在主应用的 React 上下文中渲染到微应用的容器
        const root = createRoot(targetContainer)
        root.render(<UserInfo />)
        userInfoRootRef.current.set(containerKey, root)
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
    [
      appBasicInfo.micro_app.name,
      appBasicInfo.micro_app.entry,
      appBasicInfo.key,
      userInfo?.id,
      currentMicroApp?.routeBasename,
    ]
  )

  // 只在应用配置变化时重新加载微应用
  useEffect(() => {
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
    const microAppEntry = appBasicInfo.micro_app.entry
    if (!microAppEntry) {
      console.error('微应用入口不存在:', appBasicInfo)
      setLoading(false)
      message.error('微应用配置错误：缺少入口地址')
      return
    }

    let entryUrl = microAppEntry
    const hashIndex = entryUrl.indexOf('#')
    if (hashIndex !== -1) {
      entryUrl = entryUrl.substring(0, hashIndex)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'entry 包含路由 hash，已自动移除:',
          microAppEntry,
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
    const microAppName = appBasicInfo.micro_app.name
    if (process.env.NODE_ENV === 'development') {
      console.log('加载微应用:', { name: microAppName, entry: entryUrl })
    }

    // 加载微应用
    microAppInstance = loadMicroApp({
      name: microAppName,
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
            console.log('微应用加载成功:', microAppName)
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLoading(false)
          console.error('微应用加载失败:', {
            name: microAppName,
            entry: entryUrl,
            error: err,
          })
          message.error(
            `"${microAppName}" 加载失败。请检查：1) 微应用是否正确导出生命周期函数；2) 微应用的 UMD 库名是否与配置的 name 一致；3) entry 路径是否正确`
          )
        }
      })

    // 清理函数：只在组件真正卸载或 app 配置变化时执行
    return () => {
      isMounted = false
      setLoading(true)

      // 清理所有渲染根实例
      appMenuRootRef.current.forEach((root) => {
        try {
          root.unmount()
        } catch (err) {
          console.warn('清理 AppMenu 渲染实例时出错:', err)
        }
      })
      appMenuRootRef.current.clear()

      userInfoRootRef.current.forEach((root) => {
        try {
          root.unmount()
        } catch (err) {
          console.warn('清理 UserInfo 渲染实例时出错:', err)
        }
      })
      userInfoRootRef.current.clear()

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
  }, [
    appBasicInfo.micro_app.name,
    appBasicInfo.micro_app.entry,
    appBasicInfo.key,
    microAppProps,
  ])

  return (
    <>
      <div
        ref={containerRef}
        className="h-full w-full"
        id={`micro-app-container-${appBasicInfo.micro_app.name}`}
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
