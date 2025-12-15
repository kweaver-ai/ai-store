import { useState } from 'react'
import GradientContainer from '@/components/GradientContainer'
import AppListContainer from '@/components/AppList'
import { ModeEnum } from '@/components/AppList/AppGrid'
import SearchInput from '@/components/SearchInput'

const MyApp = () => {
  const [searchValue, setSearchValue] = useState<string>('')

  return (
    <GradientContainer className="h-full p-6 flex flex-col">
      <div className="flex justify-between mb-6 flex-shrink-0 z-20">
        <div className="flex flex-col gap-y-3">
          <span className="text-[32px] font-bold">探索企业级 AI 应用</span>
          <span className="text-base">
            查找具备专业能力的应用，帮你解决业务上的复杂问题
          </span>
        </div>
        <SearchInput onSearch={setSearchValue} placeholder="搜索应用" />
      </div>
      <AppListContainer mode={ModeEnum.MyApp} searchValue={searchValue} />
    </GradientContainer>
  )
}

export default MyApp
