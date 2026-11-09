/**
 * 读取 skill 目录，攒出打分要用的上下文。
 */

import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { reportPath } from "./format.mjs";
import { collectSentences, estimateTokens, findDuplicates, findLongParagraphs } from "./text.mjs";

// 布局和识别规则与校验脚本共用一份，定义在 scripts/validate-skills/layout.mjs。
export { findVariants } from "../validate-skills/layout.mjs";

export function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { ok: false, error: "SKILL.md 没有以 '---' 开头的 YAML frontmatter" };
  }
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) return { ok: false, error: "frontmatter 没有用 '---' 闭合" };
  const fields = {};
  for (const line of normalized.slice(4, end + 1).split("\n")) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const match = /^([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    const quoted =
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);
    fields[match[1]] = value;
  }
  return { ok: true, fields, body: normalized.slice(end + 4) };
}

export async function collectEntries(dir, prefix = "") {
  const entries = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    entries.push({ name: entry.name, relative, full, isDir: entry.isDirectory() });
    if (entry.isDirectory()) entries.push(...(await collectEntries(full, relative)));
  }
  return entries;
}

export function markdownFiles(entries) {
  return entries.filter((entry) => entry.relative.endsWith(".md") && !entry.isDir);
}

export function referenceFiles(entries) {
  return markdownFiles(entries).filter((entry) => entry.relative.startsWith("references/"));
}

export async function buildContext(variant, registry) {
  const dir = variant.dir;
  const name = variant.name;
  const label = reportPath(dir);
  const source = await readFile(path.join(dir, "SKILL.md"), "utf8").catch(() => "");
  const frontmatter = parseFrontmatter(source);
  const body = frontmatter.ok ? frontmatter.body : source;
  const entries = await collectEntries(dir);

  const symlinks = [];
  for (const entry of entries) {
    const info = await lstat(entry.full).catch(() => null);
    if (info?.isSymbolicLink()) symlinks.push(entry.relative);
  }

  const markdown = markdownFiles(entries);
  const textFiles = [];
  for (const entry of markdown) {
    const text = await readFile(entry.full, "utf8");
    textFiles.push({
      relative: entry.relative,
      bytes: (await lstat(entry.full)).size,
      tokens: estimateTokens(text),
      text,
    });
  }

  const references = textFiles.filter((file) => file.relative.startsWith("references/"));
  const skillBytes = (await lstat(path.join(dir, "SKILL.md"))).size;
  const skillTokens = estimateTokens(source);
  const proseBytes = textFiles.reduce((sum, file) => sum + file.bytes, 0);
  const proseTokens = textFiles.reduce((sum, file) => sum + file.tokens, 0);
  const prose = textFiles.map((file) => file.text).join("\n");
  const others = registry.filter((item) => item.skill !== variant.skill);

  return {
    dir,
    skill: variant.skill,
    lang: variant.lang,
    name,
    label,
    source,
    body,
    frontmatter,
    entries,
    symlinks,
    textFiles,
    references,
    referenceBytes: references.reduce((sum, file) => sum + file.bytes, 0),
      referenceTokens: references.reduce((sum, file) => sum + file.tokens, 0),
    skillBytes,
      skillTokens,
    proseBytes,
      proseTokens,
    prose,
    relativeSet: new Set(entries.map((entry) => entry.relative)),
    otherSkillNames: others.map((item) => item.name),
    otherDescriptions: others,
    duplicates: findDuplicates(textFiles.flatMap((file) => collectSentences(file.relative, file.text))),
    longParagraphs: textFiles.flatMap((file) => findLongParagraphs(file).map((item) => ({ ...item, file: file.relative }))),
  };
}
