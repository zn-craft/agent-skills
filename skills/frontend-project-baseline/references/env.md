# Environment variables

Environment variables come in two kinds, handled differently: anything that reaches client code is bundled into the output and therefore public, while anything used only by build scripts, the server or CI stays on the server. The first kind is told apart by its prefix, and the second must carry none.

## Template and real values

| File | In version control | Notes |
| --- | --- | --- |
| `.env.example` | Yes | Variable names and placeholder values only, so a fresh clone knows what to create locally |
| `.env.local` | No | Real values live here, excluded by `.gitignore` |
| `.env.development` / `.env.production` | Depends | Committed when they hold no secrets, never committed when they do |

Write `.gitignore` as `.env*` followed by `!.env.example`; excluding only `.env.local` misses the per-environment files.

## Prefix reference

Whether a variable can reach client code is decided by its prefix, and every framework uses a different one:

| Framework | Client-visible prefix | Everything else |
| --- | --- | --- |
| Vite | `VITE_` | Visible only in `vite.config` and on the Node side |
| Next.js | `NEXT_PUBLIC_` | Visible only on the server and at build time |
| Nuxt | `NUXT_PUBLIC_`, or `runtimeConfig.public` | Visible only on the server |
| Astro | `PUBLIC_` | Visible only on the server |
| Vue CLI | `VUE_APP_` | Visible at build time only |
| Mini program, Taro, uni-app | Injected at compile time per platform convention | A bundle can be decompiled, so no sensitive values in the frontend |

Secrets, internal addresses and signed URLs take no prefix, even when the build would accept them.

## Type declarations

In a TS project `import.meta.env.X` and `process.env.X` are `any` by default, and declaring them catches a misspelled variable name:

```ts
// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: "development" | "staging" | "production";
}
```

A project reading `process.env` on the Node side adds `@types/node` and declares it in `types` inside `tsconfig.json`. The declaration file has to be inside the `include` of the tsconfig, or the editor ignores it.

## Checklist

- Every variable the code reads has an entry in `.env.example`, with a comment stating its purpose and its values.
- `.env.example` holds no real values, real domains or real tokens.
- A file such as `.env.production` holding secrets is never committed; CI and the deployment platform inject from their secret store, as covered in [ci.md](ci.md).
- A client variable is public the moment it ships, and changing one means rebuilding.
