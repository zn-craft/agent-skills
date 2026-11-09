# Print and export

The test: printed or exported to PDF, the page shows no buttons, no overlays and no full-page dark background.

```css
@page { margin: 12mm; }

@media print {
  /* Right: interactive elements mean nothing on paper */
  :where(.toolbar, .dialog, .pagination, .toast, .button) { display: none; }

  /* Right: collapsed content opens, overriding height rather than display */
  .collapse { height: auto; overflow: visible; }

  /* Right: cards and table rows are not split across pages */
  .card, .tableRow { break-inside: avoid; }
  .chapter { break-before: page; }

  /* Right: print always runs light, not following the page's dark theme */
  [data-theme="dark"] { --surface: #ffffff; --text: #111111; }
}
```

Browsers do not print background colours or images by default, so blocks the interface distinguishes by background merge into one on paper. A colour that genuinely has to survive print takes `print-color-adjust: exact`, on those few places only.

## Exporting to a document

For a page that gets filed, such as a contract, an invoice or a report, links may print their address: `a[href^="http"]::after { content: " (" attr(href) ")"; }`. Ordinary pages leave that out, where it only clutters the text.

## Self-check

Page through the browser's print preview: interactive elements are gone, tables and cards are not cut mid-row, and no page is a large black area.
