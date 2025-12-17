/**
 * 分页参数
 */
export interface PageParams {
  /** 页码 */
  offset?: number
  /** 分页大小 */
  limit?: number
  /** 搜索关键词 */
  keyword?: string
}

/**
 * 列表响应
 */
export interface ListResponse<T> {
  /** 数据列表 */
  entries: T[]
  /** 总数 */
  total: number
}
