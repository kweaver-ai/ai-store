import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginSvgr } from '@rsbuild/plugin-svgr'

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  server: {
    port: 3001,
    // 配置代理，解决远程微应用 CORS 问题
    // 将 /micro-app-proxy/* 的请求代理到远程服务器
    proxy: {
      '/micro-app-proxy': {
        target: 'https://10.4.111.16',
        changeOrigin: true, // 修改请求头中的 origin
        secure: false, // 如果是自签名证书或内网环境，设置为 false
        // 重写路径：移除 /micro-app-proxy 前缀
        pathRewrite: {
          '^/micro-app-proxy': '',
        },
      },
    },
  },
  plugins: [pluginReact(), pluginLess(), pluginSvgr()],
  source: {
    // 配置 antd 按需加载（antd 6.0 使用 CSS-in-JS，自动按需加载）
    transformImport: [
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: false, // antd 6.0 使用 CSS-in-JS，不需要加载 CSS
      },
      {
        libraryName: 'lodash',
        customName: 'lodash/{{ member }}',
      },
    ],
  },
  resolve: {
    alias: {
      '@': './src',
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
})
