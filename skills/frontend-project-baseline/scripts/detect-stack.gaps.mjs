/**
 * Gap analysis: turn the findings into "met / partly met / missing" entries.
 * It reads the report object only and never touches the file system.
 */

function typescriptGaps(report) {
  const ts = report.typescript;
  const mono = report.monorepo;
  const items = [];
  const add = (status, detail) => items.push({ item: "TypeScript", status, detail });

  // A workspace keeps tsconfig in each package, so the root having none is fine.
  if (!ts.configs.length && mono.detected && mono.packages.length) {
    const withTs = mono.packages.filter((pkg) => pkg.hasTsconfig);
    if (!withTs.length) {
      add("missing", "neither the root nor the packages have a tsconfig");
      return items;
    }
    const notStrict = withTs.filter((pkg) => pkg.tsStrict !== true);
    add(
      notStrict.length ? "partial" : "ok",
      notStrict.length
        ? `${withTs.length} packages have a tsconfig and ${notStrict.map((pkg) => pkg.name).join(", ")} does not enable strict`
        : `all ${withTs.length} packages with a tsconfig enable strict`,
    );
    const noTypecheck = withTs.filter((pkg) => !pkg.scripts.includes("typecheck"));
    if (noTypecheck.length) {
      add("partial", `these packages have no standalone typecheck script: ${noTypecheck.map((pkg) => pkg.name).join(", ")}`);
    }
    return items;
  }

  if (!ts.configs.length) {
    add("missing", "no tsconfig");
  } else if (ts.strict === true) {
    add("ok", `${ts.main} enables strict`);
  } else {
    const flags = [
      ["strictNullChecks", ts.strictNullChecks],
      ["noImplicitAny", ts.noImplicitAny],
    ]
      .filter(([, value]) => value === true)
      .map(([name]) => name);
    add(
      flags.length ? "partial" : "missing",
      flags.length ? `strict is off and ${flags.join(", ")} is on` : "the tsconfig enables no strict checks",
    );
  }
  if (ts.extends) {
    add("partial", `${ts.main} uses extends and this tool reads local files only, so confirm the strictness by hand`);
  }
  return items;
}

function monorepoGaps(report) {
  const mono = report.monorepo;
  if (!mono.detected) return [];

  const items = [];
  const push = (item, status, detail) => items.push({ item, status, detail });

  if (!mono.packages.length) {
    push("Monorepo layout", "partial", `${mono.tools.join(" + ") || "the workspace declaration"} is configured but no packages were resolved, so check the globs by hand`);
    return items;
  }
  push("Monorepo layout", "ok", `${mono.tools.join(" + ") || "workspace declaration"}, ${mono.packages.length} packages`);
  if (mono.unresolved.length) {
    push("Monorepo layout", "partial", `these globs matched no directory: ${mono.unresolved.join(", ")}`);
  }
  if (!report.lint.configs.length && mono.packages.some((pkg) => pkg.hasLintConfig)) {
    push("Monorepo config ownership", "partial", "lint config is scattered across packages with none at the root");
  }
  if (!report.formatting.configs.length && mono.packages.some((pkg) => pkg.hasFormatConfig)) {
    push("Monorepo config ownership", "partial", "formatting config is scattered across packages with none at the root");
  }
  return items;
}

export function buildGaps(report) {
  const gaps = [];
  const add = (item, status, detail) => gaps.push({ item, status, detail });

  const pm = report.packageManager;
  if (pm.declared && pm.lockfiles.length === 1) {
    add("Runtime and package manager", "ok", `${pm.name}, lock file ${pm.lockfiles[0]}`);
  } else {
    const missing = [];
    if (!pm.declared) missing.push("package.json has no packageManager");
    if (!pm.lockfiles.length) missing.push("no lock file");
    if (pm.conflict.length) missing.push(`conflicting lock files: ${pm.conflict.join(" / ")}`);
    add("Runtime and package manager", "missing", missing.join("; "));
  }
  if (!report.node.engines) {
    add("Node version", "missing", "engines.node is not declared");
  } else if (!report.node.nvmrc) {
    add("Node version", "partial", "engines is set but .nvmrc is missing, so the local version will not switch automatically");
  }

  gaps.push(...monorepoGaps(report));
  gaps.push(...typescriptGaps(report));

  const fmt = report.formatting;
  if (fmt.tools.length && report.scripts["format:check"]) {
    add("Formatting", "ok", `${fmt.tools.join(" + ")}, with format:check`);
  } else if (fmt.tools.length) {
    add("Formatting", "partial", `${fmt.tools.join(" + ")} is configured but the format:check script is missing`);
  } else {
    add("Formatting", "missing", "no formatter configuration");
  }

  const lint = report.lint;
  if (lint.tools.length && report.scripts.lint) {
    add("Static analysis", "ok", `${lint.tools.join(" + ")}, with a lint script`);
  } else if (lint.tools.length) {
    add("Static analysis", "partial", `${lint.tools.join(" + ")} is configured but package.json has no lint script`);
  } else {
    add("Static analysis", "missing", "no lint configuration");
  }

  const style = report.stylelint;
  if (report.styleFiles || style.configs.length) {
    if (style.configs.length && report.scripts.stylelint) {
      add("Style checking", "ok", `${style.configs.join(", ")}, with a stylelint script`);
    } else if (style.configs.length) {
      add("Style checking", "partial", "stylelint is configured but package.json has no stylelint script");
    } else {
      add("Style checking", "missing", "the project has style files but no stylelint configuration");
    }
  }

  if (!report.scripts.typecheck) {
    add("Type check script", "missing", "package.json has no standalone typecheck script");
  }

  if (report.env.templates.length) {
    add("Env template", "ok", report.env.templates.join(", "));
  } else {
    add("Env template", "missing", "no template such as .env.example");
  }

  const hooks = report.hooks;
  if (hooks.tools.length && hooks.lintStaged) {
    add("Commit gates", "ok", `${hooks.tools.join(" + ")}, with lint-staged configured`);
  } else if (hooks.tools.length) {
    add("Commit gates", "partial", `${hooks.tools.join(" + ")} is installed but lint-staged is not configured`);
  } else {
    add("Commit gates", "missing", "no git hooks configuration");
  }

  const ci = report.ci;
  if (!ci.platforms.length) {
    add("CI", "missing", "no pipeline configuration");
  } else {
    const required = ["lint", "typecheck", "test", "build"];
    const absent = required.filter((token) => !ci.commands.includes(token));
    if (absent.length) {
      add("CI", "partial", `${ci.platforms.join(" + ")} is configured but the pipeline never mentions ${absent.join(", ")}`);
    } else {
      add("CI", "ok", ci.platforms.join(" + "));
    }
  }

  for (const [name, label] of [
    ["dev", "dev"],
    ["build", "build"],
  ]) {
    if (!report.scripts[name]) add("Base scripts", "missing", `package.json has no ${label} script`);
  }

  return gaps;
}
