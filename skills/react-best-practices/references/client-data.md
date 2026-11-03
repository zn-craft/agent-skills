# 客户端请求与缓存

适用于浏览器端请求和远端缓存。服务端加载按项目的 SSR 或 RSC 机制处理。

## 请求与缓存

- 项目已有查询层（如 TanStack Query、SWR、RTK Query）或框架加载机制时，由它管理查询状态、缓存、重试和失效。请求函数继续使用项目已有的 HTTP 客户端和封装。
- 项目只有 Axios 实例、`fetch` 封装或其他 HTTP 客户端时，复用它已有的鉴权、错误处理和取消约定。先确认哪些能力由封装提供，再补组件需要的状态。
- 服务端数据与本地 UI 状态分开；不要无理由把远端列表复制进全局 Store。
- 请求触发遵循用户语义：输入即搜索由查询参数驱动；点击搜索才提交时使用已提交条件；用户动作触发的变更由事件 / Mutation 发起。
- 不把所有异步逻辑放进 Effect。只有确实由组件订阅或响应式参数驱动，且项目没有合适数据层时才考虑 Effect 请求。
- 区分初始加载、后台刷新、错误和成功空数据；空数组不等于请求失败。

## 组件需要自行管理请求时

- 请求参数变更或组件卸载时，使用客户端支持的方式取消请求，或标记旧结果失效。Axios 可在支持的版本传入 `signal`，通过封装调用时确认它传到了底层。
- 按请求层的错误约定处理失败。直接使用原生 `fetch` 时检查 `response.ok`，因为 HTTP 4xx / 5xx 不会自动 reject。
- 取消请求通常不应显示成普通错误；事件与异步回调异常需有 UI、日志或监控处理。
- 若请求层已管理取消、错误和缓存，不在组件重复实现。

如果关键词变化驱动请求，且项目没有查询层管理竞态，可以这样防止上一轮结果覆盖这一轮。示例里的 `searchUsers` 使用项目已有客户端，接收并传递 `signal`，按项目约定报告错误。

```tsx
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  searchUsers(keyword, signal).then(
    (users) => {
      if (!signal.aborted) setResult({ status: "success", users });
    },
    (error: unknown) => {
      if (!signal.aborted) setResult({ status: "error", error });
    },
  );

  return () => controller.abort();
}, [keyword]);
```
