# Functions and classes

Covers function form, parameter design, and the tradeoff between classes and inheritance. Control flow and values are in [control-flow-and-values.md](control-flow-and-values.md), async work in [async-and-errors.md](async-and-errors.md).

## Function form

Arrow functions are the default: they do not bind their own `this`, so callbacks need no `bind`. Write `function` in these cases:

| Case | Why |
| --- | --- |
| Class methods | They live on the prototype, so a subclass can call `super` |
| Anything needing a dynamic `this`, including an explicit `this` parameter | An arrow function takes `this` from where it is defined |
| Generators, `function*` | Arrow functions have no generator syntax |
| Constructors | They need `new` and `this` |
| Code relying on function declaration hoisting | The call site comes before the definition, and an arrow function hits the temporal dead zone |

Write a recursive function as a named function expression, so the name shows up in a stack trace instead of being guessed from a line number.

Do not rewrite the form of existing functions for the sake of consistency: a class method turned into an arrow property sits on the instance, where a subclass cannot override it and `super` cannot reach it, and a `this`-sensitive rewrite tends to change behavior.

```js
const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

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

// Wrong: a class method written as an arrow property. It sits on the instance,
// a subclass cannot override it, and super cannot reach it.
class BadStore {
  #orders = [];
  add = (order) => { this.#orders.push(order); };
}
```

## Parameter design

- Order parameters from the most stable to the most volatile for the caller, with optional ones last.
- Past three parameters, switch to an options object so the call site shows what each value is.
- A boolean parameter hides its meaning at the call site; split it into two functions or use a value parameter.
- Use default parameters rather than `||` as a fallback: `(limit = 10)` keeps a `0` the caller passed in.

```js
// What the third true means is only visible inside the implementation.
fetchList(page, size, true);

// A value parameter explains itself at the call site.
fetchList(page, size, { includeArchived: true });
```

## Choosing a class

- Inheritance expresses "is a"; plain code reuse uses composition or an injected strategy. When two implementations only share a flow, parameterize the part that changes.
- A parent class holds real commonality only: it never asks which subclasses it has and never imports them, and behavior only some subclasses need lives there or in a strategy.
- An override keeps the parent's signature and contract, and a behavior difference gets a line of explanation next to it.
- Before changing a parent method, a constructor parameter or a `protected` member, find every subclass and override.
- Do not hide side effects in a getter or setter; when something has to be computed, give it a named method.

```js
// Wrong: the parent branches on the subclass type, so a new export format
// means coming back to edit the parent.
class ExportJob {
  run(rows) {
    if (this.format === "csv") return toCsv(rows);
    if (this.format === "xlsx") return toXlsx(rows);
    throw new Error(`unknown format: ${this.format}`);
  }
}

// Right: reuse through injection, and ExportJob knows no concrete format.
const createExportJob = ({ toBuffer }) => ({
  run: (rows) => toBuffer(rows),
});

const csvJob = createExportJob({ toBuffer: toCsv });
```
