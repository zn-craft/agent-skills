# 函数与类

管函数形态、参数设计和类与继承的结构取舍。控制流与值处理见 [control-flow-and-values.md](control-flow-and-values.md)，异步与错误见 [async-and-errors.md](async-and-errors.md)。

## 函数形态

默认写箭头函数：`const formatPrice = (value: number): string => {...}`。它不绑定自己的 `this`，回调里不用额外 `bind`。

这些情况写 `function`：

| 情况 | 原因 |
| --- | --- |
| 类的方法 | 挂在原型上，子类能 `super` 调用 |
| 需要动态 `this` | 箭头函数的 `this` 由定义位置决定 |
| 生成器 `function*` | 箭头函数没有生成器语法 |
| 构造函数 | 需要 `new` 和 `this` |
| 依赖函数声明提升 | 调用点在定义之前，箭头函数会报暂时性死区 |

- 回调一律用箭头，避免 `this` 丢失。
- 递归函数写成命名函数表达式，栈里能看到方法名，排查问题时不用靠行号猜。
- 不为了「统一」把类方法、`this` 敏感的存量函数改写成箭头，这类改写容易引入行为差异。

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

- 继承只表达「是一个」关系；单纯复用代码用组合、传函数或注入策略。
- 父类只放真实共性。只有部分子类具有的行为，放到子类重写或抽成策略，不在父类里按类型分流。
- 父类不判断自己有哪些子类，也不导入子类。
- 子类重写保持父类的签名和约定；行为和父类不同时在旁边写一句说明。
- 改父类的方法、构造参数或被 `protected` 标记的成员前，先找出所有子类和重写点，逐个确认影响。
- 不滥用 getter / setter 做隐式副作用；取值就是取值，要计算就写成有名字的方法。

## 案例

### 同一个文件里的箭头与 function

```js
// ✓ 默认箭头：纯函数和回调不绑 this，回调里不用 bind
const formatPrice = (cents) => `¥${(cents / 100).toFixed(2)}`;
const orderRows = rows.map((row) => ({ id: row.id, name: row.name }));

// ✓ 类方法是原型方法，子类能 super，this 跟着实例走
class OrderStore {
  #orders = [];
  add(order) {
    this.#orders = [...this.#orders, order];
  }
  listPending() {
    return this.#orders.filter((order) => !order.paid);
  }
}

// ✓ 生成器没有箭头写法，写 function*
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

### 复用代码用组合，不用继承

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
const xlsxJob = createExportJob({ toBuffer: toXlsx });
```

只有子类和父类真是「是一个」关系时才写 `extends`；两种实现只是共享一段流程时，把变化的那段参数化。
