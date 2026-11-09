/** @type {import("prettier").Config} */
export default {
  // Line width: 100 wraps a little less than the default 80 and reads better
  // with long type definitions
  printWidth: 100,
  // Trailing commas in multi-line structures, so adding or removing a line does
  // not touch the one before it
  trailingComma: "all",
  // Two spaces for indentation; switching to tabs means changing both lines
  tabWidth: 2,
  useTabs: false,
  // Statements keep their semicolons
  semi: true,
  // JS and TS strings use double quotes
  singleQuote: false,
  // Object properties are quoted only where the syntax needs it
  quoteProps: "as-needed",
  // JSX attributes use double quotes like JS strings, leaving one quote rule
  // across the repository
  jsxSingleQuote: false,
  // A single-parameter arrow function keeps its parentheses, so adding a second
  // parameter changes nothing
  arrowParens: "always",
  // Spaces inside object literal braces: { foo }
  bracketSpacing: true,
  // The closing angle bracket of a multi-line element goes on its own line
  bracketSameLine: false,
  // One line ending, so Windows and Linux contributors do not create whole-file diffs
  endOfLine: "lf",
  // Markdown keeps its own line breaks rather than reflowing paragraphs
  proseWrap: "preserve",
  // HTML whitespace follows the CSS display default, and Vue templates with it
  htmlWhitespaceSensitivity: "css",
};
