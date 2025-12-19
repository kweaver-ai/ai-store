import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { Row, Col, Tabs } from 'antd'
import AutoSizer from 'react-virtualized-auto-sizer'
import { computeColumnCount, gap } from './utils'
import AppCard from './AppCard'
import type { ApplicationInfo } from '@/apis/dip-hub'
import { ModeEnum, ALL_TAB_KEY } from './types'
import styles from './index.module.less'

interface AppListProps {
  mode: ModeEnum.MyApp | ModeEnum.AppStore
  /** 应用列表数据 */
  apps: ApplicationInfo[]
  /** 卡片菜单点击回调 */
  onMenuClick?: (action: string, app: ApplicationInfo) => void
}

/**
 * AppList 组件
 */
const AppList: React.FC<AppListProps> = ({ mode, apps, onMenuClick }) => {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB_KEY)

  // 根据后端返回的 category 动态分组
  const { groupedApps, appTypes } = useMemo(() => {
    const groups: Record<string, ApplicationInfo[]> = {
      [ALL_TAB_KEY]: apps,
    }
    const typeSet = new Set<string>()

    apps.forEach((app) => {
      const appType = app.category
      if (appType) {
        typeSet.add(appType)
        if (!groups[appType]) {
          groups[appType] = []
        }
        groups[appType].push(app)
      }
    })

    return {
      groupedApps: groups,
      appTypes: Array.from(typeSet),
    }
  }, [apps])

  // 当 appTypes 变化时，如果当前 activeTab 不在列表中，重置为全部
  useEffect(() => {
    if (activeTab !== ALL_TAB_KEY && !appTypes.includes(activeTab)) {
      setActiveTab(ALL_TAB_KEY)
    }
  }, [appTypes, activeTab])

  // 当前 Tab 下的应用列表
  const currentApps = useMemo(() => {
    return groupedApps[activeTab] || []
  }, [groupedApps, activeTab])

  // 动态生成 Tab 配置
  const tabItems = useMemo(() => {
    const items = [
      {
        key: ALL_TAB_KEY,
        label: `全部 (${apps.length})`,
      },
    ]

    appTypes.forEach((type) => {
      items.push({
        key: type,
        label: `${type} (${groupedApps[type]?.length || 0})`,
      })
    })

    return items
  }, [apps.length, appTypes, groupedApps])

  /** 渲染应用卡片 */
  const renderAppCard = useCallback(
    (app: ApplicationInfo, width: number) => {
      return (
        <Col key={app.key} style={{ width, minWidth: width }}>
          <AppCard
            app={app}
            mode={mode}
            onMenuClick={(key) => onMenuClick?.(key, app)}
          />
        </Col>
      )
    },
    [mode, onMenuClick]
  )

  return (
    <div className="mr-[-16px] flex flex-col h-0 flex-1">
      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={setActiveTab}
        className={`flex-shrink-0 ${styles.tabs}`}
        size="small"
      />
      <div className={styles.hideScrollbar}>
        <AutoSizer style={{ width: 'calc(100% - 8px)' }} disableHeight>
          {({ width }) => {
            const count = computeColumnCount(width)
            const calculatedCardWidth = width / count

            return (
              <Row gutter={[gap, gap]}>
                {currentApps.map((app) =>
                  renderAppCard(app, calculatedCardWidth)
                )}
              </Row>
            )
          }}
        </AutoSizer>
      </div>
    </div>
  )
}

export default memo(AppList)
