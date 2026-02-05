import { Avatar } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'

interface AppIconProps {
  /** 应用图标（Base64编码字符串） */
  icon?: string
  /** 应用名称（用于显示首字母） */
  name?: string
  /** 图标大小 */
  size?: number
  /** Avatar 形状 */
  shape?: 'circle' | 'square'
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 是否由边框 */
  hasBorder?: boolean
}

/**
 * 应用图标组件
 * 支持显示 base64 图片，加载失败时自动 fallback 到 Avatar 显示首字母
 */
const AppIcon = ({
  icon,
  name,
  size = 24,
  shape = 'circle',
  className,
  style,
  hasBorder = false,
}: AppIconProps) => {
  const [imageError, setImageError] = useState(false)

  // 如果没有图标或图片加载失败，使用 Avatar 显示首字母
  if (!icon || imageError) {
    return (
      <Avatar
        size={size}
        shape={shape}
        className={clsx('shrink-0 border border-[var(--dip-border-color)]', className)}
        style={style}
      >
        {name?.charAt(0) || ''}
      </Avatar>
    )
  }

  // 判断 icon 是否已经是完整的 data URL
  const imageSrc = icon.startsWith('data:') ? icon : `data:image/png;base64,${icon}`

  return hasBorder ? (
    <Avatar
      size={size}
      shape={shape}
      className={clsx('shrink-0 border border-[var(--dip-border-color)]', className)}
      style={style}
      draggable={false}
      src={
        <img
          src={imageSrc}
          alt=""
          onError={() => setImageError(true)}
          className="!object-scale-down"
          style={{ width: size-16, height: size-16 }}
        />
      }
    />
  ) : (
    <img
      src={imageSrc}
      alt=""
      onError={() => setImageError(true)}
      className={clsx('!object-scale-down shrink-0', className)}
      style={{ width: size, height: size }}
    />
  )
}

export default AppIcon
