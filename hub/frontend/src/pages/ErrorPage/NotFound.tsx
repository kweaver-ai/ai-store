import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Result
        status="404"
        title="哎呀！页面不在了..."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Back
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
