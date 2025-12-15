import { useEffect } from 'react'
import Template from '@anyshare/template'
import '@anyshare/template/style.css'
// import Header from './Header' // 如需使用 header，取消注释
import Content from './Content'
import Footer from './Footer'
// import About from './About' // 如需使用 about，取消注释

function OAuthLogin() {
  return (
    <Template
      // header={<Header />}
      content={<Content />}
      footer={<Footer />}
      //   about={<About />}
      // background={logo} // 如果有 logo 图片，取消注释并导入
    />
  )
}

export default OAuthLogin
