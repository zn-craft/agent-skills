# React Server Components 与 Server Functions

仅在项目明确采用 RSC / Server Functions 且框架提供支持时加载。本文件不等同于通用 SSR 指南。

## 执行模型

- **SSR**：把 React 树输出为 HTML，客户端通常再 hydration。
- **Server Components（RSC）**：在独立的服务端 / 构建环境执行组件，可在服务端访问数据层；不等同于 SSR，也不自动成为客户端可交互组件。
- **Client Components**：包含客户端交互和状态；由框架定义客户端边界，也可能参与 SSR 预渲染。

## Server / Client 边界

- 默认遵循框架的模块边界，避免无必要地扩大客户端 bundle。
- Server Component 可获取服务端数据，并将客户端需要的可序列化数据 / 节点传给 Client Component。
- Client Component 不应直接导入仅能在服务端运行的数据库、文件系统或含密钥模块。
- 事件处理、浏览器 API、客户端 Hooks 放在 Client Component；不要为单个交互无差别地把整页标记为客户端。
- React 19.3 支持 Server Components 直接渲染从客户端模块导入的 Context；Server Components 本身仍不能创建 Context。实际使用以框架支持为准。

## Server Functions / Actions

- `"use server"` 标记的 Server Function 由框架建立调用边界；客户端调用会发起网络请求，不是普通本地函数调用。
- 将 Server Function 视为可被外部触发的服务端入口：服务端重新校验输入、执行身份认证与权限检查，不信任客户端传入的用户 ID 或权限字段。
- 不向客户端暴露密钥、内部数据或不应公开的错误；处理重复提交、失败和数据一致性。
- `useActionState` / `useOptimistic` 是 React Hooks，可参与客户端 Action / Transition；不要将它们定义为“仅服务端 API”。
- Server Functions、表单 Actions、缓存和重验证依赖框架集成；先查当前框架版本文档，不自行假设底层协议。

## 安全提醒

服务端代码不自动安全。每次数据访问都应执行授权；所有外部输入都要验证；隐藏按钮不能代替服务端权限控制。关注框架与 React Server Components 包的安全公告，及时升级受影响版本。
