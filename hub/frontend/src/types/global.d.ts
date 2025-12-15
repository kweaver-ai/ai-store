declare module 'js-cookie'
declare module '@anyshare/template' {
  import { ReactNode } from 'react'
  interface TemplateProps {
    header?: ReactNode
    content?: ReactNode
    footer?: ReactNode
    about?: ReactNode
    background?: string
  }
  const Template: React.FC<TemplateProps>
  export default Template
}
