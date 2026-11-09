#!/usr/bin/env node
/**
 * Scaffold a new skill from templates/skill.
 *
 *   node scripts/new-skill.mjs my-skill
 *   node scripts/new-skill.mjs my-skill --description "..." --resources references,scripts
 *
 * 一次建好两棵树：skills/<skill>/ 是英文版，zh/<skill>/ 是中文版。
 */

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { LANGS } from "./validate-skills/layout.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "templates", "skill");

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESOURCE_DIRS = ["scripts", "references", "assets"];
// 两棵树各写各的语言，没给描述时也要给对应语言的占位符，
// 否则英文版会留下中文 TODO、中文版会留下英文 TODO。
const DESCRIPTION_PLACEHOLDER = {
  en: "TODO: say in one or two sentences what this skill solves and when to use it",
  zh: "TODO: 说明这个 skill 做什么、什么时候该用它",
};
const SHORT_DESCRIPTION_PLACEHOLDER = {
  en: "TODO: a 25-64 character summary for the agent UI",
  zh: "TODO: 25-64 字符的界面简短描述",
};

/** 值里有 YAML 的敏感字符就加双引号，否则生成出来的 frontmatter 会解析失败。 */
function yamlScalar(value) {
  const needsQuote = /:\s|\s#|^(?:-|\?|:)\s|^[#[\]{}&*!|>'"%@`]/.test(value);
  return needsQuote ? `"${value.replace(/"/g, '\\"')}"` : value;
}

function usage() {
  console.log(`用法：node scripts/new-skill.mjs <skill-name> [options]

Options:
  --description <text>        SKILL.md 的 description，会同时填进两棵树，另一门语言记得改写
  --short-description <text>  agents/openai.yaml 里的界面简短描述（25-64 字符），同样两棵树共用
  --resources <list>          额外创建目录，逗号分隔：${RESOURCE_DIRS.join(",")}
  --no-openai-yaml            不生成 agents/openai.yaml
  -h, --help                  显示帮助`);
}

function parseArgs(argv) {
  const options = {
    skill: "",
    description: "",
    shortDescription: "",
    resources: [],
    openaiYaml: true,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`缺少参数值：${arg}`);
      return argv[index];
    };
    switch (arg) {
      case "--description":
        options.description = next();
        break;
      case "--short-description":
        options.shortDescription = next();
        break;
      case "--resources":
        options.resources = next()
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
        break;
      case "--no-openai-yaml":
        options.openaiYaml = false;
        break;
      case "-h":
      case "--help":
        usage();
        process.exit(0);
        break;
      default:
        if (arg.startsWith("-")) throw new Error(`未知参数：${arg}`);
        if (options.skill) throw new Error("只能指定一个 skill 名称");
        options.skill = arg;
    }
  }
  return options;
}

async function substitute(target, replacements) {
  const info = await stat(target);
  if (info.isDirectory()) {
    for (const child of await readdir(target)) {
      await substitute(path.join(target, child), replacements);
    }
    return;
  }
  if (!info.isFile()) return;
  let content = await readFile(target, "utf8");
  for (const [token, value] of Object.entries(replacements)) {
    content = content.split(token).join(value);
  }
  await writeFile(target, content);
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }

  if (!options.skill) {
    usage();
    process.exit(2);
  }
  if (!NAME_PATTERN.test(options.skill) || options.skill.length > 64) {
    console.error(`skill 名称不合法：${options.skill}（小写字母、数字、连字符，≤64 字符）`);
    process.exit(2);
  }
  for (const resource of options.resources) {
    if (!RESOURCE_DIRS.includes(resource)) {
      console.error(`不支持的资源目录：${resource}（可选：${RESOURCE_DIRS.join(",")}）`);
      process.exit(2);
    }
  }

  const targets = {
    en: path.join(REPO_ROOT, "skills", options.skill),
    zh: path.join(REPO_ROOT, "zh", options.skill),
  };
  for (const [lang, dir] of Object.entries(targets)) {
    if (await stat(dir).catch(() => null)) {
      console.error(`${lang} 目录已存在：${path.relative(REPO_ROOT, dir)}`);
      process.exit(1);
    }
  }
  for (const lang of LANGS) {
    const langTemplate = path.join(TEMPLATE_DIR, lang);
    if (!(await stat(langTemplate).catch(() => null))) {
      console.error(`找不到模板目录：${path.relative(REPO_ROOT, langTemplate)}`);
      process.exit(1);
    }
  }

  for (const lang of LANGS) {
    const langDest = targets[lang];
    await cp(path.join(TEMPLATE_DIR, lang), langDest, { recursive: true });
    const replacements = {
      "{{skill-name}}": options.skill,
      "{{display-name}}": options.skill,
      "{{description}}": yamlScalar(options.description || DESCRIPTION_PLACEHOLDER[lang]),
      "{{short-description}}": yamlScalar(options.shortDescription || SHORT_DESCRIPTION_PLACEHOLDER[lang]),
    };
    for (const child of await readdir(langDest)) {
      await substitute(path.join(langDest, child), replacements);
    }
    if (!options.openaiYaml) {
      await rm(path.join(langDest, "agents"), { recursive: true, force: true });
    }
    for (const resource of options.resources) {
      const resourceDir = path.join(langDest, resource);
      await mkdir(resourceDir, { recursive: true });
      await writeFile(path.join(resourceDir, ".gitkeep"), "");
    }
  }

  const relative = path.relative(REPO_ROOT, targets.en).split(path.sep).join("/");
  const zhRelative = path.relative(REPO_ROOT, targets.zh).split(path.sep).join("/");
  console.log(`已创建 ${relative}（英文）和 ${zhRelative}（中文）`);
  console.log("\n下一步：");
  console.log(`  1. 补全 ${relative}/SKILL.md 和 ${zhRelative}/SKILL.md 里的 TODO`);
  console.log(`  2. node scripts/validate-skills.mjs`);
  console.log(`  3. node scripts/score-skills.mjs ${relative}`);
  console.log("  4. 在 README.md 和 README.en.md 的 skills 表格里各登记一行");
}

await main();
