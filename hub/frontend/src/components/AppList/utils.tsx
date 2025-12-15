import { PushpinFilled, PushpinOutlined } from '@ant-design/icons'
import { AppFixedStatus, type AppInfo } from '@/apis/app-development'
import { AppStoreActionEnum, ModeEnum } from './types'
import IconFont from '../IconFont'

// 卡片的最小宽度
export const minCardWidth = 380
// 卡片的最大宽度
export const maxCardWidth = 500
// 卡片的间距
export const gap = 16
// 正常卡片的高度（包含间距）
export const rowHeight = 171 + gap
// loadingMore 行的高度
export const loadingMoreRowHeight = 30

/**
 * 计算列个数，卡片的宽度在 minCardWidth~maxCardWidth 之间
 * @param width 容器宽度
 * @param options 配置选项
 * @param options.minWidth 最小卡片宽度，默认 minCardWidth
 * @param options.maxWidth 最大卡片宽度，默认 maxCardWidth
 * @returns 列数
 */
export const computeColumnCount = (
  width: number,
  { minWidth, maxWidth }: { minWidth: number; maxWidth: number } = {
    minWidth: minCardWidth,
    maxWidth: maxCardWidth,
  }
): number => {
  let count = 1

  // 如果当前列数下的卡片宽度大于最大宽度，增加列数
  while (width / count > maxWidth) {
    count = count + 1
  }

  // 如果当前列数下的卡片宽度小于最小宽度，且列数大于1，减少列数
  if (width / count < minWidth && count > 1) {
    count = count - 1
  }

  // 如果调整后仍然大于最大宽度，递归调整最小和最大宽度范围
  if (width / count > maxWidth) {
    return computeColumnCount(width, {
      minWidth: minWidth - 10,
      maxWidth: maxWidth + 10,
    })
  }

  return count
}

/** 我的应用操作菜单项 */
export const getMyAppMenuItems = (app: AppInfo) => {
  if (app.fixedStatus === AppFixedStatus.Fixed) {
    return [
      {
        key: AppFixedStatus.Unfixed,
        label: '取消固定',
        icon: <PushpinOutlined />,
      },
    ]
  }
  return [
    {
      key: AppFixedStatus.Fixed,
      icon: <PushpinFilled />,
      label: '固定',
    },
  ]
}

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
      label: '卸载',
    },
  ]
}

export const getAppCardMenuItems = (mode: ModeEnum, app: AppInfo) => {
  if (mode === ModeEnum.AppStore) {
    return getAppStoreMenuItems()
  }
  return getMyAppMenuItems(app)
}
