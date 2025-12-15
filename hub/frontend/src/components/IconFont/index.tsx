import React, { type CSSProperties } from 'react'
import { createFromIconfontCN } from '@ant-design/icons'
import type { IconFontProps } from '@ant-design/icons/es/components/IconFont'
import classNames from 'classnames'
import '@/assets/fonts/iconfont.js'
import '@/assets/fonts/color-iconfont.js'

const IconBaseComponent = createFromIconfontCN({
  scriptUrl: [],
})

export interface IconFontType extends IconFontProps {
  className?: string
  style?: CSSProperties
}

const IconFont: React.FC<IconFontType> = (props) => {
  const { className, ...restProps } = props
  return (
    <IconBaseComponent
      className={classNames('text-sm leading-none inline-block', className)}
      {...restProps}
    />
  )
}

export default IconFont
