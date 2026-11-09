/**
 * 仓库的 skill 布局：
 *
 *   skills/<skill-name>/SKILL.md   英文版，发布物，安装器和目录站默认发现它
 *   zh/<skill-name>/SKILL.md       中文版，校对源，不在 skills/ 下，默认不被发现
 *
 * 两棵树一一对应：skills/<名>/x 对应 zh/<名>/x，改一边就要同步另一边。
 * 布局只在这里定义一次，校验脚本、打分脚本和脚手架都从这里取，
 * 避免几边对"什么算一个 skill"的口径漂移。
 */

import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** 语言的展示顺序：先英文后中文。 */
export const LANGS = ["en", "zh"];

/** 两个语言根目录，相对仓库根。 */
export const EN_ROOT = "skills";
export const ZH_ROOT = "zh";

/** 语言版本对应的 skill 名：英文用原名，其余语言加后缀。 */
export function expectedName(skill, lang) {
  return lang === "en" ? skill : `${skill}-${lang}`;
}

function rootFor(repoRoot, lang) {
  return path.join(repoRoot, lang === "en" ? EN_ROOT : ZH_ROOT);
}

async function readIfExists(file) {
  return readFile(file, "utf8").catch(() => null);
}

/** 直接子目录里带 SKILL.md 的才算一个语言版本。 */
async function variantDirsIn(root) {
  const found = [];
  for (const entry of await readdir(root, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const dir = path.join(root, entry.name);
    if ((await readIfExists(path.join(dir, "SKILL.md"))) === null) continue;
    found.push({ skill: entry.name, dir });
  }
  return found;
}

/** 列出所有 skill 和它已有的语言版本目录。 */
export async function findSkills(repoRoot) {
  const skills = new Map();
  for (const lang of LANGS) {
    for (const item of await variantDirsIn(rootFor(repoRoot, lang))) {
      const skill = skills.get(item.skill) ?? { skill: item.skill, dirs: {} };
      skill.dirs[lang] = item.dir;
      skills.set(item.skill, skill);
    }
  }
  return [...skills.values()].sort((left, right) => left.skill.localeCompare(right.skill));
}

/** 展平成语言版本，每个版本是独立的校验、打分和安装单位。 */
export async function findVariants(repoRoot) {
  const variants = [];
  for (const skill of await findSkills(repoRoot)) {
    for (const lang of LANGS) {
      const dir = skill.dirs[lang];
      if (!dir) continue;
      variants.push({ skill: skill.skill, lang, dir, name: expectedName(skill.skill, lang) });
    }
  }
  return variants;
}

/**
 * 把命令行参数解析成语言版本。参数可以指向仓库根、skills/、zh/、
 * 某个 skill 目录或某个语言版本目录；指不到任何 skill 时返回空数组。
 */
export async function variantsFromPath(target) {
  const stats = await lstat(target).catch(() => null);
  if (!stats?.isDirectory()) return [];

  const name = path.basename(target);
  const parentName = path.basename(path.dirname(target));

  if (name === EN_ROOT || name === ZH_ROOT) {
    const lang = name === EN_ROOT ? "en" : "zh";
    return (await variantDirsIn(target)).map((item) => ({
      skill: item.skill,
      lang,
      dir: item.dir,
      name: expectedName(item.skill, lang),
    }));
  }

  if (
    (parentName === EN_ROOT || parentName === ZH_ROOT) &&
    (await readIfExists(path.join(target, "SKILL.md"))) !== null
  ) {
    const lang = parentName === EN_ROOT ? "en" : "zh";
    return [{ skill: name, lang, dir: target, name: expectedName(name, lang) }];
  }

  return findVariants(target);
}

/**
 * 列出一个目录树里的相对文件路径，用来比对中英两棵树是否一一对应。
 * 隐藏文件也算（`.github/`、`.husky/` 这些配置模板就得两边都有），
 * 只跳过系统和编辑器产生的临时文件。
 */
export async function listTreeFiles(dir) {
  const found = [];
  const noise = new Set([".DS_Store", "Thumbs.db"]);

  async function walk(current, prefix) {
    for (const entry of await readdir(current, { withFileTypes: true }).catch(() => [])) {
      if (noise.has(entry.name)) continue;
      const next = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path.join(current, entry.name), next);
      else found.push(next);
    }
  }

  await walk(dir, "");
  return found.sort();
}

/** 找出不在语言目录里的散落 SKILL.md。 */
export async function findStraySkillFiles(repoRoot) {
  const known = new Set((await findVariants(repoRoot)).map((variant) => path.join(variant.dir, "SKILL.md")));
  const found = [];

  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
      if (entry.name.startsWith(".")) continue;
      const child = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (entry.name.toLowerCase() === "skill.md" && !known.has(child)) found.push(child);
    }
  }

  for (const lang of LANGS) await walk(rootFor(repoRoot, lang));
  return found.sort();
}
