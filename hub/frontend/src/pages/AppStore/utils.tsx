import { AppStoreActionEnum } from './types'
import IconFont from '@/components/IconFont'

/** 应用商店操作菜单项 */
export const getAppStoreMenuItems = () => {
  return [
    {
      key: AppStoreActionEnum.Config,
      icon: <IconFont type="icon-dip-shezhi" />,
      label: '配置',
    },
    {
      key: AppStoreActionEnum.Run,
      icon: <IconFont type="icon-dip-run" />,
      label: '运行',
    },
    {
      key: AppStoreActionEnum.Auth,
      icon: <IconFont type="icon-dip-User" />,
      label: '授权管理',
    },
    { type: 'divider' },
    {
      key: AppStoreActionEnum.Uninstall,
      icon: <IconFont type="icon-dip-trash" />,
      danger: true,
      label: '卸载',
    },
  ]
}
