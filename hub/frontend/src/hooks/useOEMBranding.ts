import { useEffect, useMemo } from 'react'
import { useOEMConfigStore } from '@/stores/oemConfigStore'
import { themeColors } from '@/styles/themeColors'
import { hexToRgb } from '@/utils/colorUtils'

/**
 * 处理与 OEM 品牌相关的全局效果：
 * - 主题色（CSS 变量）
 * - favicon
 * 返回当前 primaryColor 供上层（如 App）配置 antd 主题。
 */
export const useOEMBranding = () => {
  const { getOEMBasicConfig } = useOEMConfigStore()
  const oemBasicConfig = getOEMBasicConfig()

  // 从 OEM 配置中获取主题色，如果没有则使用默认值
  const primaryColor = useMemo(() => {
    return oemBasicConfig?.theme || themeColors.primary
  }, [oemBasicConfig?.theme])

  // 动态设置 CSS 变量
  useEffect(() => {
    const root = document.documentElement
    // 1. 同步主色
    root.style.setProperty('--dip-primary-color', primaryColor)
    const rgb = hexToRgb(primaryColor)
    root.style.setProperty('--dip-primary-color-rgb', rgb)
    root.style.setProperty('--dip-primary-color-rgb-space', rgb.replace(/,/g, ' '))

    // 2. 同步状态色和文字色
    root.style.setProperty('--dip-success-color', themeColors.success)
    root.style.setProperty('--dip-warning-color', themeColors.warning)
    root.style.setProperty('--dip-error-color', themeColors.error)
    root.style.setProperty('--dip-info-color', themeColors.info)
    root.style.setProperty('--dip-text-color-85', themeColors.text)
    root.style.setProperty('--dip-link-color', themeColors.link)
  }, [primaryColor])

  // 根据 OEM 配置动态设置 favicon
  useEffect(() => {
    const favicon = oemBasicConfig?.['favicon.ico']
    if (!favicon) return

    // 处理后端返回的 favicon：可能是完整 dataURL，也可能是纯 base64
    const href = favicon.startsWith('data:') ? favicon : `data:image/x-icon;base64,${favicon}`

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = href
  }, [oemBasicConfig?.['favicon.ico']])

  return { primaryColor }
}
