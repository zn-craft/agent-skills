# 业务案例：状态流转建模

适用：订单、工单、审批、支付这类有明确状态取值和允许流转的业务对象。只有两三个稳定状态、没有流转限制时，用联合类型就够，不必上流转表。

| 决策点 | 做法 | 判据 |
| --- | --- | --- |
| 状态取值 | 字符串联合，不用裸 `string` | 要遍历全部取值再换成 `as const` 对象 |
| 流转规则 | `Record<Status, readonly Status[]>` 一张表 | 判断散在多个 `if` 里，改一处漏一处 |
| 非法流转 | 类型上写不出来，运行时报错兜底 | 前后端各挡一次 |
| 状态与历史 | 当前状态是单值，历史是追加数组 | 别用可变对象揉在一起 |

## 案例

```ts
export type OrderStatus = "created" | "paid" | "shipped" | "done" | "canceled";

const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  created: ["paid", "canceled"],
  paid: ["shipped", "canceled"],
  shipped: ["done"],
  done: [],
  canceled: [],
};

export const moveOrder = (from: OrderStatus, to: OrderStatus): OrderStatus => {
  if (!ALLOWED[from].includes(to)) throw new Error(`illegal transition: ${from} -> ${to}`);
  return to;
};
```

## 验收

1. 给 `OrderStatus` 加一个 `"refunded"`，`ALLOWED` 立刻报缺键。
2. 从 `done` 走到 `paid`，函数抛错，界面落不到非法状态。
3. 渲染状态的 `switch` 的 `default` 写 `never` 兜底（写法见 type-safety.md），加状态后编译报错，逼你补分支。

## 常见误区

- 状态用裸 `string` 或数字，任何值都能塞进去，读日志时也对不上含义。
- 用布尔字段拼状态（`isPaid`、`isShipped`），组合出互相矛盾的值。

需要拍板的：终态还能不能被改、取消是所有状态都允许还是只在部分状态允许、状态由前端推还是后端推。
