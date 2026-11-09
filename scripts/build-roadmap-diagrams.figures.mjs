/**
 * ROADMAP 三张图的文案与方块坐标。
 *
 * 只放内容，画法在 build-roadmap-diagrams.svg.mjs，入口在 build-roadmap-diagrams.mjs。
 * 改文案、加一层或加一个阶段都在本文件里。
 */

import {
  FAINT,
  LINE,
  MUTED,
  TONE,
  arrow,
  card,
  estimateWidth,
  frame,
  line,
  localize,
  rect,
  text,
  wrap,
} from "./build-roadmap-diagrams.svg.mjs";

/** 图一：L0-L4 分层，左列前端现状，右列后端与数据规划。 */
export function layersDiagram() {
  const rows = [
    {
      label: "L0",
      name: "工程基线",
      hint: "搭一次，长期生效",
      left: [
        {
          title: "frontend-project-baseline",
          lines: ["包管理器 / Node 引擎 / TypeScript 严格度", "格式化 / lint / git hooks / CI 必过项"],
          tone: "baseline",
          wide: true,
        },
      ],
      right: [
        { title: "node-project-baseline", lines: ["服务端工程化基线"], tone: "planned" },
        { title: "python-project-baseline", lines: ["工程化基线"], tone: "planned" },
      ],
    },
    {
      label: "L1",
      name: "语言层",
      hint: "每次写代码",
      left: [
        { title: "js-best-practices", lines: ["命名 / 控制流 / 异步", "错误 / 集合 / 性能取舍"], tone: "lang" },
        { title: "typescript-best-practices", lines: ["类型建模 / 收窄", "any 过渡 / Props 类型"], tone: "lang" },
      ],
      right: [
        { title: "python-best-practices", lines: ["语言层写法"], tone: "planned" },
        { title: "go-best-practices", lines: ["语言层写法"], tone: "planned" },
      ],
    },
    {
      label: "L2",
      name: "结构层",
      hint: "新建或重组模块",
      left: [
        {
          title: "js-module-structure",
          lines: ["一个目录一个模块：主逻辑 + type / config / mock / test", "React / Vue / 小程序 / Taro / uni-app 的目录适配"],
          tone: "structure",
          wide: true,
        },
      ],
      right: [
        { title: "node-module-structure", lines: ["服务端分层职责"], tone: "planned" },
        { title: "data-access", lines: ["仓储与数据访问边界"], tone: "planned" },
      ],
    },
    {
      label: "L3",
      name: "框架与视图",
      hint: "改组件、改样式",
      left: [
        { title: "react-best-practices", lines: ["组件 / 状态 / Hooks", "Effect / 数据 / 性能"], tone: "framework" },
        { title: "vue-best-practices", lines: ["组件与组合式 API"], tone: "planned" },
        { title: "style-conventions", lines: ["作用域 / token", "选择器 / 断点 / 主题"], tone: "style" },
      ],
      right: [
        { title: "api-design", lines: ["接口契约设计"], tone: "planned" },
        { title: "fastapi / spring", lines: ["框架层写法"], tone: "planned" },
        { title: "nest / fastify", lines: ["框架层写法"], tone: "planned" },
      ],
    },
    {
      label: "L4",
      name: "横切",
      hint: "任何改动都适用",
      left: [
        { title: "code-comments", lines: ["写什么 / 何时删", "旧注释处置"], tone: "crosscut" },
        { title: "testing", lines: ["测试范围与用例"], tone: "planned" },
        { title: "accessibility", lines: ["键盘与可访问名称"], tone: "planned" },
      ],
      right: [
        { title: "security", lines: ["鉴权与输入校验"], tone: "planned" },
        { title: "observability", lines: ["日志与链路"], tone: "planned" },
        { title: "resilience", lines: ["重试 / 超时 / 幂等"], tone: "planned" },
      ],
    },
  ];

  const body = [];
  const rowTop = 132;
  const rowHeight = 144;
  const gap = 14;
  const cardHeight = 118;

  body.push(text(276, 118, "前端（已发布）", { size: 13.5, weight: 650, fill: "#334155" }));
  body.push(text(900, 118, "后端 / 数据 / 平台（规划）", { size: 13.5, weight: 650, fill: FAINT }));

  rows.forEach((row, index) => {
    const y = rowTop + index * (rowHeight + gap);
    body.push(rect(56, y, 190, rowHeight, { rx: 16, fill: "#f8fafc", stroke: LINE }));
    body.push(text(76, y + 40, row.label, { size: 20, weight: 700, fill: "#334155" }));
    body.push(text(76, y + 66, row.name, { size: 13.5, weight: 600 }));
    body.push(text(76, y + 88, row.hint, { size: 11, fill: MUTED }));

    body.push(rect(262, y, 590, rowHeight, { rx: 16, fill: "#ffffff", stroke: LINE }));
    let leftCursor = 278;
    for (const item of row.left) {
      const itemWidth = item.wide ? 358 : 172;
      body.push(card(leftCursor, y + 12, itemWidth, cardHeight, item));
      leftCursor += itemWidth + 16;
    }

    body.push(rect(868, y, 434, rowHeight, { rx: 16, fill: "#ffffff", stroke: "#eef2f6" }));
    row.right.forEach((item, position) => {
      // 133 是让「仓储与数据访问边界」这类 9 字中文标签不折行的最小宽度。
      body.push(card(882 + position * 139, y + 12, 133, cardHeight, { ...item, lines: item.lines.slice(0, 2) }));
    });
  });

  body.push(
    rect(56, 926, 12, 12, { rx: 3, fill: TONE.baseline.fill, stroke: TONE.baseline.stroke }),
    text(76, 936, "已发布", { size: 11.5, fill: MUTED }),
    rect(140, 926, 12, 12, { rx: 3, fill: "#fff", stroke: "#cbd5e1", dash: "4 3" }),
    text(160, 936, "规划中", { size: 11.5, fill: FAINT }),
    text(1246, 936, "同一套轴向上扩展，不另起一套分类", { size: 11.5, fill: FAINT, anchor: "end" }),
  );

  return frame(
    1358,
    966,
    "Agent Skills 分层架构",
    "按触发时机分层：越靠下越贴近具体改动，越靠上越接近一次性配置。右列是同一套轴上的扩展位。",
    body.join("\n  "),
  );
}

