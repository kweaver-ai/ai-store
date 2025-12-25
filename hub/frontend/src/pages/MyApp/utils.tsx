import type { ApplicationInfo } from '@/apis/applications'
import { usePreferenceStore } from '@/stores'
import { PushpinOutlined } from '@ant-design/icons'

/** 我的应用操作菜单项 */
export const getMyAppMenuItems = (app: ApplicationInfo) => {
  const { isPinned } = usePreferenceStore.getState()
  const pinned = isPinned(app.key)

  if (pinned) {
    return [
      {
        key: 'unfix',
        label: '取消固定',
        icon: <PushpinOutlined className="text-[var(--dip-warning-color)]" />,
      },
    ]
  }
  return [
    {
      key: 'fix',
      icon: <PushpinOutlined />,
      label: '固定',
    },
  ]
}
