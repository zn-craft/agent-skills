# Comments on functions and methods

Read this when writing a function, a method, a hook, a component or an exported API.

A function comment carries **the contract its signature cannot express**: preconditions, return boundaries, thrown errors, side effects, units, idempotence, required call order.

## Public interfaces take block comments

Anything called from elsewhere whose contract has something the signature cannot say needs a block comment — whether invalid input throws or returns `NaN`, whether the return value is normalized, whether a failure leaves a side effect behind. Being exported does not by itself require JSDoc; a self-explanatory signature gets none. An internal function gets one `//` line only when it carries a non-obvious constraint.

"Self-explanatory signature" is about what the caller can see, not how short the body is: a hover at the call site shows the declaration, and the body is not part of it, so a one-line wrapper may still need a comment. Only a name and a type that already state the whole contract need none; when the code should change instead, change the code, and fall back to a comment only when it cannot or should not.

When the missing contract shows up at a call site, fix it on the declaration: a single comment at the call site just leaves the next caller to trip over the same thing.

Tags earn their place only when they carry information:

| Tag | When to write it | The redundant version |
| --- | --- | --- |
| `@param` | the argument has a range, a format, a unit or a precondition | `@param {string} id the user ID` |
| `@returns` | the boundary is not obvious: may be empty, may be `-1`, order guaranteed | `@returns the user list` |
| `@throws` | it throws and the caller has to handle that | leaving it out, so callers learn by crashing |
| `@deprecated` | always with the replacement and the removal condition | a bare "deprecated" |
| `@example` | the usage is not obvious, for instance argument combinations matter | an example for a plain getter |
| `@default` | the default comes from somewhere the signature does not show | — |

## Cases

Return boundary
✗ `// get the user list` above `getUserList()`
✓ `/** Returns an empty array when there is nothing, never null */`
reason: the boundary the caller must handle is missing

One-line wrapper
✗ nothing, on the grounds that the body is one line and reads easily
✓ `/** Returns NaN when parsing fails; it does not throw */`
reason: the caller sees the declaration, not the body, and the failure boundary is not in the declaration

Precondition
✗ `// compute the price`
✓ `/** init() must run first, otherwise this reads the default exchange rate */`
reason: the required order is invisible in the signature

Side effect
✗ `// send a notification`
✓ `/** Also marks the notification as read, and does not roll that back on failure */`
reason: the caller has to know about the hidden consequence

Deprecation
✗ `/** @deprecated */`
✓ `/** @deprecated Use fetchOrders; this endpoint goes away in 2026-03 */`
reason: the value of a deprecation notice is entirely in the replacement and the deadline

## Where languages differ

- TS: types live in the signature, so comments carry semantics and boundaries only.
- JS: no type system, so JSDoc carries the types of parameters and return values.
- Python: the docstring sits directly under `def`, and Args / Returns / Raises line up one-to-one with the signature; skip types when annotations already exist.
- Go: the doc comment goes above the declaration, opens with the name of the thing it documents, and uses full sentences instead of tags.
