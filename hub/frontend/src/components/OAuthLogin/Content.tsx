import { useRef, memo } from 'react'

function Content() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 构建登录 URL
  const getLoginUrl = () => {
    const state = new Date().getTime()
    // 根据实际 OAuth 服务地址调整
    const baseUrl =
      'https://192.168.181.18/interface/studioweb/login?lang=zh-cn&state=491Yo813uQ&x-forwarded-prefix=&integrated=false&product=adp&_t=1765178984017'

    return `${baseUrl}?state=${state}`
  }

  return (
    <iframe
      src={getLoginUrl()}
      ref={iframeRef}
      className="w-[560px] h-[460px] border-none bg-white"
      title="登录"
    />
  )
}

export default memo(Content)
