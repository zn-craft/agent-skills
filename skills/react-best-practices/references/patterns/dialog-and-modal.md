# 业务模式：Dialog / Modal / Drawer

适用：确认弹窗、编辑表单弹窗、抽屉和带异步动作的对话框。

## 先选择控制方式

- **受控**：父级持有 `open`，通过 `onOpenChange` 接收关闭请求。适用于页面流程、路由状态和外部按钮控制。
- **非受控**：组件内部管理开关，调用方提供初始值或触发器。适用于简单、独立的展示组件。
- **命令式 Ref**：只在库或场景明确需要 `open()` / `close()` 命令式 API 时使用；不要把它作为默认状态管理方式。

## 推荐决策

1. 弹层只负责展示和通用交互；业务提交、删除等动作由业务组件或 Hook 管理。
2. 关闭策略明确：点击遮罩、按 Escape、点击关闭按钮、提交中是否允许关闭，由产品语义决定。
3. 模态 Dialog 应正确管理焦点：打开时移动焦点、限制焦点范围、关闭后恢复到触发元素。
4. 非模态 Popover / Tooltip 不是 Dialog，不应机械套用焦点陷阱。
5. 异步提交区分 idle / submitting / success / error；避免重复提交，并确保失败后用户能恢复。
6. 多个弹窗是否允许同时打开、关闭父弹窗时子弹窗如何处理，需有明确策略。
7. 优先使用经过验证的 Dialog / Drawer 组件库；不要只靠 `role="dialog"` 自己模拟完整无障碍行为。

## Props 设计示意

```tsx
type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};
```

这是受控接口示意，不是完整 Dialog 实现。完整组件还需处理 portal、焦点、键盘、滚动锁定、ARIA 和 SSR 兼容等细节。

## 常见误区

- 一个 Modal 组件包含所有业务动作和各种业务字段。
- 通过大量布尔 Props 组合出难以理解的弹窗类型。
- 关闭弹窗后是否清空表单状态没有定义。
- 只处理视觉关闭，不恢复焦点或键盘操作。
- 把 Popover、Menu、Tooltip 和模态 Dialog 统一当作同一种弹层。
