import { Col, type MenuProps, Row } from 'antd'
import { memo, useCallback } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ProjectInfo } from '@/apis'
import ScrollBarContainer from '../ScrollBarContainer'
import ProjectCard from './ProjectCard'
import { computeColumnCount, gap } from './utils'

interface ProjectListProps {
  /** 项目列表数据 */
  projects: ProjectInfo[]
  /** 卡片菜单点击回调 */
  onCardClick?: (project: ProjectInfo) => void
  /** 卡片菜单点击回调 */
  menuItems?: (project: ProjectInfo) => MenuProps['items']
}

/**
 * ProjectList 组件
 */
const ProjectList: React.FC<ProjectListProps> = ({ projects, onCardClick, menuItems }) => {
  /** 渲染应用卡片 */
  const renderCard = useCallback(
    (project: ProjectInfo, width: number) => {
      return (
        <Col key={project.id} style={{ width, minWidth: width }}>
          <ProjectCard
            project={project}
            width={width}
            menuItems={menuItems?.(project)}
            onCardClick={(project) => onCardClick?.(project)}
          />
        </Col>
      )
    },
    [onCardClick],
  )

  return (
    <div className="mr-[-24px] flex flex-col h-0 flex-1">
      <ScrollBarContainer className="pr-2">
        <AutoSizer style={{ width: 'calc(100% - 8px)' }} disableHeight>
          {({ width }) => {
            const count = computeColumnCount(width)
            const calculatedCardWidth = width / count

            return (
              <Row gutter={[gap, gap]}>
                {projects.map((project) => renderCard(project, calculatedCardWidth))}
              </Row>
            )
          }}
        </AutoSizer>
      </ScrollBarContainer>
    </div>
  )
}

export default memo(ProjectList)
