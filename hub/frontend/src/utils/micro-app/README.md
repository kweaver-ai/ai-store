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
  }

  /** ========== 语言 ========== */
  /** 当前语言（如 zh-CN, en-US） */
  language: string

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
    language,
    setMicroAppState,
    onMicroAppStateChange,
    container,
  } = props

  // 访问 token
  const accessToken = token.accessToken
  const newToken = await token.refreshToken()

  // 访问路由信息
  const routeBasename = route.basename

  // 访问用户信息
  const userId = user.id
  const userName = user.name

  // 监听全局状态变化（返回取消监听的函数）
  const unsubscribe = onMicroAppStateChange((state, prev) => {
    if (state.language !== prev.language) {
      // 语言变化处理
      console.log('Language changed:', state.language)
    }
  }, true) // true 表示立即执行一次

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

## 注意事项

1. **appName 必须一致**：微应用配置的 `name` 必须与 package.json 中的 name 保持一致
2. **字段白名单**：微应用只能更新 `allowedFields` 中允许的字段（当前只有 `breadcrumb`），其他字段只能由主应用更新
3. **函数命名**：使用 `setMicroAppState` / `onMicroAppStateChange`（微应用）和 `setMicroAppGlobalState` / `onMicroAppGlobalStateChange`（主应用）
4. **状态初始化**：全局状态的 `lang` 字段会在初始化时从 `languageStore` 读取，支持从 localStorage 恢复
5. **微应用信息**：微应用信息（name、displayName、routeBasename）存储在 `microAppStore` 中，不会传递给微应用
6. **取消监听**：`onMicroAppStateChange` 返回取消监听的函数，组件卸载时应该调用以清理资源
