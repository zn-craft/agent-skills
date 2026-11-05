# JSX 与组件类型

管 `.tsx` 里 Props、事件、ref 和泛型组件的类型怎么标。组件怎么拆、状态放哪、渲染行为见项目里的 React 约定，这里只管类型。

## Props 与组件类型

- Props 是对象契约，沿用其他对象类型的规则：用 `interface`，命名 `I` + 组件名 + `Props`（`IUserCardProps`）；互斥状态才改成 `type` 联合。
- `children` 只在组件确实接收内容时声明，类型用 `React.ReactNode`。
- 包装组件库时复用组件公开的 Props、事件和 ref 类型。库没有单独导出 Props 时，从 `React.ComponentProps<typeof Button>` 取，并只暴露包装组件实际支持的属性。
- 包装原生元素时从对应标签取类型：不转发 ref 用 `React.ComponentPropsWithoutRef<"button">`，转发 ref 用 `React.ComponentPropsWithRef<"button">`。
- 互斥模式用判别式联合表达，不用一堆可选 Props 拼出非法状态。
- 函数参数标 Props 类型，返回类型交给推导；`React.FC` 不是错误 API，不为风格偏好批量改写存量代码。

```tsx
interface IAlertProps {
  children: React.ReactNode;
  kind: "text" | "action";
  text?: string;
  onConfirm?: () => void;
}

// 互斥状态改成判别式联合，调用方不可能同时传 text 和 onConfirm。
// 这里是 type 别名，按联合类型处理，不加 I 前缀。
type StrictAlertProps = { children: React.ReactNode } & (
  | { kind: "text"; text: string }
  | { kind: "action"; onConfirm: () => void }
);
```

## 事件

- 回调 Props 写明确签名，如 `(id: string) => void`，不用 `Function` 或 `any`。
- 事件类型跟着实际回调走。组件库的回调直接传选中值时，沿用它的签名；只有原生输入框的 change 才用 `React.ChangeEvent<HTMLInputElement>`。
- 组件库自己声明了事件类型就用它的，不手写一个近似类型代替。

```tsx
interface ISearchProps {
  onKeywordChange: (keyword: string) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
```

## ref

- DOM ref 用准确元素类型和 `null` 初值：`React.useRef<HTMLInputElement>(null)`，不用 `any`。
- 组件库可能暴露 DOM 节点，也可能暴露自定义句柄（`focus`、`scrollTo` 之类），以实际声明为准。
- 转发 ref 或使用 Fragment ref 前先确认项目实际 React 版本，不同版本的类型写法不一样。

```tsx
const inputRef = React.useRef<HTMLInputElement>(null);

const focusInput = (): void => {
  inputRef.current?.focus();
};
```

## 泛型 Props

调用方的数据类型需要同时约束多个 Props 时再用泛型。列表组件的 `items` 和 `onSelect` 共享同一个元素类型就是典型场景；只有一个具体类型时直接写具体类型。

```tsx
interface ISelectProps<T> {
  items: readonly T[];
  onSelect: (item: T) => void;
  renderLabel: (item: T) => string;
}

const Select = <T,>({ items, onSelect, renderLabel }: ISelectProps<T>) => {
  return <ul>{items.map((item) => <li key={renderLabel(item)} onClick={() => onSelect(item)}>{renderLabel(item)}</li>)}</ul>;
};
```
