import { Layout } from 'antd'
import clsx from 'classnames'
import { useParams } from 'react-router-dom'
import type { SiderType } from '@/routes/types'
import ProjectSider from '../ProjectSider'
import BaseSider from './BaseSider'
import HomeSider from './HomeSider'
import styles from './index.module.less'

const { Sider: AntdSider } = Layout

interface SiderProps {
  /** 是否折叠 */
  collapsed: boolean
  /** 折叠状态改变回调 */
  onCollapse: (collapsed: boolean) => void
  /** 顶部偏移量 */
  topOffset?: number
  /** 侧边栏类型 */
  type?: SiderType
}

/**
 * 侧边栏主组件
 * 根据 type 选择渲染 BaseSider（store/studio）或 MicroAppSider（micro-app）
 */
const Sider = ({ collapsed, onCollapse, topOffset = 0, type = 'home' }: SiderProps) => {
  const params = useParams()
  const projectId = params.projectId || ''

  return (
    <AntdSider
      width={240}
      collapsedWidth={60}
      collapsible
      collapsed={collapsed}
      trigger={null}
      className={clsx(
        'bg-white backdrop-blur-[6px] shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]',
        styles.siderContainer,
        collapsed && styles.collapsed,
      )}
      style={{
        left: 0,
        height: `calc(100vh - ${topOffset}px)`,
        top: 0,
        bottom: 0,
      }}
    >
      {type === 'home' ? (
        <HomeSider collapsed={collapsed} onCollapse={onCollapse} />
      ) : type === 'project' ? (
        <ProjectSider collapsed={collapsed} onCollapse={onCollapse} projectId={projectId} />
      ) : (
        <BaseSider collapsed={collapsed} onCollapse={onCollapse} type={type} />
      )}
    </AntdSider>
  )
}

export default Sider
