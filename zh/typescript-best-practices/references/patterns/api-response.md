# 业务案例：接口响应收窄

适用：从后端拉数据、存进前端状态、再渲染的链路，响应结构不受本方控制。类型由本方生成且结构稳定（GraphQL codegen 这类）时直接沿用生成类型，不重复手写 schema；一次性脚本和本地 mock 不需要这层校验。

| 决策点 | 做法 | 判据 |
| --- | --- | --- |
| 从哪进类型系统 | 请求层，`unknown` 起步 | 越早收窄，下游越少断言 |
| 谁来校验 | schema 或手写 type guard | 校验逻辑跨模块复用就选 schema |
| 类型从哪来 | 从 schema 派生 | 手写第二份 interface 迟早和后端对不上 |
| 校验在哪做 | 只在入口做一次 | 收窄过的数据下游直接用，不再判字段在不在 |
| 失败怎么表达 | 可恢复返回 `Result`，不可恢复抛错 | 不返回半成品对象让调用方猜 |
| 分页与列表 | 单独建 `IPageResult<T>` | 别把分页字段拍进每个实体 |

## 案例

```ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["admin", "member"]),
});

// 派生出来的是对象契约，照常带 I 前缀；z.enum 那种取值集合是联合类型，不带前缀。
export type IUserInfo = z.infer<typeof userSchema>;

export const fetchUserInfo = async (id: string): Promise<IUserInfo> => {
  const raw: unknown = await request(`/api/user/${id}`);
  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`invalid user payload: ${parsed.error.message}`);
  return parsed.data;
};
```

## 验收

1. 后端把 `role` 改成数字，校验阶段就失败，不等到线上渲染出空白。
2. 收窄链路上搜不到 `as ` 和 `unknown as`。
3. 字段定义只有 schema 一处；删掉手写的接口类型后代码仍能编译。

## 常见误区

- 请求函数返回 `any` 或 `unknown`，把收窄推给每个调用方。
- 用 `as IUserInfo` 跳过校验。
- 把服务端报文外壳（`{ code, data, message }`）一路带进组件。

需要拍板的：哪些字段缺失算致命而不是给默认值、分页以 `total` 还是 `hasNext` 为准、后端字段名与前端领域名不一致时在哪一层映射。
