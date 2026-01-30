import type { ModalProps } from 'antd'
import { Form, Input, Modal, message } from 'antd'
import { useEffect, useState } from 'react'
import {
  postApplicationNode,
  postFunctionNode,
  postPageNode,
  postProjects,
  putApplicationNode,
  putFunctionNode,
  putPageNode,
  putProjects,
} from '@/apis/projects'
import { ObjectTypeEnum } from '@/pages/ProjectManagement/types'
import {
  projectActionModalDescPlaceholderMap,
  projectActionModalNamePlaceholderMap,
  projectActionModalTitleMap,
} from '@/pages/ProjectManagement/utils'

export interface ActionModalProps extends Pick<ModalProps, 'open' | 'onCancel'> {
  /** 新建成功的回调，传递项目 ID */
  onSuccess: (id: string) => void

  /** 要编辑的对象信息 */
  objectInfo?: {
    id: string
    name: string
    description: string
  }

  /** 操作类型 */
  operationType: 'add' | 'edit'

  /** 操作对象类型 */
  objectType: ObjectTypeEnum
}

/** 新建 编辑 弹窗 */
const ActionModal = ({
  open,
  onCancel,
  onSuccess,
  objectInfo,
  operationType,
  objectType,
}: ActionModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  // 当弹窗关闭时重置表单
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setLoading(false)
    } else if (operationType === 'edit' && objectInfo) {
      form.setFieldsValue(objectInfo)
    }
  }, [open, form, objectInfo])

  /** 处理确定按钮点击 */
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      let result: any
      if (objectType === ObjectTypeEnum.Project) {
        if (operationType === 'add') {
          result = await postProjects(values)
        } else if (operationType === 'edit' && objectInfo) {
          result = await putProjects(objectInfo.id, values)
        }
      } else if (objectType === ObjectTypeEnum.Application) {
        if (operationType === 'add') {
          result = await postApplicationNode(values)
        } else if (operationType === 'edit' && objectInfo) {
          result = await putApplicationNode(objectInfo.id, values)
        }
      } else if (objectType === ObjectTypeEnum.Page) {
        if (operationType === 'add') {
          result = await postPageNode(values)
        } else if (operationType === 'edit' && objectInfo) {
          result = await putPageNode(objectInfo.id, values)
        }
      } else if (objectType === ObjectTypeEnum.Function) {
        if (operationType === 'add') {
          result = await postFunctionNode(values)
        } else if (operationType === 'edit' && objectInfo) {
          result = await putFunctionNode(objectInfo.id, values)
        }
      }
      messageApi.success(
        `${operationType === 'add' ? '新建' : '编辑'}${projectActionModalTitleMap(objectType)}成功`,
      )
      onSuccess(result.id)
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
        messageApi.error(
          `${operationType === 'add' ? '新建' : '编辑'}${projectActionModalTitleMap(objectType)}失败，请稍后重试`,
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log(changedValues, allValues)
    // name有值，则可以提交
    setCanSubmit(!!allValues.name)
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={`${operationType === 'add' ? '新建' : '编辑'} ${projectActionModalTitleMap(objectType)}`}
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
        closable
        maskClosable={false}
        destroyOnHidden
        width={520}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ loading: loading, disabled: !canSubmit }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
            <CancelBtn />
          </>
        )}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4 mb-10"
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input
              placeholder={projectActionModalNamePlaceholderMap(objectType)}
              maxLength={128}
              showCount
            />
          </Form.Item>

          <Form.Item label="项目描述" name="description">
            <Input.TextArea
              placeholder={projectActionModalDescPlaceholderMap(objectType)}
              rows={4}
              maxLength={400}
              showCount
              autoSize={{ minRows: 5, maxRows: 5 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ActionModal
