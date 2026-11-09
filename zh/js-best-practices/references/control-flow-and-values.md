# 控制流与值

管命名、分支结构、默认值与可选链，以及值怎么改。函数形态与类见 [functions-and-classes.md](functions-and-classes.md)，集合与属性见 [objects-and-collections.md](objects-and-collections.md)。

## 命名

- 名字说清它是什么：`data`、`list`、`temp`、`res` 换个地方就失效，不用。
- 布尔量用 `is` / `has` / `should` / `can` / `needs` 开头；函数名是动词短语（`fetchOrders`、`normalizePhone`），`process`、`handle` 这类空词不单独当名字。
- 缩写只在团队通用时用：`id`、`url`、`api` 可以，`usr`、`cfg`、`btn` 不行。
- 同一个值出现两处以上抽成命名常量，不留魔法数字。

## 分支

- 先处理异常和边界，正常路径留在函数主体，嵌套自然就浅；嵌套超过 3 层拆函数，不按行数机械拆。
- 复杂条件先算成命名布尔，让 `if` 读起来是一句话。
- 不在条件里赋值，也不在条件里调用有副作用的函数。
- `switch` 每个分支都有出口，`default` 要么抛错要么明确兜底；不靠穿透 `case` 省代码。

## 默认值与可选链

- 只有 `null` / `undefined` 要走默认值时用 `??`；`||` 会连 `0`、`""`、`false` 一起吞掉。
- 可选链后面紧跟 `??` 给默认值，别让 `undefined` 一路传下去。
- 取不到是正常情况才用可选链；取不到是 bug 就先判空或直接抛错，不用它掩盖。

```js
const pageSize = options.pageSize ?? 20;
const ownerName = order.owner?.name ?? "未指定";
```

## 值怎么改

- 推结果用 `map` / `filter` / `find` / `some` / `every` 表达意图，不手写 `for` 加临时变量。
- 要改一个字段就复制那一层（`{ ...order, status: "unpaid" }`），不共享引用。

## 案例

### 边界先走，正常路径留在主体

```js
// ✗ 四个 if 套在一起，正常路径埋在最后一行
const getDiscount = (user, order) => {
  if (user) {
    if (user.isActive) {
      if (order.items.length > 0) {
        return order.coupon ? order.coupon.value : 0;
      }
    }
  }
  return 0;
};

// ✓ 边界逐个返回，主流程一眼读完
const getDiscount = (user, order) => {
  if (!user?.isActive) return 0;
  if (order.items.length === 0) return 0;
  return order.coupon?.value ?? 0;
};
```

### 返回新值，不改调用方的数据

```js
// ✗ 原地改传进来的数组和对象，调用方的状态跟着变
const markUnpaid = (orders) => {
  for (const order of orders) {
    if (!order.paid) order.status = "unpaid";
  }
  return orders;
};

// ✓ map 返回新数组，命中项展开成新对象
const markUnpaid = (orders) =>
  orders.map((order) =>
    order.paid ? order : { ...order, status: "unpaid" },
  );
```
