---
name: js-module-structure-zh
description: 规划 JS/TS 前端应用、组件库和工具库的模块目录、文件职责、代码归属和导出关系。新建、拆分、移动或重组模块、组件和文件，或者调整现有文件职责及 import/export 时使用。后端项目不适用。
---

# JS/TS 模块化目录结构

只决定内容放在哪个文件、文件如何拆分，以及模块如何导出和引用。类型如何建模、组件和业务逻辑如何实现、样式值与测试策略怎么写，沿用项目规则。

一个目录就是一个模块。工具方法库、组件库，以及应用里的 api、store、hooks、utils、组件和页面共用这套分工。框架只改变主逻辑文件的名字和必要入口，不改变其他文件的职责。团队规范与这里冲突时沿用团队的，这里只给默认值。

## 落位流程

1. 修改已有模块前，查看主逻辑文件和同基名的 `.type.ts`、`.config.ts`、`.mock.ts`、样式及测试文件。已有同名文件就是对应内容的默认目标。
2. 新增内容属于已有兄弟文件时，直接写入该文件并从主逻辑引用；主逻辑里不再保留同名类型、配置或 mock 的副本。
3. 文件不存在时，只有实际出现了对应职责才创建。没有文件职责变化，就不新增、移动或拆分文件。
4. 功能修改也可能触发结构规划：先判断 Props、状态、映射、默认值、mock 等内容是否跨出主逻辑，再开始写实现。
5. 移动内容时同步修正 import/export；外部入口需要稳定时先补模块入口，再移动内部实现。

`xx.type.ts`、`xx.config.ts` 等文件不是待办清单。空文件、仅有一个 re-export 的文件、只为了补齐目录而存在的层级都不要建。

## 文件职责

目录名和文件名用小驼峰：`userCard/userCard.ts`、`userCard/userCard.tsx`。代码里的组件标识符用大驼峰，否则 JSX 和模板会把它当原生标签。沿用仓库已有命名；同一个目录里不要混用风格。

| 文件 | 职责 | 什么时候才建 |
| --- | --- | --- |
| `xx.ts` / `xx.tsx` / `xx.vue` / `xx.js` | 主逻辑，基名与目录名一致。承载实现和交互，其他文件负责的声明与配置不在这里重复定义 | 总是先有它 |
| `index.ts` / `index.js` | 模块入口，默认只做 re-export。模块外部从这里引用，内部文件直接引用目标文件。原生小程序把 `index.ts` 用作页面或组件主逻辑时，从框架 | 模块被外部引用时 |
| `xx.config.ts` / `xx.config.js` | 模块级固定值、配置项、映射和默认值；不执行初始化、注册、IO 等副作用 | 实际出现需要独立管理的运行期值时 |
| `xx.type.ts` | 类型声明及本模块取值定义：`interface`、`type`、`enum`、`as const` 取值表及其派生类型；不放副作用。JS 项目用 JSDoc `@typedef` 或仓库已有约定 | 出现上述声明时。它们默认就放这里，不要求先被多处引用 |
| `xx.mock.ts` / `xx.mock.js` | mock 数据及生成 mock 的函数 | 测试、预览或联调需要 mock 数据时 |
| `xx.json` | 纯静态数据，不含任何逻辑 | 数据要给非 TS 侧消费时。原生小程序不能 import JSON，数据写在 `.ts` 里 |
| `xx.css` / `xx.module.css` | 组件私有样式，与组件同级同名 | 组件有样式时。样式多于一个文件、或做组件库，才建 `styles/` 子目录 |
| `xx.test.ts` / `xx.test.js` / JSX 测试 | 测试文件 | 项目需要保存对应测试时 |

`.d.ts` 用于声明文件或第三方补充声明，不用它存放普通模块的内部类型。

用于限定合法取值的 `enum`、`as const` 取值表放 `xx.type.ts`；用这些取值生成文案、样式或默认结果的运行期映射放 `xx.config.ts`。

## 常见模块类型

