---
name: typescript-best-practices-zh
description: TypeScript 的类型建模与写法决策。新建、修改、评审或重构 TS 代码时使用：类型怎么建（interface / type / 联合 / 枚举 / as const）、unknown 怎么收窄、any 与断言怎么过渡、错误与领域概念怎么用类型表达、严格度怎么取舍，以及 .tsx 的 Props / 事件 / ref / 泛型组件类型。不负责通用 JS 风格、模块目录、JSX 渲染和 tsconfig / lint 配置。
---

# TypeScript 最佳实践

每条规则都落到判据上：什么情况这么做、什么信号说明写坏了、怎么改。动笔前先看工程现状：`tsconfig` 严格度、命名风格、`interface` 与 `type` 的用法、类型目录和路径别名；工程已有约定时按工程来，这里只做兜底。

## 写法

- 对象结构用 `interface`，联合、交叉、映射、条件类型用 `type`；对象契约（含 schema 派生）加 `I` 前缀，`enum` 加 `E` 前缀，联合、工具与键名类型不加。
- 外部数据从 `unknown` 起步，用 type guard 收窄；不写 `any`，不用 `!` 和 `@ts-ignore`。
- 导出的函数写返回类型；本模块的类型与取值定义（`interface`、`type`、`enum`、`as const` 取值表）默认写进 `xxx.type.ts`，不要求被两处引用才拆；`declare` 与第三方补声明写进 `xxx.d.ts`，函数与类留在实现文件。
- 补类型不动业务逻辑、不加新依赖；工程没开 `strict` 时，只保证改动的文件按严格写法写。
- 文件是 `.tsx` 时只处理类型：Props、事件、ref、泛型组件；组件拆分、状态、Hooks、Effect 与渲染行为不归这里。
- 不擅自升级规则版本、改 `tsconfig` 严格度，或成批重排类型文件，这些会牵动全量代码。

## 按需读取

先按上面的规则写。遇到具体问题再查对应文档，有业务取舍先看案例。

### 日常写法

| 任务 | 读取文件 |
| --- | --- |
| 类型怎么建、放在哪、领域概念、泛型与工具类型用到什么程度 | [type-modeling.md](references/type-modeling.md) |
| `any` 怎么过渡、`unknown` 怎么收窄、断言与兜底分支、错误与异步失败 | [type-safety.md](references/type-safety.md) |
| 类型命名、`import type` 与 `export type`、类成员修饰符与函数参数 | [naming-and-declaration.md](references/naming-and-declaration.md) |
| `.tsx` 里组件 Props、事件、ref 与泛型组件的类型怎么标 | [jsx-types.md](references/jsx-types.md) |

### 业务案例

| 任务 | 读取文件 |
| --- | --- |
| 接口响应从 `unknown` 收到领域对象的整条链路 | [api-response.md](references/patterns/api-response.md) |
| 订单、流程的状态取值与允许的流转怎么建模 | [state-machine.md](references/patterns/state-machine.md) |
| 给存量模块逐处收窄 `any`，不扩大 diff | [legacy-any.md](references/patterns/legacy-any.md) |
| 用 `satisfies` 写配置对象和常量表 | [config-object.md](references/patterns/config-object.md) |

## 需要用户拍板时

- 先读 `skill-memory/typescript-best-practices.md`，命中就照做，不再问。
- 要问的：严格项怎么收、存量 `any` 收到什么范围、类型要不要单独抽文件、继承层次要不要拆。
- 只在这类答案会影响多处代码时问；问完把结论和一句理由写进该文件，不抄对话。
- 其余按代码现状定：命名、局部类型拆不拆、某个 `as` 留不留，以及工程里已有的同类决定（已有类型文件、已在用枚举）。
