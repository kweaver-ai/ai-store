import error_zh from './error/zh-CN.json'
import global_zh from './global/zh-CN.json'

import error_tw from './error/zh-TW.json'
import global_tw from './global/zh-TW.json'

import error_en from './error/en-US.json'
import global_en from './global/en-US.json'

const zh_CN = {
  ...error_zh,
  ...global_zh,
}

const zh_TW = {
  ...error_tw,
  ...global_tw,
}

const en_US = {
  ...error_en,
  ...global_en,
}

const locales = {
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
  'en-US': en_US,
}

export default locales
