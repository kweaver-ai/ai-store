# 微应用集成方案

## 技术选型

- **微前端框架**：qiankun 2.x
- **设计原则**：主应用定义标准，微应用适配主应用
- **全局状态管理**：自定义实现（替代 qiankun 的 `globalState`，qiankun 3.0 将移除此功能）

---

## 微应用加载方式

1. 微应用通过配置的 `entry` 入口加载，如 `http://localhost:8081`
2. 每个微应用需要导出标准的 qiankun UMD 生命周期：
   - `bootstrap()`
   - `mount(props)`
   - `unmount(props)`

---

## 路由约定

微应用统一挂载在：

- `/application/:appKey/*`
- 其中 `:appKey` 为微应用的应用包唯一标识（对应 `Application.key`）
- 采用 History 模式

---

## 传递给微应用的 Props

所有微应用必须按照 `MicroAppProps` 接口接收 props，主应用统一传递此结构。

### `MicroAppProps` 接口定义

```typescript
interface MicroAppProps {
  /** ========== 认证相关 ========== */
  token: {
    /** 访问令牌（accessToken），使用 getter，每次访问时都从 Cookie 读取最新值 */
    get accessToken(): string
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
    /** 用户名称，使用 getter，每次访问时都从 store 读取最新值 */
    get name(): string
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
  /** 容器 DOM 元素 */
  container: HTMLElement
}
```

### 微应用使用示例

```javascript
export async function mount(props) {
  // 使用标准化的 props
  const {
    token,
    route,
    user,
    renderAppMenu,
    renderUserInfo,
    setMicroAppState,
    onMicroAppStateChange,
    container,
  } = props

  // 访问 token（每次访问都会获取最新值）
  const accessToken = token.accessToken
  // 刷新 token（刷新后，下次访问 token.accessToken 时会自动获取最新值）
  const newToken = await token.refreshToken()
  // 刷新后再次访问，会自动获取最新的 token
  const latestToken = token.accessToken

  // 访问路由信息
  const routeBasename = route.basename

  // 访问用户信息（每次访问都会获取最新值）
  const userId = user.id
  const userName = user.name // 使用 getter，每次访问都获取最新值

  // 使用主应用提供的 UI 组件
  // 这些组件在主应用的 React 上下文中渲染，使用 ReactDOM.createRoot 渲染到微应用指定的容器
  // 这样可以确保组件在主应用的 React 上下文中渲染，可以访问主应用的 store 和 hooks
  //
  // 注意：需要在组件中使用 useRef 和 useEffect 来调用渲染函数
  // 示例代码见下方

  // 监听全局状态变化（返回取消监听的函数）
  // fireImmediately: true 表示立即执行一次，可以获取初始语言值
  let currentLanguage = 'zh-CN' // 默认值
  const unsubscribe = onMicroAppStateChange((state, prev) => {
    // 语言变化处理（通过全局状态监听获取语言，包括初始值）
    if (
      state.language !== prev.language ||
      state.language !== currentLanguage
    ) {
      currentLanguage = state.language
      console.log('Language changed:', state.language)
      // 更新微应用的国际化配置
    }

    // Copilot 点击事件处理
    if (state.copilot !== prev.copilot && state.copilot?.clickedAt) {
      console.log('Copilot clicked at:', state.copilot.clickedAt)
      // 处理 Copilot 点击事件
    }
  }, true) // true 表示立即执行一次，获取初始语言值

  // 组件卸载时取消监听
  // unmount() {
  //   unsubscribe()
  // }
}
```

---

## 全局状态管理

### `MicroAppGlobalState` 结构

```typescript
interface MicroAppGlobalState {
  /** 当前语言，如 zh-CN / en-US（仅主应用可更新，初始化时从 languageStore 读取） */
  language: string
  /** 面包屑导航数据（微应用可更新） */
  breadcrumb?: Array<{
    key?: string
    name: string
    path?: string
    icon?: string
  }>
  /** Copilot 相关状态（仅主应用可更新，用于通知微应用 Copilot 事件） */
  copilot?: {
    clickedAt?: number
    [key: string]: any
  }
  /** 预留扩展字段 */
  [key: string]: any
}
```

**注意**：微应用信息（name、displayName、routeBasename）存储在 `microAppStore` 中，不在 globalState 中。

### 字段更新权限

- **微应用只能更新**：`allowedFields` 中允许的字段（当前仅 `breadcrumb`）
- **主应用可以更新**：所有字段（如 `language`、`copilot`）

当前允许微应用更新的字段：

- `breadcrumb`：面包屑导航数据

### 微应用更新全局状态

```javascript
// 通过 props
props.setMicroAppState({
  breadcrumb: [
    { key: 'dashboard', name: '仪表盘', path: '/dashboard' },
    { key: 'detail', name: '数据详情', path: '/dashboard/detail' },
  ],
})

// 清空面包屑
props.setMicroAppState({
  breadcrumb: [],
})
```

**注意**：微应用只能更新 `allowedFields` 中允许的字段（当前只有 `breadcrumb`），其他字段会被过滤并在开发环境下输出警告。

### 主应用更新全局状态

