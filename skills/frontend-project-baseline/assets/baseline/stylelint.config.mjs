/** @type {import("stylelint").Config} */
export default {
  // The community standard rule set. Formatting is Prettier's job, so only what
  // Prettier cannot see stays here; the rules that fight Prettier are set to null
  // one by one, or the whole thing is swapped for the narrower stylelint-config-recommended
  extends: ["stylelint-config-standard"],

  // An SCSS project uses stylelint-config-standard-scss with customSyntax
  // extends: ["stylelint-config-standard-scss"],
  // customSyntax: "postcss-scss",

  // Build output, dependencies and minified files are not checked
  ignoreFiles: [
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/node_modules/**",
    "**/*.min.css",
  ],

  // Every disabled rule states its reason, so nobody later mistakes it for an oversight
  rules: {
    // Selector specificity compares across files and reports too many false
    // positives in a component library, so it is off for now
    "no-descending-specificity": null,
    // Turn on when nesting depth needs a limit to keep style layering in check
    // "max-nesting-depth": 3,
  },
};
