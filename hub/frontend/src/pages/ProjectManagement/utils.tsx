import type { MenuProps } from 'antd'
import type { ObjectType } from '@/apis/projects'
import IconFont from '@/components/IconFont'
import { ProjectActionEnum } from './types'

/** 项目管理操作菜单项 */
export const getProjectMenuItems = (
  onMenuClick: (key: ProjectActionEnum) => void,
): MenuProps['items'] => {
  return [
    {
      key: ProjectActionEnum.Edit,
      icon: <IconFont type="icon-dip-bianji" />,
      label: '编辑',
      onClick: (e: any) => {
        e.domEvent.stopPropagation()
        onMenuClick(ProjectActionEnum.Edit)
      },
    },
    { type: 'divider' },
    {
      key: ProjectActionEnum.Delete,
      icon: <IconFont type="icon-dip-trash" />,
      danger: true,
      label: '删除',
      onClick: (e: any) => {
        e.domEvent.stopPropagation()
        onMenuClick(ProjectActionEnum.Delete)
      },
    },
  ]
}

/** ObjectType 中文名称映射 */
export const objectTypeNameMap = (objectType: ObjectType): string => {
  return {
    project: '项目',
    application: '应用',
    page: '页面',
    function: '模块',
  }[objectType]
}

/** ObjectType 名称输入框占位符映射 */
export const objectNamePlaceholderMap = (objectType: ObjectType): string => {
  return {
    project: '请输入项目名称',
    application: '请输入应用名称',
    page: '例如：用户管理',
    function: '例如：列表查询模块',
  }[objectType]
}

/** ObjectType 描述输入框占位符映射 */
export const objectDescPlaceholderMap = (objectType: ObjectType): string => {
  return {
    project: '请输入项目描述',
    application: '请输入简要描述...',
    page: '请输入简要描述...',
    function: '请输入简要描述...',
  }[objectType]
}

/** TODO: 测试项目列表 */
export const testProjects = [
  {
    id: '1',
    name: '项目1',
    description:
      '项目1描述项目1描述项目1描述项目1描述项目1描述项目1描述项目1描述项目1描述项目1描述项目1描述项目1描述',
    updated_at: new Date().toISOString(),
    updated_by: '1',
  },
  {
    id: '2',
    name: '项目2',
    description:
      '项目2描述项目2描述项目2描述项目2描述项目2描述项目2描述项目2描述项目2描述项目2描述项目2描述项目2描述',
    updated_at: new Date().toISOString(),
    updated_by: '2',
  },
  {
    id: '3',
    name: '项目3',
    description: '',
    updated_at: new Date().toISOString(),
    updated_by: '3',
  },
  {
    id: '4',
    name: '项目4',
    description: '',
    updated_at: new Date().toISOString(),
    updated_by: '4',
  },
]

export const testNodes = [
  {
    id: 'app_1',
    project_id: '1',
    type: 'application',
    parent_id: null,
    name: '应用1',
    description: '应用1描述',
    creator: '1',
    created_at: new Date().toISOString(),
    editor: '1',
    edited_at: new Date().toISOString(),
    node_code: '1234567890',
  },
  {
    id: 'page_1',
    project_id: '1',
    type: 'page',
    parent_id: 'app_1',
    name: '页面1',
    description: '页面1描述',
    creator: '1',
    created_at: new Date().toISOString(),
    editor: '1',
    edited_at: new Date().toISOString(),
    node_code: '1234567890',
  },
  {
    id: 'func_1',
    project_id: '1',
    type: 'function',
    parent_id: 'page_1',
    name: '模块1',
    description: '模块1描述',
    creator: '1',
    created_at: new Date().toISOString(),
    editor: '1',
    edited_at: new Date().toISOString(),
    node_code: '1234567890',
  },
]