```typescript
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'

// 主应用更新语言或 Copilot 状态（需要传入 allowAllFields: true）
setMicroAppGlobalState(
  {
    language: 'en-US',
    copilot: { clickedAt: Date.now() },
  },
  { allowAllFields: true }
)
```

**注意**：

- 主应用必须传入 `{ allowAllFields: true }` 才能更新所有字段
- 微应用调用时不需要传入此选项，会自动过滤不允许的字段
- 状态更新会进行浅比较，如果状态未变化，不会触发监听器（性能优化）

### 监听全局状态变化

```javascript
// 在微应用中监听（返回取消监听的函数）
const unsubscribe = props.onMicroAppStateChange((state, prev) => {
  // 语言变化
  if (state.language !== prev.language) {
    // 处理语言切换
  }

  // 面包屑变化
  if (state.breadcrumb !== prev.breadcrumb) {
    // 处理面包屑更新
  }

  // Copilot 事件
  if (state.copilot !== prev.copilot && state.copilot?.clickedAt) {
    // 处理 Copilot 点击
  }
}, true) // true 表示立即执行一次

// 组件卸载时取消监听
// unmount() {
//   unsubscribe()
// }
```

```typescript
// 在主应用中监听
import { onMicroAppGlobalStateChange } from '@/utils/micro-app/globalState'

useEffect(() => {
  const unsubscribe = onMicroAppGlobalStateChange((state, prev) => {
    // 处理状态变化
  }, true) // true 表示立即执行一次

  return () => {
    unsubscribe() // 清理监听器
  }
}, [])
```

---

## 主应用配置

### 微应用配置

```typescript
interface MicroAppConfig {
  /** 应用名称，必须与 package.json 中的 name 保持一致 */
  name: string
  /** 应用入口 URL */
  entry: string
}
```

---

## 面包屑导航实现

### 子应用端实现

在路由守卫或路由变化时更新面包屑（仅需关心「微应用内部路径」）：

```javascript
// 通过 props
props.setMicroAppState({
  breadcrumb: [
    { key: 'alarm', name: '告警与故障分析', path: '/alarm' },
    { key: 'problem', name: '问题', path: '/alarm/problem' },
  ],
})
```

主应用会自动将这些路径挂载到 `route.basename` 之下，例如：

- `route.basename = /application/app-1`
- `/alarm` -> `/application/app-1/alarm`
- `/alarm/problem` -> `/application/app-1/alarm/problem`

### 主应用端实现

主应用在 `MicroAppHeader` 组件中自动监听并渲染（简化示意，实际实现见代码）：

```typescript
import { onMicroAppGlobalStateChange } from '@/utils/micro-app/globalState'
import { useMicroAppStore } from '@/stores'

const MicroAppHeader = () => {
  const { currentMicroApp } = useMicroAppStore()
  const [microAppBreadcrumb, setMicroAppBreadcrumb] = useState([])

  useEffect(() => {
    const unsubscribe = onMicroAppGlobalStateChange((state) => {
      if (state.breadcrumb) {
        setMicroAppBreadcrumb(state.breadcrumb)
      }
    }, true)

    return () => {
      unsubscribe()
    }
  }, [])

  // 这里会先插入一条“微应用根”项（应用图标+名称），
  // 再把微应用上报的 breadcrumb 映射到 /application/:appKey/... 下
  // 最终通过 Breadcrumb 组件渲染（内部自动加首页图标）
}
```

---

## Props 更新机制

### 使用 Getter 的字段（无需更新 props）

以下字段使用 getter 实现，每次访问时都会获取最新值，无需更新 props：

- **`token.accessToken`**：每次访问时从 Cookie 读取最新值

  - Token 刷新后，下次访问 `token.accessToken` 时会自动获取最新值
  - 微应用无需监听 token 变化，直接访问即可获取最新值

- **`user.name`**：每次访问时从 store 读取最新值
  - 用户名称变化后，下次访问 `user.name` 时会自动获取最新值
  - 微应用无需监听用户名称变化，直接访问即可获取最新值

### 通过全局状态管理的字段（需要监听变化）

以下字段完全通过全局状态管理传递，微应用需要通过监听获取：

- **`language`**：通过 `onMicroAppStateChange` 获取初始值和变化
  - 推荐：在 `mount` 时通过 `onMicroAppStateChange(callback, true)` 获取初始值
  - `fireImmediately: true` 会在注册监听时立即执行一次，可以获取当前语言值
  - 后续语言变化也会通过同一个监听器通知

### UI 组件渲染函数

主应用提供了一些 UI 组件的渲染函数，微应用可以调用这些函数来渲染主应用的组件：

- **`renderAppMenu(container)`**：渲染应用菜单组件（AppMenu）到指定容器

  - 参数：`container` - 容器元素（HTMLElement）或容器元素 ID（string）
  - 使用 `ReactDOM.createRoot` 在主应用的 React 上下文中渲染到微应用指定的容器
  - 组件在主应用的 React 上下文中渲染，可以访问主应用的 store 和 hooks
  - 点击菜单项会在新标签页打开对应的应用
  - 主应用会自动管理渲染实例的生命周期，微应用卸载时会自动清理

