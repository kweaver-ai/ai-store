import { useState, useEffect, useRef } from 'react'
import { Modal, Upload, Button, Spin, message } from 'antd'
import type { UploadProps, ModalProps } from 'antd'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseCircleOutlined,
  FileZipOutlined,
} from '@ant-design/icons'
import { UploadStatus } from './types'
import {
  formatFileSize,
  validateFileFormat,
  validateFileSize,
  getFileInfo,
} from './utils'
import { postApplications } from '@/apis/dip-hub/applications'
import type { FileInfo } from './types'
import UploadFileIcon from '@/assets/images/uploadFile.svg?react'
import styles from './index.module.less'
import clsx from 'clsx'
import ScrollBarContainer from '../ScrollBarContainer'

const { Dragger } = Upload

export interface UploadAppModalProps
  extends Pick<ModalProps, 'open' | 'onCancel'> {
  /** 上传成功的回调 */
  onSuccess: () => void
}

/** 上传应用安装包弹窗 */
const UploadAppModal = ({ open, onCancel, onSuccess }: UploadAppModalProps) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    UploadStatus.INITIAL
  )
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const uploadControllerRef = useRef<AbortController | null>(null)

  // 重置状态
  const resetState = () => {
    setUploadStatus(UploadStatus.INITIAL)
    setFileInfo(null)
    setErrorMessage('')
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort()
      uploadControllerRef.current = null
    }
  }

  // 当弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open])

  // 处理文件选择
  const handleFileChange: UploadProps['onChange'] = (info) => {
    const { file } = info
    const { status } = file

    console.log('handleFileChange', info)

    if (status === 'removed') {
      setFileInfo(null)
      setUploadStatus(UploadStatus.INITIAL)
      setErrorMessage('')
      console.log('handleFileChange removed')
      return
    }

    if (status === 'done' || status === 'uploading') {
      return
    }

    // 当 beforeUpload 返回 false 时，文件对象在 originFileObj 中，如果没有则 file 本身就是 File 对象
    const fileObj = file.originFileObj || file
    if (!fileObj || !(fileObj instanceof File)) {
      return
    }

    // 验证文件格式
    if (!validateFileFormat(fileObj)) {
      message.error('仅支持 .dip 格式的应用安装包')
      return
    }

    // 验证文件大小
    if (!validateFileSize(fileObj)) {
      message.error('文件大小不能超过 1GB')
      return
    }

    setFileInfo(getFileInfo(fileObj))
    setUploadStatus(UploadStatus.READY)
    console.log('handleFileChange ready')
    setErrorMessage('')
  }

  // 上传文件
  const handleUpload = async () => {
    if (!fileInfo) {
      return
    }

    setUploadStatus(UploadStatus.UPLOADING)
    setErrorMessage('')

    // 创建 AbortController 用于取消上传
    const controller = new AbortController()
    uploadControllerRef.current = controller

    try {
      // 将文件转换为 Blob
      const blob = fileInfo.file
      await postApplications(blob)

      setUploadStatus(UploadStatus.SUCCESS)
    } catch (error: any) {
      if (controller.signal.aborted) {
        // 如果已取消，不设置错误状态
        return
      }

      setUploadStatus(UploadStatus.FAILED)
      if (error?.description) {
        setErrorMessage(error?.description)
      } else {
        setErrorMessage('上传失败，请重试')
      }
    } finally {
      if (uploadControllerRef.current) {
        uploadControllerRef.current = null
      }
    }
  }

  // 处理取消上传
  const handleCancelUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort()
      uploadControllerRef.current = null
    }
    if (onCancel) {
      onCancel(undefined as any)
    }
  }

  // 处理取消
  const handleCancel = (
    e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (uploadStatus === UploadStatus.UPLOADING) {
      // 上传中需要二次确认
      Modal.confirm({
        title: '确认取消安装',
        content: '正在上传中，取消后将中断上传。是否继续？',
        okText: '确定',
        okType: 'primary',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: handleCancelUpload,
        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
            <CancelBtn />
          </>
        ),
      })
    } else {
      if (onCancel) {
        onCancel(e as any)
      }
    }
  }

  // 处理拖拽上传
  const draggerProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.dip',
    beforeUpload: () => false, // 阻止自动上传
    onChange: handleFileChange,
    showUploadList: false,
    disabled:
      uploadStatus === UploadStatus.UPLOADING ||
      uploadStatus === UploadStatus.SUCCESS,
  }

  // 渲染上传区域
  const renderUploadArea = () => {
    const isUploading = uploadStatus === UploadStatus.UPLOADING

    return (
      <Dragger {...draggerProps}>
        {isUploading ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ height: '100%' }}
          >
            <Spin />
            <p className="mt-4 text-sm text-[#1677FF]">正在验证应用包...</p>
          </div>
        ) : (
          <>
            <p className="ant-upload-drag-icon">
              <UploadFileIcon style={{ width: 48, height: 48 }} />
            </p>
            <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
            <p className="ant-upload-hint">支持 .dip 格式的应用安装包</p>
          </>
        )}
      </Dragger>
    )
  }

  // 渲染文件展示区域
  const renderFileInfo = () => {
    if (!fileInfo || uploadStatus === UploadStatus.INITIAL) {
      return null
    }

    const isUploading = uploadStatus === UploadStatus.UPLOADING
    const isFailed = uploadStatus === UploadStatus.FAILED

    return (
      <div className="mt-4 p-4 bg-[#F9FAFC] rounded-lg">
        <div className="flex items-center gap-3">
          <FileZipOutlined className="text-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{fileInfo.name}</div>
            <div className="text-xs text-[rgba(0,0,0,0.45)] mt-1">
              {formatFileSize(fileInfo.size)}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isUploading && (
              <span className="px-2 py-0.5 text-xs border border-[--dip-border-color-base] rounded">
                验证中
              </span>
            )}
            {uploadStatus === UploadStatus.READY && (
              <span className="px-2 py-0.5 text-xs border border-[--dip-border-color-base] rounded">
                等待安装
              </span>
            )}
            {isFailed && (
              <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-[--dip-error-color] bg-[rgba(255,77,79,0.1)] border border-[#FFCCC7] rounded">
                <CloseCircleOutlined className="text-[--dip-error-color]" />
                安装失败
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 渲染错误展示区域
  const renderError = () => {
    if (!errorMessage || uploadStatus !== UploadStatus.FAILED) {
      return null
    }

    return (
      <div className="mt-4 px-3 py-2 bg-[#FFF1F0] border border-[#FFCCC7] rounded-lg flex gap-2">
        <CloseCircleFilled className="text-[--dip-error-color] text-base flex-shrink-0" />
        <div className="flex-1 text-sm line-clamp-2" title={errorMessage}>
          {errorMessage}
        </div>
      </div>
    )
  }

  // 渲染操作按钮
  const renderActionButton = () => {
    const isUploading = uploadStatus === UploadStatus.UPLOADING
    const canUpload =
      uploadStatus === UploadStatus.READY ||
      uploadStatus === UploadStatus.FAILED

    return (
      <div className="mt-4 mb-16">
        <Button
          type="primary"
          block
          disabled={!canUpload}
          onClick={handleUpload}
          style={{ opacity: isUploading ? 0.25 : 1 }}
        >
          安装应用
        </Button>
      </div>
    )
  }

  // 渲染成功区域
  const renderSuccess = () => {
    if (uploadStatus !== UploadStatus.SUCCESS) {
      return null
    }

    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <CheckCircleFilled className="text-7xl text-[--dip-success-color]" />
        <div className="mt-8 text-2xl font-medium]">应用安装成功</div>
        <div className="mt-2 text-sm text-[--dip-text-color-45]">
          您的应用已安装成功，可前往应用列表查看
        </div>
      </div>
    )
  }

  return (
    <Modal
      title="安装应用包"
      open={open}
      onCancel={handleCancel}
      closable
      width={620}
      styles={{
        container: {
          maxHeight: 600,
          minHeight: 436,
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        },
      }}
      okText="确定"
      okButtonProps={{
        onClick: () => onSuccess(),
      }}
      cancelText="取消"
      cancelButtonProps={{
        onClick: () => handleCancel(),
      }}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>{uploadStatus === UploadStatus.SUCCESS ? <OkBtn /> : <CancelBtn />}</>
      )}
    >
      <ScrollBarContainer
        suppressScrollX={false}
        className={clsx(styles.uploadContainer, 'flex flex-col h-full')}
        style={{ overflow: 'hidden auto' }}
      >
        {uploadStatus === UploadStatus.SUCCESS ? (
          renderSuccess()
        ) : (
          <>
            <div className="mt-3">{renderUploadArea()}</div>
            {renderFileInfo()}
            {renderError()}
            {renderActionButton()}
          </>
        )}
      </ScrollBarContainer>
    </Modal>
  )
}

export default UploadAppModal
