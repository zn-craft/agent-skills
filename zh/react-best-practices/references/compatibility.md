# React 版本核对

用到版本相关的 API 时，先从锁文件确认实际安装的 `react`、`react-dom` 和 `@types/react`。再核对对应版本的官方发布说明、API 文档和框架支持。官网默认展示最新文档。

## 常见差异

- 函数组件转发 `ref` 时，React 18 通常用 `forwardRef`，React 19 可直接接收 `ref` Prop。组件库还要考虑支持的最低版本和类型声明。
- `useEffectEvent` 从 React 19.2 起稳定可用。使用条件见 [状态与 Effect](state-and-effects.md)。
- Fragment ref 从 React 19.3 起稳定可用。需要操作一组兄弟 DOM 节点时，用显式的 `<Fragment ref={...}>`。
- RSC、Server Functions 和相关缓存行为看框架版本及配置。React Compiler 则确认插件已启用，且目标文件确实经过编译。

其他 API 查对应发布说明。若 API 还处于实验阶段，先确认项目是否明确采用对应渠道。
