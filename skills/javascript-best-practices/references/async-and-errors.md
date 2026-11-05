# 异步与错误

管 `async` / `await`、并发和错误处理的语言层写法。函数形态与类见 [functions-and-classes.md](functions-and-classes.md)，控制流见 [control-flow-and-values.md](control-flow-and-values.md)。

## async / await

- 能用 `async` / `await` 就不写长 `.then()` 链，错误堆栈和阅读顺序都更接近同步代码。
- 每个 promise 都要有归属：`await`、`return`，或挂 `.catch()`。浮着的 promise 出错会变成未处理拒绝。
- 没有依赖的请求一起发，用 `Promise.all` 收定长结果。
- 有依赖的请求才串行 `await`；循环里逐个 `await` 前先确认是不是真的需要按顺序。
- 并发数量要限制时写批次或信号量，不要无上限地 `Promise.all` 几万个任务。
- 需要取消的请求接 `AbortSignal`，条件变化或组件卸载时主动 `abort()`，不用一个 `isCancelled` 变量到处判断。

```js
// 无依赖的两个请求串行，白等一个来回。
const user = await fetchUser(id);
const orders = await fetchOrders(id);

// 一起发，结果按位置收。
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
```

## 错误处理

- 抛 `Error` 实例，不抛字符串：字符串没有堆栈，也接不住类型判断。
- 错误信息写清哪一步、什么输入；不带密钥、token、完整用户对象这类内部细节。
- 捕获后至少记录或重新抛出，空 `catch` 和「只 `console.log` 后继续走」都要避免。
- 能处理就处理，处理不了就往上抛；不要每一层都 `try` 一遍再原样 `throw`。
- 预期内的业务失败用返回值表达，让调用方必须判断：`{ ok: false, reason: "not-found" }`。
- `finally` 只放一定要执行的清理，不在这里改业务结果。

```js
const loadOrders = async (id) => {
  try {
    return await fetchOrders(id);
  } catch (error) {
    logger.error("loadOrders failed", { id, error });
    throw error;
  }
};
```

## 案例

### 独立请求并行，数量不可控时切批次

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

循环里的 `await` 只有在前一项的结果决定下一项时才留；数量不可控时按批切分，结果顺序跟着批次走。

### 预期内的失败用返回值

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

### 每个 promise 都要有归属

```js
// ✗ 没有 await 也没有 catch，报错变成 unhandledRejection
saveDraft(draft);

// ✓ 要么等它拿结果，要么显式接住错误
await saveDraft(draft);
void saveDraft(draft).catch((error) => logger.error("saveDraft failed", error));
```