- **`renderUserInfo(container)`**：渲染用户信息组件（UserInfo）到指定容器
  - 参数：`container` - 容器元素（HTMLElement）或容器元素 ID（string）
  - 使用 `ReactDOM.createRoot` 在主应用的 React 上下文中渲染到微应用指定的容器
  - 组件在主应用的 React 上下文中渲染，可以访问主应用的 store 和 hooks
  - 显示当前登录用户的头像和名称，点击可以退出登录
  - 主应用会自动管理渲染实例的生命周期，微应用卸载时会自动清理

**使用示例**：

```javascript
import React, { useRef, useEffect } from 'react'
import { Layout } from 'antd'

const { Header } = Layout

function MyHeader({ renderAppMenu, renderUserInfo }) {
  const appMenuContainerRef = useRef(null)
  const userInfoContainerRef = useRef(null)

  // 在容器准备好后渲染主应用的组件
  useEffect(() => {
    if (appMenuContainerRef.current) {
      renderAppMenu(appMenuContainerRef.current)
    }

    return () => {
      // 清理函数：组件卸载时清理渲染
      // 注意：主应用会自动清理，这里只是清空容器内容
      if (appMenuContainerRef.current) {
        appMenuContainerRef.current.innerHTML = ''
      }
    }
  }, [renderAppMenu])

  useEffect(() => {
    if (userInfoContainerRef.current) {
      renderUserInfo(userInfoContainerRef.current)
    }

    return () => {
      if (userInfoContainerRef.current) {
        userInfoContainerRef.current.innerHTML = ''
      }
    }
  }, [renderUserInfo])

  return (
    <Header>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* 左侧：应用菜单 */}
        <div ref={appMenuContainerRef} />

        {/* 右侧：用户信息 */}
        <div ref={userInfoContainerRef} />
      </div>
    </Header>
  )
}
```

**或者使用元素 ID**：

```javascript
// 如果容器有固定的 ID
useEffect(() => {
  renderAppMenu('app-menu-container')
  renderUserInfo('user-info-container')
}, [renderAppMenu, renderUserInfo])

// JSX
<div>
  <div id="app-menu-container" />
  <div id="user-info-container" />
</div>
```

**注意事项**：

- 这些渲染函数在主应用的 React 上下文中执行，使用 `ReactDOM.createRoot` 渲染
- 必须传入一个有效的容器元素（HTMLElement）或容器元素 ID（string）
- 组件会自动响应主应用的状态变化（如用户信息更新）
- 主应用会自动管理渲染实例的生命周期，微应用卸载时会自动清理所有渲染实例
- 如果容器元素不存在，函数会输出警告并返回，不会抛出错误
- 多次调用同一个容器的渲染函数时，会自动清理旧的渲染实例

### 微应用重新加载的触发条件

微应用只会在以下情况重新加载（卸载并重新挂载）：

- **应用配置变化**：`app.name` 或 `app.entry` 变化
- **用户切换**：`user.id` 变化（不同用户登录）
- **路由基础路径变化**：`route.basename` 变化

**不会导致重新加载的情况**：

- ✅ Token 刷新（通过 getter 实时获取）
- ✅ 用户名称变化（通过 getter 实时获取）
- ✅ 语言切换（通过全局状态管理通知，微应用通过 `onMicroAppStateChange` 监听）
- ✅ 其他全局状态变化（通过 `onMicroAppStateChange` 通知）
- ✅ UI 组件渲染（使用 `ReactDOM.createRoot` 在主应用上下文中渲染，不影响微应用生命周期）

---

## 注意事项

1. **appName 必须一致**：微应用配置的 `name` 必须与 package.json 中的 name 保持一致
2. **字段白名单**：微应用只能更新 `allowedFields` 中允许的字段（当前只有 `breadcrumb`），其他字段只能由主应用更新
3. **函数命名**：使用 `setMicroAppState` / `onMicroAppStateChange`（微应用）和 `setMicroAppGlobalState` / `onMicroAppGlobalStateChange`（主应用）
4. **状态初始化**：全局状态的 `language` 字段会在初始化时从 `languageStore` 读取，支持从 localStorage 恢复
5. **微应用信息**：微应用信息（name、displayName、routeBasename）存储在 `microAppStore` 中，不会传递给微应用
6. **取消监听**：`onMicroAppStateChange` 返回取消监听的函数，组件卸载时应该调用以清理资源
7. **Token 刷新**：Token 刷新后，微应用通过 `token.accessToken` 访问时会自动获取最新值，无需更新 props
8. **语言获取**：语言不再通过 props 传递，微应用必须在 `mount` 时通过 `onMicroAppStateChange(callback, true)` 获取初始值和监听变化
9. **UI 组件渲染**：`renderAppMenu` 和 `renderUserInfo` 需要传入容器元素，使用 `useRef` 和 `useEffect` 在容器准备好后调用。主应用会自动管理渲染实例的生命周期
10. **React 上下文隔离**：UI 组件渲染函数使用 `ReactDOM.createRoot` 在主应用的 React 上下文中渲染，确保组件可以正常使用主应用的 hooks 和 store
