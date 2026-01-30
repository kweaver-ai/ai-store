import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LogoIcon from '@/assets/images/brand/logo.svg?react'
import { Breadcrumb } from '@/components/Header/components/Breadcrumb'
import type { HeaderType } from '@/routes/types'
import { getRouteByPath } from '@/routes/utils'
import { useLanguageStore, useOEMConfigStore } from '@/stores'
import type { BreadcrumbItem } from '@/utils/micro-app/globalState'
import { UserInfo } from '../components/UserInfo'

/**
 * 获取 BaseHeaderType 对应的名称
 */
const getSectionName = (type: HeaderType): string => {
  return type === 'store' ? 'AI Store' : 'DIP Studio'
}

// /**
//  * 根据路由路径和配置判断 BaseHeaderType
//  */
// const getHeaderTypeFromRoute = (
//   pathname: string,
//   routeConfig: ReturnType<typeof getRouteByPath>,
// ): HeaderType => {
//   // 优先从路由配置的 siderType 判断
//   const siderType = routeConfig?.handle?.layout?.siderType
//   if (siderType === 'store' || siderType === 'studio') {
//     return siderType
//   }

//   // 如果路由配置中没有 siderType，通过路径判断
//   // location.pathname 已经是相对于 basename 的路径，不包含 BASE_PATH
//   const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname
//   if (normalizedPath.startsWith('store/')) {
//     return 'store'
//   }
//   if (normalizedPath.startsWith('studio/')) {
//     return 'studio'
//   }

//   // 默认返回 store
//   return 'store'
// }

/**
 * 商店/工作室版块通用的导航头
 * 通过路由路径和配置自动判断分类，无需传递 type prop
 */
const BaseHeader = ({ headerType }: { headerType: HeaderType }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { getOEMResourceConfig } = useOEMConfigStore()
  const { language } = useLanguageStore()
  const oemResourceConfig = getOEMResourceConfig(language)

  // 面包屑导航跳转
  const handleBreadcrumbNavigate = useCallback(
    (item: BreadcrumbItem) => {
      if (!item.path) return
      navigate(item.path)
    },
    [navigate],
  )

  // 获取当前路由配置
  const currentRoute = useMemo(() => getRouteByPath(location.pathname), [location.pathname])

  // 构建面包屑数据：BaseHeaderType名称 / 当前路由名称
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const result: BreadcrumbItem[] = []

    // BaseHeaderType 名称（只显示，不可点击）
    const sectionName = getSectionName(headerType)
    result.push({
      key: `section-${headerType}`,
      name: sectionName,
      disabled: true,
    })

    // 当前路由名称（如果存在）
    if (currentRoute?.label) {
      result.push({
        key: currentRoute.key || `route-${currentRoute.path}`,
        name: currentRoute.label,
        path: currentRoute.path ? `/${currentRoute.path}` : undefined,
      })
    }

    return result
  }, [headerType, currentRoute])

  const getLogoUrl = () => {
    const base64Image = oemResourceConfig?.['logo.png']
    if (!base64Image) {
      return null
    }
    // 如果已经是 data URL 格式，直接使用
    if (base64Image.startsWith('data:image/')) {
      return base64Image
    }
    // 否则添加 base64 前缀
    return `data:image/png;base64,${base64Image}`
  }
  const logoUrl = getLogoUrl()

  return (
    <>
      {/* 左侧：Logo 和面包屑 */}
      <div className="flex items-center gap-x-10">
        {logoUrl ? (
          <img src={logoUrl} alt="logo" className="h-6 w-auto" />
        ) : (
          <LogoIcon className="h-6 w-auto" />
        )}
        <Breadcrumb
          type={headerType}
          items={breadcrumbItems}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>

      {/* 右侧：用户信息 */}
      <div className="flex items-center gap-x-4 h-full">
        <UserInfo />
      </div>
    </>
  )
}

export default BaseHeader
