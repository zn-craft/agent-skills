/**
 * ROADMAP 配图的 SVG 原语、配色与文本排版。
 *
 * 三张图的文案和方块坐标在 build-roadmap-diagrams.mjs，这里只管怎么画：
 * 折行、缩字号、配色都由本文件决定。零依赖，Node 18+。
 */

import { EN_LABELS } from "./build-roadmap-diagrams.labels.en.mjs";

export const INK = "#0f172a";
export const MUTED = "#64748b";
export const FAINT = "#94a3b8";
export const LINE = "#e2e8f0";

// 三类色板：已发布的写法类 skill、横切类 skill、规划中的空位。
export const TONE = {
  baseline: { fill: "#eef2ff", stroke: "#c7d2fe", title: "#3730a3" },
  lang: { fill: "#f5f3ff", stroke: "#ddd6fe", title: "#5b21b6" },
  structure: { fill: "#eff6ff", stroke: "#bfdbfe", title: "#1d4ed8" },
  framework: { fill: "#ecfdf5", stroke: "#a7f3d0", title: "#065f46" },
  style: { fill: "#fff1f2", stroke: "#fecdd3", title: "#9f1239" },
  crosscut: { fill: "#fff7ed", stroke: "#fed7aa", title: "#9a3412" },
  planned: { fill: "#ffffff", stroke: "#cbd5e1", title: "#94a3b8" },
};

// 先按目标语言取文案，再排版：英文比中文长，折行必须发生在翻译之后。
let LANG = "zh";
const EN_ENTRIES = Object.entries(EN_LABELS).sort((a, b) => b[0].length - a[0].length);

export function setLang(lang) {
  LANG = lang;
}

export function localize(value) {
  if (LANG !== "en") return value;
  let output = String(value);
  for (const [zh, en] of EN_ENTRIES) output = output.split(zh).join(en);
  return output;
}

export const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const rect = (x, y, w, h, { rx = 14, fill = "#fff", stroke = "none", sw = 1.5, dash = "" } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${
    stroke === "none" ? "" : ` stroke="${stroke}" stroke-width="${sw}"`
  }${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;

export const text = (x, y, value, { size = 13, weight = 400, fill = INK, anchor = "start" } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(localize(value))}</text>`;

export const line = (x1, y1, x2, y2, { stroke = LINE, sw = 1.5, dash = "" } = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${
    dash ? ` stroke-dasharray="${dash}"` : ""
  }/>`;

export const arrow = (x1, y1, x2, y2, { color = "#94a3b8" } = {}) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="2" marker-end="url(#arrowhead)"/>`;

// 估算文本宽度，不引字体度量库：中日韩字符按 1em，大写和窄字符各给一个系数。
// 系数略偏大，宁可多折一行也不要让文字压出卡片。
const CJK_CHAR = /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/;
const NARROW_CHAR = /[iljtfr.,:;'!|()[\]{}/\\-]/;

export function estimateWidth(value, size) {
  let units = 0;
  for (const char of String(value)) {
    if (CJK_CHAR.test(char)) units += 1;
    else if (char === " ") units += 0.32;
    else if (NARROW_CHAR.test(char)) units += 0.38;
    else if (char === char.toUpperCase() && char !== char.toLowerCase()) units += 0.66;
    else units += 0.58;
  }
  return units * size;
}

/** 按估算宽度折行；没有空格的整段中文按字符硬切，避免溢出卡片。 */
export function wrap(value, maxWidth, size) {
  const lines = [];
  let current = "";
  const flush = (piece) => {
    if (current) lines.push(current);
    current = piece;
  };

  for (const word of String(value).split(/\s+/).filter(Boolean)) {
    if (estimateWidth(word, size) > maxWidth) {
      let buffer = "";
      for (const char of word) {
        if (estimateWidth(buffer + char, size) > maxWidth) {
          if (buffer) lines.push(buffer);
          buffer = char;
        } else {
          buffer += char;
        }
      }
      flush(buffer);
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (estimateWidth(candidate, size) <= maxWidth) current = candidate;
    else flush(word);
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * 标题放不下一行时按连字符或空格折成两行，再不行就缩小字号。
 * 长 skill 名（frontend-project-baseline 这类）必须能完整显示，截断会让人认错 skill。
 */
export function fitTitle(title, available) {
  for (const size of [14, 12.5]) {
    if (estimateWidth(title, size) <= available) return { lines: [title], size };
  }

  // 空格紧挨着斜杠时不断行，否则会切出以 "/" 开头的行。
  const breaks = [...title.matchAll(/[-\s]/g)]
    .filter(
      (match) =>
        /-/.test(match[0]) ||
        ((title[match.index - 1] ?? "") !== "/" && (title[match.index + 1] ?? "") !== "/"),
    )
    .map((match) => match.index + 1);
  const middle = title.length / 2;
  const cut = breaks.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))[0] ?? 0;
  const lines = cut ? [title.slice(0, cut).trim(), title.slice(cut).trim()] : [title];
  const widest = Math.max(...lines.map((entry) => estimateWidth(entry, 12.5)));
  return { lines, size: widest <= available ? 12.5 : 11.5 };
}

/** 带标题和说明行的卡片。tone 决定配色，planned 走虚线灰底表示还没做。 */
export const card = (x, y, w, h, { title, lines = [], tone = "lang" }) => {
  const skin = TONE[tone];
  const dashed = tone === "planned";
  const { lines: titleLines, size } = fitTitle(localize(title), w - 32);
  const twoLine = titleLines.length > 1;
  const parts = [
    rect(x, y, w, h, {
      fill: skin.fill,
      stroke: skin.stroke,
      dash: dashed ? "6 5" : "",
    }),
  ];

  titleLines.forEach((entry, index) => {
    parts.push(
      text(x + 16, y + (twoLine ? 24 + index * 17 : 29), entry, { size, weight: 650, fill: skin.title }),
    );
  });

  // 英文说明比中文长，统一折行后按行排版；上限四行，再多就要重写文案而不是加高卡片。
  const body = lines.flatMap((entry) => wrap(localize(entry), w - 32, 11)).slice(0, 4);
  const lineTop = twoLine ? y + 60 : y + 50;
  body.forEach((entry, index) => {
    parts.push(text(x + 16, lineTop + index * 15, entry, { size: 11, fill: dashed ? FAINT : MUTED }));
  });
  return parts.join("");
};

export const frame = (width, height, title, subtitle, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(
    localize(title),
  )}">
  <defs>
    <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8"/>
    </marker>
  </defs>
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  ${text(56, 58, title, { size: 25, weight: 700 })}
  ${text(56, 86, subtitle, { size: 13, fill: MUTED })}
  ${body}
</svg>
`;
