# 业务案例：配置对象与常量表

适用：写配置、选项表、路由表、表单校验规则这类「值固定、结构要检查」的常量。值要运行时拼装、结构不固定时不必上 `satisfies`。

| 决策点 | 做法 | 判据 |
| --- | --- | --- |
| 要不要运行时值 | 要（渲染、校验、拼参数）就写 `as const` 对象 | 值只在类型里用、运行时不遍历，就别引入运行时对象 |
| 怎么检查结构 | `satisfies` | `as` 缺字段也不报错；类型注解会把字面量放宽 |
| 类型从哪来 | 从值派生 | `keyof typeof` 或 `(typeof X)[keyof typeof X]`，不手写第二份 |
| 嵌套多深 | 超过三层拆成命名子对象 | 一层能写完就一层 |

## 案例

```ts
interface IRouteMeta {
  path: string;
  permission: string;
  breadcrumb: string;
}

export const ROUTES = {
  dashboard: { path: "/dashboard", permission: "dashboard:read", breadcrumb: "首页" },
  users: { path: "/users", permission: "user:read", breadcrumb: "用户" },
} satisfies Record<string, IRouteMeta>;

export type RouteKey = keyof typeof ROUTES;
```

`breadcrumb` 拼成 `breadcum`，`satisfies` 当场报错；`ROUTES.dashboard.path` 的类型仍是字面量 `"/dashboard"`，不是 `string`。

## 验收

1. 给某个路由加一个 `IRouteMeta` 之外的多余字段，`satisfies` 报错。
2. 删掉任一 `path`，报缺字段。
3. `RouteKey` 是 `"dashboard" | "users"`，不是 `string`。

## 常见误区

- 用 `const x: IXxx = {...}`，以为写了类型就安全，结果字面量被放宽。
- 只写 `as const` 不加 `satisfies`，结构写错也不报。
- 手写一份类型、一份值，两边各改各的。

需要拍板的：结构会不会扩成多层嵌套、`RouteKey` 要不要导出给别的模块、这份取值表要不要被构建脚本读取。
