import { CloseOutlined } from '@ant-design/icons'
import type { PopoverProps } from 'antd'
import { Popover } from 'antd'
import type { ReactNode } from 'react'
import type { ProjectInfo } from '@/apis/projects'
import ProjectIcon from '@/assets/images/projectIcon.svg?react'
import { formatTimeMinute } from '@/utils/handle-function/FormatTime'

interface ProjectInfoPopoverProps extends Omit<PopoverProps, 'content'> {
  projectInfo: ProjectInfo | null
  children: ReactNode
  onClose: () => void
}

/**
 * 项目信息 Popover
 * 显示项目的详细信息，包括名称、简介、创建时间等
 */
export const ProjectInfoPopover = ({
  projectInfo,
  children,
  onClose,
  ...popoverProps
}: ProjectInfoPopoverProps) => {
  if (!projectInfo) {
    return <>{children}</>
  }

  const content = (
    <div className="flex flex-col items-center w-[400px] relative p-3">
      <button
        type="button"
        className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center hover:bg-[--dip-hover-bg-color-6] rounded cursor-pointer"
        onClick={onClose}
      >
        <CloseOutlined />
      </button>
      {/* 图标 */}
      <div className="w-14 h-14 mb-5 flex-shrink-0 rounded-full flex justify-center overflow-hidden">
        <ProjectIcon className="w-14 h-14" />
      </div>
      {/* 名称 */}
      <div
        className="mb-6 text-base font-medium text-[--dip-text-color] line-clamp-1"
        title={projectInfo.name}
      >
        {projectInfo.name}
      </div>
      {/* 项目简介 */}
      <div
        className="mb-12 leading-6 text-[--dip-text-color-65] line-clamp-2"
        title={projectInfo.description}
      >
        {projectInfo.description || '[暂无描述]'}
      </div>
      {/* 分隔线 */}
      <div className="h-px w-full bg-[--dip-line-color-10] mb-5" />
      {/* 创建时间 */}
      <div className="w-full mb-4 flex items-center justify-between">
        <span className="shrink-0">创建时间</span>
        <span className="truncate">
          {projectInfo.created_at
            ? formatTimeMinute(new Date(projectInfo.created_at).getTime())
            : '--'}
        </span>
      </div>

      {/* 创建者 */}
      <div className="w-full mb-4 flex items-center justify-between gap-x-2">
        <span className="shrink-0">创建者</span>
        <span className="truncate">{projectInfo.created_by || '--'}</span>
      </div>
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottom" arrow={false} {...popoverProps}>
      {children}
    </Popover>
  )
}

export default ProjectInfoPopover
