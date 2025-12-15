import { useState } from 'react'
import { Button, Upload, Progress, message } from 'antd'
import type { UploadFile, RcFile } from 'antd/es/upload'
import {
  UploadOutlined,
  CloseOutlined,
  ReloadOutlined,
  PaperClipOutlined,
} from '@ant-design/icons'
import { uploadAppApi } from '../../apis/micro-app'
import type { UploadAppFormData } from './index'

interface StepTwoProps {
  formData: UploadAppFormData
  onBack: () => void
  onChange: (data: Partial<UploadAppFormData>) => void
  onSuccess?: () => void
}

const StepTwo = ({ formData, onBack, onChange, onSuccess }: StepTwoProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 文件上传前的验证
  const beforeUpload = (file: RcFile) => {
    // 验证文件格式
    if (!file.name.toLowerCase().endsWith('.zip')) {
      message.error('仅支持 ZIP 格式')
      return Upload.LIST_IGNORE
    }

    // 验证文件大小 (100MB = 100 * 1024 * 1024)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      message.error('文件大小不能超过 100MB')
      return Upload.LIST_IGNORE
    }

    // 保存文件到 formData
    onChange({
      packageFile: file,
      uploadStatus: 'idle',
    })

    // 添加到文件列表
    const newFile: UploadFile = {
      uid: Date.now().toString(),
      name: file.name,
      status: 'done',
      originFileObj: file,
    }
    setFileList([newFile])

    return false // 阻止自动上传
  }

  // 文件列表变化
  const handleChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList)

    if (info.fileList.length === 0) {
      onChange({
        packageFile: null,
        uploadProgress: undefined,
        uploadStatus: 'idle',
      })
    }
  }

  // 移除文件
  const handleRemove = () => {
    setFileList([])
    onChange({
      packageFile: null,
      uploadProgress: undefined,
      uploadStatus: 'idle',
    })
  }

  // 上传文件
  const handleUpload = async () => {
    if (!formData.packageFile) {
      message.error('请先选择文件')
      return
    }

    onChange({ uploadStatus: 'uploading', uploadProgress: 0 })

    try {
      await uploadAppApi(
        {
          appName: formData.appName,
          appDescription: formData.appDescription,
          appIcon: formData.appIcon || undefined,
          packageFile: formData.packageFile,
        },
        (progress) => {
          onChange({ uploadProgress: progress })
        }
      )

      onChange({
        uploadStatus: 'success',
        uploadProgress: 100,
      })
      message.success('上传成功')
      // 延迟调用成功回调，让用户看到成功提示
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '上传失败，请重试'
      onChange({
        uploadStatus: 'failed',
        uploadProgress: 100,
      })
      message.error(errorMessage)
    }
  }

  // 重试上传
  const handleRetry = () => {
    onChange({
      uploadStatus: 'idle',
      uploadProgress: undefined,
    })
    handleUpload()
  }

  const renderUploadArea = () => {
    if (formData.uploadStatus === 'uploading') {
      const progress = Math.round(formData.uploadProgress || 0)
      return (
        <div className="w-full h-[235px] rounded-lg border border-[rgba(0,0,0,0.15)] bg-[rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
          <div className="w-full px-[5px]">
            <div className="flex items-center justify-between mb-[2px]">
              <div className="flex items-center">
                <PaperClipOutlined className="text-base text-[rgba(0,0,0,0.65)] mr-[2px] opacity-90" />
                <span className="text-sm text-[rgba(0,0,0,0.85)]">
                  {formData.packageFile?.name}
                </span>
              </div>
              <CloseOutlined
                className="text-base text-[rgba(0,0,0,0.45)] cursor-pointer hover:text-[rgba(0,0,0,0.65)]"
                onClick={handleRemove}
              />
            </div>
            <Progress
              percent={progress}
              strokeColor="#1677FF"
              showInfo={false}
              className="[&_.ant-progress-bg]:h-[2px] [&_.ant-progress-bg]:rounded-[32px]"
            />
          </div>
        </div>
      )
    }

    if (formData.uploadStatus === 'success') {
      return (
        <div className="w-full h-[235px] rounded-lg border border-[rgba(0,0,0,0.15)] bg-[rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
          <div className="w-full px-[5px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PaperClipOutlined className="text-base text-[rgba(0,0,0,0.65)] mr-[2px]" />
                <span className="text-sm text-[rgba(0,0,0,0.85)]">
                  {formData.packageFile?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (formData.uploadStatus === 'failed') {
      return (
        <div className="w-full h-[235px] rounded-lg border border-[rgba(0,0,0,0.15)] bg-[rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
          <div className="w-full px-[5px]">
            <div className="flex items-center justify-between mb-[2px]">
              <div className="flex items-center">
                <PaperClipOutlined className="text-base text-[rgba(0,0,0,0.65)] mr-[2px] opacity-90" />
                <span className="text-sm text-[rgba(0,0,0,0.85)]">
                  {formData.packageFile?.name}
                </span>
              </div>
              <div className="flex items-center gap-[2px]">
                <ReloadOutlined
                  className="text-base text-[rgba(0,0,0,0.45)] cursor-pointer hover:text-[rgba(0,0,0,0.65)]"
                  onClick={handleRetry}
                />
                <CloseOutlined
                  className="text-base text-[rgba(0,0,0,0.45)] cursor-pointer hover:text-[rgba(0,0,0,0.65)]"
                  onClick={handleRemove}
                />
              </div>
            </div>
            <Progress
              percent={100}
              strokeColor="#FF4D4F"
              showInfo={false}
              className="[&_.ant-progress-bg]:h-[2px]"
            />
          </div>
        </div>
      )
    }

    return (
      <Upload.Dragger
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={handleRemove}
        accept=".zip"
        maxCount={1}
        className="!h-[235px] [&_.ant-upload-drag]:!h-full [&_.ant-upload-drag]:!border-dashed [&_.ant-upload-drag]:!border-[rgba(0,0,0,0.15)] [&_.ant-upload-drag]:!bg-[rgba(0,0,0,0.04)] [&_.ant-upload-drag]:!rounded-lg [&_.ant-upload-drag-container]:!h-full [&_.ant-upload-drag-container]:!flex [&_.ant-upload-drag-container]:!flex-col [&_.ant-upload-drag-container]:!items-center [&_.ant-upload-drag-container]:!justify-center"
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined className="text-5xl text-[rgba(0,0,0,0.65)]" />
        </p>
        <p className="ant-upload-text text-base text-[rgba(0,0,0,0.85)] font-normal mb-[2px]">
          点击或将文件拖拽到这里上传
        </p>
        <p className="ant-upload-hint text-sm text-[rgba(0,0,0,0.45)]">
          仅支持 ZIP 格式，文件大小不超过 100MB
        </p>
      </Upload.Dragger>
    )
  }

  return (
    <div className="px-0">
      {/* 应用包要求 */}
      <div className="mb-[6px] p-[4px] rounded-lg bg-[#E6F4FF] border border-[#BAE0FF]">
        <div className="flex items-start">
          <div className="w-[6px] h-[6px] flex items-center justify-center mr-[2px] mt-[0.5px]">
            <div className="w-[5px] h-[5px] rounded-full bg-[#126EE3] flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-[rgba(0,0,0,0.85)] mb-[3px]">
              应用包要求
            </div>
            <div className="text-sm text-[rgba(0,0,0,0.85)] leading-[22px] space-y-1">
              <div>文件格式：ZIP 压缩包</div>
              <div>文件大小：不超过 100MB</div>
              {formData.uploadStatus === 'uploading' && (
                <>
                  <div>必须包含 manifest.json 配置文件</div>
                  <div>上传前请确保应用包结构符合规范</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="mb-[6px]">
        <div className="mb-[15px]">
          <label className="text-sm text-[rgba(0,0,0,0.85)]">
            上传应用安装包
          </label>
        </div>
        {renderUploadArea()}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-[2px] mt-[8px] mb-[5px]">
        <Button
          onClick={onBack}
          className="h-[7px] px-[15px] rounded-[2px] border border-[rgba(0,0,0,0.1)] text-sm text-[rgba(0,0,0,0.85)] bg-[rgba(255,255,255,0.04)]"
        >
          上一步
        </Button>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={
            !formData.packageFile || formData.uploadStatus === 'uploading'
          }
          className="h-[7px] px-[15px] rounded-[2px] bg-[rgba(18,110,227,0.25)] text-white border-none disabled:bg-[rgba(0,0,0,0.06)] disabled:text-[rgba(0,0,0,0.45)]"
        >
          {formData.uploadStatus === 'uploading' ? '上传中...' : '上传并验证'}
        </Button>
      </div>
    </div>
  )
}

export default StepTwo
