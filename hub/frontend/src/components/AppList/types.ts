export enum ModeEnum {
  /** 我的应用 */
  MyApp = 'myApp',
  /** 应用商店 */
  AppStore = 'appStore',
}

export enum MyAppActionEnum {
  /** 固定 */
  Fix = 'fix',
  /** 取消固定 */
  Unfix = 'unfix',
}

export enum AppStoreActionEnum {
  /** 安装 */
  Install = 'install',
  /** 配置 */
  Config = 'config',
  /** 运行 */
  Run = 'run',
  /** 授权管理 */
  Auth = 'auth',
  /** 卸载 */
  Uninstall = 'uninstall',
}

/** 应用列表状态 */
export interface AppListStatus {
  /** 是否加载中 */
  loading: boolean
  /** 是否加载失败 */
  error: string | null
  /** 是否空 */
  empty: boolean
}
