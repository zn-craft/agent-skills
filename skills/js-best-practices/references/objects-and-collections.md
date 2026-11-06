# 对象与集合

管数组、对象和 `Map` / `Set` 的选择。值与日期见 [values-and-numbers.md](values-and-numbers.md)，控制流见 [control-flow-and-values.md](control-flow-and-values.md)。

## 先看已有的工具

项目里已有工具库或内部 `utils` 时，同一件事只留一种做法；下面列的是常见例子，别的库或内部实现有同样能力也一样用。引入方式见 [imports.md](imports.md)。

- 手写要十几行、容易写错的用现成的：`groupBy`、`keyBy`、`uniqBy`、`sortBy`、`chunk`、`debounce`、`throttle`；这类自己实现容易在相等判断、取消和最后一次触发上出错。
- 内置一行能表达的（`map` / `filter` / `find` / `some` / `Object.entries` / `Object.fromEntries`）用内置，不为「统一风格」都套一层 `_.`。
- `get` / `set` 这类按字符串路径读写的工具：路径没有类型检查，字段缺失时静默返回 `undefined`，写错路径也不报错；结构已知就用可选链。

## 数组

- 先看这份数组是谁的：自己造的临时数组原地 `sort` / `push` 更直接；来自参数、state、store 或缓存的不能原地改，别的持有方会跟着变。契约本来就是原地改就把这件事写进名字（`sortInPlace`）。
- 不改原值的写法（`toSorted`、`toReversed`、`toSpliced`、`with`）都要复制整份；数据量大时先看有没有别的持有方，没有就原地改，不为「看起来是纯函数」多复制一次。
- `sort`、`push`、`splice`、`reverse`、`fill` 都改原数组；`sort` 还默认按字符串比（`[10, 9].sort()` 还是 `[10, 9]`），数字序写 `(a, b) => a - b`，本地化顺序用 `localeCompare`。
- 判断元素存在用 `includes`（它认得 `NaN`），要下标才用 `indexOf`；找第一个用 `find`，判有无用 `some`，判全部用 `every`。
- 要按顺序、要提前退出、循环体里有 `await` 时用 `for...of`；不用 `for...in` 遍历数组，它按字符串键枚举，还会带上原型链上的可枚举属性。
- 生成定长数组用 `Array.from({ length: n }, (_, index) => index)`；`new Array(n)` 是稀疏数组，`map` / `forEach` 会跳过空位。

## 对象

- 判断自己有没有某个键用 `Object.hasOwn(target, key)`；`target.hasOwnProperty(key)` 会被同名属性覆盖，`Object.create(null)` 上还不存在。`in` 和 `for...in` 都沿原型链找。
- 遍历自己的键用 `Object.keys` / `values` / `entries`：只给可枚举的自有字符串键，`Symbol` 键要走 `Object.getOwnPropertySymbols`，JSON 也带不走。
- 键顺序不是契约：整数形式的键会被提到最前面。顺序有语义就用 `Map` 或数组，不靠字面量的书写顺序。
- 存外部可控的键（URL 参数、表单字段名、接口返回的字典）用 `Map` 或 `Object.create(null)`；普通对象遇到 `__proto__` 这类键会污染原型。
- 频繁增删键用 `Map`：`delete` 会让引擎丢掉对象形状。

## Map 与 Set

- 键是任意类型、或不能和内置属性重名时用 `Map`，不用普通对象硬凑。
- 判断键存在用 `map.has(key)`，不写 `map.get(key) !== undefined`：值本身可能就是 `undefined`。
- 去重、判重、白名单用 `Set`；大集合里判存在用 `set.has`，比 `array.includes` 少一次线性扫描。
- 取个数用 `size`，不是 `length`。

## 案例

```js
// ✗ scores 是调用方的数组，sort 会连它一起改掉，默认还按字符串比
const rank = (scores) => scores.sort();

// ✓ 要留原值就返回新数组
const rank = (scores) => scores.toSorted((a, b) => a - b);

// ✓ 自己造出来的中间数组直接原地改，不用复制
const rankValid = (scores) => {
  const valid = scores.filter((score) => score >= 0);
  valid.sort((a, b) => a - b);
  return valid;
};
```

```js
// ✗ 只认 get 的返回值，值本身就是 undefined 时判不出来
if (cache.get(key) !== undefined) return cache.get(key);

// ✓ has 判存在，get 取值
if (cache.has(key)) return cache.get(key);
```
