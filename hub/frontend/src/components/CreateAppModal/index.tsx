import { useState } from 'react'
import { Modal, Button, Tag } from 'antd'
import { CloudUploadOutlined, CodeOutlined } from '@ant-design/icons'
import UploadAppModal from '../UploadAppModal'

interface CreateAppModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess?: () => void
}

const CreateAppModal = ({ visible, onCancel, onSuccess }: CreateAppModalProps) => {
  const [uploadModalVisible, setUploadModalVisible] = useState(false)

  const handleLocalUpload = () => {
    setUploadModalVisible(true)
    onCancel()
  }

  return (
    <>
      <Modal
        title="选择应用开发模式"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={640}
        className="[&_.ant-modal-header]:pb-4"
      >
        <div className="py-1">
          <div className="flex gap-0.5">
            {/* 从本地上传选项 */}
            <div
              className="flex-1 border border-gray-200 rounded-lg p-1.5 cursor-pointer hover:border-blue-500 transition-colors"
              onClick={handleLocalUpload}
            >
              <div className="flex flex-col items-center text-center">
                {/* 图标 */}
                <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center mb-0.5">
                  <CloudUploadOutlined className="text-3xl text-blue-500" />
                </div>

                {/* 标题 */}
                <h3 className="text-base font-bold text-gray-900 mb-0.5">
                  从本地上传
                </h3>

                {/* 描述 */}
                <p className="text-sm text-gray-500 mb-0.5 min-h-[48px]">
                  将本地开发、编译、打包后的应用安装包上传到应用中
                </p>

                {/* 特性列表 */}
                <div className="text-sm text-gray-500 text-left w-full space-y-1">
                  <div>✓ 支持完整的本地开发流程</div>
                  <div>✓ 上传ZIP格式安装包</div>
                  <div>✓ 快速部署上线</div>
                </div>
              </div>
            </div>

            {/* 在线开发选项（禁用状态） */}
            <div className="flex-1 border border-gray-200 rounded-lg p-1.5 opacity-50 cursor-not-allowed relative">
              <div className="flex flex-col items-center text-center">
                {/* 即将上线标签 */}
                <div className="absolute top-0.5 right-0.5">
                  <Tag color="gold">即将上线</Tag>
                </div>

                {/* 图标 */}
                <div className="w-[16px] h-[16px] bg-gray-100 rounded-lg flex items-center justify-center mb-[4px]">
                  <CodeOutlined className="text-3xl text-gray-400" />
                </div>

                {/* 标题 */}
                <h3 className="text-base font-bold text-gray-900 mb-[2px] opacity-50">
                  在线开发
                </h3>

                {/* 描述 */}
                <p className="text-sm text-gray-500 mb-[4px] min-h-[48px] opacity-50">
                  使用低代码能力开发DIP应用（敬请期待）
                </p>

                {/* 特性列表 */}
                <div className="text-sm text-gray-500 text-left w-full space-y-1 opacity-50">
                  <div>✓ 可视化拖拽开发</div>
                  <div>✓ 实时预览和调试</div>
                  <div>✓ 一键发布部署</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <UploadAppModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onSuccess={onSuccess}
      />
    </>
  )
}

export default CreateAppModal
