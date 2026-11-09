# 业务模式：搜索与筛选

适用：文本搜索、组合筛选、输入即搜索或点击后搜索。

## 先确定触发语义

- **输入即搜索**：输入值经防抖后成为查询参数；查询缓存键必须包含影响结果的筛选条件。
- **点击搜索**：区分正在编辑的 draft 条件与已提交的 applied 条件；只有提交动作更新查询条件。
- **本地过滤**：数据已完整加载且规模合理时，可在渲染期间直接派生过滤结果。
- **服务端过滤**：数据量、权限或搜索语义要求后端过滤时，将参数交给请求 / Query 层。

## 推荐状态模型

```tsx
const [keyword, setKeyword] = useState("");
const debouncedKeyword = useDebouncedValue(keyword, 300);

const query = useQuery({
  queryKey: ["items", { keyword: debouncedKeyword }],
  queryFn: ({ signal }) => getItems({ keyword: debouncedKeyword }, { signal }),
});
```

以上为 TanStack Query 风格示例；假设 `getItems` 将 `signal` 传递给底层 `fetch`。若项目使用其他数据层，应沿用其缓存键和请求语义。`useDebouncedValue` 只负责防抖，不负责缓存、取消和竞态处理。

## 关键边界

1. Query Key 必须包含所有影响服务端结果的参数，避免不同筛选条件错误共享缓存。
2. 旧请求不能覆盖新查询结果；优先依赖成熟 Query 层的取消 / 过期请求处理。
3. 清空条件、提交条件和切换页码时，明确是否重置分页。
4. 筛选条件和页码需要一起变更时，在同一个事件处理函数或 reducer 中更新两者。
5. 如果条件需要分享或刷新恢复，评估 URL Search Params；避免 URL 与组件 State 双向重复存储。
6. 处理输入法组合输入、空白字符、大小写和服务端搜索规则；不要擅自改变业务语义。

## 常见误区

- 每次键入都直接请求，且没有防抖或请求过期处理。
- 点击搜索后仍然由另一个 Effect 根据旧状态请求。
- 将查询条件、请求结果和选择状态保存在同一个对象中。
- 仅把 keyword 放入 Query Key，遗漏其他影响结果的筛选字段。
- 对小数组过滤也机械使用 `useMemo`。

防抖和提交时机按交互需求决定，缓存和请求沿用项目现有数据层。
