import { useEffect } from 'react'
import { useOEMConfigStore } from '../stores/oemConfigStore'
import { initQiankun } from '../utils/qiankun'
import { useLanguage } from './useLanguage'

/**
 * 应用初始化 Hook
 * 封装应用启动时的初始化逻辑：
 * - 设置页面标题
 * - 初始化语言配置
 * - 初始化 OEM 配置
 * - 初始化 qiankun
 */
export const useAppInit = () => {
  const { initLanguage } = useLanguage()
  const { initialize: initOEMConfig } = useOEMConfigStore()

  useEffect(() => {
    document.title = 'DIP'
    initLanguage()
    initOEMConfig()
    initQiankun()
    // 这些初始化操作只需要在组件挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
