# 控制流与值

管命名、分支结构、默认值和数据怎么改。函数形态与类见 [functions-and-classes.md](functions-and-classes.md)，异步与错误见 [async-and-errors.md](async-and-errors.md)。

## 命名

- 名字说清它是什么、用来做什么，不用 `data`、`list`、`temp`、`res` 这类换个地方就失效的名字。
- 布尔量用 `is` / `has` / `should` / `can` / `needs` 开头：`isLoading`、`hasPermission`、`shouldRefresh`。
- 函数名是动词短语，说明它做什么：`fetchOrders`、`normalizePhone`。`process`、`handle` 这类空词不能单独当名字。
- 缩写只在团队通用时用：`id`、`url`、`api` 可以，`usr`、`cfg`、`btn` 不行。
- 常量名说明含义，不用魔法数字；同一个值出现在两处以上就抽成命名常量。

## 分支

- 先处理异常和边界，正常路径留在函数主体，嵌套自然就浅。
- 复杂条件先算成命名布尔，让 `if` 读起来是一句话。
- 不在条件里赋值，也不在条件里调用有副作用的函数；副作用单独一行，条件只做判断。
- `switch` 每个分支都要有出口，`default` 要么抛错，要么写出明确兜底；不靠穿透 `case` 省代码。
- 嵌套超过 3 层就拆函数，不按行数机械拆。

```js
// 嵌套到最后一行才看懂正常路径。
const canSubmit = (form) => {
  if (form) {
    if (form.items.length > 0) {
      if (!form.submitting) return true;
    }
  }
  return false;
};

// 条件本身就是一个句子。
const canSubmit = (form) =>
  Boolean(form) && form.items.length > 0 && !form.submitting;
```

## 默认值与可选链

- 只有 `null` / `undefined` 要走默认值时用 `??`；`||` 会连 `0`、`""`、`false` 一起吞掉。
- 可选链只用在调用方确实允许为空的地方，后面紧跟 `??` 给默认值，别让 `undefined` 一路传下去。
- 取不到是正常情况的用可选链；取不到是 bug 的先判空或直接抛错，不用可选链掩盖。

```js
const pageSize = options.pageSize ?? 20;
const ownerName = order.owner?.name ?? "未指定";
```

## 值与不可变

- 数组用 `map` / `filter` / `find` / `some` / `every` / `reduce` 表达意图，不用 `for` 循环加临时变量推结果；循环体里有 `await`、有副作用或要提前退出时才用 `for`。
- 入参不原地改：`items.push(x)` 会改到调用方的数组，改成返回新数组或先复制。
- 判断相等用 `===` / `!==`，不用 `==`。
- 展开和 `Object.assign` 都是浅拷贝；要改嵌套对象的深层字段时逐层复制，避免改到共享引用。

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

循环体里没有 `await`、没有副作用、不需要提前退出时用 `map` / `filter` 表达意图；要改一个字段就复制那一层，不共享引用。
