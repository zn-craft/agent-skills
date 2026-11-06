# 值、数字与日期

管数字精度、字符串处理、日期时区和相等判断。集合与属性见 [objects-and-collections.md](objects-and-collections.md)，函数形态见 [functions-and-classes.md](functions-and-classes.md)。

## 先看已有的工具

先找项目里现成的处理入口：依赖里的第三方库、内部 `utils`、数据层封装都算。有就用它，没有才按下面各节的内置写法，同一件事只留一种做法；引入方式见 [imports.md](imports.md)。下面括号里的库名只是常见例子，判断依据是有没有这类工具。

- 日期：已有专门处理日期的库或内部封装（`dayjs`、`date-fns`、`luxon`，或项目自己的 `formatDate`、`parseDate`）时，解析、时区和格式化都交给它，不另外手写一套。
- 金额与小数：已有小数或金额处理（`decimal.js`、`bignumber.js`、`Dinero.js`，或内部金额工具）时，计算走它，不再手动转最小单位；项目本来用整数分就继续用整数分，两套别并行。
- 拷贝与不可变：数据层已有不可变机制（`immer`、`immutable`），或工具库已有深拷贝（`cloneDeep`、`klona`）时跟着它走；要保留原型链或函数引用用库里的，纯数据用 `structuredClone`。
- 数据形状跟调用点走：库里返回的对象（日期对象、小数实例）该在什么时候转成字符串或数字，在模块边界上定一次，不在各处随手 `toISOString()`、`toNumber()`。

## 数字

- 金额、数量用最小单位的整数存（分、厘、克）：`0.1 + 0.2` 是 `0.30000000000000004`，浮点累加几笔账就对不上；展示交给 `Intl.NumberFormat`。
- 超过 2^53 - 1 的整数（订单号、雪花 ID）用 `BigInt`：不能和 `Number` 混算，`JSON.stringify` 遇到它直接抛错。
- 判断 `NaN` 用 `Number.isNaN`，判断有限数字用 `Number.isFinite`；全局的 `isNaN` / `isFinite` 会先转数字。
- 字符串转数字用 `parseInt(text, 10)` 显式给基数或 `Number(text)`；`Number("")` 和 `Number(null)` 都是 `0`，边界数据先判空。

## 字符串

- 替换全部匹配用 `replaceAll`；判断前后缀和包含用 `startsWith` / `endsWith` / `includes`；截取用 `slice`，取末尾用 `at(-1)`。
- 用户输入做比较、去重、搜索前先 `normalize("NFC")`：同一个字有组合和预组合两套码点，不归一化比不出相等。

## 日期

- 只把 ISO 8601 字符串交给 `new Date()`（`2026-11-06T10:00:00.000Z`）；`2026/11/06`、`11/06/2026` 按实现各自解析，换个运行时结果就变。
- 纯日期 `"2026-11-06"` 按 UTC 解析；要本地时间就传参数 `new Date(2026, 10, 6)`，要 UTC 就写全并带 `Z`。
- 展示用 `Intl.DateTimeFormat` 并显式写 `timeZone`；存储和传输用 `toISOString()` 或时间戳，不用 `toString()`。
- 算间隔用时间戳相减；「今天」「本月」按业务时区算，不按运行机器的时区。

## 相等

- 一律 `===` / `!==`；`NaN` 不等于自身，要区分 `-0` 和 `0` 用 `Object.is`。
- 对象和数组比的是引用，比内容要逐字段比；工具库里有 `isEqual` 可以用，但它是全量深比较，别放进高频路径。
- `null` 表示「明确没有」，`undefined` 表示「没提供」；同一份数据里不要两种混用表达同一件事。

## 深拷贝

- 展开和 `Object.assign` 都是浅拷贝，只够改一层。
- 深拷贝用 `structuredClone`：支持 `Date`、`Map`、`Set`、`RegExp`、`ArrayBuffer` 和循环引用。
- 不用 `JSON.parse(JSON.stringify(value))`：`Date` 变字符串，`undefined`、函数和 `Symbol` 被丢掉，`Map` / `Set` 变 `{}`，`BigInt` 直接抛错。
- `structuredClone` 克隆不了函数、`Error`、DOM 节点和类实例的原型链，这些值要写自己的转换函数。

## 案例

```js
const currencyFormat = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
});

// ✗ 以元为单位累加，展示时再四舍五入一次，误差对不上账
const total = items.reduce((sum, item) => sum + item.price, 0);

// ✓ 以分为单位算整数，只在展示层格式化
const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
const totalLabel = currencyFormat.format(totalCents / 100);
```

```js
// ✗ 非 ISO 格式靠实现解析："2026/11/06" 在部分运行时是本地时间，在另一些是 NaN
const deadline = new Date(row.deadline);

// ✓ 后端给 ISO 字符串或时间戳；本地日期用参数构造
const deadline = new Date(row.deadlineIso);
const localDate = new Date(row.year, row.month - 1, row.day);
```
