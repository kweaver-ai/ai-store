import type { ModalProps } from 'antd'
import { Form, Input, Modal, message } from 'antd'
import { useEffect, useState } from 'react'
import { deleteProjects, type ProjectInfo } from '@/apis/projects'

export interface DeleteProjectModalProps extends Pick<ModalProps, 'open' | 'onCancel'> {
  /** 要删除的项目信息 */
  project?: ProjectInfo
  /** 删除成功的回调 */
  onSuccess: () => void
}

/** 删除项目弹窗 */
const DeleteProjectModal = ({ open, onCancel, project, onSuccess }: DeleteProjectModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  // 当弹窗关闭时重置表单
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setLoading(false)
    }
  }, [open, form])

  /** 处理确定按钮点击 */
  const handleOk = async () => {
    if (!project) {
      return
    }

    try {
      const values = await form.validateFields()
      setLoading(true)

      // 验证输入的项目名称是否匹配
      if (values.projectName !== project.name) {
        form.setFields([
          {
            name: 'projectName',
            errors: ['输入的项目名称不匹配'],
          },
        ])
        setLoading(false)
        return
      }

      await deleteProjects(String(project.id))

      messageApi.success('删除项目成功')
      onSuccess()
      onCancel?.(undefined as any)
    } catch (err: any) {
      // 表单验证失败时不显示错误消息
      if (err?.errorFields) {
        return
      }
      // API 请求失败时显示错误消息并停留
      if (err?.description) {
        messageApi.error(err.description)
      } else {
        messageApi.error('删除项目失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title="删除项目"
        open={open && !!project}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
        closable
        maskClosable={false}
        destroyOnHidden
        width={520}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
            <CancelBtn />
          </>
        )}
      >
        <div className="mt-4">
          <div className="mb-4 text-sm text-[--dip-text-color-65]">
            删除项目后，相关配置和数据将被清除，用户将无法使用项目。此操作不可恢复。
          </div>
          <div className="mb-4 text-sm">
            请输入项目名称{' '}
            <span className="font-medium text-[--dip-text-color-85]">{project?.name}</span>{' '}
            以确认删除：
          </div>
          <Form form={form} layout="vertical">
            <Form.Item
              label="项目名称"
              name="projectName"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  )
}

export default DeleteProjectModal
