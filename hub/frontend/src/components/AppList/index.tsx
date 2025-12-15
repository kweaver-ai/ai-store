import { useState, useRef, memo, useCallback } from 'react'
import { Button, Spin } from 'antd'
import AppGrid from './AppGrid'
import { ModeEnum, type AppListStatus } from './types'
import Empty from '../Empty'
import loadFailed from '@/assets/images/load-failed.png'

interface AppListProps {
  mode: ModeEnum.MyApp | ModeEnum.AppStore
  searchValue?: string
  renderEmpty?: () => React.ReactNode
}

/**
 * AppList 容器组件
 * 统一处理 loading、error、empty 状态的
 * 使用此组件可以避免在每个使用 AppList 的地方重复处理状态逻辑
 */
const AppList: React.FC<AppListProps> = ({
  mode,
  searchValue,
  renderEmpty,
}) => {
  const [appListStatus, setAppListStatus] = useState<AppListStatus>({
    loading: false,
    error: null,
    empty: false,
  })
  const appListRef = useRef<{ refresh: () => void } | null>(null)

  const handleStatusChange = useCallback((status: AppListStatus) => {
    setAppListStatus(status)
  }, [])

  return (
    <>
      {/* 统一处理 loading、error、empty 状态 */}
      {(appListStatus.loading ||
        appListStatus.error ||
        appListStatus.empty) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {appListStatus.loading ? (
            <Spin size="large" />
          ) : appListStatus.error ? (
            <Empty iconSrc={loadFailed} desc={'加载失败'}>
              <Button
                type="primary"
                onClick={() => {
                  appListRef.current?.refresh()
                }}
              >
                重试
              </Button>
            </Empty>
          ) : appListStatus.empty ? (
            renderEmpty ? (
              renderEmpty()
            ) : searchValue ? (
              <Empty desc={`未找到"${searchValue}"相关应用`} />
            ) : (
              <Empty desc="暂无应用" />
            )
          ) : null}
        </div>
      )}
      {/* AppList 始终渲染，但通过状态控制是否显示内容 */}
      <div
        className={
          appListStatus.loading || appListStatus.error || appListStatus.empty
            ? 'opacity-0 pointer-events-none h-full'
            : 'h-full'
        }
      >
        <AppGrid
          ref={appListRef}
          mode={mode}
          searchValue={searchValue}
          onStatusChange={handleStatusChange}
        />
      </div>
    </>
  )
}

export default memo(AppList)
