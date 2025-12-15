import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { initQiankun } from '../../utils/qiankun'
import Container from './Container'

const GlobalLayout = () => {
  const { initLanguage } = useLanguage()

  useEffect(() => {
    document.title = 'DIP'
    initLanguage()
    initQiankun()
  }, [])

  return (
    <Container>
      <Outlet />
    </Container>
  )
}

export default GlobalLayout
