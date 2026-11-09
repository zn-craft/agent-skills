# Async work and errors

Covers `async` / `await`, concurrency, failure and finishing work. Function form is in [functions-and-classes.md](functions-and-classes.md), control flow in [control-flow-and-values.md](control-flow-and-values.md).

## async / await

- `async` / `await` carries the normal flow rather than a long `.then()` chain; failure and finishing attach to the promise.
- Independent requests go out together with `Promise.all`; when a partial failure still needs every result, use `Promise.allSettled`; when only the first success matters, use `Promise.any`, which throws an `AggregateError` if all fail.
- Dependencies are what make `await`s sequential; when concurrency would be unbounded, batch the work or add a semaphore instead of calling `Promise.all` over everything.
- Cancellation attaches to an `AbortSignal`, calling `abort()` when the condition changes or a component unmounts; a timeout uses `AbortSignal.timeout(ms)`, and several signals combine through `AbortSignal.any([...])`.
- Never write an `async` function as the callback of an event handler, because nothing can catch what it throws; when a callback calls a function returning a promise, attach `.catch()` immediately.

```js
// Wrong: awaiting inside the loop turns N requests into N round trips.
const loadProfiles = async (ids) => {
  const profiles = [];
  for (const id of ids) {
    profiles.push(await fetchProfile(id));
  }
  return profiles;
};

// Right: each batch goes out together, and results keep the batch order.
const loadProfiles = async (ids, { batchSize = 10 } = {}) => {
  const profiles = [];
  for (const batch of chunk(ids, batchSize)) {
    profiles.push(...(await Promise.all(batch.map(fetchProfile))));
  }
  return profiles;
};
```

## Throwing and logging

- Throw `Error` instances, not strings: a string carries no stack and no type to check.
- An error message states which step and which input, without internal detail such as keys, tokens or a whole user object.
- Keep the original error when wrapping, with `new Error(message, { cause: error })` rather than concatenating `error.message` into a new string.
- Several errors at once go into an `AggregateError`, and the caller reads them back from `error.errors`.
- Handle what can be handled and rethrow what cannot; do not wrap every layer in `try` only to `throw` the same thing again.
- An expected business failure comes back as a return value (`{ ok: false, reason: "not-found" }`) and exceptions are left for the unexpected.
- `finally` holds cleanup that must run, and does not change the business result.

```js
const loadOrders = (id) =>
  fetchOrders(id).catch((error) => {
    logger.error("loadOrders failed", { id, error });
    throw error;
  });
```

## How a failure is caught

Every async operation answers two questions: what happens on failure, and what happens either way. By default that means `.catch()` / `.finally()` while `await` carries the normal flow; `try` / `catch` comes in when several `await`s share one failure handler, when execution continues after a catch, or when the catch rethrows to a caller further out.

- A `try` that is too wide turns an unexpected error elsewhere in the function into a handled failure, and the real bug no longer matches its stack.
- The failure branch follows the business: roll back an optimistic update, return the state to something retryable, tell the user, report to logging. A `console.log` followed by carrying on is not handling.
- Finishing work goes in `finally`: clearing loading or a submitting flag, releasing locks and connections, cleaning up temporary resources. Cancellation and timeouts take that path too, or the state stays stuck on loading.
- `.finally()` only finishes; it catches nothing, and a call whose result is not awaited still needs `.catch()`.
- Every promise has an owner: a floating promise that fails becomes an unhandled rejection, which ends a Node process by default and reaches nobody in a browser.

```js
// Wrong: nothing handles a failure, and loading never stops.
const submit = async () => {
  setLoading(true);
  await saveOrder(order);
  setLoading(false);
};

// Right: await carries the normal flow while failure and finishing attach to the promise.
const submit = async () => {
  setLoading(true);
  await saveOrder(order)
    .catch((error) => {
      rollbackOrder(order.id);
      setError("Save failed, please retry");
      logger.error("saveOrder failed", { orderId: order.id, error });
    })
    .finally(() => setLoading(false));
};

// Right: try comes in only when two awaits share one failure handler, and it
// wraps exactly those two lines.
const submit = async () => {
  setLoading(true);
  try {
    await saveOrder(order);
    await notifyWarehouse(order.id);
  } catch (error) {
    rollbackOrder(order.id);
    logger.error("submit failed", { orderId: order.id, error });
    return;
  } finally {
    setLoading(false);
  }
  setSaved(true);
};
```

## Case: an expected failure as a return value

```js
// Wrong: a business failure thrown as an exception, leaving the caller to guess
// which kind it was from a catch.
const findUser = async (id) => {
  const user = await db.findUser(id);
  if (!user) throw new Error("not-found");
  return user;
};

// Right: the failure is an ordinary return value, and the caller checks ok
// before reaching for user.
const findUser = async (id) => {
  const user = await db.findUser(id);
  return user ? { ok: true, user } : { ok: false, reason: "not-found" };
};
```
