# Vue

## 目录示例

```text
userCard/
├── index.ts              # export { default as UserCard } from "./userCard.vue";
│                         # export type { IUserCardProps } from "./userCard.type";
├── userCard.vue          # <script setup lang="ts">，样式默认写在 <style scoped> 里
├── userCard.config.ts    # 状态映射、默认值、样式常量
├── userCard.type.ts      # props / emits / 对外类型
├── userCard.mock.ts
└── userCard.test.ts
```

需要把响应式逻辑放进独立文件时，使用同级 `useXx.ts` 或 `composables/useXx.ts`。是否独立成文件沿用项目规则。

## 要点

- 文件名小驼峰、组件名大驼峰：`userCard.vue` 的模板里写 `<UserCard />`。
- `.vue` 文件由框架默认导出，`index.ts` 可将它转成具名导出：`export { default as UserCard } from "./userCard.vue"`。
- `defineProps` / `defineEmits` 的类型从 `xx.type.ts` import。类型默认都写在 `xx.type.ts`，不要留在 SFC 里。
- 已经独立成文件的 composable 使用 `useXx.ts` 命名，放在当前模块的同级或 `composables/` 下。
- 运行期常量、状态映射和默认值放 `xx.config.ts`；类型与 `as const` 取值定义放 `xx.type.ts`。
- 样式优先写在 SFC 的 `<style scoped>` 里，需要单独成文件时才拆 `xx.css` / `xx.module.css`。
- mock 放 `xx.mock.ts`，测试放 `xx.test.ts`，具体写法沿用项目测试规范。
- 状态管理（pinia / vuex）的 store 放模块级的 `store/` 下，不放进组件目录。
