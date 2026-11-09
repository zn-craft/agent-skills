# Checking the React version

Before using a version-dependent API, confirm the installed `react`, `react-dom` and `@types/react` in the lock file. Then check the release notes, the API documentation and the framework's support for that version. The official site shows the latest docs by default.

## Common differences

- Forwarding `ref` out of a function component usually means `forwardRef` on React 18, while React 19 accepts `ref` as a Prop. A component library also weighs the oldest version it supports and its type declarations.
- `useEffectEvent` is stable from React 19.2. For when to use it, see [state and Effects](state-and-effects.md).
- Fragment refs are stable from React 19.3. Use an explicit `<Fragment ref={...}>` when a group of sibling DOM nodes has to be reached.
- RSC, Server Functions and the caching that goes with them depend on the framework version and configuration, while the React Compiler needs its plugin enabled and the file in question actually compiled.

Look up the matching release notes for other APIs. An experimental API first requires confirming that the project has deliberately opted into that channel.
