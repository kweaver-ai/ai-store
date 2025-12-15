import intl from 'react-intl-universal'
import { httpConfig } from './token-config'
import { message } from 'antd'

export async function handleError({
  error,
  url,
  reject,
  isOffline,
}: {
  error: any
  url: string
  reject: (params: any) => void
  isOffline?: boolean
}) {
  const handleReject = (code: number | string) => {
    reject(code)
    return
  }

  if (/\/v1\/(ping|profile|avatars|user\/get)/.test(url)) {
    handleReject(0)
    return
  }

  if (isOffline) {
    message.warning(intl.get('error.networkError'))
    handleReject(0)
    return
  }

  if (error.code === 'ECONNABORTED' && error.message === 'TIMEOUT') {
    message.warning(intl.get('error.timeoutError'))
    handleReject(0)
    return
  }

  if (error.message === 'CANCEL') {
    handleReject('CANCEL')
    return
  }

  if (!error.response) {
    message.warning(intl.get('error.serverError'))
    handleReject(0)
    return
  }

  const { status, data } = error.response

  if (status === 401 && httpConfig.onTokenExpired) {
    httpConfig.onTokenExpired(data?.code)
    handleReject(status)
    return
  }

  if (status >= 500) {
    if (data?.description) {
      reject(data)
      return
    }
    const messageText = getServerErrorMsg(status)
    message.warning(messageText)
    handleReject(status)
    return
  }

  reject(data)
}

export function getServerErrorMsg(status: number): string {
  return intl.get(`error.${status}`) || intl.get('error.serverError')
}
