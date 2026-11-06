# 性能取舍

管循环与查找的结构选择：什么时候值得动结构、常见的热点长什么样。容器选择见 [objects-and-collections.md](objects-and-collections.md)，复制成本见 [values-and-numbers.md](values-and-numbers.md)。

## 先测再改

没有测量结果就不改结构：先确认热点在哪、数据规模多大、这段代码每次交互跑一次还是几千次。凭感觉换写法，多半换来更难读的代码和看不出来的收益；改完用同一份数据量复测。

## 循环里的查找

外层遍历、内层再 `find` / `filter` / `includes` 找一次，就是 O(n*m)：数据上千时直接卡住。

- 同一份数据要被反复查找，按 key 建一次 `Map`，之后 O(1) 查。
- 建索引会改变重复 key 和缺失值的语义：重复 ID 保留哪一个、查不到返回 `undefined` 还是默认值，按原来的行为定。

```js
// ✗ 外层遍历 + 内层 find，规模一上来就是 O(n*m)
const rows = orders.map((order) => ({
  ...order,
  buyer: users.find((user) => user.id === order.userId),
}));

// ✓ 按 key 建一次索引，之后每次 O(1)
const userById = new Map(users.map((user) => [user.id, user]));
const rows = orders.map((order) => ({
  ...order,
  buyer: userById.get(order.userId),
}));
```

## 一趟算完

同一个数组上连着 `filter().map().reduce()`，中间数组占内存，多趟遍历占时间。要算多个相关结果（数量、金额、分组）时一趟循环算完。

只在数据量大或调用频繁时合并：`filter().map()` 读起来更清楚，规模小就别拆成循环。

```js
// ✗ 三趟遍历 + 两个中间数组
const paid = orders.filter((order) => order.paid);
const amounts = paid.map((order) => order.amount);
const sum = amounts.reduce((acc, amount) => acc + amount, 0);

// ✓ 一趟同时拿数量和金额
let count = 0;
let sum = 0;
for (const order of orders) {
  if (!order.paid) continue;
  count += 1;
  sum += order.amount;
}
```

## 能提前结束就别走完

- 判有没有用 `some`，判是不是全部用 `every`，找第一个用 `find`；`filter(...).length > 0` 会把整趟走完。
- 只要最大 / 最小就用一次遍历比较，别 `sort()` 之后取第一个：排序更贵，还会改原数组。
- 只显示前 N 条就不用全量排序再截取。

```js
// ✗ 为了判有没有走完整趟
const hasBlocked = users.filter((user) => user.blocked).length > 0;

// ✓ 命中就返回
const hasBlocked = users.some((user) => user.blocked);
```

## 循环里不重复算

循环体内别重复构造正则、重复解析日期、重复 `JSON.parse`，也别把同一段链式属性访问算两遍；提到循环外存成变量。这类改动同样先确认它是热点，否则只多了一个变量。

## 缓存要先写失效条件

缓存是拿内存和失效风险换时间：输入稳定、重复调用多、单次结果确实贵时才加，key 和失效条件一起写出来；没有失效条件的缓存最后一定会读到脏数据。

## 合并重复的 IO

多次写、多次请求能合成一次的合一次（批量接口、一次事务写多行）。这类改动减的是往返次数，比省几次属性访问划算得多。
