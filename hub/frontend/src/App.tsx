import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Suspense } from 'react'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import zhTW from 'antd/locale/zh_TW'
import { useLanguageStore } from './stores/languageStore'

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
      getPopupContainer={() => document.getElementById('root') || document.body}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Spin spinning />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
