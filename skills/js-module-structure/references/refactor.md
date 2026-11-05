# 重构与归整目录

目标：对外 import 路径保持不变，或者一次性替换干净，每一步都可编译。

同一套流程对任何 JS/TS 模块都适用，工具方法库、api、store、组件都一样，区别只在最后跑的是单测还是 typecheck。

## 把单文件拆成模块目录

1. 先确认外部怎么引用它：`rg "from ['\"].*<旧路径>"`，记录所有调用点。
2. 建目录并把主逻辑整体移进去，此时外部调用点会立刻报错，属正常。
3. 补 `index.ts` 做 re-export，恢复对外契约，外部调用点无需改动即可编译通过。
4. 再逐个拆：先移 `xx.type.ts`，再移 `xx.config.ts`，每移一次就修 import。
5. 拆 mock、测试按需要补，不做就留空。
6. 收尾：跑 typecheck、lint、测试；确认没有文件既在旧位置又在目录里。

## 拆分前后对照

```ts
// 之前：单文件，实现与类型混在一起，外部直接指到这个文件
// src/utils/formatDate.ts
export interface IFormatDateOptions { locale?: string; }
export const formatDate = (value: Date, options: IFormatDateOptions = {}) => { /* … */ };

// 调用方
import { formatDate } from "@/utils/formatDate";
```

```text
之后：import 路径不变，文件换成目录，由 index.ts 恢复对外契约
src/utils/formatDate/
├── index.ts             # export { formatDate } from "./formatDate";
│                        # export type { IFormatDateOptions } from "./formatDate.type";
├── formatDate.ts
├── formatDate.type.ts   # IFormatDateOptions
└── formatDate.test.ts
```

先补 `index.ts` 让编译恢复，再逐个移 `xx.type.ts`、`xx.config.ts`，每移一次跑一遍 typecheck；外部调用点一行都不用改。

## 把散落文件归整成目录

- 判断依据是"谁和谁永远一起改"，不是文件名像不像。
- `xx.util.ts`、`xx.helper.ts` 里只有一两个纯函数的，并入 `xx.config.ts` 或模块下的 `utils/`，不要再留一层。
- 归整后如果某个文件没有任何外部引用，说明它可以合并回主逻辑。
- 一次只归整一个模块，混在一起改会让 review 失去重点。

## 不该做的

- 不要在重构的同时改行为、改接口签名、升级依赖。
- 不要为了"符合规范"给每个目录都补 `index.ts`：只有被跨模块引用的目录才需要。
- 不要保留新旧两份实现"以防万一"，那会让下一个改代码的人不知道该改哪个。
- 库或包重构导出面时，先改 `index.ts` 再动实现，把破坏性变更集中在一处，方便 review 时一眼看出。
