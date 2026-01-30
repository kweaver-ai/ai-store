import { memo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ProjectInfo } from '@/apis/projects'
import Empty from '@/components/Empty'
import ActionModal from '@/components/ProjectActionModal/ActionModal'
import ProjectList from '@/components/ProjectList'
import { useProjectStore } from '@/stores'
import { ObjectTypeEnum, ProjectActionEnum } from '../types'
import { getProjectMenuItems } from '../utils'

/** 项目 */
const Project = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { selectedNode } = useProjectStore()
  const [addProjectModalVisible, setAddProjectModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProjectInfo>()

  /** 处理卡片菜单操作 */
  const handleProjectCardClick = (_project: ProjectInfo) => {
    // TODO: 处理项目卡片点击
  }

  /** 处理新建项目成功 */
  const handleAddProjectSuccess = () => {
    // TODO: 刷新数据
  }

  /** 处理项目操作 */
  const handleProjectMenuClick = (key: ProjectActionEnum, _project?: ProjectInfo) => {
    switch (key) {
      case ProjectActionEnum.Edit:
        setSelectedItem(_project)
        setAddProjectModalVisible(true)
        break
      case ProjectActionEnum.Delete:
        // TODO: 实现删除功能
        setSelectedItem(_project)
        break
    }
  }

  // 示例项目数据，实际应该从 API 获取
  const projects: ProjectInfo[] = []

  /** 根据选中的节点渲染内容 */
  const renderNodeContent = () => {
    if (!selectedNode || selectedNode.projectId !== projectId) {
      return (
        <div className="flex items-center justify-center h-full text-[--dip-text-color-65]">
          请从左侧选择要查看的内容
        </div>
      )
    }

    switch (selectedNode.nodeType) {
      case 'dictionary':
        return (
          <div className="h-full">
            <div className="mb-4">
              <h2 className="text-lg font-medium">数据字典</h2>
              <p className="text-sm text-[--dip-text-color-65] mt-1">管理项目术语和定义</p>
            </div>
            {/* TODO: 实现数据字典内容 */}
            <Empty desc="数据字典功能开发中" />
          </div>
        )
      case 'application':
        return (
          <div className="h-full">
            <div className="mb-4">
              <h2 className="text-lg font-medium">{selectedNode.nodeName}</h2>
              <p className="text-sm text-[--dip-text-color-65] mt-1">应用节点详情</p>
            </div>
            {/* TODO: 实现应用节点内容 */}
            <Empty desc="应用节点详情功能开发中" />
          </div>
        )
      case 'page':
        return (
          <div className="h-full">
            <div className="mb-4">
              <h2 className="text-lg font-medium">{selectedNode.nodeName}</h2>
              <p className="text-sm text-[--dip-text-color-65] mt-1">页面节点详情</p>
            </div>
            {/* TODO: 实现页面节点内容 */}
            <Empty desc="页面节点详情功能开发中" />
          </div>
        )
      case 'function':
        return (
          <div className="h-full">
            <div className="mb-4">
              <h2 className="text-lg font-medium">{selectedNode.nodeName}</h2>
              <p className="text-sm text-[--dip-text-color-65] mt-1">功能节点详情</p>
            </div>
            {/* TODO: 实现功能节点内容 */}
            <Empty desc="功能节点详情功能开发中" />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full text-[--dip-text-color-65]">
            未知节点类型
          </div>
        )
    }
  }

  /** 渲染内容区域 */
  const renderContent = () => {
    // 如果有选中的节点，显示节点内容；否则显示项目列表
    if (selectedNode && selectedNode.projectId === projectId) {
      return renderNodeContent()
    }

    // 默认显示项目列表（如果有项目数据）
    if (projects.length > 0) {
      return (
        <ProjectList
          projects={projects}
          onCardClick={handleProjectCardClick}
          menuItems={(project) =>
            getProjectMenuItems((key) => handleProjectMenuClick(key, project))
          }
        />
      )
    }

    // 没有选中节点且没有项目数据时，显示提示
    return (
      <div className="flex items-center justify-center h-full text-[--dip-text-color-65]">
        请从左侧选择要查看的内容
      </div>
    )
  }

  return (
    <div className="h-full p-6 flex flex-col relative bg-[--dip-white]">
      {renderContent()}
      <ActionModal
        open={addProjectModalVisible}
        onCancel={() => setAddProjectModalVisible(false)}
        onSuccess={handleAddProjectSuccess}
        operationType={selectedItem ? 'edit' : 'add'}
        objectType={ObjectTypeEnum.Project}
        objectInfo={selectedItem}
      />
    </div>
  )
}

export default memo(Project)
