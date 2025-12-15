import { useState, useRef, useCallback, useMemo } from 'react'
import { Dropdown, message } from 'antd'
import type { MenuProps } from 'antd'
import { getAppListApi, type AppInfo } from '@/apis/app-development'

/**
 * 导航菜单图标按钮组件
 */
export const AppMenu = () => {
  const [appList, setAppList] = useState<Array<AppInfo>>([])
  const fetchingRef = useRef(false) // 使用 ref 跟踪请求状态，避免状态更新延迟导致的重复请求

  // 点击时再请求应用列表
  const fetchAppList = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      // await getAppListApi({})
      // // setAppList(list)
      // setAppList(mockAppList)
    } catch (error: any) {
      // 开发环境使用 mock 数据
      console.warn('Failed to fetch app list, using mock data:', error)
      if (error?.description) {
        message.error(error.description)
      }
    } finally {
      fetchingRef.current = false
    }
  }, [])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const app = appList.find((item) => item.appId === key)
    if (app && app.appId) {
      // 以新标签页形式打开应用
      window.open(`app/${app.appId}`, '_blank')
    }
  }

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      Array.isArray(appList)
        ? appList.map((app) => ({
            key: app.appId,
            label: (
              <div className="flex items-center gap-2">
                <img
                  src={app.appIcon}
                  alt={app.appName}
                  className="w-[4px] h-[4px]"
                />
                <span>{app.appName}</span>
              </div>
            ),
          }))
        : [],
    [appList]
  )

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <button
        className="flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-0 p-0 text-black transition-opacity duration-200 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={fetchingRef.current}
        onClick={fetchAppList}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 第一行 */}
          <circle cx="4" cy="4" r="2" fill="currentColor" />
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="20" cy="4" r="2" fill="currentColor" />
          {/* 第二行 */}
          <circle cx="4" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="20" cy="12" r="2" fill="currentColor" />
          {/* 第三行 */}
          <circle cx="4" cy="20" r="2" fill="currentColor" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          <circle cx="20" cy="20" r="2" fill="currentColor" />
        </svg>
      </button>
    </Dropdown>
  )
}
