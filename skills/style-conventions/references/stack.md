# Where the rules land

The test: scoping, variables, specificity and breakpoints each have one settled home in the approach being used. When the homes are unclear, the rules get worked around.

| Approach | Scoping comes from | Where variables live | Common trap |
| --- | --- | --- | --- |
| Global CSS with BEM | A naming convention | `:root` in `tokens.css` | Once naming drifts nothing stops it |
| CSS Modules | A build-time hash on class names | `:root` variables or `tokens.module.css` | Reuse needs explicit `composes`, not a hand copy |
| Vue SFC `scoped` | A compiled attribute selector on nodes | Global variables referenced from the component's `<style>` | Reaching in must be written as `:deep()` |
| Tailwind | The class names are the styles | A CSS `@theme` block, or `tailwind.config.js` on v3 | Values outside the config do not become `w-[13px]` |
| Mini program wxss | No real scoping; pages and components each keep their own | A `page` selector in `app.wxss` | Component styles written into `app.wxss` |
| CSS-in-JS | Class names generated at runtime | A theme object or variables | Interpolation references variables, never string building |

## CSS Modules

```css
/* Right: a base style that needs reusing is composed, not copied into a business component */
.cardTitle {
  composes: textEllipsis from "./text.module.css";
  color: var(--text);
}
```

## Tailwind

```css
/* Right: the scale is defined once in @theme (v3 projects put it in tailwind.config.js) */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.55 0.2 264);
  --radius-sm: 4px;
  --spacing-md: 16px;
}
```

The names defined are the names used: `--color-primary` becomes `bg-primary` and `--spacing-md` becomes `p-md`. A value outside the config may appear once in square brackets, and on the second appearance it joins `@theme`; `@apply` is for base classes reused three times or more.

## Mini program wxss

```css
/* Right: app.wxss defines variables and base typography; component styles live in the component's own wxss */
page {
  --color-primary: #2563eb;
  --space-4: 16px;
}
```

A mini program has no `:root`, so variables are defined on `page`. A custom component defaults to `styleIsolation: isolated`, keeping its styles in and other rules out; letting outside styles in means opening `apply-shared` explicitly.

## CSS-in-JS

```js
// Right: interpolation only references variables, so no colour or size is built at runtime
const Button = styled.button`
  background: var(--btn-bg, var(--color-primary));
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
`;
```

One component keeps its whole styling in one approach, rather than part in styled components and part in global class names.

## Changing the approach

Before migrating, write down where all four things land: what provides scoping, where variables live, how order is decided, and which breakpoint steps are used. Settle those first and move, keeping two systems from coexisting. Whether to change follows the probe in the main file, asked once and recorded in `skill-memory/style-conventions.md`.
