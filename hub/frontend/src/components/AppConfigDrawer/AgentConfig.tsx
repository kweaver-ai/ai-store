import { ShareAltOutlined } from '@ant-design/icons'
import { Alert, Spin } from 'antd'
import { memo, useEffect, useState } from 'react'
import { type AgentInfo, getApplicationsAgents } from '@/apis/applications'

interface AgentConfigProps {
  appId?: number
}

const AgentConfig = ({ appId }: AgentConfigProps) => {
  const [loading, setLoading] = useState(false)
  const [agents, setAgents] = useState<AgentInfo[]>([])

  useEffect(() => {
    if (appId) {
      loadAgents()
    } else {
      setAgents([])
    }
  }, [appId])

  const loadAgents = async () => {
    if (!appId) return
    setLoading(true)
    try {
      const data = await getApplicationsAgents(appId)
      setAgents(data.agents || [])
    } catch (error) {
      console.error('获取智能体配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="absolute inset-0 left-40 flex items-center justify-center">
        <Spin />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="text-sm font-medium text-[--dip-text-color]">智能体配置</div>

      {/* 提示信息框 */}
      <Alert
        title="以下是此应用包含的智能体。您可以点击下方链接查看或调整智能体的详细配置（如知识来源、模型参数等）。"
        type="info"
        showIcon
        className="border-[#BAE0FF] bg-[#E6F4FF]"
        styles={{
          root: {
            alignItems: 'flex-start',
          },
          icon: {
            paddingTop: '4px',
          },
        }}
      />

      {/* 智能体列表 */}
      <div className="flex flex-col gap-3">
        {agents.length === 0 ? (
          <div className="text-center text-[--dip-text-color-secondary] py-8">暂无智能体配置</div>
        ) : (
          agents.map((item) => {
            // 假设从接口获取的数据结构，如果没有则使用默认值
            const prompt = (item as any).prompt || ''
            const skills = (item as any).skills || []

            return (
              <div
                key={item.id}
                className="flex flex-col gap-y-2 rounded-lg border border-[#E3E8EF] bg-white p-3"
              >
                {/* 标题 */}
                <div className="text-xs font-medium text-[--dip-text-color]">
                  {item.name || `智能体 #${item.id}`}
                </div>

                {/* 描述 */}
                {item.description && (
                  <div className="text-xs text-[rgba(0,0,0,0.45)]">{item.description}</div>
                )}

                {/* 提示词 */}
                {prompt && (
                  <div className="flex flex-col gap-y-1">
                    <div className="text-xs text-[rgba(0,0,0,0.45)]">提示词</div>
                    <div className="rounded-lg bg-[#F9FAFC] p-3.5 text-xs text-[--dip-text-color] leading-relaxed">
                      {prompt}
                    </div>
                  </div>
                )}

                {/* 技能列表 */}
                {skills.length > 0 && (
                  <div className="flex flex-col gap-y-1">
                    <div className="text-xs text-[rgba(0,0,0,0.45)]">技能列表</div>
                    <div className="flex flex-col gap-y-1.5 pl-5">
                      {skills.map((skill: string) => (
                        <div key={`${item.id}-${skill}`} className="flex items-start gap-3.5">
                          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#D9D9D9] flex-shrink-0" />
                          <div className="text-xs text-[--dip-text-color] leading-relaxed">
                            {skill}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 链接 */}
                <a
                  href={`${window.location.origin}/studio/dataagent/agent-web-space/agent-web-myagents/config?agentId=${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-[var(--dip-primary-color)] hover:text-[var(--dip-primary-color)] hover:underline"
                >
                  <ShareAltOutlined />
                  前往ADP平台查看详细配置
                </a>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default memo(AgentConfig)
