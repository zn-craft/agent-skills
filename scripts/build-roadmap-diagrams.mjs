#!/usr/bin/env node
/**
 * 生成 ROADMAP 用的 SVG 配图，中英各一套（英文版是 .en.svg）。
 *
 *   node scripts/build-roadmap-diagrams.mjs            # 写入 docs/assets/
 *   node scripts/build-roadmap-diagrams.mjs --out DIR  # 换个输出目录
 *
 * 零依赖，Node 18+。本文件只负责跑流程并校验英文版；
 * 三张图在 build-roadmap-diagrams.figures.mjs，画法在 .svg.mjs，英文文案在 .labels.en.mjs。
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { layersDiagram, roadmapDiagram, seamsDiagram } from "./build-roadmap-diagrams.figures.mjs";
import { setLang } from "./build-roadmap-diagrams.svg.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 中日韩文字与全角标点：英文版里还剩下这些，说明标签表漏了词。
const CJK = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]+/g;

function assertEnglish(svg) {
  const leftover = [...new Set(svg.match(CJK) ?? [])];
  if (leftover.length) {
    throw new Error(
      `英文版还有没翻译的文案：${leftover.join(" / ")}。` +
        "补进 build-roadmap-diagrams.labels.en.mjs 即可。",
    );
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const outIndex = argv.indexOf("--out");
  const outDir = outIndex === -1 ? path.join(REPO_ROOT, "docs", "assets") : path.resolve(argv[outIndex + 1]);
  await mkdir(outDir, { recursive: true });

  const figures = [
    ["architecture-layers", layersDiagram],
    ["composition-seams", seamsDiagram],
    ["roadmap-phases", roadmapDiagram],
  ];

  for (const [name, build] of figures) {
    for (const [suffix, lang] of [
      ["", "zh"],
      [".en", "en"],
    ]) {
      setLang(lang);
      const svg = build();
      if (lang === "en") assertEnglish(svg);
      const file = path.join(outDir, `${name}${suffix}.svg`);
      await writeFile(file, svg);
      console.log(`已写入 ${path.relative(REPO_ROOT, file)}`);
    }
  }
}

await main();
