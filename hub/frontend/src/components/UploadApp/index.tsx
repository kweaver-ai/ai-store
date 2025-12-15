import { useState } from 'react'
import { Card } from 'antd'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import Steps from './Steps'

export interface UploadAppFormData {
  // 第一步数据
  appName: string
  appDescription: string
  appIcon: File | null
  iconPreview?: string

  // 第二步数据
  packageFile: File | null
  uploadProgress?: number
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'failed'
}

const UploadApp = () => {
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

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="flex justify-center pt-[68px]">
        <Card
          className="w-[1020px] min-h-[681px] rounded-[6px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)]"
          bodyStyle={{ padding: 0 }}
        >
          <div className="px-2 pt-2 pb-px">
            <Steps current={currentStep} />
            {currentStep === 1 && (
              <StepOne
                formData={formData}
                onNext={handleStepOneNext}
                onChange={(data) =>
                  setFormData((prev) => ({ ...prev, ...data }))
                }
              />
            )}
            {currentStep === 2 && (
              <StepTwo
                formData={formData}
                onBack={handleStepTwoBack}
                onChange={(data) =>
                  setFormData((prev) => ({ ...prev, ...data }))
                }
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default UploadApp