| 模块 | 主逻辑怎么切 | 常见附带文件 |
| --- | --- | --- |
| 工具方法库 | 一个能力一个文件（`formatDate.ts`），目录名即能力名 | `index.ts`、`xx.type.ts`、`xx.test.ts` |
| 组件库 | 一个组件一个目录（`userCard/userCard.tsx`） | `xx.type.ts`（props）、`xx.config.ts`（尺寸 / 变体映射）、`xx.test.tsx` |
| api 模块 | 一个资源一个文件（`userApi.ts`） | `xx.type.ts`（请求 / 响应结构）、`xx.mock.ts`、`index.ts` |
| store 模块 | 一个 store 一个文件（`useUserStore.ts`） | `xx.type.ts`（state / action 类型）、`xx.mock.ts`（初始 state 工厂） |
| hooks / utils 模块 | 一个能力一个文件（`useXx.ts`、`xx.ts`） | `xx.test.ts`、`xx.type.ts` |
| 页面 | 一页一个目录，入口文件名跟框架的路由约定（原生小程序是 `index.ts`） | `xx.config.ts`（页面级常量）、`xx.mock.ts`（预览数据） |

判断依据始终是"这段内容属于哪种职责"，而不是"它像不像前端组件"。

## 规划示例

已有组件只有 `userCard.tsx`，功能修改要求增加一组受约束的状态、状态文案和样式：

- 状态联合类型、`as const` 取值表及 Props 放进新建的 `userCard.type.ts`。
- 状态到文案和样式名的固定映射放进新建的 `userCard.config.ts`。
- `userCard.tsx` 只保留渲染、事件和把映射用到界面上的实现。
- 模块要被外部引用时，再补入口文件统一导出组件和公共类型。

如果这些兄弟文件已经存在，就修改对应文件，不在 TSX 里另写一份。

## 导出与引用

- 模块入口只导出，不写实现；TS 项目使用 `index.ts`，JS 项目使用 `index.js`。模块内部文件互相引用时用相对路径直连目标文件，不要绕回入口，避免循环依赖。
- 对外只认模块入口：外部要用的东西都在这里导出，外部也只用它引用（`import { xx } from "@/modules/user"`），不要写 `from "@/modules/user/impl/detail"`。绕过入口深挖内部文件会让依赖跨层成环，对方目录一动还会波及所有调用方。
- 具名导出优先；框架或加载机制要求默认导出时（路由 / 懒加载、页面入口等）才用 `export default`。导出顺序：方法 / 组件 → 类型 → 常量，类型用 `export type { ... }` 单独一行。
- 模块入口是对外契约，库和包的导出面等于兼容性承诺。重构时先补入口再移动实现，外部 import 路径就不用改。
- 模块下的子目录（`components/`、`hooks/`、`composables/`、`utils/`）沿用同一套文件分工。
- 测试文件默认与实现同级；仓库已有 `__tests__/` 约定时沿用仓库的。

## 需要用户拍板时

- 先读项目里的 `skill-memory/js-module-structure.md`，命中就照做、不再问。
- 只在这类答案会影响整个仓库时问：目录与文件用哪种命名风格、是否给每个模块补入口、类型文件放模块内还是公共目录。
- 问完把结论和一句理由写进该文件，一行一条「结论 —— 一句理由」，不抄对话。
- 其余按现状定：单个模块叫什么、某个文件放哪、这个模块要不要 `.mock.ts`。

## 继续读

- React 项目（组件、页面、hooks）：读 [references/react.md](references/react.md)
- Vue 项目：读 [references/vue.md](references/vue.md)
- 小程序（原生 / Taro / uni-app）：读 [references/miniprogram.md](references/miniprogram.md)。注意原生小程序的 `index.json` 是框架配置文件，不是数据文件。
- 工具方法库、组件库：读 [references/library.md](references/library.md)
- api、store、hooks、utils 等不带界面的模块：读 [references/non-ui-modules.md](references/non-ui-modules.md)
- 重构、归整目录：读 [references/refactor.md](references/refactor.md)