/** 图二：组合加载时的接缝与裁决顺序。 */
export function seamsDiagram() {
  const width = 1358;
  const body = [];
  const chain = [
    { title: "js-best-practices", lines: ["语言层写法", "命名 / 异步 / 错误"], tone: "lang" },
    { title: "typescript-best-practices", lines: ["类型建模", "收窄 / 断言过渡"], tone: "lang" },
    { title: "js-module-structure", lines: ["目录与文件职责", "导出面"], tone: "structure" },
    { title: "react-best-practices", lines: ["组件行为", "状态 / Effect / 性能"], tone: "framework" },
    { title: "style-conventions", lines: ["样式落点", "token / 作用域 / 断点"], tone: "style" },
  ];
  const seams = ["失败语义", "类型归属", "导出面", "样式落点"];

  body.push(text(56, 128, "一次 React + TS 改动会同时命中多个 skill，靠四条接缝交接：", { size: 13, fill: MUTED }));

  const startX = 56;
  const cardW = 200;
  const cardH = 118;
  const cardY = 250;
  const step = 266;

  chain.forEach((item, index) => {
    const x = startX + index * step;
    body.push(card(x, cardY, cardW, cardH, item));
    if (index === chain.length - 1) return;
    const from = x + cardW + 8;
    const to = x + step - 8;
    body.push(arrow(from, cardY + cardH / 2, to, cardY + cardH / 2));
    const mid = (from + to) / 2;
    body.push(
      `<circle cx="${mid}" cy="${cardY + cardH / 2}" r="11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>`,
      text(mid, cardY + cardH / 2 + 4, String(index + 1), {
        size: 11.5,
        weight: 650,
        fill: MUTED,
        anchor: "middle",
      }),
    );
  });

  // 接缝名字放图例里，不压在箭头上：中英长度差一倍，箭头间隙放不下英文。
  let legendCursor = 56;
  seams.forEach((seam, index) => {
    body.push(
      `<circle cx="${legendCursor + 11}" cy="${400}" r="11" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>`,
      text(legendCursor + 11, 404, String(index + 1), { size: 11.5, weight: 650, fill: MUTED, anchor: "middle" }),
      text(legendCursor + 30, 404, seam, { size: 12, fill: MUTED }),
    );
    // 图例项之间留足余量：英文比中文长，估宽偏小时靠这段空白兜底。
    legendCursor += 30 + estimateWidth(seam, 12) * 1.1 + 64;
  });

  body.push(rect(56, 168, 1246, 52, { rx: 12, fill: TONE.crosscut.fill, stroke: TONE.crosscut.stroke, dash: "6 5" }));
  body.push(text(76, 200, "code-comments · 横切所有层：写什么、什么时候必须写、什么时候删掉", { size: 13, fill: TONE.crosscut.title }));

  body.push(rect(56, 442, 1246, 64, { rx: 14, fill: TONE.baseline.fill, stroke: TONE.baseline.stroke }));
  body.push(text(76, 470, "frontend-project-baseline · 约束所有层：lockfile、tsconfig 严格度、lint 规则级别、提交门禁、CI 必过项", { size: 12.5, fill: TONE.baseline.title }));
  body.push(text(76, 492, "两个 skill 冲突时以它为准，改动它的配置属于单独的迁移决策", { size: 11, fill: MUTED }));

  body.push(text(56, 562, "裁决顺序（前压后）", { size: 13.5, weight: 650 }));
  const order = ["用户明确要求", "工程现状与 lint", "框架专有规则", "结构约定", "类型规则", "语言默认值"];
  let cursor = 56;
  order.forEach((item, index) => {
    const w = 168;
    body.push(rect(cursor, 580, w, 38, { rx: 10, fill: index === 0 ? TONE.baseline.fill : "#f8fafc", stroke: LINE }));
    body.push(text(cursor + w / 2, 604, item, { size: 11.5, fill: index === 0 ? TONE.baseline.title : MUTED, anchor: "middle" }));
    cursor += w + 8;
    if (index < order.length - 1) {
      body.push(text(cursor - 8, 604, "→", { size: 12, fill: FAINT, anchor: "middle" }));
    }
  });

  return frame(
    width,
    650,
    "skill 之间怎么协作",
    "每个 skill 独立安装，组合使用时靠固定接缝交接；接缝之外互相不引用。",
    body.join("\n  "),
  );
}

