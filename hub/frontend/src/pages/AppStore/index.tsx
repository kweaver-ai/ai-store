import { useState, useRef, useEffect } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import GradientContainer from '@/components/GradientContainer'
import AppList, { ModeEnum } from '@/components/AppList/AppGrid'

const MyApp = () => {
  // 输入框展示值
  const [searchInput, setSearchInput] = useState<string>('')
  // 传递给列表的搜索值（带延迟）
  const [searchValue, setSearchValue] = useState<string>('')
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const clearDebounce = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
    }
  }

  const triggerSearch = (value: string, immediate = false) => {
    if (immediate) {
      clearDebounce()
      setSearchValue(value)
      return
    }

    clearDebounce()
    debounceTimer.current = setTimeout(() => {
      setSearchValue(value)
    }, 300)
  }

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    triggerSearch(value)
  }

  // 处理搜索输入框按下回车
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const value = (e.target as HTMLInputElement).value
    triggerSearch(value, true)
  }

  // 组件卸载时清理定时器
  useEffect(() => clearDebounce, [])

  return (
    <GradientContainer className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的应用</h1>
        <Input
          placeholder="搜索应用"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={handleSearchEnter}
          prefix={<SearchOutlined className="dip-opacity-75" />}
          allowClear
        />
      </div>
      <AppList mode={ModeEnum.MyApp} searchValue={searchValue} />
    </GradientContainer>
  )
}

export default MyApp
