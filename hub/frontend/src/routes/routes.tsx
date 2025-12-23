import { lazy } from 'react'
import applicationsUrl from '@/assets/images/sider/applications.svg'
import appStoreUrl from '@/assets/images/sider/appStore.svg'
import {
  SYSTEM_FIXED_APP_ADMIN_USER_ID,
  SYSTEM_FIXED_NORMAL_USER_ID,
} from '@/apis/types'
import type { RouteConfig } from './types'

const MyApp = lazy(() => import('../pages/MyApp'))
const AppStore = lazy(() => import('../pages/AppStore'))

/**
 * 路由配置数组
 * 这里定义了所有路由信息，包括路径、组件、菜单显示等
 */
export const routeConfigs: RouteConfig[] = [
  {
    path: 'my-app',
    key: 'my-app',
    label: '应用',
    iconUrl: applicationsUrl,
    requiredRoleIds: [SYSTEM_FIXED_NORMAL_USER_ID],
    element: <MyApp />,
    showInSidebar: true,
    handle: {
      layout: {
        hasSider: true,
        hasHeader: false,
      },
    },
  },
  {
    path: 'app-store',
    key: 'app-store',
    label: '应用商店',
    iconUrl: appStoreUrl,
    requiredRoleIds: [SYSTEM_FIXED_APP_ADMIN_USER_ID],
    element: <AppStore />,
    showInSidebar: true,
    handle: {
      layout: {
        hasSider: true,
        hasHeader: false,
      },
    },
  },
]
