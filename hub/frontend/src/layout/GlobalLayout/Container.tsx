import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useMatches, useParams } from 'react-router-dom'
import bg from '@/assets/images/gradient-container-bg.png'
import type { RouteHandle } from '@/routes/types'
import { WENSHU_APP_KEY } from '@/routes/types'
import { usePreferenceStore } from '@/stores'
import { useMicroAppStore } from '@/stores/microAppStore'
import Header from '../../components/Header'
import Sider from '../../components/Sider'

const { Content } = Layout

interface ContainerProps {
  children: ReactNode
}

const Container = ({ children }: ContainerProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const matches = useMatches()
  const params = useParams()
  const { currentMicroApp } = useMicroAppStore()
  const { wenshuAppInfo } = usePreferenceStore()

  // 当前是否处于微应用容器场景
  const isMicroApp = !!currentMicroApp
  // headless 微应用：需要任何壳层 Header / Sider
  const microAppHasHeader = isMicroApp && currentMicroApp?.micro_app?.headless

  // 只使用最后一个匹配的路由（当前路由）的布局配置
  // 主应用页面只依赖路由的静态布局配置
  const currentMatch = matches[matches.length - 1]
  const routeLayoutConfig = (currentMatch?.handle as RouteHandle | undefined)?.layout

  // 特殊处理：问数应用没有导航头，有侧边栏
  // 1. 优先通过当前微应用的 key 判断（兼容直接刷新 /application/:appId 的场景）
  // 2. 兼容通过 store 中缓存的 wenshuAppInfo.id 判断（兼容从首页/登录跳转的场景）
  const isWenshuByKey = currentMicroApp?.key === WENSHU_APP_KEY
  const isWenshuById = wenshuAppInfo?.id === Number(params?.appId)
  const isWenshuApp = isWenshuByKey || isWenshuById

  // 布局决策：
  // - headless 微应用：强制 { hasHeader: false, hasSider: false }
  // - 问数应用：强制 { hasHeader: false, hasSider: true }
  // - 其他情况（主应用页面或普通微应用）：使用路由静态配置
  const layoutConfig = microAppHasHeader
    ? { ...routeLayoutConfig, hasHeader: true }
    : isWenshuApp
      ? { ...routeLayoutConfig, hasSider: true }
      : routeLayoutConfig

  // 默认值
  const {
    hasSider = false,
    hasHeader = false,
    siderType = 'home',
    headerType = 'micro-app',
  } = layoutConfig || {}

  const headerHeight = 52

  return (
    <Layout className="overflow-hidden">
      {/* Header 决策 */}
      {hasHeader && <Header headerType={headerType} />}

      <Layout style={{ backgroundImage: `url(${bg})` }} className="bg-no-repeat bg-cover">
        {hasSider && (
          <Sider
            collapsed={collapsed}
            onCollapse={setCollapsed}
            topOffset={hasHeader ? headerHeight : 0}
            type={siderType}
          />
        )}
        <Layout
          className="transition-all duration-200 overflow-auto bg-transparent"
          style={{
            height: hasHeader ? `calc(100vh - ${headerHeight}px)` : '100vh',
          }}
        >
          <Content className="relative bg-transparent min-w-[1040px] m-0">{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Container
