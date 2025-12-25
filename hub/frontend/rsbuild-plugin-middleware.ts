import type { RsbuildPlugin } from '@rsbuild/core'
import express from 'express'
import axios from 'axios'
import { Agent } from 'https'

/**
 * 开发环境登录和服务转发中间件插件
 */
export function rsbuildMiddlewarePlugin(): RsbuildPlugin {
  return {
    name: 'rsbuild-plugin-middleware',

    setup(rsbuild) {
      // 只在开发环境启用
      if (process.env.NODE_ENV !== 'development') {
        return
      }

      // 获取环境变量
      const DEBUG_ORIGIN = process.env.DEBUG_ORIGIN || 'https://10.4.111.24'

      // 创建 Express 应用
      const app = express()

      // 设置中间件
      app.use(express.json({ limit: '10mb' }))
      app.use(express.urlencoded({ extended: true, limit: '10mb' }))

      // 在服务器启动后设置认证路由
      rsbuild.onAfterStartDevServer((devServer) => {
        // 获取实际端口和中间件
        const server = devServer as any
        const actualPort = server.httpServer?.address()?.port || 3001
        const middlewares = server.middlewares || server

        // 设置认证路由（需要实际端口）
        setupAuthRoutes(app, DEBUG_ORIGIN, actualPort)

        // 挂载中间件到 /api/dip-hub 路径
        // Express 应用可以直接作为中间件使用
        if (middlewares && typeof middlewares.use === 'function') {
          middlewares.use('/api/dip-hub', app)
        }
      })
    },
  }
}

function setupAuthRoutes(
  app: express.Application,
  DEBUG_ORIGIN: string,
  port: string | number
) {
  const PORT = typeof port === 'string' ? parseInt(port, 10) : port
  const ORIGIN = `http://localhost:${PORT}`
  const REDIRECT_URI = `${ORIGIN}/api/dip-hub/v1/login/callback`
  const POST_LOGOUT_REDIRECT_URI = `${ORIGIN}/api/dip-hub/v1/logout/callback`

  let clientCache: any = null

  // 动态获取端口和URI的函数
  const getConfig = () => {
    return { ORIGIN, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI }
  }

  // 注册 OAuth2 客户端
  const registerClient = async () => {
    if (clientCache) return clientCache

    try {
      const config = getConfig()
      const { data } = await axios.post(
        '/oauth2/clients',
        {
          grant_types: ['authorization_code', 'refresh_token', 'implicit'],
          scope: 'offline openid all',
          redirect_uris: [config.REDIRECT_URI],
          post_logout_redirect_uris: [config.POST_LOGOUT_REDIRECT_URI],
          client_name: 'WebDebugClient',
          metadata: {
            device: {
              name: 'WebDebugClient',
              client_type: 'unknown',
              description: 'WebDebugClient',
            },
          },
          response_types: ['token id_token', 'code', 'token'],
        },
        {
          baseURL: DEBUG_ORIGIN,
          httpsAgent: new Agent({ rejectUnauthorized: false }),
        }
      )

      clientCache = data
      console.log('✅ OAuth2 客户端注册成功')
      return data
    } catch (error: any) {
      console.error('❌ OAuth2 客户端注册失败:', error.message)
      return null
    }
  }

  // 登录路由
  app.get('/v1/login', async (req, res) => {
    try {
      const config = getConfig()
      const clientData = await registerClient()
      if (!clientData) {
        return res.status(500).send('OAuth 客户端注册失败')
      }

      const { client_id } = clientData
      const { asredirect } = req.query

      // 将重定向地址编码为 state
      const redirectUrl = (asredirect as string) || ''
      const state = redirectUrl
        ? Buffer.from(decodeURIComponent(redirectUrl)).toString('base64')
        : ''

      // 使用 dip. 前缀保持一致性
      res.cookie('dip.state', state, { httpOnly: true })
      const url = `${DEBUG_ORIGIN}/oauth2/auth?client_id=${client_id}&response_type=code&scope=offline+openid+all&redirect_uri=${encodeURIComponent(
        config.REDIRECT_URI
      )}&state=${encodeURIComponent(state)}&lang=zh-cn`

      res.redirect(url)
    } catch (error: any) {
      console.error('❌ 登录路由错误:', error)
      res.status(500).send('登录处理失败')
    }
  })

  // 登录回调
  app.get('/v1/login/callback', async (req, res) => {
    try {
      const config = getConfig()
      const clientData = await registerClient()
      if (!clientData) {
        return res.status(500).send('OAuth 客户端注册失败')
      }

      const { client_secret, client_id } = clientData
      const { code, state } = req.query
      const params = new URLSearchParams()

      params.append('grant_type', 'authorization_code')
      params.append('code', code as string)
      params.append('redirect_uri', config.REDIRECT_URI)

      const {
        data: { access_token, id_token },
      } = await axios.post(`${DEBUG_ORIGIN}/oauth2/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${encodeURIComponent(client_id)}:${encodeURIComponent(
              client_secret
            )}`
          ).toString('base64')}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      })

      // 使用与后端一致的 cookie 名称（dip. 前缀）
      res.cookie('dip.oauth2_token', access_token, { httpOnly: false })
      // 注意：后端不设置 id_token，但保留以兼容可能的其他用途，使用 dip. 前缀保持一致性
      res.cookie('dip.id_token', id_token, { httpOnly: false })
      res.clearCookie('dip.state')

      // 解码 state 获取重定向地址
      let redirectUrl = '/dip-hub/login-success'
      if (state && typeof state === 'string') {
        try {
          const decodedState = Buffer.from(state, 'base64').toString()
          if (decodedState) {
            // 确保是相对路径
            redirectUrl = decodedState.startsWith('/')
              ? decodedState
              : `/${decodedState}`
          }
        } catch (e) {
          // 忽略解码错误，使用默认重定向地址
        }
      }

      res.redirect(redirectUrl)
    } catch (error: any) {
      console.error('❌ 登录回调错误:', error)
      res.status(500).send('登录回调处理失败')
    }
  })

  // 登出
  app.get('/v1/logout', async (req, res) => {
    // 清除所有使用 dip. 前缀的 cookie，与后端保持一致
    res.clearCookie('dip.oauth2_token')
    res.clearCookie('dip.session_id')
    res.clearCookie('dip.userid')
    res.clearCookie('dip.id_token')
    res.clearCookie('dip.state')
    res.redirect('/api/dip-hub/v1/logout/callback')
  })

  // 登出回调
  app.get('/v1/logout/callback', async (req, res) => {
    res.redirect('/dip-hub/')
  })
}
