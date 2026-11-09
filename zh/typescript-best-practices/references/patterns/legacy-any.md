# 业务案例：存量模块收窄 any

适用：已经跑着的模块里散落 `any`、`as`、`@ts-ignore`，要在不干扰其他改动的前提下逐步收紧。

## 先定边界

1. **一次只碰一个范围**：一个文件或一条调用链，`git diff` 里只出现类型和必要的收窄代码，不动算法和结构，不顺手改名、改目录。
2. **先收导出签名**：调用方一改成具体类型，往里传错值当场报错，隐藏的 `any` 就浮出来了；接着收数据边界（接口响应、`JSON.parse`、事件参数），内部函数和组件临时变量放最后。
3. **边界处加 type guard**：判断函数返回 `value is IXxx`；范围外的 `any` 原样留着，新写的行里不出现 `any`、`!`、`@ts-ignore`。

## 案例

收窄前：

```ts
export const sumAmounts = (data: any) => {
  const items = data.items as any[];
  return items.map((item) => item.amount).reduce((a, b) => a + b, 0);
};
```

收窄后只动类型和收窄代码，求和算法不变：

```ts
interface IReportRow {
  amount: number;
}

const isReportRow = (value: unknown): value is IReportRow =>
  typeof value === "object" && value !== null && "amount" in value;

export const sumAmounts = (data: unknown): number => {
  const raw = (data as { items?: unknown }).items;
  if (!Array.isArray(raw) || !raw.every(isReportRow)) throw new Error("invalid report payload");
  return raw.reduce((total, row) => total + row.amount, 0);
};
```

### 验收

1. `sumAmounts({ items: [{ amount: 1 }] })` 通过，`sumAmounts({ items: [{}] })` 抛错。
2. 改后 `git diff` 只有类型和收窄代码，求和那行没动。
3. 文件里 `any` 数量下降，且没有新增 `@ts-ignore`、`!`。

## 常见误区

- 一上来把整个目录的 `any` 换掉，diff 几百行，评审没人看得住。
- 把 `any` 直接换成 `unknown` 就收工，调用方反而报一片错，于是又改回去。
- 用 `as IXxx` 假装收窄，运行时照样炸。
- 顺手重构、改名、改目录，把类型改动和结构调整混在一起。

需要拍板的：这个模块近期还会不会大改、收窄后报错的地方要编译失败还是保持兼容、有没有测试能挡住收窄引入的行为变化。

## 适用边界

一次性脚本、即将删除的旧模块不必收窄。收窄前先确认有基础类型检查（`tsc --noEmit` 或等价流程），否则改完没人能验证。
