// Framework-agnostic baseline. React uses eslint-plugin-react-hooks, Vue uses
// eslint-plugin-vue and Svelte uses svelte-eslint-parser, each appending its own
// flat config to this array.
import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Build output, dependencies and generated code are not checked
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "public/**",
      "**/*.min.js",
      "src/generated/**",
    ],
  },

  // Base JS rules; the type-aware config below takes over for TS files
  js.configs.recommended,

  {
    languageOptions: {
      // Browser and Node globals; without SSR, browser alone is enough
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Allow == null and require === everywhere else
      eqeqeq: ["error", "smart"],
      // Production logging goes through a wrapper, so this only warns
      "no-console": "warn",
    },
  },

  // Type-aware rules apply to TS files only, so a config file outside the
  // tsconfig include does not raise an error
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        // Find the nearest tsconfig per file, which also works when a monorepo
        // has one per package
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Unused variables and parameters warn, and a leading underscore marks a
      // deliberate omission
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // A promise missing an await loses its error silently
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      // Type imports are written import type, leaving no runtime code behind
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },

  // Scripts and config files may print to the console
  {
    files: ["scripts/**", "**/*.config.{js,mjs,cjs,ts}"],
    rules: { "no-console": "off" },
  },

  // Last: turn off the style rules that conflict with Prettier
  prettier,
);
