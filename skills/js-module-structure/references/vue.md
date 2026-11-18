# Vue

## Directory example

```text
userCard/
├── index.ts              # export { default as UserCard } from "./userCard.vue";
│                         # export type { IUserCardProps } from "./userCard.type";
├── userCard.vue          # <script setup lang="ts">, styles in <style scoped> by default
├── userCard.config.ts    # runtime state mappings and defaults
├── userCard.type.ts      # props, emits, enums and value definitions
├── userCard.mock.ts
└── userCard.test.ts
```

When reactive logic goes into its own file, use a sibling `useXx.ts` or `composables/useXx.ts`. Whether to extract the file follows the project rules.

## Points that matter

- File names are lowerCamelCase and component names UpperCamelCase: the template in `userCard.vue` writes `<UserCard />`.
- A `.vue` file is default-exported by the framework, and `index.ts` can turn it into a named export: `export { default as UserCard } from "./userCard.vue"`.
- Import `defineProps` and `defineEmits` types from `xx.type.ts`; types live there by default rather than inside the SFC.
- A composable that is already in its own file uses the `useXx.ts` name and lives beside the module or under `composables/`.
- Runtime constants, state mappings and defaults go into `xx.config.ts`; type and `as const` value definitions go into `xx.type.ts`.
- Styles belong in the SFC's `<style scoped>` first, and split into `xx.css` or `xx.module.css` only when a separate file is genuinely needed.
- Put mocks in `xx.mock.ts` and tests in `xx.test.ts`, following the project's testing convention.
- Stores for state management (pinia, vuex) live in the module-level `store/`, not inside a component directory.
