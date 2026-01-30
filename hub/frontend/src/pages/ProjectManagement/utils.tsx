import type { MenuProps } from 'antd'
import IconFont from '@/components/IconFont'
import { ObjectTypeEnum, ProjectActionEnum } from './types'

/** 项目管理操作菜单项 */
export const getProjectMenuItems = (
  onMenuClick: (key: ProjectActionEnum) => void,
): MenuProps['items'] => {
  return [
    {
      key: ProjectActionEnum.Edit,
      icon: <IconFont type="icon-dip-bianji" />,
      label: '编辑',
      onClick: () => onMenuClick(ProjectActionEnum.Edit),
    },
    { type: 'divider' },
    {
      key: ProjectActionEnum.Delete,
      icon: <IconFont type="icon-dip-trash" />,
      danger: true,
      label: '删除',
      onClick: () => onMenuClick(ProjectActionEnum.Delete),
    },
  ]
}

export const projectActionModalTitleMap = (objectType: ObjectTypeEnum): string => {
  return {
    [ObjectTypeEnum.Project]: '项目',
    [ObjectTypeEnum.Application]: '应用',
    [ObjectTypeEnum.Page]: '页面',
    [ObjectTypeEnum.Function]: '模块',
  }[objectType]
}
export const projectActionModalNamePlaceholderMap = (objectType: ObjectTypeEnum): string => {
  return {
    [ObjectTypeEnum.Project]: '请输入项目名称',
    [ObjectTypeEnum.Application]: '请输入应用名称',
    [ObjectTypeEnum.Page]: '例如：用户管理',
    [ObjectTypeEnum.Function]: '例如：列表查询功能',
  }[objectType]
}
export const projectActionModalDescPlaceholderMap = (objectType: ObjectTypeEnum): string => {
  return {
    [ObjectTypeEnum.Project]: '请输入项目描述',
    [ObjectTypeEnum.Application]: '请输入简要描述...',
    [ObjectTypeEnum.Page]: '请输入简要描述...',
    [ObjectTypeEnum.Function]: '请输入简要描述...',
  }[objectType]
}
