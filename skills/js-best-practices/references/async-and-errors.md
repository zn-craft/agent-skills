# 异步与错误

管 `async` / `await`、并发、失败与收尾。函数形态见 [functions-and-classes.md](functions-and-classes.md)，控制流见 [control-flow-and-values.md](control-flow-and-values.md)。

## async / await

- `async` / `await` 写正常流程，不写长 `.then()` 链；失败和收尾接在 promise 上。
- 独立请求一起发用 `Promise.all`；一部分失败也要全部结果用 `Promise.allSettled`；只要第一个成功用 `Promise.any`（全失败抛 `AggregateError`）。
- 有依赖才串行 `await`；并发数量不可控时切批次或加信号量，不无上限地 `Promise.all`。
- 取消接 `AbortSignal`，条件变化或组件卸载时主动 `abort()`；超时用 `AbortSignal.timeout(ms)`，多个信号合并用 `AbortSignal.any([...])`。
- 事件回调里不写 `async` 函数，抛出的错没人接得住；回调里调用了返回 promise 的函数就立刻挂 `.catch()`。

```js
// ✗ 循环里逐个 await，N 个请求排成 N 次往返
const loadProfiles = async (ids) => {
  const profiles = [];
  for (const id of ids) {
    profiles.push(await fetchProfile(id));
  }
  return profiles;
};

// ✓ 一批一起发，结果按批次顺序收
const loadProfiles = async (ids, { batchSize = 10 } = {}) => {
  const profiles = [];
  for (const batch of chunk(ids, batchSize)) {
    profiles.push(...(await Promise.all(batch.map(fetchProfile))));
  }
  return profiles;
};
```

## 抛错与记录

- 抛 `Error` 实例，不抛字符串：字符串没有堆栈，也接不住类型判断。
- 错误信息写清哪一步、什么输入，不带密钥、token、完整用户对象这类内部细节。
- 包装保留原始错误用 `new Error(message, { cause: error })`，不把 `error.message` 拼进新字符串。
- 一次抛多个错误用 `AggregateError`，调用方从 `error.errors` 逐个读回来。
- 能处理就处理，处理不了往上抛；不要每层 `try` 一遍再原样 `throw`。
- 预期内的业务失败用返回值表达（`{ ok: false, reason: "not-found" }`），异常只留给意外。
- `finally` 只放一定要执行的清理，不改业务结果。

```js
const loadOrders = (id) =>
  fetchOrders(id).catch((error) => {
    logger.error("loadOrders failed", { id, error });
    throw error;
  });
```

## 失败怎么接

每个异步操作都要能回答两个问题：失败了做什么、不管成败都要做什么。默认接 `.catch()` / `.finally()`，`await` 只负责正常流程；多个 `await` 共用同一段失败处理、捕获后还要继续走后面几步、需要在 `catch` 里重新抛给上层时才用 `try` / `catch`。

- `try` 圈得太大，同一个函数里其他语句的意外错误会被当成预期失败处理掉，真正的 bug 连堆栈都对不上。
- 失败分支按业务定：回滚乐观更新、状态改回可重试、给用户提示、上报日志；只 `console.log` 后继续走等于没处理。
- 收尾放 `finally`：loading / 提交中复位、锁和连接释放、临时资源清理；取消和超时也走这条路径，否则状态卡在 loading。
- `.finally()` 只做收尾，接不到错误；不等结果的调用照样要挂 `.catch()`。
- 每个 promise 都要有归属：浮着的 promise 出错就是未处理拒绝——Node 默认直接终止进程，浏览器里没人拿得到。

```js
// ✗ 失败没人管，loading 永远停不下来
const submit = async () => {
  setLoading(true);
  await saveOrder(order);
  setLoading(false);
};

// ✓ 默认写法：await 走正常流程，失败和收尾接在 promise 上
const submit = async () => {
  setLoading(true);
  await saveOrder(order)
    .catch((error) => {
      rollbackOrder(order.id);
      setError("保存失败，请重试");
      logger.error("saveOrder failed", { orderId: order.id, error });
    })
    .finally(() => setLoading(false));
};

// ✓ 两个 await 共用同一段失败处理时，才用 try，范围只圈这两行
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

## 案例：预期内的失败用返回值

```js
// ✗ 业务失败抛异常，调用方靠 catch 猜是哪一种
const findUser = async (id) => {
  const user = await db.findUser(id);
  if (!user) throw new Error("not-found");
  return user;
};

// ✓ 失败是正常返回值，调用方判过 ok 才能取 user
const findUser = async (id) => {
  const user = await db.findUser(id);
  return user ? { ok: true, user } : { ok: false, reason: "not-found" };
};
```
