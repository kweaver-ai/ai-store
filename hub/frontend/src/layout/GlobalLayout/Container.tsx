import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMatches } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from '../../components/Sidebar'
import MicroAppHeader from '../../components/MicroAppHeader'
import { useMicroAppStore } from '@/stores/microAppStore'

const { Content } = Layout

interface LayoutConfig {
  hasSider?: boolean
  hasHeader?: boolean
}

interface RouteHandle {
  layout?: LayoutConfig
}

interface ContainerProps {
  children: ReactNode
}

const Container = ({ children }: ContainerProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const matches = useMatches()
  const { currentMicroApp } = useMicroAppStore()

  // 当前是否处于微应用容器场景
  const isMicroApp = !!currentMicroApp
  // headless 微应用：不需要任何壳层 Header / Sider
  const isHeadlessMicroApp = isMicroApp && currentMicroApp?.config?.headless

  // 只使用最后一个匹配的路由（当前路由）的布局配置
  // 主应用页面只依赖路由的静态布局配置
  const currentMatch = matches[matches.length - 1]
  const routeLayoutConfig = (currentMatch?.handle as RouteHandle | undefined)
    ?.layout

  // 布局决策：
  // - headless 微应用：强制 { hasHeader: false, hasSider: false }
  // - 其他情况（主应用页面或普通微应用）：使用路由静态配置
  const layoutConfig: LayoutConfig | undefined = isHeadlessMicroApp
    ? { hasHeader: false, hasSider: false }
    : routeLayoutConfig

  // 默认值：如果当前路由没有设置，则默认都是 false
  const { hasSider = false, hasHeader = false } = layoutConfig || {}

  const headerHeight = 52

  return (
    <Layout className="overflow-hidden">
      {/* 微应用壳 Header：当前项目仅微应用容器路由会开启 hasHeader */}
      {hasHeader && <MicroAppHeader />}
      <Layout>
        {hasSider && (
          <Sidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
            topOffset={hasHeader ? headerHeight : 0}
          />
        )}
        <Layout
          className="transition-all duration-200 overflow-auto"
          style={{
            height: hasHeader ? `calc(100vh - ${headerHeight}px)` : '100vh',
          }}
        >
          <Content className="relative bg-white min-w-[1040px] m-0">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Container
