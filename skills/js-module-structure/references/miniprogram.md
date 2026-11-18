# Mini programs

## Native WeChat mini programs

```text
pages/userCard/            # components live in components/userCard/
├── index.ts               # page or component logic
├── index.wxml
├── index.wxss
├── index.json             # framework config: usingComponents, component: true and so on
└── index.config.ts        # runtime constants and defaults
```

- **`index.json` is a framework configuration file and does not hold data.** A native mini program cannot import JSON, so data is written in `index.ts` or a sibling `.ts` file. Taro and uni-app go through a build chain and can import JSON normally.
- Directories follow the framework's lowerCamelCase convention (`userCard/`, `orderDetail/`) instead of switching to UpperCamelCase, which would stop matching the routes in `app.json`.
- A component directory keeps the multi-file structure the framework expects.
- `.mock.ts`, `.type.ts` and `.test.ts` follow the same role rules as on the web and appear as needed.
- Directories under `pages/` are route entries, so renaming one means updating `app.json` in the same change.

## Taro

- The React rules apply: `index.tsx` holds the main logic, and `index.config.ts` is the page or component build configuration.
- Because the framework occupies the `xx.config.ts` name, business runtime constants move to `xx.const.ts`; type and `as const` definitions stay in `xx.type.ts`.

## uni-app

- The Vue rules apply, `pages.json` manages routing and window configuration, and component directories match the Vue layout.
- Platform differences are gathered into `xx.config.ts` or per-platform files (`xx.weapp.ts`, `xx.h5.ts`) instead of `#ifdef` spread through the main logic.

## Both kinds

- Route pages live under `pages/` and reusable components under `components/`; do not hide reusable components inside page directories.
- Shared code that belongs to the main package goes to `utils/` and `components/`, while code only a few screens need is organized into subpackages.
