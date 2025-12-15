import { useRef } from 'react'
import { Input, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadAppFormData } from './index'

const { TextArea } = Input

interface StepOneProps {
  formData: UploadAppFormData
  onNext: (data: Partial<UploadAppFormData>) => void
  onChange: (data: Partial<UploadAppFormData>) => void
}

const StepOne = ({ formData, onNext, onChange }: StepOneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAppNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ appName: e.target.value })
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    if (value.length <= 200) {
      onChange({ appDescription: value })
    }
  }

  const handleIconUpload = (file: File) => {
    // 验证文件格式
    const isValidFormat = ['image/jpeg', 'image/jpg', 'image/png'].includes(
      file.type
    )
    if (!isValidFormat) {
      message.error('仅支持 JPG、PNG 格式')
      return false
    }

    // 验证文件大小 (假设最大 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('图片大小不能超过 5MB')
      return false
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      const preview = e.target?.result as string
      onChange({
        appIcon: file,
        iconPreview: preview,
      })
    }
    reader.readAsDataURL(file)

    return false // 阻止自动上传
  }

  const handleIconRemove = () => {
    onChange({
      appIcon: null,
      iconPreview: undefined,
    })
  }

  const handleNext = () => {
    if (!formData.appName.trim()) {
      message.error('请输入应用名称')
      return
    }
    onNext(formData)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleIconUpload(file)
    }
    // 重置 input，以便可以重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="px-[7px]">
      {/* 应用名称 */}
      <div className="mb-[8px]">
        <div className="flex items-center mb-[15px]">
          <span className="text-[#FF4D4F] mr-[2px]">*</span>
          <label className="text-sm text-[rgba(0,0,0,0.85)]">应用名称</label>
        </div>
        <Input
          placeholder="请输入名称"
          value={formData.appName}
          onChange={handleAppNameChange}
          className="h-[8px] rounded-[6px] border-[rgba(0,0,0,0.15)]"
          style={{
            fontSize: '14px',
            fontFamily: 'PingFang SC',
          }}
        />
      </div>

      {/* 应用描述 */}
      <div className="mb-[8px]">
        <div className="mb-[15px]">
          <label className="text-sm text-[rgba(0,0,0,0.85)]">应用描述</label>
        </div>
        <div className="relative">
          <TextArea
            placeholder="请描述应用的功能和特点（选填）"
            value={formData.appDescription}
            onChange={handleDescriptionChange}
            rows={4}
            maxLength={200}
            showCount
            className="rounded-[6px] border-[rgba(0,0,0,0.15)]"
            style={{
              fontSize: '14px',
              fontFamily: 'Noto Sans SC',
              padding: '8px 12px',
            }}
          />
          <div className="absolute bottom-[2px] right-[3px] text-sm text-[rgba(0,0,0,0.45)]">
            {formData.appDescription.length}/200
          </div>
        </div>
      </div>

      {/* 应用图标 */}
      <div className="mb-[8px]">
        <div className="mb-[15px]">
          <label className="text-sm text-[rgba(0,0,0,0.85)]">应用图标</label>
        </div>
        <div className="flex items-start">
          {/* 上传区域 */}
          <div className="relative">
            {formData.iconPreview ? (
              <div className="w-[104px] h-[104px] rounded-[6px] border border-[rgba(0,0,0,0.15)] overflow-hidden">
                <img
                  src={formData.iconPreview}
                  alt="应用图标"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute top-0 right-0 w-[5px] h-[5px] bg-black bg-opacity-50 text-white flex items-center justify-center cursor-pointer rounded-bl"
                  onClick={handleIconRemove}
                >
                  ×
                </div>
              </div>
            ) : (
              <div className="w-[104px] h-[104px] rounded-[6px] border border-dashed border-[rgba(0,0,0,0.15)] flex items-center justify-center bg-white">
                <UploadOutlined className="text-2xl text-[rgba(0,0,0,0.45)]" />
              </div>
            )}
          </div>

          {/* 提示信息和上传按钮 */}
          <div className="ml-[6px] flex flex-col">
            <div className="text-xs text-[rgba(0,0,0,0.25)] mb-[22px]">
              推荐尺寸：114*114
            </div>
            <div className="text-xs text-[rgba(0,0,0,0.25)] mb-[4px]">
              支持JPG、PNG格式
            </div>
            <Button
              onClick={handleUploadClick}
              className="w-[86px] h-[7px] rounded-[6px] border border-[rgba(0,0,0,0.1)] text-sm text-[rgba(0,0,0,0.85)]"
            >
              上传图片
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end mt-[8px] mb-[5px]">
        <Button
          type="primary"
          onClick={handleNext}
          disabled={!formData.appName.trim()}
          className="h-[7px] px-[15px] rounded-[2px] bg-[rgba(18,110,227,0.25)] text-white border-none disabled:bg-[rgba(0,0,0,0.06)] disabled:text-[rgba(0,0,0,0.25)]"
          style={{
            fontSize: '14px',
            fontFamily: 'Noto Sans SC',
          }}
        >
          下一步
        </Button>
      </div>
    </div>
  )
}

export default StepOne
