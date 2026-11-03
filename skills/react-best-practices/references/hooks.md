# 自定义 Hooks

## 调用规则

- 自定义 Hook 用 `use` 加大写字母开头，例如 `useSelection`。
- 普通 Hooks 必须在函数组件或自定义 Hook 的顶层调用，放在所有可能提前返回的分支之前。
- 调用顺序必须在每次渲染中一致；不要用注释关闭 Hooks lint 绕过问题。
- React `use` API 有独立规则，不要把普通 Hooks 的全部限制机械套用到它。

如果隐藏面板时要保留草稿，把提前返回放到 `useState` 后面。这里假设调用方只是切换 `visible`，组件始终挂载。

```tsx
function EditPanel({ visible }: { visible: boolean }) {
  const [draft, setDraft] = useState("");
  if (!visible) return null;
  return <input aria-label="草稿" value={draft} onChange={(e) => setDraft(e.currentTarget.value)} />;
}
```

## 何时抽取

- 逻辑有独立领域语义、状态生命周期、外部订阅 / 副作用或明确复用需求时，考虑抽取。
- 纯计算用普通函数；重复 UI 用组件；不要只为缩短文件或包一层 `useState` 而抽 Hook。
- 每次 Hook 调用拥有独立状态；调用同一个 Hook 不会自动共享状态。

## 参数与返回值

- 参数较多或存在可选配置时优先具名对象；少量且语义清楚时可用位置参数。
- 单一值及 setter 可返回元组；多个状态和动作通常返回具名对象。
- 同一个 Hook 在加载、成功和失败等状态下保持返回结构一致，例如始终返回 `{ status, data, error }`，由字段值表达差异。
- Hook 通常返回数据和操作，不返回 JSX。
- 返回对象每次重建不自动构成问题；只有引用稳定性造成可验证影响时才考虑缓存。
- `useMemo` / `useCallback` 是优化工具，不用于建立业务正确性或持久身份保证。

## 浏览器与 SSR

项目使用 SSR / SSG 时，读取浏览器状态需遵循 [ssr-and-hydration.md](ssr-and-hydration.md)。不要在 Hook 初始化或渲染阶段假设 `window`、`navigator`、`localStorage` 一定存在。
