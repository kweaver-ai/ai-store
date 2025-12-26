import { useRef, memo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLoginUrl } from '@/apis/login'

interface ContentProps {
  iframeHeight: number
}

function Content({ iframeHeight }: ContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [searchParams] = useSearchParams()

  // 获取重定向地址（登录成功后跳转）
  const asredirect = searchParams.get('asredirect') || undefined

  // 构建登录 URL
  const loginUrl = getLoginUrl(asredirect)

  // 开发环境下直接跳转到登录URL（登录回调会由后端处理并重定向到/login-success）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = loginUrl
    }
  }, [loginUrl])

  return (
    <iframe
      src={loginUrl}
      ref={iframeRef}
      className="w-[560px] border-none bg-white"
      style={{ height: `${iframeHeight}px` }}
      title="登录"
    />
  )
}

export default memo(Content)
