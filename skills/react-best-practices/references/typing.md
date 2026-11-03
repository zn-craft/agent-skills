# React + TypeScript 类型

## Props 与组件类型

- Props 的命名和声明方式沿用项目约定。
- `children` 仅在组件确实接收内容时显式声明为 `React.ReactNode`。
- 包装组件库时优先复用组件公开的 Props、事件和 ref 类型。简单包装且库未单独导出 Props 时，可以从 `React.ComponentProps<typeof Button>` 取类型。只暴露包装组件实际支持的属性。
- 包装原生元素时从对应标签取类型。例如不转发 ref 的按钮用 `React.ComponentPropsWithoutRef<'button'>`。
- 互斥模式用判别式联合表达，避免大量可选 Props 组成非法状态。
- 优先为函数参数标注 Props 并让返回类型推断；`React.FC` 不是错误 API，不为风格偏好批量改写存量代码。

## 事件与 ref

- 回调 Props 使用明确签名，如 `(id: string) => void`，避免 `Function` / `any`。
- 事件类型跟实际回调走。组件库的 Select 如果直接传选中值，就沿用该回调签名。原生输入框的 change 回调才用对应的 DOM 事件类型，如 `React.ChangeEvent<HTMLInputElement>`。
- DOM ref 提供准确元素类型和 `null` 初始值，不使用 `any`。
- 组件库可能暴露 DOM 节点，也可能暴露自定义句柄。以实际声明为准。转发 ref 或使用 Fragment ref 前查 [版本兼容](compatibility.md)。

## 泛型 Props

调用方的数据类型需要同时约束多个 Props 时再用泛型。例如列表组件的 `items` 和 `onSelect` 可以共享同一个元素类型。
