# Vue

## Directory example

```text
userCard/
├── index.ts              # export { default as UserCard } from "./userCard.vue";
│                         # export type { IUserCardProps } from "./userCard.type";
├── userCard.vue          # <script setup lang="ts">, styles in <style scoped> by default
├── userCard.config.ts    # state mapping, defaults, style constants
├── userCard.type.ts      # props, emits and public types
├── userCard.mock.ts
└── userCard.test.ts
```

`composables/useUserCard.ts` is extracted only once a second component needs the same logic.

## Points that matter

- File names are lowerCamelCase and component names UpperCamelCase: the template in `userCard.vue` writes `<UserCard />`.
- A `.vue` file has to default-export, which the framework requires, and `index.ts` turns that into a named export: `export { default as UserCard } from "./userCard.vue"`.
- The types for `defineProps` and `defineEmits` are imported from `xx.type.ts`, where types live by default rather than inside the SFC.
- Reusable reactive logic goes into `composables/useXx.ts`, instead of the same `watch` or `computed` copied across components.
- Constants and state-mapping tables go into `xx.config.ts`, using `as const` so the literal types still constrain props.
- Styles belong in the SFC's `<style scoped>` first, and split into `xx.css` or `xx.module.css` only when a separate file is genuinely needed.
- Tests keep the repository's framework (vitest with @vue/test-utils and the like), mounting the component and asserting what renders and what it emits.
- Stores for state management (pinia, vuex) live in the module-level `store/`, never inside a component directory.
