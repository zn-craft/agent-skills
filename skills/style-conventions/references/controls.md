# Forms and native controls

The test: in another browser the inputs, selects and checkboxes still look and behave the same, and the keyboard still reaches everything.

Native controls do not inherit fonts or colours, and each browser styles them differently. Settling it once in the base layer beats overriding it in every component.

```css
@layer base {
  :where(button, input, select, textarea) {
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
  }

  :where(button, [type="button"], [type="submit"]) {
    background: none;
    border: 0;
    cursor: pointer;
  }

  :where(input, textarea)::placeholder { color: var(--text-muted); opacity: 1; }
}
```

## Do not hide the native control and draw your own

```css
/* Wrong: hiding the control loses the keyboard, the screen reader and the form semantics with it */
.pretty [type="checkbox"] { display: none; }

/* Right: adjust colour and size and leave the rest to the browser */
.field [type="checkbox"] { accent-color: var(--color-primary); width: 1rem; height: 1rem; }
```

When a full custom drawing is genuinely required, keep the element and use `appearance: none`, adding the focus state separately (see "Themes and states"):

```css
/* Right: the element is still there, only its appearance changed */
.field [type="checkbox"] { appearance: none; inline-size: 1rem; block-size: 1rem; border: 1px solid var(--border); }
.field [type="checkbox"]:checked { background: var(--color-primary); border-color: var(--color-primary); }
```

Do not rewrite the internal UI of selects, date, time or file pickers: every browser draws them differently, mobile loses the native scrolling and selection behavior, and only size, colour and border are worth changing.

## Self-check

Walk the form with Tab alone, without the mouse, and every control shows a visible focus ring; submit once more and see whether the browser blocks anything without saying so.
