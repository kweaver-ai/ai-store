import { ConfigProvider, Spin } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import zhTW from 'antd/locale/zh_TW'
import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useAppInit } from './hooks/useAppInit'
import { useOEMBranding } from './hooks/useOEMBranding'
import { router } from './routes'
import { useLanguageStore } from './stores/languageStore'
import './App.css'
import './styles/resetAntd.less'
import GradientContainer from './components/GradientContainer'

function getUILocale(lang: string): typeof enUS | typeof zhTW | typeof zhCN {
  return lang === 'en-US' ? enUS : lang === 'zh-TW' ? zhTW : zhCN
}

const App = () => {
  useAppInit()
  const { language } = useLanguageStore()
  // OEM 相关的主题色 & favicon 由 useOEMBranding 统一处理
  const { primaryColor } = useOEMBranding()

  return (
    <ConfigProvider
      prefixCls="dip"
      iconPrefixCls="dip-icon"
      locale={getUILocale(language)}
      theme={{
        token: {
          colorPrimary: primaryColor,
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          colorInfo: '#126ee3',
          colorText: 'rgba(0,0,0,0.85)',
        },
      }}
      getPopupContainer={() => document.getElementById('root') || document.body}
    >
      <Suspense
        fallback={
          <GradientContainer className="w-full h-full flex items-center justify-center">
            <Spin size="large" />
          </GradientContainer>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
