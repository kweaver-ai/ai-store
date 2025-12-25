import { useState, useEffect, useCallback, useRef } from 'react'
import { getApplications, type ApplicationInfo } from '@/apis/applications'

interface UseApplicationsServiceOptions {
  /** 是否自动加载，默认为 true */
  autoLoad?: boolean
}

/**
 * 应用列表数据服务 Hook
 * 专门用于处理应用列表的请求服务
 * @param options 配置选项
 * @returns {ApplicationInfo[]} apps 应用列表
 * @returns {boolean} loading 加载状态
 * @returns {string | null} error 错误信息
 * @returns {string} searchValue 搜索关键词
 * @returns {Function} handleSearch 处理搜索
 * @returns {Function} handleRefresh 刷新数据
 * @returns {Function} fetchAppList 手动触发获取应用列表（用于手动加载模式）
 */
export const useApplicationsService = (
  options: UseApplicationsServiceOptions = {}
) => {
  const { autoLoad = true } = options
  const [apps, setApps] = useState<ApplicationInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const currentRequestRef = useRef<{ abort: () => void } | null>(null) // 保存当前请求，用于取消

  /** 获取应用列表数据 */
  const fetchAppList = useCallback(async (keyword?: string) => {
    // 如果存在上一个请求，取消它
    if (currentRequestRef.current) {
      currentRequestRef.current.abort()
      currentRequestRef.current = null
    }

    let isCancelled = false
    try {
      setLoading(true)
      setError(null)

      // 发起新请求并保存引用
      const requestPromise = getApplications()
      currentRequestRef.current = requestPromise as any

      const apps = await requestPromise

      // 请求成功后清除引用
      currentRequestRef.current = null

      const filtered = keyword
        ? apps.filter((a) =>
            a.name?.toLowerCase().includes(keyword.toLowerCase())
          )
        : apps
      setApps(filtered)
    } catch (err: any) {
      // 请求被取消时，清除引用但不更新状态
      if (err?.name === 'AbortError' || err?.message === 'CANCEL') {
        currentRequestRef.current = null
        isCancelled = true
        return
      }
      currentRequestRef.current = null
      if (err?.description) {
        setError(err.description)
      } else {
        setError('获取数据时发生错误')
      }
    } finally {
      // 只有请求未被取消时才更新 loading 状态
      if (!isCancelled) {
        setLoading(false)
      }
    }
  }, [])

  /** 刷新数据 */
  const handleRefresh = useCallback(() => {
    fetchAppList(searchValue || undefined)
  }, [fetchAppList, searchValue])

  /** 处理搜索 */
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  // 自动加载模式：初始化和搜索时加载数据
  useEffect(() => {
    if (autoLoad) {
      fetchAppList(searchValue || undefined)
    }
  }, [autoLoad, fetchAppList, searchValue])

  // 组件卸载时取消正在进行的请求
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort()
        currentRequestRef.current = null
      }
    }
  }, [])

  return {
    apps,
    loading,
    error,
    searchValue,
    handleSearch,
    handleRefresh,
    fetchAppList, // 手动触发获取（用于手动加载模式）
  }
}
