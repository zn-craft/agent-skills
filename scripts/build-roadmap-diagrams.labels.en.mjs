/**
 * 图里中文文案 → 英文对照，由 build-roadmap-diagrams.mjs 生成英文版时使用。
 *
 * 键写源码里的原字符串（`<`、`>` 保持原样，不要写成 HTML 转义）。漏掉一条，
 * 英文版会残留中文，生成脚本报错并列出没翻译的片段。
 * 替换按长度从长到短进行，所以短词不用避让长词。
 */
export const EN_LABELS = {
  // 图一：分层架构
  "Agent Skills 分层架构": "Agent Skills architecture",
  "按触发时机分层：越靠下越贴近具体改动，越靠上越接近一次性配置。右列是同一套轴上的扩展位。":
    "Layered by when a skill fires: lower layers sit closer to an actual edit, upper layers are one-off setup. The right column reserves the same axis for later.",
  "前端（已发布）": "Frontend (published)",
  "后端 / 数据 / 平台（规划）": "Backend / data / platform (planned)",
  "工程基线": "Engineering baseline",
  "搭一次，长期生效": "Set up once, lasts",
  "语言层写法": "Language-level style",
  "语言层": "Language",
  "每次写代码": "Every code change",
  "结构层": "Structure",
  "新建或重组模块": "New or reshaped modules",
  "框架与视图": "Framework and view",
  "改组件、改样式": "Components and styles",
  "横切": "Cross-cutting",
  "任何改动都适用": "Applies to every change",
  "包管理器 / Node 引擎 / TypeScript 严格度": "Package manager / Node engine / TypeScript strictness",
  "格式化 / lint / git hooks / CI 必过项": "Formatting / lint / git hooks / required CI",
  "服务端工程化基线": "Service-side engineering baseline",
  "工程化基线": "Engineering baseline",
  "命名 / 控制流 / 异步": "Naming / control flow / async",
  "错误 / 集合 / 性能取舍": "Errors / collections / performance",
  "类型建模 / 收窄": "Type modeling / narrowing",
  "any 过渡 / Props 类型": "Leaving any / Props types",
  "一个目录一个模块：主逻辑 + type / config / mock / test":
    "One directory per module: main logic + type / config / mock / test",
  "React / Vue / 小程序 / Taro / uni-app 的目录适配":
    "Directory fit for React / Vue / mini program / Taro / uni-app",
  "服务端分层职责": "Service layering",
  "仓储与数据访问边界": "Repository and data access",
  "组件 / 状态 / Hooks": "Components / state / Hooks",
  "Effect / 数据 / 性能": "Effects / data / performance",
  "组件与组合式 API": "Components and composition API",
  "作用域 / token": "Scoping / tokens",
  "选择器 / 断点 / 主题": "Selectors / breakpoints / themes",
  "接口契约设计": "API contract design",
  "框架层写法": "Framework conventions",
  "写什么 / 何时删": "What to write / when to delete",
  "旧注释处置": "Handling stale comments",
  "测试范围与用例": "Test scope and cases",
  "键盘与可访问名称": "Keyboard and accessible names",
  "鉴权与输入校验": "Auth and input validation",
  "日志与链路": "Logs and tracing",
  "重试 / 超时 / 幂等": "Retry / timeout / idempotency",
  "已发布": "Published",
  "规划中": "Planned",
  "同一套轴向上扩展，不另起一套分类": "Same axis everywhere, no second taxonomy",

  // 图二：组合接缝
  "skill 之间怎么协作": "How the skills work together",
  "每个 skill 独立安装，组合使用时靠固定接缝交接；接缝之外互相不引用。":
    "Each skill installs on its own and hands off through fixed seams; outside those seams they never reference each other.",
  "一次 React + TS 改动会同时命中多个 skill，靠四条接缝交接：":
    "One React + TS change fires several skills at once; four seams carry the handoff:",
  "命名 / 异步 / 错误": "Naming / async / errors",
  "类型建模": "Type modeling",
  "收窄 / 断言过渡": "Narrowing / leaving assertions",
  "目录与文件职责": "Directory and file roles",
  "组件行为": "Component behavior",
  "状态 / Effect / 性能": "State / Effects / performance",
  "样式落点": "Style placement",
  "token / 作用域 / 断点": "Tokens / scoping / breakpoints",
  "失败语义": "Failure semantics",
  "类型归属": "Type placement",
  "导出面": "Public surface",
  "code-comments · 横切所有层：写什么、什么时候必须写、什么时候删掉":
    "code-comments · cuts across every layer: what to write, when it is required, when to delete",
  "frontend-project-baseline · 约束所有层：lockfile、tsconfig 严格度、lint 规则级别、提交门禁、CI 必过项":
    "frontend-project-baseline · constrains every layer: lockfile, tsconfig strictness, lint rule levels, commit gates, required CI",
  "两个 skill 冲突时以它为准，改动它的配置属于单独的迁移决策":
    "When two skills disagree it wins; changing its config is a separate migration decision",
  "裁决顺序（前压后）": "Precedence (earlier wins)",
  "用户明确要求": "Explicit user request",
  "工程现状与 lint": "Project state and lint",
  "框架专有规则": "Framework-specific rules",
  "结构约定": "Structure conventions",
  "类型规则": "Type rules",
  "语言默认值": "Language defaults",

  // 图三：路线图
  "发展路线图": "Roadmap",
  "P0 把前端的口径收干净，P1 起沿同一套轴（L0-L4）横向扩到后端、数据与平台。":
    "P0 cleans up frontend consistency; from P1 on, the same L0-L4 axis extends into backend, data, and platform.",
  "巩固前端": "Solidify frontend",
  "Node 服务端": "Node backend",
  "数据与可靠性": "Data and reliability",
  "多语言与平台": "More languages and platform",
  "生态化": "Ecosystem",
  "现在起 2-3 个月": "Next 2-3 months",
  "3 个月": "3 months",
  "6 个月": "6 months",
  "持续": "Ongoing",
  "修掉跨 skill 口径冲突": "Fix cross-skill conflicts",
  "vue / svelte 框架层": "vue / svelte framework layer",
  "README 与 description 校验": "README and description check",
  "打第一个 release tag": "First release tag",
  "api-design 接口契约": "api-design contracts",
  "与前端 skill 共用术语": "Shared terms with frontend skills",
  "resilience 幂等与重试": "resilience: idempotency, retry",
  "python / java / go 三件套": "python / java / go trios",
  "monorepo 划分": "monorepo splitting",
  "团队规范注入": "Inject team conventions",
  "有无 skill 对照评测": "With-vs-without evaluation",
  "skills/<category>/ 分类": "skills/<category>/ categories",
  "外部贡献者自助上架": "Self-serve publishing for contributors",
  "每阶段的验收标准": "Acceptance bar per phase",
  "新增 skill 评分 ≥ 9.5；同一层 skill 的 description 相似度 < 50%；前端已有 skill 不改一行就能与新 skill 共存；":
    "New skills score ≥ 9.5; descriptions in the same layer stay under 50% similarity; existing frontend skills keep working unchanged;",
  "每个新 skill 都带可执行的验收清单，并用「有无 skill 对照」跑一遍再发布。":
    "Every new skill ships an executable acceptance checklist and a with-vs-without run before release.",
};
