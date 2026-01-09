# DIP 企业级 AI 应用平台 / DIP Enterprise AI Application Platform

DIP 是 KWeaver 生态的一部分。如果您喜欢这个项目，欢迎也给 **[KWeaver](https://github.com/kweaver-ai/kweaver)** 项目点个 ⭐！

## 产品架构 / Product Architecture

DIP 是企业级 AI 应用平台。DIP 由应用开发、应用发现和应用消费三大核心能力组成。

DIP is an enterprise AI application platform. DIP consists of three core capabilities: application development, application discovery, and application consumption.

### 应用消费 / Application Consumption

- **我的应用 / My Applications**
  - 运行应用 → 应用实例 / Run Application → Application Instance
- **授权应用给用户 / Authorize Applications to Users**

### 应用发现 / Application Discovery

- **AI 应用商店 / AI Application Store**
  - 安装应用 → 应用管理 / Install Application → Application Management
- **发布应用到 AI 应用商店 / Publish Application to AI Application Store**

### 应用开发 / Application Development

- **项目管理 / Project Management**
- **ChatKit SDK**

## 核心能力模块 / Core Capability Modules

### 1. 应用开发 / Application Development

面向应用开发者，以项目来管理应用的开发、调试、上传和发布，并提供 ChatKit SDK 供开发者将 AI 组件集成到现有 Web 应用中。

Targeted at application developers, it manages application development, debugging, upload, and publishing through projects, and provides ChatKit SDK for developers to integrate AI components into existing Web applications.

应用开发包含以下两个模块：

Application development includes the following two modules:

- **项目管理 / Project Management**：管理应用的开发、调试、上传和发布 / Manage application development, debugging, upload, and publishing
- **ChatKit SDK**：供开发者将 AI 组件集成到现有 Web 应用中 / Enable developers to integrate AI components into existing Web applications

### 2. 应用发现 / Application Discovery

面向应用管理者，提供应用浏览和安装能力。

Targeted at application administrators, it provides application browsing and installation capabilities.

应用发现包含以下两个模块：

Application discovery includes the following two modules:

- **应用商店 / Application Store**：提供应用浏览和安装能力 / Provide application browsing and installation capabilities
- **应用管理 / Application Management**：管理已安装的应用 / Manage installed applications

### 3. 应用消费 / Application Consumption

面向终端用户，提供权限范围内的应用查看、运行能力。

Targeted at end users, it provides application viewing and running capabilities within authorized permissions.

应用消费包含：

Application consumption includes:

- **我的应用 / My Applications**：查看和管理已授权的应用 / View and manage authorized applications
- **运行应用 / Run Application**：创建和管理应用实例 / Create and manage application instances
- **授权应用给用户 / Authorize Applications to Users**：管理应用权限 / Manage application permissions
