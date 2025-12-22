import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import NoAccessIcon from '@/assets/images/abnormal/noAccess.svg?react'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Result
        subTitle={
          <span className="text-base text-[--dip-text-color-65]">
            哎呀！你没有权限访问这个页面...
          </span>
        }
        // extra={
        //   <Button type="primary" onClick={() => navigate('/')}>
        //     Back
        //   </Button>
        // }
        icon={<NoAccessIcon />}
      />
    </div>
  )
}

export default NotFound
