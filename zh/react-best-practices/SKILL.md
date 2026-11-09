---
name: react-best-practices-zh
description: 写、改或评审 React 组件时使用。涵盖组件拆分、状态归属、Hooks、Effect、数据请求、渲染和交互性能。SSR 或 RSC 按项目版本查阅。不负责构建配置、TypeScript 类型设计和 CSS 规范。
---

# React 最佳实践

先看目标组件和调用方，确认 React 版本、渲染环境和现有数据层。沿用符合当前版本和运行规则的项目写法，把改动限制在任务需要的范围内。

## 写法

- 保持客户端渲染纯粹。不要在渲染时改外部变量、发起命令式请求或写 DOM。普通 Hook 在组件或自定义 Hook 顶层调用。
- 写 JSX 前先定数据从哪来、谁能改。能直接算的值就不存。需要共享状态时，让最近的共同所有者持有，子组件用 Props 读，用回调请求更新。
- 点击保存就在提交处理函数里发请求。订阅外部数据、注册监听器或启动定时器时，用 Effect 同步，并清理上一次建立的资源。
- 有独立职责或会单独变化的 UI 再拆组件。要复用有状态的行为时抽 Hook，纯计算用普通函数。两段 JSX 看着一样，先看它们会不会因同一个原因改变。
- 查询和缓存沿用项目已有数据层。手写请求时处理失败，并防止旧结果覆盖新结果。
- 组件默认写成 `const A = (props) => {...}`，文件末尾 `export { A }`；入口文件被框架或懒加载要求默认导出时才用 `export default`。
- 按场景处理加载、空结果、失败和键盘操作。

改代码时沿着当前交互看一遍，顺手省掉重复计算和无关更新，保持原有行为。

## 按需读取

普通客户端改动先用上面的规则。遇到具体问题再查对应文档。有业务取舍时先看案例，需要实现细节时再查日常写法。

### 日常写法

| 任务 | 读取文件 |
|---|---|
| 状态归属、派生值、Effect | [state-and-effects.md](references/state-and-effects.md) |
| 组件职责、内部组织、Props 接口和父子通信 | [components.md](references/components.md) |
| 何时抽 Hook、调用规则、参数和返回值 | [hooks.md](references/hooks.md) |
| JSX 写法、DOM、交互和可访问性 | [web-ui.md](references/web-ui.md) |
| 请求触发、缓存和竞态 | [client-data.md](references/client-data.md) |
| 改输入、滚动、长列表或重复计算，或排查渲染卡顿 | [performance.md](references/performance.md) |

### 运行环境与版本

| 任务 | 读取文件 |
|---|---|
| 涉及服务端预渲染或 hydration | [ssr-and-hydration.md](references/ssr-and-hydration.md) |
| 框架实际使用 RSC 或 Server Functions | [server-components.md](references/server-components.md) |
| API 版本差异 | [compatibility.md](references/compatibility.md) |

### 业务案例

| 任务 | 读取文件 |
|---|---|
| 分页、行选择、批量操作 | [data-table.md](references/patterns/data-table.md) |
| 输入搜索、点击搜索、请求竞态 | [search-and-filter.md](references/patterns/search-and-filter.md) |
| 字段联动、动态校验 | [dynamic-form.md](references/patterns/dynamic-form.md) |
| 弹窗开关、提交和焦点恢复 | [dialog-and-modal.md](references/patterns/dialog-and-modal.md) |

## 需要确认的业务行为

动笔前查看项目里的 `skill-memory/react-best-practices.md`，有记录就读相关条目。记录与现状一致就沿用，有冲突就按现状更新。需求、实现和记录都没定，且选择会改变用户看到的结果时再问，例如跨页是否保留已选行。

确认后只记长期有效的决定和一句理由。文件没有就新建，结论变了就更新原条目。
