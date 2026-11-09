/**
 * 校验实现：frontmatter、目录条目、README 登记与中英两棵树的一一对应。
 */

import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { findSkills, findStraySkillFiles, findVariants, listTreeFiles, variantsFromPath } from "./layout.mjs";
import {
  NAME_PATTERN,
  PLACEHOLDER_PATTERN,
  REGISTRY_ROW,
  REPO_ROOT,
  VARIANT_ENTRIES,
} from "./validate-skills.config.mjs";

export function usage(print = console.log) {
  print(`用法：node scripts/validate-skills.mjs [路径 ...] [options]

路径可以是仓库根、skills/、zh/、某个 skill 目录或某个语言版本目录；不给则校验全部。

Options:
  --json            输出机器可读结果
  -h, --help        显示帮助`);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function reportPath(target) {
  const relative = path.relative(REPO_ROOT, target);
  return relative && !relative.startsWith("..") ? toPosix(relative) : target;
}

function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { error: "SKILL.md 必须以 '---' 开头的 YAML frontmatter 开始" };
  }
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) {
    return { error: "frontmatter 没有用 '---' 正常闭合" };
  }
  const fields = {};
  for (const line of normalized.slice(4, end + 1).split("\n")) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const match = /^([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    const quoted =
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);
    fields[match[1]] = value;
  }
  return { fields, body: normalized.slice(end + 4) };
}

async function collectEntries(dir, prefix = "") {
  const entries = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    entries.push({ name: entry.name, relative, full, entry });
    if (entry.isDirectory()) entries.push(...(await collectEntries(full, relative)));
  }
  return entries;
}

/** 读 README 表格：skill 名 -> 说明列。缺行的 skill 不在 map 里。 */
async function readRegistry(file) {
  const text = await readFile(file, "utf8").catch(() => null);
  const registry = new Map();
  if (text === null) return registry;
  for (const line of text.split("\n")) {
    const match = REGISTRY_ROW.exec(line);
    if (!match) continue;
    const name = path.basename(match[2].replace(/\/+$/, ""));
    registry.set(name, match[3].trim());
  }
  return registry;
}

/**
 * README 的 skills 表格是使用者查找入口，说明列必须等于 description：
 * README.md 抄中文版（没有中文版时抄英文版），README.en.md 只登记有英文版的 skill。
 * 顺带比对中英两棵树的文件是否一一对应。
 */
async function checkRegistry(results) {
  const cn = await readRegistry(path.join(REPO_ROOT, "README.md"));
  const en = await readRegistry(path.join(REPO_ROOT, "README.en.md"));
  // 另一种语言是否存在看磁盘，不看这次跑了哪些目标。
  const onDisk = new Map((await findSkills(REPO_ROOT)).map((skill) => [skill.skill, skill.dirs]));

  const bySkill = new Map();
  for (const result of results) {
    if (!result.skill) continue;
    if (!bySkill.has(result.skill)) bySkill.set(result.skill, []);
    bySkill.get(result.skill).push(result);
  }

  for (const [skill, variants] of bySkill) {
    const dirs = onDisk.get(skill) ?? {};
    const hasEn = Boolean(dirs.en);
    const hasZh = Boolean(dirs.zh);
    const zh = variants.find((item) => item.lang === "zh") ?? null;
    const english = variants.find((item) => item.lang === "en") ?? null;

    // README.md 登记中文版的 description，没有中文版时用英文版。
    const primary = hasZh ? zh : english;
    if (primary && !primary.errors.length) {
      const listedCn = cn.get(skill);
      if (listedCn === undefined) {
        primary.errors.push("README.md 的 skills 表格里没有这一行，使用者查不到");
      } else if (listedCn !== primary.description) {
        primary.errors.push(`README.md 的说明列与 ${primary.lang} 版的 description 不一致（说明列抄 description）`);
      }
    }

    // README.en.md 只登记有英文版的 skill。
    if (hasEn && english && !english.errors.length) {
      const listedEn = en.get(skill);
      if (listedEn === undefined) english.warnings.push("README.en.md 的 skills 表格里没有这一行");
      else if (listedEn !== english.description) {
        english.errors.push("README.en.md 的说明列与英文版的 description 不一致（说明列抄 description）");
      }
    }

    // 中英两棵树的文件必须一一对应。
    if (hasEn && hasZh) {
      if (zh && english) {
        const enFiles = new Set(await listTreeFiles(english.dir));
        const zhFiles = new Set(await listTreeFiles(zh.dir));
        for (const file of enFiles) {
          if (!zhFiles.has(file)) english.warnings.push(`zh/${skill}/${file} 缺失，中文版要和英文版一一对应`);
        }
        for (const file of zhFiles) {
          if (!enFiles.has(file)) zh.warnings.push(`skills/${skill}/${file} 缺失，英文版要和中文版一一对应`);
        }
      }
    } else if (hasEn) {
      (english ?? variants[0]).warnings.push(`zh/${skill}/ 不存在，中文版要和英文版一起维护`);
    } else if (hasZh) {
      (zh ?? variants[0]).warnings.push(`skills/${skill}/ 不存在，这个 skill 还没有英文版`);
    }
  }
}