/** 图三：五个阶段与各阶段产出。 */
export function roadmapDiagram() {
  const width = 1400;
  const body = [];
  const phases = [
    {
      tag: "P0",
      name: "巩固前端",
      time: "现在起 2-3 个月",
      tone: TONE.structure,
      items: ["修掉跨 skill 口径冲突", "vue / svelte 框架层", "testing / accessibility", "README 与 description 校验", "打第一个 release tag"],
    },
    {
      tag: "P1",
      name: "Node 服务端",
      time: "3 个月",
      tone: TONE.lang,
      items: ["node-project-baseline", "node-module-structure", "api-design 接口契约", "与前端 skill 共用术语"],
    },
    {
      tag: "P2",
      name: "数据与可靠性",
      time: "3 个月",
      tone: TONE.framework,
      items: ["sql-best-practices", "observability", "security", "resilience 幂等与重试"],
    },
    {
      tag: "P3",
      name: "多语言与平台",
      time: "6 个月",
      tone: TONE.style,
      items: ["python / java / go 三件套", "container-and-deploy", "release-and-versioning", "monorepo 划分"],
    },
    {
      tag: "P4",
      name: "生态化",
      time: "持续",
      tone: TONE.crosscut,
      items: ["团队规范注入", "有无 skill 对照评测", "skills/<category>/ 分类", "外部贡献者自助上架"],
    },
  ];

  body.push(line(176, 150, 1232, 150, { stroke: "#cbd5e1", sw: 3 }));
  phases.forEach((phase, index) => {
    const x = 56 + index * 264;
    body.push(`<circle cx="${x + 120}" cy="150" r="11" fill="${phase.tone.stroke}" stroke="#fff" stroke-width="3"/>`);
    body.push(rect(x, 186, 240, 66, { rx: 14, fill: phase.tone.fill, stroke: phase.tone.stroke }));
    // 阶段名英文更长，放不下就逐档降字号，不折行也不出框。
    const heading = `${phase.tag}  ${phase.name}`;
    const headingSize = [15, 13.5, 12.5, 11.5].find((size) => estimateWidth(localize(heading), size) <= 208) ?? 11.5;
    body.push(text(x + 16, 213, heading, { size: headingSize, weight: 700, fill: phase.tone.title }));
    body.push(text(x + 16, 236, phase.time, { size: 11.5, fill: MUTED }));

    phase.items.forEach((item, position) => {
      const y = 272 + position * 52;
      body.push(rect(x, y, 240, 42, { rx: 11, fill: "#ffffff", stroke: LINE, sw: 1.2 }));
      const wrapped = wrap(localize(item), 212, 11.5).slice(0, 2);
      if (wrapped.length === 1) {
        body.push(text(x + 14, y + 26, wrapped[0], { size: 12, fill: "#334155" }));
      } else {
        body.push(text(x + 14, y + 18, wrapped[0], { size: 11.5, fill: "#334155" }));
        body.push(text(x + 14, y + 33, wrapped[1], { size: 11.5, fill: "#334155" }));
      }
    });
  });

  const acceptance = [
    "新增 skill 评分 ≥ 9.5；同一层 skill 的 description 相似度 < 50%；前端已有 skill 不改一行就能与新 skill 共存；",
    "每个新 skill 都带可执行的验收清单，并用「有无 skill 对照」跑一遍再发布。",
  ].flatMap((paragraph) => wrap(localize(paragraph), 1250, 12));

  body.push(
    rect(56, 566, 1290, 56 + acceptance.length * 24, { rx: 16, fill: "#f8fafc", stroke: LINE }),
    text(76, 596, "每阶段的验收标准", { size: 13.5, weight: 650 }),
  );
  acceptance.forEach((paragraph, index) => {
    body.push(text(76, 624 + index * 22, paragraph, { size: 12, fill: MUTED }));
  });

  return frame(
    width,
    700,
    "发展路线图",
    "P0 把前端的口径收干净，P1 起沿同一套轴（L0-L4）横向扩到后端、数据与平台。",
    body.join("\n  "),
  );
}
