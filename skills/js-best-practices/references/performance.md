# Performance tradeoffs

Covers structural choices around loops and lookups: when a structure is worth changing, and what common hot spots look like. Container choice is in [objects-and-collections.md](objects-and-collections.md), copy cost in [values-and-numbers.md](values-and-numbers.md).

## Measure before changing

Without a measurement, the structure stays as it is: establish where the hot spot is, how much data is involved, and whether the code runs once per interaction or thousands of times. Swapping the shape on a hunch mostly buys harder-to-read code with no visible gain, and any change is re-measured at the same data size afterwards.

## Lookups inside a loop

An outer pass with an inner `find` / `filter` / `includes` is O(n*m): past a thousand rows it simply stalls.

- Data looked up repeatedly gets a `Map` built once by key, and every lookup after that is O(1).
- Building an index changes the meaning of duplicate keys and missing values: which one a duplicate id keeps, and whether a miss returns `undefined` or a default, follows the previous behavior.

```js
// Wrong: an outer pass with an inner find, which is O(n*m) as soon as data grows.
const rows = orders.map((order) => ({
  ...order,
  buyer: users.find((user) => user.id === order.userId),
}));

// Right: build the index once, then every lookup is O(1).
const userById = new Map(users.map((user) => [user.id, user]));
const rows = orders.map((order) => ({
  ...order,
  buyer: userById.get(order.userId),
}));
```

## One pass instead of several

Chaining `filter().map().reduce()` over one array allocates intermediate arrays and walks the data repeatedly. Several related results (a count, a total, a grouping) come out of a single loop.

Only merge when the data is large or the call is frequent: `filter().map()` reads more clearly, and small data is not worth unrolling.

```js
// Wrong: three passes and two intermediate arrays.
const paid = orders.filter((order) => order.paid);
const amounts = paid.map((order) => order.amount);
const sum = amounts.reduce((acc, amount) => acc + amount, 0);

// Right: one pass yields both the count and the total.
let count = 0;
let sum = 0;
for (const order of orders) {
  if (!order.paid) continue;
  count += 1;
  sum += order.amount;
}
```

## Stop as soon as the answer is known

- `some` answers whether anything matches, `every` whether all do, and `find` returns the first hit; `filter(...).length > 0` walks the whole array.
- A maximum or minimum comes from one comparison pass, not from `sort()` followed by the first element: sorting costs more and mutates the array.
- Showing the first N records does not need a full sort followed by a slice.

```js
// Wrong: a full pass just to answer yes or no.
const hasBlocked = users.filter((user) => user.blocked).length > 0;

// Right: return on the first hit.
const hasBlocked = users.some((user) => user.blocked);
```

## No repeated work inside a loop

Do not rebuild a regular expression, re-parse a date or call `JSON.parse` again inside the body, and do not compute the same chained property access twice; hoist it into a variable outside the loop. This change also waits for confirmation that the spot is hot, otherwise it only adds a variable.

## A cache needs its invalidation condition first

A cache trades memory and staleness risk for time: add one when the input is stable, the call repeats often and a single result is genuinely expensive, and write the key together with the invalidation condition. A cache without one ends up serving stale data.

## Merge repeated IO

Several writes or requests that can become one should become one (a batch endpoint, one transaction writing several rows). That cuts round trips, which is worth far more than saving a few property accesses.
