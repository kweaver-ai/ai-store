# API 目录结构规范

## 目录组织

1. **通用类型定义**：放在 `apis/types.ts` 文件里（如 `PageParams`、`ListResponse` 等）
2. **服务划分**：按照后端服务划分文件夹（如 `dip-hub`、`auth`、`micro-app` 等）

## 文件夹结构

每个服务文件夹下**必须**包含以下两个基础文件：

### 必需文件

- **`index.ts`**：声明该服务相关的接口请求方法

  - 可以直接在文件中编写所有接口方法
  - 也可以按功能模块拆分到单独文件（如 `applications.ts`），然后在 `index.ts` 中统一导出
  - 示例：

    ```typescript
    // 方式一：直接编写
    export function getApplications() { ... }

    // 方式二：拆分后统一导出
    export * from './applications'
    ```

- **`index.d.ts`**：声明接口请求和返回相关的数据结构（TypeScript 类型定义）
  - 导出该服务相关的所有类型接口
  - 示例：
    ```typescript
    export interface Application { ... }
    export interface User { ... }
    ```

### 可选文件

- **功能模块文件**（如 `applications.ts`、`users.ts` 等）：当接口方法较多时，可以按功能模块拆分
  - 在功能模块文件中编写具体的接口请求方法
  - 在 `index.ts` 中统一导出，保持对外接口的一致性

## 示例结构

```
apis/
├── types.ts              # 通用类型定义
├── dip-hub/
│   ├── index.ts          # 统一导出入口
│   ├── index.d.ts        # 类型定义
│   └── applications.ts   # 应用相关接口（可选）
├── auth/
│   ├── index.ts          # 接口请求方法
│   └── index.d.ts        # 类型定义
└── micro-app/
    ├── index.ts          # 接口请求方法
    └── index.d.ts        # 类型定义
```
