import type { MenuProps } from 'antd'
import IconFont from '@/components/IconFont'
import { AppStoreActionEnum } from './types'

/** 应用商店操作菜单项 */
export const getAppStoreMenuItems = (
  onMenuClick: (key: AppStoreActionEnum) => void,
): MenuProps['items'] => {
  return [
    {
      key: AppStoreActionEnum.Config,
      icon: <IconFont type="icon-dip-shezhi" />,
      label: '配置',
      onClick: () => onMenuClick(AppStoreActionEnum.Config),
    },
    {
      key: AppStoreActionEnum.Run,
      icon: <IconFont type="icon-dip-run" />,
      label: '运行',
      onClick: () => onMenuClick(AppStoreActionEnum.Run),
    },
    // {
    //   key: AppStoreActionEnum.Auth,
    //   icon: <IconFont type="icon-dip-User" />,
    //   label: '授权管理',
    // },
    { type: 'divider' },
    {
      key: AppStoreActionEnum.Uninstall,
      icon: <IconFont type="icon-dip-trash" />,
      danger: true,
      label: '卸载',
      onClick: () => onMenuClick(AppStoreActionEnum.Uninstall),
    },
  ]
}
