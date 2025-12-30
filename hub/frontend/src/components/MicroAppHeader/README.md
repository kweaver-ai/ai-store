# MicroAppHeader 组件

## 1. 组件介绍

### 组件用途

微应用壳导航头组件，专门用于微应用容器路由场景（`/application/:appId/*`）。提供统一的导航体验，包括应用菜单、面包屑导航、Copilot 按钮和用户信息。

### 整体结构

组件采用左右布局结构：

- **左侧区域**：应用菜单（AppMenu）+ 面包屑导航（Breadcrumb）
- **右侧区域**：Copilot 按钮（CopilotButton，仅微应用路由显示）+ 用户信息（UserInfo）

### 使用场景

- 仅在微应用容器路由下使用（`/application/:appId/*`）
- 通过路由的 `handle.layout.hasHeader` 配置控制是否显示
- 不支持 headless 微应用（headless 微应用不显示任何壳层组件）

## 2. 组件结构

### 文件列表

```
MicroAppHeader/
├── index.tsx              # 主组件，负责状态管理和布局
├── AppMenu/              # 应用菜单子组件
│   └── index.tsx
├── Breadcrumb/           # 面包屑导航子组件
│   └── index.tsx
├── CopilotButton/        # Copilot 按钮子组件
│   └── index.tsx
├── UserInfo/             # 用户信息子组件
│   └── index.tsx
└── README.md             # 本文档
```

### 文件说明

- **index.tsx**：主组件，负责监听微应用全局状态、构建面包屑数据、处理导航跳转和 Copilot 事件
- **AppMenu/index.tsx**：应用菜单下拉组件，点击加载应用列表并支持跳转
- **Breadcrumb/index.tsx**：面包屑导航组件，显示首页图标、微应用信息和微应用传递的面包屑
- **CopilotButton/index.tsx**：Copilot 按钮组件，点击时通过全局状态通知微应用
- **UserInfo/index.tsx**：用户信息组件，显示用户头像和名称，支持退出登录

## 3. 交互设计

### 3.1 Figma 设计稿链接

`https://www.figma.com/design/kHfaKWb2UqWz9Nf8FyaKMv/Copilot?node-id=4-2&t=vKvWASWezhVgNNLX-4`

### 3.2 布局结构

- **整体布局**：水平布局，左右分布
- **高度**：固定高度 `52px`
- **背景**：白色背景，底部边框 `border-gray-200`
- **内边距**：水平方向 `12px`（`px-3`）
- **间距**：左侧和右侧内部元素间距 `16px`（`gap-x-4`）

### 3.3 交互行为

#### 应用菜单（AppMenu）

- **触发方式**：点击菜单图标按钮
- **加载时机**：点击时才触发应用列表加载（手动加载模式）
- **菜单行为**：点击菜单项后，以新标签页形式打开对应微应用
- **加载状态**：加载时按钮禁用

#### 面包屑导航（Breadcrumb）

- **结构组成**：
  1. 首页图标：点击跳转到 `/`
  2. 微应用根节点：显示微应用图标和名称，点击跳转到微应用基础路由
  3. 微应用面包屑：由微应用通过全局状态传递，点击跳转到对应路径
- **最后一项**：不可点击，仅显示当前页面名称
- **路径处理**：微应用传递的相对路径会自动拼接 `routeBasename` 前缀

#### Copilot 按钮（CopilotButton）

- **显示条件**：仅在微应用路由且存在 `currentMicroApp` 时显示
- **点击行为**：通过全局状态通知微应用 Copilot 被点击事件
- **事件结构**：`{ copilot: { clickedAt: Date.now() } }`

#### 用户信息（UserInfo）

- **显示内容**：用户头像图标 + 用户名称（`vision_name`）
- **交互方式**：点击下拉菜单
- **菜单项**：退出登录

### 3.4 外部链接/跳转

- **应用菜单跳转**：`/application/${app.id}`（新标签页）
- **面包屑跳转**：使用 React Router 的 `navigate` 进行路由跳转

## 4. 代码实现

### 4.1 Props 接口

组件不接受任何 props，所有数据通过以下方式获取：

- **路由信息**：通过 `useLocation()` 和 `useNavigate()` 获取
- **微应用信息**：通过 `useMicroAppStore()` 获取 `currentMicroApp`
- **全局状态**：通过 `onMicroAppGlobalStateChange()` 监听微应用传递的面包屑数据

### 4.2 默认行为

- **初始化状态**：面包屑为空数组，仅在微应用路由下才监听全局状态
- **路由检测**：通过 `location.pathname.startsWith('/application/')` 判断是否为微应用路由
- **自动清理**：离开微应用路由时自动清空面包屑数据并取消监听

### 4.3 数据加载

#### 微应用信息

- **数据来源**：`useMicroAppStore()` 中的 `currentMicroApp`
- **Store 位置**：`/src/stores/microAppStore.ts`
- **加载时机**：由 `MicroAppContainer` 组件在加载微应用时设置

#### 面包屑数据

