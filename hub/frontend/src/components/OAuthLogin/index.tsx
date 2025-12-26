import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { getIframeSizeApi } from '@/apis/config'
import { useOEMConfigStore } from '@/stores/oemConfigStore'
import { useLanguageStore } from '@/stores/languageStore'
import styles from './index.module.less'
import backgroundImage from '@/assets/images/logoBackground.png'
import Header from './Header'
import Content from './Content'
import Footer from './Footer'
import About from './About'

function OAuthLogin() {
  const { language } = useLanguageStore()
  const { getOEMConfig } = useOEMConfigStore()
  const oemConfig = getOEMConfig(language)
  const [iframeHeight, setIframeHeight] = useState<number>(410) // 默认高度

  // 获取 iframe 高度
  useEffect(() => {
    let cancelled = false

    async function fetchIframeHeight() {
      try {
        const height = await getIframeSizeApi()
        if (!cancelled) {
          setIframeHeight(height)
        }
      } catch (err) {
        if (!cancelled) {
          // 如果获取失败，使用默认值
          setIframeHeight(410)
        }
      }
    }

    fetchIframeHeight()

    return () => {
      cancelled = true
    }
  }, [])

  // 从 OEM 配置中获取背景图片（base64 值）
  // 如果 API 返回的是纯 base64 字符串，需要添加 data URL 前缀
  const getBackgroundImageUrl = () => {
    const base64Image = oemConfig?.['background.png']
    if (!base64Image) {
      return backgroundImage
    }
    // 如果已经是 data URL 格式，直接使用
    if (base64Image.startsWith('data:image/')) {
      return base64Image
    }
    // 否则添加 base64 前缀
    return `data:image/png;base64,${base64Image}`
  }
  const backgroundImageUrl = getBackgroundImageUrl()

  // 计算登录框高度，如果 iframe 高度大于 435，则调整容器高度
  const loginHeight =
    iframeHeight > 435 ? `${560 + iframeHeight - 435}px` : '560px'

  return (
    <div className={classNames(styles.container)}>
      <div
        className={styles['background-container']}
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      <div className={styles.wrapper} style={{ height: loginHeight }}>
        <div className={styles.oem} style={{ height: loginHeight }}>
          <div
            className={styles['oem-img']}
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              height: loginHeight,
              backgroundSize: `440px ${loginHeight}`,
            }}
          />
        </div>
        <div className={styles.index} style={{ height: loginHeight }}>
          <div className={styles['wrap-header-bar']}>
            <Header />
          </div>
          <div className={styles['wrap-login']}>
            <Content iframeHeight={iframeHeight} />
          </div>
          <div className={styles['wrap-footer']}>
            <Footer />
            <div className={styles.split} />
            {/* <About /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OAuthLogin
