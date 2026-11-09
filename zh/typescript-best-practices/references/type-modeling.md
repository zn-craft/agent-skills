# 类型建模

管类型怎么声明、放在哪、怎么表达领域概念，以及抽象该停在什么程度。边界数据怎么收窄见 [type-safety.md](type-safety.md)，命名与导入导出见 [naming-and-declaration.md](naming-and-declaration.md)。

## 声明与位置

- 对象结构用 `interface`，联合、交叉、映射、条件类型用 `type`，同一类结构不混用；前缀与命名细节见 [naming-and-declaration.md](naming-and-declaration.md)。
- 可选属性写 `prop?: T`，不写 `prop: T | undefined`，除非要区分「没传」和「传了 undefined」。
- 不用 `Function`、`Object`、`{}` 做类型，写具体签名：`(...args: unknown[]) => void`、`Record<string, unknown>`。
- 导出的函数写返回类型，内部函数交给推导；返回类型是模块对外的契约，不能由实现细节决定。
- 联合类型不混 `string` 兜底：`"pending" | "done" | string` 等于没约束。
- 本模块的类型与取值定义集中写进工程约定的类型文件（`type.ts`、`xxx.type.ts`）：`interface`、`type` 别名、`enum`、`as const` 取值表和共享常量都放这里；工程把类型放别处就按工程来。
- 带实现体的留在实现文件：函数、类、组件、副作用代码不进类型文件。类型文件里有 `enum`、`as const` 这类取值时，取值的引用方用普通 `import`，只引类型才用 `import type`。
- 环境声明写进 `xxx.d.ts`：`declare module`、`declare global`、`declare const`，以及第三方库缺失的类型（先看 `@types/xxx`，没有就只补实际用到的部分）；`.d.ts` 里不写运行时逻辑。
- 类型文件内按分组顺序排列，每组上方写一行注释：

```text
1. 外部类型：扩展或复用的第三方类型
2. 基础类型：ID、通用实体
3. 业务实体：本模块的数据结构
4. 请求与响应：入参、出参、接口返回
5. 取值定义：枚举、`as const` 取值表及其派生联合
6. 函数与组件：参数、返回结构
7. 工具类型：泛型、映射、条件类型
```

- 组内按依赖顺序排，被依赖的在前，避免循环引用；导出用 `export type` / `export interface`，不做 `export *`。
- 跨模块共用的类型放工程的公共类型目录，不在各模块重复定义。

## 取值集合怎么选

| 场景 | 选什么 |
| --- | --- |
| 值只出现在类型里，不需要运行时遍历 | 字符串联合类型 |
| 运行时要拿到全部取值：渲染下拉框、做校验、拼查询参数、建映射 | `as const` 对象 + `typeof` 派生联合 |
| 需要在运行时按名字拿到取值，或成员要分组、加注释、当对外 SDK 的一部分 | 字符串枚举（`E` 前缀） |
| 纯数字常量 | `as const` 数组或对象，不用枚举 |

```ts
export const ORDER_STATUS = {
  Pending: "pending",
  Shipped: "shipped",
  Done: "done",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

- 同一份取值只能有一处定义：先写了联合类型、后来又要遍历，就改成 `as const` 对象用 `typeof` 派生，不让两份并存。
- 不用数字枚举：有反向映射噪音，`0` 还会被当成假值。
- 联合成员多不是换成枚举的理由，还是看运行时要不用拿到全部取值。
- 工程原来就用枚举，继续用，不为了「更现代」改成 `as const`。

## 用类型表达领域概念

- 同一个业务概念到处都用 `string` 时，用 branded type 区分：`type UserId = string & { readonly __brand: "UserId" }`，订单号传成用户 ID 这类串用能在编译期挡住；`__brand` 只是类型标记，不产生运行时成员，与成员命名无关。
- 只有确实发生过串用的字段才加 brand，给所有字符串都包一层只增加噪音。
- 状态流转、流程节点用联合类型表达，不允许的流转在类型上就写不出来。
- 已校验与未校验的数据在类型上分开：`unknown` 进，具体类型出，中间必须经过校验函数。
- 运行时的合法性（枚举取值、字段必填、格式）不能只靠类型。接口响应和用户输入都用 schema 或判断函数校验一次，再从校验结果派生类型，不手写第二份。
- 只写在注释里的约束等于没有约束，能用类型表达的规则不写成注释。

## 泛型与抽象的门槛

- 用泛型的前提是同一段逻辑要适配多种类型，且类型之间的关系要保住；只有一个调用点，或用泛型只是为了少写一个具体类型名，直接写具体类型。
- 泛型参数用有意义的名字：多参数写 `TKey`、`TValue`，不排 `T`、`U`、`V`；要约束用 `extends`（只描述调用方真的依赖的关系），要默认值写 `= T`。
- 泛型嵌套不超过 2 层：`Promise<Array<Map<string, IUserInfo>>>` 抽成别名再注释。
- 交叉类型超过 3 个就拆成有语义的组合，或改成 `interface extends`。
- 索引链不连写：`keyof typeof X[number]["field"]` 超过两段就抽中间类型并命名。
- 业务代码不写高级类型：条件类型、`infer`、mapped type、递归类型只在工具类型文件里出现。
- 内置工具类型能表达就不手写：`Partial`、`Pick`、`Omit`、`Record`、`ReturnType`、`Parameters` 直接用，手写等价映射类型只多一个维护点。
- 工具类型用来做真实的类型变换，不拿来回避源头设计：可选性没定就用 `Partial<T>`、字段一个个剥用 `Omit`，说明源头类型该改；派生链超过两层就抽一个带语义的中间类型并命名。
- 单行类型超过约 100 字符，或一个类型声明超过 5 行，就拆分或加注释。
- 遇到 `Type instantiation is excessively deep` 或编辑器变慢，说明类型过度复杂，简化结构，不用 `@ts-expect-error` 压掉。

确实需要复杂类型时必须写注释，讲清三件事：这个类型代表什么、为什么不能用更简单的写法、改动时要注意什么。

```ts
// 从接口响应里剥掉通用 envelope，只留业务字段。
// 后端没给独立类型，且响应结构随接口版本变，只能靠条件类型推导；envelope 结构改动时这里要同步。
type UnwrapResponse<T> = T extends { data: infer D } ? D : T;
```
