---
name: javascript-best-practices
description: JavaScript 语言层写法与结构决策：写、改或评审 JS/TS 代码时使用。规定命名、函数形态（默认箭头函数及例外）、控制流、值处理、异步写法、错误处理，以及类与继承的取舍。不负责 TypeScript 类型建模、模块目录、React 组件、CSS、注释和构建 / lint 配置。
---

# JavaScript 最佳实践

每条规则都落到判据上：什么情况这么做、什么信号说明写坏了、怎么改。动笔前先看工程现状：命名习惯、模块里已有的函数形态、错误处理方式、lint 已开了哪些规则；工程已有约定时按工程来，这里只做兜底。

## 写法

- 能不变就 `const`，确实要重新赋值才用 `let`；`var` 不用。
- 函数默认写箭头函数；类的方法、需要动态 `this`（含显式 `this` 参数）、生成器与构造函数、依赖函数声明提升时才写 `function`。
- 命名说明业务含义，不用 `data`、`temp`、`handleClick2` 这类名字；布尔值用 `is` / `has` / `should` / `can` 开头。
- 用提前返回压掉嵌套；复杂条件先算成命名布尔，不在条件里塞副作用。
- 入参不原地改；能给调用方返回新值，就不改传进来的对象和数组。
- 异步统一用 `async` / `await`；并行的独立操作用 `Promise.all`，每个 promise 都要被 `await`、返回或显式接住。
- 错误不吞：捕获后记录或往上抛，空 `catch` 不要出现；预期内的业务失败用返回值表达。
- 继承只用在「是一个」关系上；单纯复用代码用组合，父类不判断自己有哪些子类。

## 按需读取

先用上面的规则写。遇到具体问题再查对应文档。

### 日常写法

| 任务 | 读取文件 |
| --- | --- |
| 函数该写箭头还是 `function`、参数怎么设计、类与继承的取舍 | [functions-and-classes.md](references/functions-and-classes.md) |
| 命名约定、提前返回、条件与默认值、数组和对象怎么改 | [control-flow-and-values.md](references/control-flow-and-values.md) |
| `async` / `await`、并发、promise 接住、错误怎么抛和怎么吞 | [async-and-errors.md](references/async-and-errors.md) |

## 需要用户拍板时

- 先读 `skill-memory/javascript-best-practices.md`，命中就照做、不再问。
- 要问的：默认函数形态要不要统一改、父类与子类职责要不要拆、错误该往上抛还是用返回值。
- 只在这类答案会影响多处代码时问；问完把结论和一句理由写进该文件，不抄对话。
- 其余按代码现状定：局部命名、单个函数的参数形态、某个 `try` 放哪一层，以及工程里已有的同类决定。
