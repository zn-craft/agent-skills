# SSR / SSG 与 Hydration

**适用范围：** 服务端渲染、静态生成及客户端 hydration。普通 CSR 项目无需加载。RSC 是不同执行模型，见 [server-components.md](server-components.md)。

## 环境边界

- 可能在服务端执行的模块顶层、组件渲染和状态初始化器不能直接读取 `window`、`document`、`navigator`、`localStorage`、`matchMedia` 等浏览器 API。
- `use client` 定义客户端模块边界，不代表组件一定只在浏览器执行；框架仍可能先服务端预渲染。
- 浏览器状态需在客户端读取时，根据语义使用 Effect、动态加载或 `useSyncExternalStore`，并提供一致的初始值 / server snapshot。
- React DOM 19.3 的 `browser()` 可通过 `use(browser())` 让组件选择性跳过服务端渲染；它会在服务器触发最近 Suspense 边界的 fallback。只用于确实无法提供服务端 UI 的场景，不替代优先提供稳定初始 HTML 的设计。

## Hydration 一致性

- 服务端 HTML 与客户端首次渲染结果必须一致。出现 hydration mismatch 时，先找出两次输出为什么不同。
- 避免首次渲染使用随机数、当前时间、客户端 locale、浏览器尺寸或不同步的外部数据产生差异。
- 共享初始数据时使用框架提供的序列化 / 数据传递机制；外部 Store 提供一致的 server snapshot。
- 跨 SSR / hydration 生成稳定 ID 时使用 `useId`，不要使用随机值或时间戳。
- “先服务端渲染占位，再在 Effect 切换客户端内容”会增加一次渲染，只在必要且接受体验代价时使用。

例如，密度偏好只存在浏览器时，服务端和客户端首次渲染都用默认密度。挂载后再恢复已保存的值。

```tsx
"use client";

import { useEffect, useState } from "react";

export function DensityLabel() {
  const [density, setDensity] = useState<"normal" | "compact">("normal");

  useEffect(() => {
    let saved: string | null;
    try {
      saved = window.localStorage.getItem("table-density");
    } catch {
      return; // 存储不可用时保留默认值。
    }
    if (saved === "compact") setDensity("compact");
  }, []);

  return <span>{density === "compact" ? "紧凑" : "标准"}</span>;
}
```

## 数据与诊断

- 优先使用框架的数据加载、路由 loader 或缓存机制；避免把可在服务端并行取得的数据拆成客户端 Effect 请求瀑布。
- 只向客户端序列化确实需要的数据；不传递密钥、内部凭据或无用的大对象。
- 排查 mismatch 时先比较服务端 HTML 与客户端首次 render 的数据和分支，再检查环境判断、时间 / 随机数、locale、无稳定初始数据、无效 HTML 嵌套和第三方脚本。
- 流式 SSR、缓存、请求隔离和部署行为由框架 / 运行时决定；不在普通组件里自行实现 `react-dom/server` 顶层 API。
