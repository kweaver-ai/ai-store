# Contributing

感谢你对本项目的关注！以下是一个非常简洁的贡献流程说明。

---

## 1. 如何开始

1. Fork 本仓库

2. 克隆到本地：

   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

3. 创建功能分支：

   ```bash
   git checkout -b feature/my-feature
   ```

---

## 2. 项目目录结构

- `README.md`：产品与能力概览，快速理解 DIP 的定位
- `hub`: DIP 应用与商店
  - `hub/design/`：产品架构与界面设计稿（PDF），与实现保持一致
  - `hub/backend/`：应用管理后端（FastAPI）
  - `hub/frontend/`：前端代码目录（当前空目录，预留未来实现）
  - `hub/openapi/`：OpenAPI 规范。

---

## 3. 文档驱动的开发

本项目的贡献原则：设计优先。

建议采用：设计文档 + AI 来进行开发。

如果你想要提交新功能，请随代码同步提交更新后的功能设计文档。无论你是否使用AI，**都请务必确保实现和文档的一致**。如此，其他贡献者才能基于功能设计文档持续贡献。请把 **文档是最高级的语言**。

* 所有改动都要通过 **测试** 和 **代码检查**
* 提交前请确保：

  * Python 代码已通过格式化与静态检查
  * TypeScript 代码已通过 lint、format、build / test

---

## 4. 提交信息（Commit Message）

保持简洁明了，使用英文或简短中文均可，推荐格式：

```text
feat: add user login api
fix: incorrect error handling in auth middleware
chore: update dependencies
docs: update contributing guide
```

常用前缀示例：

* `feat:` 新功能
* `fix:` 修复 Bug
* `chore:` 构建配置、依赖等杂项
* `docs:` 文档相关
* `test:` 测试相关
* `refactor:` 代码重构（无功能变化）

---

## 5. 提交 Pull Request

在创建 PR 前，请确保：

1. 所有检查通过：

   * Python 格式化 & 检查命令已执行
   * TypeScript 格式化 & Lint & 测试已通过

2. 本地合并了最新的 `main` 分支：

   ```bash
   git checkout main
   git pull origin main
   git checkout feature/my-feature
   git rebase main
   ```

3. 提交 PR 时，请在描述中包含：

   * 此 PR 的目的（做了什么）
   * 相关 Issue（如有）
   * 任何需要特别注意的变更点

---

## 6. 代码审查（Code Review）

* 维护者可能会提出修改建议，请根据评论进行更新
* 更新 PR 时，建议继续在同一分支上提交新 commit
* 当讨论达成一致并通过检查后，维护者会合并 PR

---

感谢你的贡献！🎉
