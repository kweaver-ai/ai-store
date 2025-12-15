import { Steps as AntSteps } from 'antd'

interface StepsProps {
  current: number
}

const Steps = ({ current }: StepsProps) => {
  const items = [
    {
      title: '填写应用信息',
      description: '设置应用基本信息',
    },
    {
      title: '上传应用安装包',
      description: '上传ZIP格式的应用包',
    },
    {
      title: '完成创建',
      description: '应用创建成功',
    },
  ]

  return (
    <div className="mb-2">
      <AntSteps
        current={current - 1}
        items={items}
        className="[&_.ant-steps-item-title]:text-base [&_.ant-steps-item-title]:leading-6 [&_.ant-steps-item-description]:text-sm [&_.ant-steps-item-description]:leading-[22px]"
      />
    </div>
  )
}

export default Steps
