#!/usr/bin/env node
/**
 * Inspect the engineering setup already in place in a frontend project and
 * print a text or JSON report.
 *
 *   node detect-stack.mjs                       # inspect the current directory
 *   node detect-stack.mjs ./path/to/project     # inspect a given project
 *   node detect-stack.mjs ./app --json          # machine-readable output
 *
 * It only reads file names, package.json fields, tsconfig switches, .nvmrc and
 * workspace globs: no .env contents, and nothing is written to the project. A
 * workspace also checks each package's name, tsconfig and scripts.
 *
 * This file is the entry point only: parse arguments, assemble the report,
 * choose the output format. The detection detail lives in the sibling
 * detect-stack.*.mjs files. Zero dependencies, Node 18+.
 * Exit code is 2 when the target directory is unusable, 0 otherwise.
 */

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { BUILD_TOOLS, FRAMEWORKS, TEST_RUNNERS } from "./detect-stack.config.mjs";
import { detectFrom, exists, pickDependencies, readJson, readText } from "./detect-stack.util.mjs";
import {
  detectCi,
  detectEnv,
  detectFormatting,
  detectHooks,
  detectLint,
  detectPackageManager,
  detectStylelint,
  detectTypeScript,
  hasStyleFiles,
} from "./detect-stack.project.mjs";
import { detectMonorepo } from "./detect-stack.workspace.mjs";
import { buildGaps } from "./detect-stack.gaps.mjs";
import { renderMarkdown } from "./detect-stack.report.mjs";

async function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes("--json");
  const positional = argv.filter((arg) => !arg.startsWith("-"));
  if (argv.some((arg) => arg.startsWith("-") && arg !== "--json")) {
    console.error("Usage: node detect-stack.mjs [project root] [--json]");
    process.exit(2);
  }

  const target = path.resolve(positional[0] ?? ".");
  const info = await stat(target).catch(() => null);
  if (!info || !info.isDirectory()) {
    console.error(`Directory does not exist: ${target}`);
    process.exit(2);
  }

  const pkg = await readJson(path.join(target, "package.json"));
  const deps = pickDependencies(pkg);
  const entries = await readdir(target).catch(() => []);

  const report = {
    target,
    hasPackageJson: Boolean(pkg),
    packageManager: await detectPackageManager(target, pkg),
    node: {
      engines: pkg?.engines?.node ?? null,
      nvmrc: (await exists(path.join(target, ".nvmrc")))
        ? ((await readText(path.join(target, ".nvmrc"))) ?? "").trim()
        : null,
    },
    frameworks: detectFrom(deps, FRAMEWORKS),
    buildTools: detectFrom(deps, BUILD_TOOLS),
    testRunners: detectFrom(deps, TEST_RUNNERS),
    monorepo: await detectMonorepo(target, pkg),
    typescript: await detectTypeScript(target, pkg),
    formatting: await detectFormatting(target, deps),
    lint: await detectLint(target, deps),
    stylelint: await detectStylelint(target, deps),
    styleFiles: await hasStyleFiles(target),
    hooks: await detectHooks(target, pkg),
    ci: await detectCi(target),
    env: await detectEnv(target),
    scripts: pkg?.scripts && typeof pkg.scripts === "object" ? pkg.scripts : {},
    topLevelEntries: entries.length,
  };
  report.gaps = buildGaps(report);

  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (!report.hasPackageJson) {
    console.log(`Note: no package.json under ${report.target}; the report may be incomplete.\n`);
  }
  console.log(renderMarkdown(report));
}

await main();
