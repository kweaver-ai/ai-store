import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useOEMConfigStore } from '../../stores/oemConfigStore'
import { initQiankun } from '../../utils/qiankun'
import Container from './Container'

const GlobalLayout = () => {
  const { initLanguage } = useLanguage()
  const { initialize: initOEMConfig } = useOEMConfigStore()

  useEffect(() => {
    document.title = 'DIP'
    initLanguage()
    initOEMConfig()
    initQiankun()
  }, [])

  return (
    <Container>
      <Outlet />
    </Container>
  )
}

export default GlobalLayout
