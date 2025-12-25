import { Result } from 'antd'
import NotFoundIcon from '@/assets/images/abnormal/404.svg?react'

const NotFound = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Result
        subTitle={
          <span className="text-base text-[--dip-text-color-65]">
            哎呀！页面不在了...
          </span>
        }
        // extra={
        //   <Button type="primary" onClick={() => navigate('/')}>
        //     Back
        //   </Button>
        // }
        icon={<NotFoundIcon />}
      />
    </div>
  )
}

export default NotFound
