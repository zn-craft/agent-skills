# Inline styles

The test: does this value only exist at runtime? If so it goes into `style`; if not it stays in the stylesheet, which is the default landing place while inline styles are the exception.

## Inline carries runtime values only

```html
<!-- Right: progress, drag offset and a user-chosen colour are only known at runtime -->
<div class="bar" style="--progress: 62%"></div>

<!-- Wrong: a static value in an inline style bypasses variables, themes and pseudo-classes at once -->
<div class="card" style="padding: 16px; background: #ffffff">…</div>
```

Pass variables, not property values: the number goes into `style` and how it is used stays in the stylesheet, so `:hover`, the dark theme and media queries all still apply.

```css
.bar { width: var(--progress, 0%); }
```

Values from an API, CMS rich text or user configuration count as runtime values and may go inline; static appearance returns to the stylesheet, and a state change is expressed by adding a class rather than switching an inline value.

## An inline style beats every class

An inline style outranks any selector, and only `!important` can push back. Once written, changing it later means editing the template or adding `!important`, both more expensive than editing a stylesheet. A server-rendered project adds another layer: values assembled into a template have to be escaped, or they are an injection point.

## How each stack writes it

| Setting | Form | Watch out for |
| --- | --- | --- |
| React | `style={{ width: p + "%" }}` | camelCase property names, and custom properties as string keys |
| Vue | `:style="{ '--progress': p + '%' }"` | quote the custom property, and do not mix it with a static `style` |
| Mini program | `style="width: 62%"`, with the value built by data binding | assembled values must not carry user input |
| Plain HTML | `style="--progress: 62%"` | templates still carry variables rather than property values |

## Self-check

Search the templates for `style=` and decide for each value whether it is computed at runtime. What cannot be answered moves back to the stylesheet; what cannot be moved gets a look at whether its specificity is crushing later classes.
