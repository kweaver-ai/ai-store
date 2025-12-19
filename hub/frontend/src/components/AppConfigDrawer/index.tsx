import { Drawer, type DrawerProps } from 'antd'
import { useState, useEffect } from 'react'
import clsx from 'classnames'
import { ConfigMenuType } from './types'
import type { ApplicationBasicInfo } from '@/apis/dip-hub'
import BasicConfig from './BasicConfig'
import OntologyConfig from './OntologyConfig'
import AgentConfig from './AgentConfig'
import { menuItems } from './utils'
import ScrollBarContainer from '../ScrollBarContainer'

export interface AppConfigDrawerProps
  extends Pick<DrawerProps, 'open' | 'onClose'> {
  /** 已有的应用基础信息 */
  appData?: ApplicationBasicInfo | null
}

export const AppConfigDrawer = ({
  appData,
  open,
  onClose,
}: AppConfigDrawerProps) => {
  const [selectedMenu, setSelectedMenu] = useState<ConfigMenuType>(
    ConfigMenuType.BASIC
  )

  // 当抽屉打开时，重置选中菜单
  useEffect(() => {
    if (open) {
      setSelectedMenu(ConfigMenuType.BASIC)
    }
  }, [open])

  const handleMenuClick = (key: ConfigMenuType) => {
    setSelectedMenu(key)
  }

  return (
    <Drawer
      title={
        <div className="flex items-center gap-1 text-base font-medium text-[--dip-text-color]">
          <span>应用配置</span>
          {appData?.name && (
            <>
              <span className="text-[--dip-text-color-45] font-normal">/</span>
              <span className="text-[--dip-text-color-45]">{appData.name}</span>
            </>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      closable={{ placement: 'end' }}
      maskClosable
      styles={{
        wrapper: { width: '60%', minWidth: 640 },
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧菜单栏 */}
          <div className="w-40 pl-2 pr-1.5 py-3 bg-[#F9FAFC]">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <div
                  key={item.key}
                  className={clsx(
                    'h-10 px-3 flex items-center text-sm cursor-pointer rounded transition-colors relative text-[--dip-text-color] hover:bg-[--dip-hover-bg-color]',
                    selectedMenu === item.key &&
                      'bg-[rgba(var(--dip-primary-color-rgb),0.05)] hover:bg-[rgba(var(--dip-primary-color-rgb),0.05)]'
                  )}
                  onClick={() => handleMenuClick(item.key)}
                >
                  <span
                    className={clsx(
                      'absolute left-[-2px] top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-sm',
                      'bg-[linear-gradient(180deg,#3FA9F5_0%,#126EE3_100%)]',
                      selectedMenu === item.key ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex-1 truncate font-normal text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧配置区域 */}
          <ScrollBarContainer className="flex-1 p-4">
            {selectedMenu === ConfigMenuType.BASIC && (
              <BasicConfig key={`basic-${appData?.key}`} appId={appData?.key} />
            )}
            {selectedMenu === ConfigMenuType.ONTOLOGY && (
              <OntologyConfig
                key={`ontology-${appData?.key}`}
                appId={appData?.key}
              />
            )}
            {selectedMenu === ConfigMenuType.AGENT && (
              <AgentConfig key={`agent-${appData?.key}`} appId={appData?.key} />
            )}
          </ScrollBarContainer>
        </div>
      </div>
    </Drawer>
  )
}

export default AppConfigDrawer
