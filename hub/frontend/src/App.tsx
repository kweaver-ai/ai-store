import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Suspense } from 'react'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import zhTW from 'antd/locale/zh_TW'
import { useLanguageStore } from './stores/languageStore'
import './App.css'

function getUILocale(lang: string): typeof enUS | typeof zhTW | typeof zhCN {
  return lang === 'en-US' ? enUS : lang === 'zh-TW' ? zhTW : zhCN
}

const App = () => {
  const { language } = useLanguageStore()
  return (
    <ConfigProvider
      prefixCls="dip"
      iconPrefixCls="dip-icon"
      locale={getUILocale(language)}
      theme={{
        token: {
          colorPrimary: '#126ee3',
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
          <div className="w-full h-full flex items-center justify-center">
            <Spin size="large" />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
