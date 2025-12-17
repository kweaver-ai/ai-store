import { useState, useRef, useCallback, useMemo } from 'react'
import { Dropdown, message } from 'antd'
import type { MenuProps } from 'antd'
import { getApplications, type Application } from '@/apis/dip-hub'

/**
 * 导航菜单图标按钮组件
 */
export const AppMenu = () => {
  const [appList, setAppList] = useState<Array<Application>>([])
  const fetchingRef = useRef(false) // 使用 ref 跟踪请求状态，避免状态更新延迟导致的重复请求

  // 点击时再请求应用列表
  const fetchAppList = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      // await getApplications({})
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
    const app = appList.find((item) => item.key === key)
    if (app && app.key) {
      // 以新标签页形式打开应用
      window.open(`/application/${app.key}`, '_blank')
    }
  }

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      Array.isArray(appList)
        ? appList.map((app) => ({
            key: app.key,
            label: (
              <div className="flex items-center gap-2">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-[4px] h-[4px]"
                />
                <span>{app.name}</span>
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
        className="flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-0 p-0 text-[--dip-text-color] transition-opacity duration-200 hover:text-[--dip-link-color] disabled:opacity-50 disabled:cursor-not-allowed"
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