- **数据来源**：微应用通过全局状态传递的 `breadcrumb` 字段
- **接口位置**：`/src/utils/micro-app/globalState.ts`
- **加载时机**：组件挂载后监听全局状态变化，使用 `fireImmediately: true` 立即获取当前状态
- **数据格式**：
  ```typescript
  interface BreadcrumbItem {
    key?: string
    name: string
    path?: string // 微应用内部相对路径，如 '/alarm' 或 'alarm'
    icon?: string
  }
  ```

#### 路径处理逻辑

微应用传递的面包屑路径会被自动处理：

- 如果路径以 `/` 开头，会去掉前导斜杠
- 统一拼接 `routeBasename` 前缀（如 `/dip-hub/application/:appId`，包含 BASE_PATH 前缀）
- 示例：
  - 微应用传递：`{ path: '/alarm', name: '告警' }`
  - 最终路径：`/dip-hub/application/:appId/alarm`
  - 微应用传递：`{ path: 'alarm', name: '告警' }`
  - 最终路径：`/dip-hub/application/:appId/alarm`

**注意**：`routeBasename` 包含 `/dip-hub` 前缀，因为微应用的路由系统是独立的，需要知道浏览器中的完整路径才能正确匹配路由。

### 4.4 样式规范

- **样式方案**：主要使用 Tailwind CSS
- **关键样式**：
  - 高度：`h-[52px]`
  - 背景：`bg-white`
  - 边框：`border-b border-gray-200`
  - 间距：`px-3`（水平内边距）、`gap-x-4`（元素间距）
- **特殊样式**：
  - 面包屑项 hover 效果：`hover:bg-black/4 transition-colors duration-200`
  - Copilot 按钮阴影：`shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)]`

### 4.5 性能优化

- **useMemo**：面包屑项数组使用 `useMemo` 缓存，依赖 `isMicroAppRoute`、`currentMicroApp`、`microAppBreadcrumb`
- **useCallback**：导航跳转和 Copilot 点击处理函数使用 `useCallback` 优化
- **条件渲染**：Copilot 按钮仅在微应用路由下渲染
- **自动清理**：`useEffect` 返回清理函数，确保离开微应用路由时取消监听

## 5. 注意事项

### 5.1 特殊逻辑

#### 面包屑路径拼接

- 微应用传递的路径视为「微应用内部路径」，需要统一挂载到 `routeBasename` 之下
- `routeBasename` 包含 `/dip-hub` 前缀（如 `/dip-hub/application/:appId`），因为微应用的路由系统是独立的，需要知道浏览器中的完整路径才能正确匹配路由
- 路径处理时会去掉前导斜杠，统一按相对路径处理
- 如果路径为空，则使用 `routeBasename` 作为完整路径

#### 全局状态监听

- 使用 `fireImmediately: true` 确保组件挂载时立即获取当前状态
- 监听器会在组件卸载或离开微应用路由时自动取消
- 全局状态管理器有最大监听器数量限制（50 个），防止内存泄漏

#### Copilot 事件通知

- 主应用通过 `setMicroAppGlobalState` 设置 `copilot` 字段
- 使用 `allowAllFields: true` 选项允许主应用更新所有字段
- 微应用需要在 `props.onMicroAppStateChange` 中监听 `state.copilot` 字段

### 5.2 边界情况

- **无微应用信息**：如果 `currentMicroApp` 为 `null`，面包屑中不会显示微应用根节点
- **空面包屑数据**：如果微应用未传递面包屑或传递空数组，只显示首页图标和微应用根节点
- **非微应用路由**：在非微应用路由下，组件不监听全局状态，面包屑为空
- **路径缺失**：如果面包屑项的 `path` 为空，点击时不会进行跳转

### 5.3 依赖关系

- **路由系统**：依赖 React Router 的 `useNavigate` 和 `useLocation`
- **状态管理**：
  - `useMicroAppStore`：获取当前微应用信息
  - `onMicroAppGlobalStateChange`：监听微应用全局状态
  - `setMicroAppGlobalState`：设置全局状态（Copilot 事件）
- **子组件**：依赖 `AppMenu`、`Breadcrumb`、`CopilotButton`、`UserInfo` 子组件

### 5.4 已知问题

- 暂无已知问题

## 6. 使用示例

### 在路由配置中使用

```typescript
// src/routes/index.tsx
{
  path: 'application/:appId/*',
  element: <MicroAppContainer />,
  handle: {
    layout: {
      hasSider: false,
      hasHeader: true,  // 启用 MicroAppHeader
    },
  },
}
```

### 微应用传递面包屑

```typescript
// 微应用代码
props.setMicroAppState({
  breadcrumb: [
    { key: 'alarm', name: '告警与故障分析', path: '/alarm' },
    { key: 'problem', name: '问题', path: '/alarm/problem' },
  ],
})
```

### 微应用监听 Copilot 事件

```typescript
// 微应用代码
props.onMicroAppStateChange((state) => {
  if (state.copilot?.clickedAt) {
    // 处理 Copilot 点击事件
    console.log('Copilot clicked at:', state.copilot.clickedAt)
  }
}, true)
```
