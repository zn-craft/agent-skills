# Objects and collections

Covers the choice between arrays, objects and `Map` / `Set`. Values and dates are in [values-and-numbers.md](values-and-numbers.md), control flow in [control-flow-and-values.md](control-flow-and-values.md).

## Look for the existing tool first

With a utility library or an internal `utils` in the project, one approach per concern is enough; the names below are common examples, and another library or an internal implementation with the same capability counts just as much. Imports are covered in [imports.md](imports.md).

- Anything that takes a dozen lines to hand-write and gets it wrong belongs to a utility: `groupBy`, `keyBy`, `uniqBy`, `sortBy`, `chunk`, `debounce`, `throttle`. Written by hand, these tend to fail on equality, cancellation and the last invocation.
- Anything a built-in expresses in one line (`map` / `filter` / `find` / `some` / `Object.entries` / `Object.fromEntries`) uses the built-in, without wrapping everything in `_.` for the sake of consistency.
- Path-based helpers such as `get` and `set` carry no type check on the path, silently return `undefined` for a missing field and report nothing for a misspelled path; a known shape uses optional chaining.

## Arrays

- First see whose array it is: a temporary array you built is sorted or pushed in place more directly, while one from arguments, state, a store or a cache must not be mutated, because other holders see the change. When mutating is the contract, the name says so (`sortInPlace`).
- The non-mutating forms (`toSorted`, `toReversed`, `toSpliced`, `with`) copy the whole array; with large data, check for other holders first and mutate in place when there are none rather than copying once more to look pure.
- `sort`, `push`, `splice`, `reverse` and `fill` all mutate, and `sort` compares as strings by default (`[10, 9].sort()` stays `[10, 9]`); numeric order takes `(a, b) => a - b`, and locale order takes `localeCompare`.
- Existence uses `includes`, which also finds `NaN`, while `indexOf` is for when the index matters; the first match is `find`, whether anything matches is `some`, and whether everything does is `every`.
- Order, early exit or an `await` in the body call for `for...of`; never walk an array with `for...in`, which enumerates string keys and picks up enumerable properties on the prototype chain.
- A fixed-length sequence comes from `Array.from({ length: n }, (_, index) => index)`; `new Array(n)` is sparse and `map` / `forEach` skip the holes.

## Objects

- Owning a key is tested with `Object.hasOwn(target, key)`; `target.hasOwnProperty(key)` can be shadowed by a property of the same name and does not exist on `Object.create(null)`, while both `in` and `for...in` walk the prototype chain.
- Own keys are iterated with `Object.keys` / `values` / `entries`, which give enumerable own string keys only; `Symbol` keys need `Object.getOwnPropertySymbols` and do not survive JSON.
- Key order is not a contract: integer-like keys move to the front. When order carries meaning, use a `Map` or an array instead of relying on how the literal was written.
- Keys that outside input controls (URL parameters, form field names, a dictionary from an API) use a `Map` or `Object.create(null)`; an ordinary object using `__proto__` as a key pollutes the prototype.
- Frequent addition and removal of keys uses a `Map`, since `delete` makes the engine drop the object's shape.

## Map and Set

- Use a `Map` when keys are of any type or must not collide with built-in properties, rather than forcing an ordinary object.
- Key existence uses `map.has(key)`, not `map.get(key) !== undefined`, because the value itself may be `undefined`.
- De-duplication, membership and allow-lists use a `Set`; a large collection tests membership with `set.has`, avoiding the linear scan of `array.includes`.
- The count comes from `size`, not `length`.

## Cases

```js
// Wrong: scores belongs to the caller, sort changes it too, and the default
// comparison is by string.
const rank = (scores) => scores.sort();

// Right: keep the original and return a new array.
const rank = (scores) => scores.toSorted((a, b) => a - b);

// Right: an intermediate array you built is mutated directly, with no copy.
const rankValid = (scores) => {
  const valid = scores.filter((score) => score >= 0);
  valid.sort((a, b) => a - b);
  return valid;
};
```

```js
// Wrong: reading only what get returns cannot tell when the value is undefined.
if (cache.get(key) !== undefined) return cache.get(key);

// Right: has tests existence and get reads the value.
if (cache.has(key)) return cache.get(key);
```
