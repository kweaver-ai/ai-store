import { useEffect } from 'react'
import OAuthLogin from '@/components/OAuthLogin'

function Login() {
  useEffect(() => {
    document.title = 'DIP'
  }, [])
  return <OAuthLogin />
}

export default Login
