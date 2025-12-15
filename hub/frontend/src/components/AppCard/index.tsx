import { useState } from 'react'
import { Card, Button, message } from 'antd'
import { PushpinOutlined, PushpinFilled } from '@ant-design/icons'
import { usePreferenceStore } from '../../stores'
import type { MicroAppConfig } from '../../utils/micro-app/type'

interface AppCardProps {
  app: MicroAppConfig
}

const AppCard = ({ app }: AppCardProps) => {
  const { isPinned, togglePin } = usePreferenceStore()
  const [loading, setLoading] = useState(false)
  const pinned = isPinned(app.name)

  const handleClick = () => {
    window.open(`/app/${app.name}`, '_blank')
  }

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发卡片的 onClick
    setLoading(true)
    try {
      await togglePin(app.name)
      message.success(pinned ? '已取消钉住' : '已钉住到侧边栏')
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      message.error('操作失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      hoverable
      className="h-full relative"
      onClick={handleClick}
      cover={
        <div className="h-8 bg-gray-100 flex items-center justify-center overflow-hidden">
          {/* <img
            src={app.icon}
            alt={app.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 图片加载失败时显示占位符
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/200x120?text=No+Image'
            }}
          /> */}
        </div>
      }
      actions={[
        <Button
          key="pin"
          type="text"
          icon={pinned ? <PushpinFilled /> : <PushpinOutlined />}
          loading={loading}
          onClick={handlePinClick}
          className={pinned ? 'text-blue-500' : 'text-gray-500'}
          title={pinned ? '取消钉住' : '钉住到侧边栏'}
        />,
      ]}
    >
      <Card.Meta title={app.name} />
    </Card>
  )
}

export default AppCard
