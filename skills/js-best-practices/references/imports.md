# 引入与产物大小

管 import 怎么写才不让没用到的代码进产物。库的选择见 [objects-and-collections.md](objects-and-collections.md)，运行时热点见 [performance.md](performance.md)。

引入一个库时只拉要用到的那部分，剩下的打包器才删得掉：

- 命名导入或子路径：`import { groupBy } from "lodash-es"`、`lodash/groupBy`、`date-fns/format`、`@mui/icons-material/Delete`。整包默认导入（`import _ from "lodash"`）会把全量代码放进产物。
- 图标、组件、图表这类大库一般有专门入口：按组件路径引入，或按需注册模块（`echarts/core` 那种），照它文档的按需写法来，不从包根一次性引。
- CJS 包写得再细也难删干净：包没有 `sideEffects: false` 时打包器不敢删。产物里出现整个库，先看这两点，而不是继续改 import 写法。
- 项目自己的模块不套这一条：仍按模块入口导入。纯 re-export 的 barrel 不会把没用到的代码打进产物，它的代价主要是构建时间和循环依赖。
- 按需引入不等于动态 `import()`：静态命名导入只是不把没用到的代码打进来；要拆 chunk 用动态 `import()` 或打包配置，按路由和大功能拆，别按函数拆，否则请求变碎、首屏多几次往返。
