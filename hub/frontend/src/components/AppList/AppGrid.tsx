import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Row, Col, Spin, message } from 'antd'
import { throttle } from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'
import { computeColumnCount, gap } from './utils'
import AppCard from './AppCard'
import { getAppListApi } from '@/apis/app-development'
import type { AppInfo } from '@/apis/app-development'
import {
  ModeEnum,
  MyAppActionEnum,
  AppStoreActionEnum,
  type AppListStatus,
} from './types'

export { ModeEnum }

interface AppGridProps {
  mode: ModeEnum.MyApp | ModeEnum.AppStore
  // 搜索关键词
  searchValue?: string
  // 状态变化回调
  onStatusChange?: (status: AppListStatus) => void
}

const initialPagination = {
  page: 1,
  size: 120,
  hasMore: true, // 是否有更多数据
  total: 0, // 总数据量
}

const AppGrid = forwardRef<{ refresh: () => void }, AppGridProps>(
  ({ mode, searchValue, onStatusChange }, ref) => {
    const [apps, setApps] = useState<AppInfo[]>([])
    const [appLoading, setAppLoading] = useState<boolean>(false)
    const [loadingMore, setLoadingMore] = useState<boolean>(false)
    const [appError, setAppError] = useState<string | null>(null)
    const [pagination, setPagination] = useState(initialPagination)
    const listContainerRef = useRef<HTMLDivElement>(null)
    const isLoadingRef = useRef<boolean>(false) // 防止重复加载

    // 同步状态到父组件
    useEffect(() => {
      onStatusChange?.({
        loading: appLoading,
        error: appError,
        empty: !appLoading && !appError && apps.length === 0,
      })
    }, [appLoading, appError, apps.length === 0])

    /** 获取应用列表数据 */
    const fetchAppList = useCallback(
      async (
        currentPagination: typeof pagination,
        append: boolean,
        currentSearchValue?: string
      ) => {
        // 防止重复加载
        if (isLoadingRef.current) return

        try {
          isLoadingRef.current = true

          if (currentPagination.page === 1 && !append) {
            setAppLoading(true)
          } else {
            setLoadingMore(true)
          }

          // 根据模式使用不同的 API（目前两种模式使用相同的 API）
          const response = await getAppListApi({
            keyword: currentSearchValue ?? '',
            offset: currentPagination.page,
            limit: currentPagination.size,
          })

          if (append) {
            setApps((prev) => [...prev, ...response.entries])
          } else {
            setApps(response.entries)
          }

          // 计算分页信息：根据 total 和已加载的数据量判断是否还有更多数据
          const loadedCount =
            (currentPagination.page - 1) * currentPagination.size +
            response.entries.length
          const hasMoreData = loadedCount < response.total

          setPagination((prev) => ({
            ...prev,
            hasMore: hasMoreData,
            total: response.total,
          }))
          // 成功时清除错误状态
          setAppError(null)
        } catch (error: any) {
          // 忽略 AbortError（请求被取消）
          if (error?.name === 'AbortError') {
            return
          }
          if (error?.description) {
            message.error(error.description)
          }
          const errorMessage = '获取数据时发生错误'
          setAppError(errorMessage)
        } finally {
          setAppLoading(false)
          setLoadingMore(false)
          isLoadingRef.current = false
        }
      },
      []
    )

    // 监听 pagination.page 和 searchValue 的变化，触发数据加载
    useEffect(() => {
      // 防止重复调用
      if (isLoadingRef.current) return
      fetchAppList(pagination, pagination.page !== 1, searchValue)
    }, [pagination.page, searchValue])

    /** 重新加载数据：重置分页到第一页，触发 useEffect 重新加载 */
    const reload = useCallback(() => {
      setPagination((prev) => ({
        ...prev,
        ...initialPagination,
      }))
    }, [])

    // 使用 useImperativeHandle 暴露 refresh 方法
    useImperativeHandle(
      ref,
      () => ({
        refresh: () => {
          reload()
        },
      }),
      [reload]
    )

    /** 加载更多数据：更新 pagination.page，触发 useEffect 加载下一页 */
    const loadMoreData = () => {
      if (isLoadingRef.current || !pagination.hasMore) {
        return
      }
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }))
    }

    // 处理滚动事件，实现懒加载（使用节流优化性能）
    useEffect(() => {
      const container = listContainerRef.current
      if (!container) return

      // 使用节流优化滚动性能，200ms 执行一次
      const handleScroll = throttle(() => {
        if (isLoadingRef.current || !pagination.hasMore) {
          return
        }

        const { scrollTop, clientHeight, scrollHeight } = container

        // 当滚动到距离底部100px时触发加载
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          loadMoreData()
        }
      }, 200)

      // 同步window滚动到容器滚动（可选功能，提升用户体验）
      const handleWindowScroll = throttle(() => {
        if (!container) return

        // 计算 window 滚动比例，避免除零
        const windowScrollHeight =
          document.documentElement.scrollHeight - window.innerHeight
        if (windowScrollHeight <= 0) return

        const windowScrollRatio = window.scrollY / windowScrollHeight

        // 计算容器滚动目标位置，避免除零
        const containerScrollHeight =
          container.scrollHeight - container.clientHeight
        if (containerScrollHeight <= 0) return

        const containerScrollTarget = windowScrollRatio * containerScrollHeight

        // 防止循环触发
        if (Math.abs(container.scrollTop - containerScrollTarget) > 5) {
          container.scrollTop = containerScrollTarget
        }
      }, 100)

      container.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('scroll', handleWindowScroll, { passive: true })

      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('scroll', handleWindowScroll)
        // 取消节流函数的待执行调用
        handleScroll.cancel()
        handleWindowScroll.cancel()
      }
    }, [pagination.hasMore])

    /** 处理应用操作 */
    const handleAppAction = useCallback(
      async (action: string, app: AppInfo) => {
        try {
          switch (action) {
            case AppStoreActionEnum.Install:
              // TODO: 实现安装功能
              message.success('安装成功')
              // 重置分页到第一页，触发 useEffect 重新加载
              setPagination((prev) => ({
                ...prev,
                page: 1,
                hasMore: true,
                total: 0,
              }))
              break
            case AppStoreActionEnum.Uninstall:
              // TODO: 实现卸载功能
              message.success('卸载成功')
              // 重置分页到第一页，触发 useEffect 重新加载
              setPagination((prev) => ({
                ...prev,
                page: 1,
                hasMore: true,
                total: 0,
              }))
              break
            case MyAppActionEnum.Fix:
              // TODO: 实现固定功能
              message.success('已固定')
              break
            case MyAppActionEnum.Unfix:
              // TODO: 实现取消固定功能
              message.success('已取消固定')
              break
            default:
              break
          }
        } catch (error) {
          console.error('Failed to handle app action:', error)
          message.error('操作失败')
        }
      },
      []
    )

    /** 渲染应用卡片 */
    const renderAppCard = useCallback(
      (app: AppInfo, width: number) => {
        return (
          <Col key={app.appId} style={{ width, minWidth: width }}>
            <AppCard
              app={app}
              mode={mode}
              cardWidth={width}
              onMenuClick={(key) => {
                handleAppAction(key, app)
              }}
              onClick={(app) => {
                // 点击卡片可以跳转到应用详情
                console.log('Click app:', app)
              }}
            />
          </Col>
        )
      },
      [mode, handleAppAction]
    )

    return (
      <div
        ref={listContainerRef}
        className="flex flex-col flex-1 overflow-auto h-full"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <AutoSizer style={{ width: '100%', height: '100%' }}>
          {({ width }) => {
            // 计算卡片宽度
            const count = computeColumnCount(width)
            const calculatedCardWidth = (width - gap * (count - 1)) / count

            return (
              <>
                <Row gutter={[gap, gap]}>
                  {apps.map((app) => renderAppCard(app, calculatedCardWidth))}
                </Row>
                {loadingMore && (
                  <div className="flex justify-center items-center py-1">
                    <Spin size="small" />
                    <span className="ml-0.5 text-sm text-gray-500">
                      加载中...
                    </span>
                  </div>
                )}
              </>
            )
          }}
        </AutoSizer>
      </div>
    )
  }
)

export default memo(AppGrid)
