import { PushpinOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { ApplicationInfo } from '@/apis'
import { usePreferenceStore } from '@/stores'
import { MyAppActionEnum } from './types'

/** 我的应用操作菜单项 */
export const getMyAppMenuItems = (
  app: ApplicationInfo,
  onMenuClick: (key: MyAppActionEnum) => void,
): MenuProps['items'] => {
  const { isPinned } = usePreferenceStore.getState()
  const pinned = isPinned(app.id)

  if (pinned) {
    return [
      {
        key: 'unfix',
        label: '取消固定',
        icon: <PushpinOutlined className="text-[var(--dip-warning-color)]" />,
        onClick: () => onMenuClick(MyAppActionEnum.Unfix),
      },
    ]
  }
  return [
    {
      key: 'fix',
      icon: <PushpinOutlined />,
      label: '固定',
      onClick: () => onMenuClick(MyAppActionEnum.Fix),
    },
  ]
}
