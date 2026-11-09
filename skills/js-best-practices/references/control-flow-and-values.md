# Control flow and values

Covers naming, branching, defaults and optional chaining, and how a value is changed. Function form and classes are in [functions-and-classes.md](functions-and-classes.md), collections and properties in [objects-and-collections.md](objects-and-collections.md).

## Naming

- A name says what the thing is: `data`, `list`, `temp` and `res` stop meaning anything once they move, so they are out.
- Booleans start with `is` / `has` / `should` / `can` / `needs`; a function name is a verb phrase (`fetchOrders`, `normalizePhone`), and empty words like `process` or `handle` are never a name on their own.
- Abbreviations only where the team shares them: `id`, `url` and `api` are fine, while `usr`, `cfg` and `btn` are not.
- The same value in two or more places becomes a named constant; no magic numbers are left behind.

## Branching

- Handle the unusual cases and boundaries first and leave the normal path in the body, which keeps nesting shallow on its own; past three levels, extract a function rather than splitting by line count.
- Compute a complex condition into a named boolean so the `if` reads as one sentence.
- No assignment inside a condition, and no call with a side effect inside one.
- Every `switch` branch exits, and `default` either throws or is a deliberate fallback; never save code by letting a `case` fall through.

## Defaults and optional chaining

- Use `??` when only `null` and `undefined` should fall back; `||` also swallows `0`, `""` and `false`.
- Pair optional chaining with `??` right away instead of letting `undefined` travel on.
- Optional chaining is for the case where missing is normal; when missing is a bug, check for null or throw instead of masking it.

```js
const pageSize = options.pageSize ?? 20;
const ownerName = order.owner?.name ?? "unassigned";
```

## Changing a value

- Building a result uses `map` / `filter` / `find` / `some` / `every` to state the intent, rather than a hand-written `for` with a temporary variable.
- Changing one field copies that one level (`{ ...order, status: "unpaid" }`) instead of sharing a reference.

## Cases

### Boundaries first, normal path in the body

```js
// Wrong: four nested ifs, with the normal path buried on the last line.
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

// Right: each boundary returns, and the main flow reads in one pass.
const getDiscount = (user, order) => {
  if (!user?.isActive) return 0;
  if (order.items.length === 0) return 0;
  return order.coupon?.value ?? 0;
};
```

### Return a new value and leave the caller's data alone

```js
// Wrong: mutating the array and objects that came in, so the caller's state
// changes with it.
const markUnpaid = (orders) => {
  for (const order of orders) {
    if (!order.paid) order.status = "unpaid";
  }
  return orders;
};

// Right: map returns a new array, and a matching item spreads into a new object.
const markUnpaid = (orders) =>
  orders.map((order) =>
    order.paid ? order : { ...order, status: "unpaid" },
  );
```
