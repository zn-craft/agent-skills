# Mini programs

## Native WeChat mini programs

```text
pages/userCard/            # components live in components/userCard/
├── index.ts               # page or component logic
├── index.wxml
├── index.wxss
├── index.json             # framework config: usingComponents, component: true and so on
└── index.config.ts        # business constants and defaults
```

- **`index.json` is a framework configuration file and does not hold data.** A native mini program cannot import JSON, so business data is written in `index.ts` or a sibling `.ts` file, never in `xx.data.json`. Taro and uni-app go through a build chain and can import JSON normally.
- Directories follow the framework's lowerCamelCase convention (`userCard/`, `orderDetail/`) instead of switching to UpperCamelCase, which would stop matching the routes in `app.json`.
- A component directory keeps the multi-file structure the framework expects, rather than collapsing to a single `userCard.ts` for consistency.
- `.mock.ts`, `.type.ts` and `.test.ts` follow the same rules as on the web side and appear as needed.
- Directories under `pages/` are route entries, so renaming one means updating `app.json` in the same change.

## Taro

- The React rules apply: `index.tsx` holds the logic, and `index.config.ts` is the **page or component build configuration** (`navigationBarTitleText` and the like).
- Because the framework occupies the `xx.config.ts` name, business constants move to `xx.const.ts` and the two are never mixed.

## uni-app

- The Vue rules apply, `pages.json` manages routing and window configuration, and component directories match the Vue layout.
- Platform differences are gathered into `xx.config.ts` or per-platform files (`xx.weapp.ts`, `xx.h5.ts`) instead of `#ifdef` spread through the main logic.

## Both kinds

- Pages and components are different directories: a page owns routing and lifecycle, a component owns presentation. A reusable component never lives under `pages/`.
- Package size is precious in a mini program, so shared code that belongs in the main package goes to `utils/` and `components/`, while code only a few screens need is organized into subpackages.
