/**
 * Text report rendering: turn the report object into Markdown tables.
 */

import { EXPECTED_SCRIPTS, PACKAGE_TABLE_LIMIT } from "./detect-stack.config.mjs";

export function renderMarkdown(report) {
  const lines = [];
  lines.push(`# Engineering baseline: ${report.target}`);
  lines.push("");
  lines.push(`Package manager: ${report.packageManager.name ?? "unknown"}`);
  if (report.packageManager.lockfiles.length) {
    lines.push(`Lock files: ${report.packageManager.lockfiles.join(", ")}`);
  }
  if (report.packageManager.conflict.length) {
    lines.push(`⚠️ more than one lock file: ${report.packageManager.conflict.join(", ")}`);
  }
  lines.push(
    `Node constraint: ${report.node.engines ?? "not declared"}${report.node.nvmrc ? ` (${report.node.nvmrc})` : ""}`,
  );
  lines.push("");

  const row = (label, value) => lines.push(`| ${label} | ${value ?? "—"} |`);

  lines.push("## Stack");
  lines.push("");
  lines.push("| Item | Value |");
  lines.push("| --- | --- |");
  row("Frameworks", report.frameworks.join(", ") || "not detected");
  row("Build tools", report.buildTools.join(", ") || "not detected");
  row("Tests", report.testRunners.join(", ") || "not detected");
  const packagesWithTs = report.monorepo.packages.filter((item) => item.hasTsconfig).length;
  row(
    "TypeScript",
    report.typescript.configs.join(", ") ||
      (report.monorepo.detected && packagesWithTs ? `per package (${packagesWithTs} tsconfig files)` : "not used"),
  );
  lines.push("");

  if (report.monorepo.detected) {
    const mono = report.monorepo;
    lines.push("## Workspace");
    lines.push("");
    lines.push(`Tools: ${mono.tools.join(" + ") || "not detected"}`);
    lines.push(`Matched packages: ${mono.packages.length}`);
    if (mono.unresolved.length) {
      lines.push(`Globs with no matching directory: ${mono.unresolved.join(", ")}`);
    }
    lines.push("");
    if (mono.packages.length) {
      lines.push("| Package | Path | tsconfig | typecheck |");
      lines.push("| --- | --- | --- | --- |");
      const shown = mono.packages.slice(0, PACKAGE_TABLE_LIMIT);
      for (const item of shown) {
        lines.push(
          `| ${item.name} | ${item.dir} | ${item.hasTsconfig ? "yes" : "no"} | ${item.scripts.includes("typecheck") ? "yes" : "no"} |`,
        );
      }
      if (mono.packages.length > shown.length) {
        lines.push(`| … | ${mono.packages.length - shown.length} more packages | | |`);
      }
      lines.push("");
    }
  }

  lines.push("## In place");
  lines.push("");
  lines.push("| Item | Value |");
  lines.push("| --- | --- |");
  row("Formatting", report.formatting.tools.join(" + ") || "none");
  row("Static analysis", report.lint.tools.join(" + ") || "none");
  row("Style checking", report.stylelint.tools.join(" + ") || "none");
  row("git hooks", report.hooks.tools.join(" + ") || "none");
  row("lint-staged", report.hooks.lintStaged ? "configured" : "none");
  row("CI", report.ci.platforms.join(" + ") || "none");
  row("Env template", report.env.templates.join(", ") || "none");
  row("Scripts present", Object.keys(report.scripts).filter((s) => EXPECTED_SCRIPTS.includes(s)).join(", ") || "none");
  lines.push("");
  if (report.env.stray.length) {
    lines.push(`Local .env files (contents not read): ${report.env.stray.join(", ")}`);
    lines.push("");
  }

  const order = { missing: 0, partial: 1, ok: 2 };
  const gaps = [...report.gaps].sort((a, b) => order[a.status] - order[b.status]);
  lines.push("## Gaps");
  lines.push("");
  lines.push("| Status | Item | Detail |");
  lines.push("| --- | --- | --- |");
  for (const gap of gaps) {
    const status = gap.status === "ok" ? "✅" : gap.status === "partial" ? "◐" : "❌";
    lines.push(`| ${status} | ${gap.item} | ${gap.detail} |`);
  }
  lines.push("");
  const missing = gaps.filter((gap) => gap.status !== "ok").length;
  lines.push(missing ? `${missing} items still need work; follow the adoption order in SKILL.md.` : "The baseline is complete.");
  return lines.join("\n");
}
