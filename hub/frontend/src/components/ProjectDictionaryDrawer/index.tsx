import { PlusOutlined } from '@ant-design/icons'
import { Button, Drawer, Form, Input, Modal, message, Table } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import type { CreateDictionaryParams, DictionaryItem } from '@/apis/projects'
import {
  deleteProjectDictionary,
  getProjectDictionary,
  postProjectDictionary,
  putProjectDictionary,
} from '@/apis/projects'
import Empty from '@/components/Empty'
import { formatTime } from '@/utils/handle-function/FormatTime'
import IconFont from '../IconFont'
import styles from './index.module.less'

export interface ProjectDictionaryDrawerProps {
  open: boolean
  onClose: () => void
  projectId: string
}

interface DictionaryFormValues {
  term: string
  definition: string
}

/** 项目数据字典抽屉 */
const ProjectDictionaryDrawer = ({ open, onClose, projectId }: ProjectDictionaryDrawerProps) => {
  const [modal, contextHolder] = Modal.useModal()
  const [messageApi, messageContextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [dictionaryList, setDictionaryList] = useState<DictionaryItem[]>([])
  const [modalVisible, setModalVisible] = useState(false)

  /** 新建/编辑相关状态 */
  const [form] = Form.useForm<DictionaryFormValues>()
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)

  /** 加载数据字典列表 */
  const loadDictionaryList = useCallback(async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const data = await getProjectDictionary(projectId)
      setDictionaryList(data)
    } catch (error: any) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  /** 打开新建弹窗 */
  const handleAdd = useCallback(() => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }, [form])

  /** 打开编辑弹窗 */
  const handleEdit = useCallback(
    (item: DictionaryItem) => {
      setEditingItem(item)
      form.setFieldsValue({
        term: item.term,
        definition: item.definition,
      })
      setModalVisible(true)
    },
    [form],
  )

  /** 处理删除 */
  const handleDelete = useCallback(
    (item: DictionaryItem) => {
      modal.confirm({
        title: '确认删除',
        content: `确定要删除术语"${item.term}"吗？`,
        okText: '确定',
        cancelText: '取消',
        okType: 'primary',
        okButtonProps: { danger: true },
        footer: (_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
            <CancelBtn />
          </>
        ),
        onOk: async () => {
          try {
            await deleteProjectDictionary(item.id)
            messageApi.success('删除成功')
            loadDictionaryList()
          } catch (error: any) {
            if (error?.description) {
              messageApi.error(error.description)
            } else {
              messageApi.error('删除失败')
            }
          }
        },
      })
    },
    [loadDictionaryList],
  )

  /** 提交表单 */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const params: CreateDictionaryParams = {
        project_id: projectId,
        term: values.term?.trim(),
        definition: values.definition?.trim(),
      }

      if (editingItem) {
        await putProjectDictionary(editingItem.id, params)
        messageApi.success('更新成功')
      } else {
        await postProjectDictionary(params)
        messageApi.success('新建成功')
      }

      setModalVisible(false)
      form.resetFields()
      loadDictionaryList()
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return
      }
      if (error?.description) {
        messageApi.error(error.description)
      } else {
        messageApi.error(editingItem ? '更新失败' : '新建失败')
      }
    } finally {
      setSubmitting(false)
    }
  }, [form, projectId, editingItem, loadDictionaryList])

  /** 取消 */
  const handleCancel = useCallback(() => {
    setModalVisible(false)
    form.resetFields()
    setEditingItem(null)
  }, [form])

  // 抽屉打开时加载数据
  useEffect(() => {
    if (open && projectId) {
      loadDictionaryList()
    } else {
      setDictionaryList([])
      setError(null)
    }
  }, [open, projectId, loadDictionaryList])

  const columns = [
    {
      title: '术语',
      dataIndex: 'term',
      key: 'term',
      ellipsis: true,
    },
    {
      title: '定义',
      dataIndex: 'definition',
      key: 'definition',
      width: '50%',
      ellipsis: true,
    },
    {
      title: '操作时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text: string) => (text ? formatTime(text) : '--'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: DictionaryItem) => (
        <div className="flex items-center gap-2">
          <Button
            variant="link"
            color="default"
            icon={<IconFont type="icon-dip-bianji" />}
            onClick={() => handleEdit(record)}
          />
          <Button
            variant="link"
            color="default"
            icon={<IconFont type="icon-dip-trash" />}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ]

  const handleValuesChange = (_changedValues: any, allValues: any) => {
    setCanSubmit(!!allValues.term && !!allValues.definition)
  }

  return (
    <Drawer
      title="项目数据字典"
      open={open}
      onClose={onClose}
      closable={{ placement: 'end' }}
      maskClosable
      destroyOnHidden
      styles={{
        wrapper: { width: '60%', minWidth: 640 },
        header: { borderBottom: 'none' },
        body: { padding: '8px 24px 16px' },
      }}
    >
      {contextHolder}
      {messageContextHolder}
      <div className="flex flex-col h-full gap-y-2">
        {/* 头部 */}
        <div className="flex items-center justify-between gap-x-2">
          <span className="text-sm font-medium text-[--dip-text-color]">数据字典列表</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建术语
          </Button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto">
          <Table
            size="small"
            columns={columns}
            dataSource={dictionaryList}
            rowKey="id"
            pagination={false}
            loading={loading}
            className={styles.dictionaryTable}
            scroll={{ y: 'calc(100vh - 168px)' }}
            locale={{
              emptyText: error ? (
                <Empty type="failed" title="加载失败">
                  <Button className="mt-1" type="primary" onClick={loadDictionaryList}>
                    重试
                  </Button>
                </Empty>
              ) : (
                <Empty desc="暂无数据字典定义" />
              ),
            }}
          />
        </div>
      </div>
      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑术语' : '新建术语'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={submitting}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ loading: submitting, disabled: !canSubmit }}
        width={520}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
            <CancelBtn />
          </>
        )}
      >
        <Form form={form} layout="vertical" className="mt-4" onValuesChange={handleValuesChange}>
          <Form.Item label="名称" name="term" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：人力资源ROI" />
          </Form.Item>
          <Form.Item
            label="定义"
            name="definition"
            rules={[{ required: true, message: '请输入定义' }]}
          >
            <Input.TextArea
              placeholder="请输入定义"
              rows={4}
              autoSize={{ minRows: 5, maxRows: 5 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  )
}

export default ProjectDictionaryDrawer