async function validateVariant(variant) {
  const { lang } = variant;
  const dir = variant.dir;
  const label = reportPath(dir);
  const errors = [];
  const warnings = [];

  const source = await readFile(path.join(dir, "SKILL.md"), "utf8").catch(() => null);
  if (source === null) {
    errors.push("SKILL.md 无法读取");
    return { ...variant, label, description: "", errors, warnings };
  }

  const parsed = parseFrontmatter(source);
  let description = "";
  if (parsed.error) {
    errors.push(parsed.error);
  } else {
    const { fields, body } = parsed;
    const declared = fields.name;
    if (!declared) {
      errors.push("frontmatter 缺少 name");
    } else {
      if (!NAME_PATTERN.test(declared)) {
        errors.push(`name 只允许小写字母、数字和连字符：${declared}`);
      }
      if (declared.length > 64) errors.push("name 超过 64 个字符");
      if (declared !== variant.name) {
        errors.push(`这个版本的 name 必须是 ${variant.name}，当前是 ${declared}`);
      }
    }

    description = fields.description ?? "";
    if (!description) {
      errors.push("frontmatter 缺少 description");
    } else if (description === ">" || description === "|") {
      errors.push("description 请写成单行文本，不要用 YAML 块标量");
    } else {
      if (description.length < 20) errors.push("description 太短，至少要写清做什么和什么时候用");
      if (description.length > 1024) errors.push("description 超过 1024 个字符");
      if (PLACEHOLDER_PATTERN.test(description)) errors.push("description 里还有未完成的占位内容");
    }

    if (body.trim().length < 20) {
      errors.push("SKILL.md 正文为空或过短");
    } else if (PLACEHOLDER_PATTERN.test(body)) {
      errors.push("SKILL.md 正文里还有未完成的占位内容（{{...}} / TODO / FIXME）");
    }
  }

  for (const { name: entryName, relative, full, entry } of await collectEntries(dir)) {
    const info = await lstat(full);
    if (info.isSymbolicLink()) {
      errors.push(`不允许符号链接：${relative}`);
      continue;
    }
    if (!entry.isDirectory() && !entry.isFile()) {
      errors.push(`不支持的文件类型：${relative}`);
      continue;
    }
    if (!relative.includes("/") && !VARIANT_ENTRIES.has(entryName)) {
      warnings.push(
        `非常规条目：${entryName}（语言目录里通常只放 SKILL.md/agents/scripts/references/assets）`,
      );
    }
  }

  const yaml = await readFile(path.join(dir, "agents", "openai.yaml"), "utf8").catch(() => null);
  if (yaml !== null) {
    if (!/^interface:/m.test(yaml)) warnings.push("agents/openai.yaml 里没有 interface 段");
    if (PLACEHOLDER_PATTERN.test(yaml)) warnings.push("agents/openai.yaml 里还有未完成的占位内容");
  }

  return { ...variant, label, description, errors, warnings };
}

/** 命令行参数可以指向仓库根、skills/、zh/、一个 skill 目录或一个语言版本目录。 */
async function collectVariants(targets) {
  const variants = [];
  const roots = targets.length ? targets.map((target) => path.resolve(REPO_ROOT, target)) : [REPO_ROOT];

  for (const root of roots) {
    const stats = await lstat(root).catch(() => null);
    if (!stats || !stats.isDirectory()) {
      console.error(`路径不存在或不是目录：${reportPath(root)}`);
      process.exit(2);
    }

    const found = await variantsFromPath(root);
    if (!found.length) {
      console.error(`没有找到 skill：${reportPath(root)}（应为 skills/<name>/SKILL.md 或 zh/<name>/SKILL.md）`);
      process.exit(2);
    }
    variants.push(...found);
  }

  return variants;
}

export async function run() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    usage();
    return;
  }

  const known = new Set(["--json"]);
  const unknown = argv.find((arg) => arg.startsWith("-") && !known.has(arg));
  if (unknown) {
    console.error(`未知参数：${unknown}`);
    usage(console.error);
    process.exit(2);
  }

  const json = argv.includes("--json");
  const targets = argv.filter((arg) => !arg.startsWith("-"));

  const variants = await collectVariants(targets);
  const results = [];
  for (const variant of variants) results.push(await validateVariant(variant));
  await checkRegistry(results);

  // 不在 skills/<名>/ 或 zh/<名>/ 里的 SKILL.md 不会被上面找到，单独提示。
  const recognized = new Set((await findVariants(REPO_ROOT)).map((variant) => path.join(variant.dir, "SKILL.md")));
  for (const file of await findStraySkillFiles(REPO_ROOT)) {
    if (recognized.has(file)) continue;
    results.push({
      skill: "",
      lang: "",
      dir: path.dirname(file),
      name: "",
      label: reportPath(file),
      description: "",
      errors: [],
      warnings: ["这个 SKILL.md 不在 skills/<名>/ 或 zh/<名>/ 下，不会被识别为 skill"],
    });
  }

  const failed = results.filter((result) => result.errors.length).length;
  const skillCount = new Set(variants.map((variant) => variant.skill)).size;

  if (json) {
    console.log(JSON.stringify({ skills: skillCount, count: results.length, failed, variants: results }, null, 2));
  } else if (!results.length) {
    console.log("skills/ 下还没有任何 skill。用 `node scripts/new-skill.mjs <name>` 新建一个。");
  } else {
    for (const result of results) {
      console.log(`${result.errors.length ? "FAIL" : "PASS"} ${result.label}`);
      for (const error of result.errors) console.log(`  error: ${error}`);
      for (const warning of result.warnings) console.log(`  warn:  ${warning}`);
    }
    console.log(
      `\n${skillCount} 个 skill，${variants.length} 个语言版本，${variants.length - failed} 个通过，${failed} 个失败。`,
    );
  }

  process.exit(failed ? 1 : 0);
}
