/**
 * 加载微应用时传递给微应用的 Props
 */
export interface MicroAppProps {
  /** ========== 认证相关 ========== */
  token: {
    /** 访问令牌（accessToken） */
    accessToken: string
    /** Token 刷新能力（微应用可以调用此函数刷新 token） */
    refreshToken: () => Promise<{ accessToken: string }>
  }

  /** ========== 路由信息 ========== */
  route: {
    /** 应用路由基础路径 */
    basename: string
  }

  /** ========== 用户信息 ========== */
  user: {
    /** 用户 ID */
    id: string
    /** 用户名称 */
    name: string
    /** 用户账号 */
    loginName: string
    /** 用户角色 */
    role?: string
  }

  /** ========== UI 组件渲染函数 ========== */
  /** 渲染应用菜单组件（AppMenu）到指定容器，使用主应用的 React 上下文渲染 */
  renderAppMenu: (container: HTMLElement | string) => void
  /** 渲染用户信息组件（UserInfo）到指定容器，使用主应用的 React 上下文渲染 */
  renderUserInfo: (container: HTMLElement | string) => void

  /** ========== 全局状态管理 ========== */
  /** 设置全局状态（微应用可以通过此方法更新全局状态） */
  setMicroAppState: (state: Record<string, any>) => boolean
  /** 监听全局状态变化，返回取消监听的函数 */
  onMicroAppStateChange: (
    callback: (state: any, prev: any) => void,
    fireImmediately?: boolean
  ) => () => void

  /** ========== UI 相关 ========== */
  /** 容器 DOM 元素（可选，微应用可通过 document.getElementById 自行获取） */
  container?: HTMLElement
}
