import { useState } from 'react'
import { Modal } from 'antd'
import StepOne from '../UploadApp/StepOne'
import StepTwo from '../UploadApp/StepTwo'
import Steps from '../UploadApp/Steps'
import type { UploadAppFormData } from '../UploadApp'

interface UploadAppModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess?: () => void
}

const UploadAppModal = ({
  visible,
  onCancel,
  onSuccess,
}: UploadAppModalProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<UploadAppFormData>({
    appName: '',
    appDescription: '',
    appIcon: null,
    packageFile: null,
    uploadStatus: 'idle',
  })

  const handleStepOneNext = (data: Partial<UploadAppFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(2)
  }

  const handleStepTwoBack = () => {
    setCurrentStep(1)
  }

  const handleCancel = () => {
    // 重置状态
    setCurrentStep(1)
    setFormData({
      appName: '',
      appDescription: '',
      appIcon: null,
      packageFile: null,
      uploadStatus: 'idle',
    })
    onCancel()
  }

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1020}
      className="[&_.ant-modal-content]:p-0 [&_.ant-modal-body]:p-0 [&_.ant-modal-header]:hidden"
      styles={{
        body: {
          padding: 0,
        },
      }}
      maskClosable={false}
    >
      <div className="px-1.5 pt-2 pb-1.5 bg-white">
        <Steps current={currentStep} />
        {currentStep === 1 && (
          <StepOne
            formData={formData}
            onNext={handleStepOneNext}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />
        )}
        {currentStep === 2 && (
          <StepTwo
            formData={formData}
            onBack={handleStepTwoBack}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
            onSuccess={() => {
              handleCancel()
              onSuccess?.()
            }}
          />
        )}
      </div>
    </Modal>
  )
}

export default UploadAppModal
