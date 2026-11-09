/**
 * Fixed data used by the inspection: file name lists, dependency tables and
 * scan thresholds. Constants and plain data only, so changing a list never
 * means touching the detection logic.
 */

// Lock file to package manager. The order is the priority: the first match
// decides the package manager.
export const LOCKFILES = [
  ["pnpm-lock.yaml", "pnpm"],
  ["package-lock.json", "npm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
];

// Root tsconfig names: tsconfig.json first, and any other tsconfig.*.json
// counts as a layered config.
export const TSCONFIG_CANDIDATES = ["tsconfig.json"];
export const TSCONFIG_PREFIX = "tsconfig.";

// Both flat config and the older .eslintrc count: any match means ESLint is set up.
export const ESLINT_FILES = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yml",
  ".eslintrc.yaml",
];

// The ways a Prettier config is written, including the extensionless
// .prettierrc and the toml form.
export const PRETTIER_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yml",
  ".prettierrc.yaml",
  ".prettierrc.js",
  ".prettierrc.cjs",
  ".prettierrc.mjs",
  "prettier.config.js",
  "prettier.config.cjs",
  "prettier.config.mjs",
  ".prettierrc.toml",
];

// One Biome file covers both formatting and lint, so both checks look at it.
export const BIOME_FILES = ["biome.json", "biome.jsonc"];

// The same two generations as ESLint: flat config and the older .stylelintrc.
export const STYLELINT_FILES = [
  "stylelint.config.js",
  "stylelint.config.mjs",
  "stylelint.config.cjs",
  "stylelint.config.ts",
  ".stylelintrc",
  ".stylelintrc.js",
  ".stylelintrc.cjs",
  ".stylelintrc.mjs",
  ".stylelintrc.json",
  ".stylelintrc.yml",
  ".stylelintrc.yaml",
  ".stylelintrc.toml",
];

// Style file scan: extension only, skipping dependencies and build output, with
// depth and entry limits so a large repository cannot stall the run.
export const STYLE_FILE = /\.(css|scss|sass|less|styl)$/;
export const STYLE_SCAN_IGNORE = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  "vendor",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  ".cache",
]);
export const STYLE_SCAN_DEPTH = 4;
export const STYLE_SCAN_LIMIT = 4000;

// husky is a directory, handled by its own detection function; only
// single-file hook tools are listed here.
export const HOOK_FILES = [
  ["lefthook.yml", "lefthook"],
  ["lefthook.yaml", "lefthook"],
  [".lefthook.yml", "lefthook"],
  [".lefthook.yaml", "lefthook"],
];

// GitHub Actions goes through .github/workflows; every other platform is
// recognised by its fixed file name.
export const CI_FILES = [
  [".gitlab-ci.yml", "GitLab CI"],
  ["Jenkinsfile", "Jenkins"],
  ["azure-pipelines.yml", "Azure Pipelines"],
  [".drone.yml", "Drone"],
  ["bitbucket-pipelines.yml", "Bitbucket Pipelines"],
  [".woodpecker.yml", "Woodpecker"],
  [".circleci/config.yml", "CircleCI"],
];

// Environment template names; the stray check treats an .env* file without
// "example" as a local file and never reads its contents.
export const ENV_TEMPLATES = [
  ".env.example",
  ".env.sample",
  ".env.template",
  ".env.local.example",
  "env.example",
];

// Tools that declare a workspace; pnpm, npm and yarn are recognised through
// their own declaration fields.
export const WORKSPACE_TOOLS = [
  ["lerna.json", "Lerna"],
  ["turbo.json", "Turborepo"],
  ["nx.json", "Nx"],
  ["rush.json", "Rush"],
];

// Depth and entry limits for the workspace scan, so a huge repository cannot
// run away with the traversal.
export const PACKAGE_SCAN_DEPTH = 4;
export const PACKAGE_SCAN_LIMIT = 5000;
// How many rows the package table shows in the text report before folding.
export const PACKAGE_TABLE_LIMIT = 20;

// Dependency to display name. The order shapes the report, and a match is listed.
export const FRAMEWORKS = [
  ["next", "Next.js"],
  ["nuxt", "Nuxt"],
  ["@angular/core", "Angular"],
  ["react-native", "React Native"],
  ["@tarojs/taro", "Taro"],
  ["@dcloudio/uni-app", "uni-app"],
  ["react", "React"],
  ["vue", "Vue"],
  ["svelte", "Svelte"],
  ["solid-js", "Solid"],
  ["preact", "Preact"],
  ["lit", "Lit"],
];

// Build tools, shown in the report only and never used as a criterion.
export const BUILD_TOOLS = [
  ["vite", "Vite"],
  ["webpack", "webpack"],
  ["@rspack/core", "Rspack"],
  ["rollup", "Rollup"],
  ["esbuild", "esbuild"],
  ["parcel", "Parcel"],
  ["@angular/cli", "Angular CLI"],
  ["gulp", "gulp"],
];

// Test runners, shown in the report only and never used as a criterion.
export const TEST_RUNNERS = [
  ["vitest", "Vitest"],
  ["jest", "Jest"],
  ["@playwright/test", "Playwright"],
  ["cypress", "Cypress"],
  ["mocha", "Mocha"],
  ["ava", "AVA"],
  ["node:test", "node:test"],
];

// The allowlist behind the "scripts present" row, in display order.
export const EXPECTED_SCRIPTS = [
  "dev",
  "build",
  "lint",
  "lint:fix",
  "format",
  "format:check",
  "stylelint",
  "stylelint:fix",
  "typecheck",
  "test",
  "prepare",
];
