# 主题与状态

判据：主题切到深色、键盘聚焦到控件时，每个组件仍然完整。缺哪一项就是哪一项没写。

## 主题值只在 token 覆盖处写

```css
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #111827);
  --text: light-dark(#111827, #f9fafb);
}

/* ✓ 手动切换只覆盖变量，组件一行都不用动 */
[data-theme="dark"] {
  color-scheme: dark;
  --surface: #111827;
  --text: #f9fafb;
}
```

默认主题跟着系统走（`prefers-color-scheme` 或 `light-dark()`），手动切换用根节点上的 `data-theme`，别再加别的机制。组件里只认 `var(--surface)` 这类语义变量，不写 `.dark .card` 这样的分支——写了就会漏掉下一个新组件。

## 交互状态按清单补齐

| 组件 | 至少要有的状态 |
| --- | --- |
| 按钮、链接 | `:hover`、`:focus-visible`、`:active`、`:disabled` |
| 输入框 | `:focus-visible`、`:disabled`、`:read-only`、错误态 |
| 有异步动作的控件 | 加载态（`isLoading`）、成功与失败提示 |
| 列表、表格 | 空数据、只有一条、超长文本 |

状态用类名表达（`isLoading`、`hasError`），不靠 `:nth-child` 或相邻选择器推断。

## 把清单落成一个组件

```css
/* ✓ 一个按钮把清单上的状态补齐，颜色全部来自语义 token */
.button {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
}
.button:hover { background: var(--color-primary-hover); }
.button:active { background: var(--color-primary-active); }
.button:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
.button:disabled,
.button.isLoading { opacity: 0.6; cursor: not-allowed; }
```

深色主题只换 `:root` 上的变量，这段规则一行不用重写；缺哪个状态，对着上面的清单补一行。

## 聚焦与动效

```css
/* ✗ 收掉聚焦框，键盘用户找不到当前位置 */
.button:focus-visible { outline: none; }

/* ✗ 过渡所有属性，改一个颜色也连带动画 */
.card { transition: all 0.2s; }

/* ✓ 只过渡要动的属性 */
.card { transition: background-color 0.2s; }

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
```

聚焦框不用 `outline: none` 收掉，自定义就换成看得见的描边或阴影；过渡只写具体属性，用户开了减少动效就把过渡关掉。
