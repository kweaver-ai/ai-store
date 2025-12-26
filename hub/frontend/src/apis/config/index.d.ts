/**
 * 应用配置响应数据
 */
export interface AppConfigResponse {
  language: string
  [key: string]: any
}

/**
 * OEM 配置信息
 */
export interface OEMConfig {
  'background.png': string
  'darklogo.png': string
  'defaultBackground.png': string
  'desktopDefaultBackground.png': string
  homePageSlogan: string
  'logo.png': string
  'org.png': string
  portalBanner: string
  product: string
  'regularBackground.png': string
  'regularLiveBackground.gif': string
  'title.png': string
}
