# 函数与类

管函数形态、参数设计和类与继承的取舍。控制流与值见 [control-flow-and-values.md](control-flow-and-values.md)，异步见 [async-and-errors.md](async-and-errors.md)。

## 函数形态

默认写箭头函数：不绑自己的 `this`，回调里不用再 `bind`。这几种写 `function`：

| 情况 | 原因 |
| --- | --- |
| 类的方法 | 挂在原型上，子类能 `super` 调用 |
| 需要动态 `this`（含显式 `this` 参数） | 箭头函数的 `this` 由定义位置决定 |
| 生成器 `function*` | 箭头函数没有生成器语法 |
| 构造函数 | 需要 `new` 和 `this` |
| 依赖函数声明提升 | 调用点在定义之前，箭头函数会报暂时性死区 |

递归函数写成命名函数表达式，栈里能看到名字，排查时不用靠行号猜。

不为「统一」重写存量函数的形态：类方法改成箭头字段后挂在实例上，子类覆盖不到，`super` 也调不着；`this` 敏感的改写容易引入行为差异。

```js
const formatPrice = (cents) => `¥${(cents / 100).toFixed(2)}`;

class OrderStore {
  #orders = [];
  add(order) {
    this.#orders = [...this.#orders, order];
  }
  listPending() {
    return this.#orders.filter((order) => !order.paid);
  }
}

export function* walkTree(node) {
  yield node;
  for (const child of node.children) yield* walkTree(child);
}

// ✗ 类方法写成箭头字段：挂在实例上，子类覆盖不到，super 也调不着
class BadStore {
  #orders = [];
  add = (order) => { this.#orders.push(order); };
}
```

## 参数设计

- 参数按调用方最稳定到最易变排列，可选参数放后面。
- 超过 3 个参数改成对象参数，调用点能看清每个值是什么。
- 布尔参数会让调用点读不出含义，拆成两个函数或换成取值参数。
- 默认值用默认参数，不用 `||` 兜底：`(limit = 10)` 能保住调用方传进来的 `0`。

```js
// 第三个 true 是什么，只有翻实现才知道。
fetchList(page, size, true);

// 换成取值参数，调用点自己解释自己。
fetchList(page, size, { includeArchived: true });
```

## 类的取舍

- 继承只表达「是一个」；单纯复用代码用组合或注入策略。两种实现只是共享一段流程时，把变化的那段参数化。
- 父类只放真实共性，不判断自己有哪些子类，也不导入子类；只有部分子类具有的行为放子类或抽成策略。
- 子类重写保持父类的签名和约定，行为和父类不同就在旁边写一句说明。
- 改父类的方法、构造参数或 `protected` 成员前，先找出所有子类和重写点。
- 不拿 getter / setter 做隐式副作用；要计算就写成有名字的方法。

```js
// ✗ 父类按子类类型分流，加一种导出格式就要回来改父类
class ExportJob {
  run(rows) {
    if (this.format === "csv") return toCsv(rows);
    if (this.format === "xlsx") return toXlsx(rows);
    throw new Error(`unknown format: ${this.format}`);
  }
}

// ✓ 复用靠注入，ExportJob 不认识具体格式
const createExportJob = ({ toBuffer }) => ({
  run: (rows) => toBuffer(rows),
});

const csvJob = createExportJob({ toBuffer: toCsv });
```
