# 类型安全

管外部数据怎么收进来、`any` 和断言怎么过渡、错误怎么用类型表达。类型怎么声明见 [type-modeling.md](type-modeling.md)，命名与导入导出见 [naming-and-declaration.md](naming-and-declaration.md)。

## 禁止项

- 禁止 `any`。不确定用 `unknown`，用前收窄；接口响应、`JSON.parse`、`catch` 到的 error 一律从 `unknown` 开始。
- 禁止随手用非空断言 `!`，先判空或用 `??` 给默认值。
- 不用 `@ts-ignore`；必要时用 `@ts-expect-error`，类型修好后它会自己报错提醒删除。
- 不写 `unknown as T` 双断言糊过去，它和 `any` 一样骗过编译器，只是更难发现。
- `as` 断言只在确实比类型系统更清楚时用，并在旁边写一句原因。

## 存量 any 怎么过渡

存量工程里 `any` 成片存在，一次清零不现实：本次改动范围外的原样留着，一次只收窄一处。收窄顺序、diff 怎么拆、完整案例见 [legacy-any.md](patterns/legacy-any.md)。

## 从 unknown 收窄

- 外部数据先声明成 `unknown`，再用 `typeof` / `in` / `Array.isArray` / 自定义 type guard 收窄。
- 跨函数复用的判断抽成 type guard，不用 `as` 代替：

```ts
const isUserInfo = (value: unknown): value is IUserInfo =>
  typeof value === "object" && value !== null && "id" in value;
```

- 校验失败要抛错、且希望后续代码直接当已收窄用，写断言函数：`assertUserInfo(value: unknown): asserts value is IUserInfo`。
- 想「保持字面量类型的同时检查结构」用 `satisfies`：`const config = { ... } satisfies IXxxConfig`，写错字段会报错，类型也不会被放宽。
- 数组和对象用之前先判空：`if (items == null || items.length === 0) return;`，不用 `items!`。
- 开了 `noUncheckedIndexedAccess` 时索引访问可能拿到 `undefined`，先判空再解构。

## 兜底分支

`switch` / `if-else` 的兜底分支写 `never`，新增成员时编译期就报错：

```ts
default: {
  const exhaustive: never = status;
  throw new Error(`unhandled status: ${exhaustive}`);
}
```

兜底分支不能只是 `break` 或空实现，否则新增成员会静默走进错误分支；用枚举做分支时同样写 `never` 兜底。

## 错误处理

- 错误要在类型上说得清：会抛什么、调用方要不要处理、能不能判断是哪种失败；可恢复与不可恢复的失败用不同的错误类型或返回值区分。
- `catch` 参数按 `unknown` 处理，不写 `catch (e: any)`；`catch` 里至少记录或重新抛出，不写空 `catch`。
- 预期内的业务失败用返回值表达，让调用方必须处理：

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

- 只有在工程已有这套约定时才用 `Result`，不新造一套与工程冲突的错误模型；同一个仓库里失败返回的形状只留一种，语言层不再另起一套。
- 异步失败用 `await` + `try/catch`，或让 Promise 拒绝向上传，不把失败编码进返回值后又忘记检查。
- 抛出错误时带上定位信息（哪一步、什么输入），不带无关的内部细节。

## 异步与 Promise

- `async` 函数返回类型写 `Promise<T>`，`T` 是成功时的值，不写 `Promise<any>`。
- `await` 拿到的是成功值，失败会抛错，不是 `T | undefined`，不要给结果再叠一层 `?.` 兜底。
- 会失败且调用方要分支处理的操作用 `Promise<Result<T>>`，返回值必须检查；其余走异常向上传。
- 并行请求用 `Promise.all`，结果是定长元组；要按位置取结果就保留元组，别再 `as` 成数组。
- 回调返回 `void` 只用于确实不需要结果的场景；异步回调要接住 rejection，别留下未处理的 promise。

```ts
const loadProfile = async (id: string): Promise<IProfile> => {
  const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
  return { user, orders };
};
```
