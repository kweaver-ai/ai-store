import { Result } from 'antd'
import ServerErrorIcon from '@/assets/images/abnormal/505.svg?react'

const ServerError = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Result
        subTitle={
          <span className="text-base text-[--dip-text-color-65]">
            服务器出错了，请稍后再试...
          </span>
        }
        // extra={
        //   <Button type="primary" onClick={() => navigate('/')}>
        //     Back
        //   </Button>
        // }
        icon={<ServerErrorIcon />}
      />
    </div>
  )
}

export default ServerError
