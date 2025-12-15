import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMatches } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'

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

  // 只使用最后一个匹配的路由（当前路由）的布局配置
  // 如果当前路由没有设置 handle.layout，则默认都是 false
  const currentMatch = matches[matches.length - 1]
  const layoutConfig = (currentMatch?.handle as RouteHandle | undefined)?.layout

  // 默认值：如果当前路由没有设置，则默认都是 false
  const { hasSider = false, hasHeader = false } = layoutConfig || {}

  const headerHeight = 16 // h-[16px]

  return (
    <Layout className="min-h-screen">
      {hasHeader && <Header />}
      <Layout
        className="flex-row"
        style={{
          marginTop: hasHeader ? headerHeight : 0,
          minHeight: hasHeader ? `calc(100vh - ${headerHeight}px)` : '100vh',
        }}
      >
        {hasSider && (
          <Sidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
            topOffset={hasHeader ? headerHeight : 0}
          />
        )}
        <Layout
          className="transition-all duration-200"
          style={{
            marginLeft: hasSider ? (collapsed ? 80 : 240) : 0,
            width: hasSider ? `calc(100% - ${collapsed ? 80 : 240}px)` : '100%',
          }}
        >
          <Content className="bg-gray-50">{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Container
