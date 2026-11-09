[中文](README.md) | [English](README.en.md)

# Agent Skills

可复用的 Agent Skill 集合。每个 skill 是一个独立目录，自带 `SKILL.md` 和它真正用到的脚本、参考文档与模板，按单条安装，不用克隆整个仓库。

## 安装

装指定的一条，需要 Node 18+：

```bash
npx skills add zn-craft/agent-skills --skill js-module-structure -g
```

`-g` 装到用户级目录，这台机器上的所有项目都能用；不加则只装进当前项目。不写 `--skill` 会列出全部 skill 让你挑。

不想装 Node，或者要自己指定落点目录，用安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.sh | bash -s -- js-module-structure --agent claude
```

`--agent` 指定装给哪个 agent，`codex`、`claude`、`cursor` 都行，默认落点是该 agent 的用户级目录；加 `--project` 装进当前项目，`--dest` 直接指定目录，`--force` 覆盖已装的版本。`--agent` 和 `--dest` 都不给会报错退出，脚本没有默认 agent。

Windows 用 `scripts/install-skill.ps1`，参数一样：

```powershell
iwr https://raw.githubusercontent.com/zn-craft/agent-skills/main/scripts/install-skill.ps1 -OutFile $env:TEMP\install-skill.ps1
powershell -ExecutionPolicy Bypass -File $env:TEMP\install-skill.ps1 js-module-structure -Agent claude
```

下载来的 `.ps1` 带网络标记，会被 RemoteSigned 之类的执行策略挡下；`-ExecutionPolicy Bypass` 只对这一次运行生效，或者先跑一次 `Unblock-File`。

克隆过仓库的话，直接跑 `bash scripts/install-skill.sh js-module-structure --agent claude`。

## 已收录的 skill

新增 skill 后在这里登记一行，说明列抄该 skill 的 `description`；`description` 改了，本表和 [README.en.md](README.en.md) 要一起改。

| Skill | 说明 | 安装 |
| --- | --- | --- |
| [frontend-project-baseline](skills/frontend-project-baseline) | 给前端项目建立、补齐或修改工程化基线：包管理器与运行时约束、TypeScript、格式化与静态检查、环境变量模板、提交门禁、CI 必过项。新建项目定技术约束、存量项目接入 lint / 格式化 / 类型检查 / git hooks / CI、评审工程化是否达标，以及改动 ESLint、Prettier、tsconfig、stylelint、husky、CI 等工程化配置时使用。与框架无关，单包与 monorepo 都适用；附配置探测脚本与可复制模板。不负责业务目录与模块职责划分，也不覆盖构建产物优化、版本发布和 monorepo 划分。 | `npx skills add zn-craft/agent-skills --skill frontend-project-baseline` |
| [js-module-structure](skills/js-module-structure) | 规定 JS/TS 非后端项目的模块目录、文件职责与命名导出约定。新建模块，写工具方法库或组件库，给前端应用加 api / store / hooks / utils / 组件 / 页面，往已有模块补类型、常量、mock、样式或测试，或在 React、Vue、原生小程序、Taro、uni-app 项目里拆分与归整目录时使用。只在创建、重组 JS/TS 代码，或决定代码放进哪个文件时使用，后端服务端工程不适用。 | `npx skills add zn-craft/agent-skills --skill js-module-structure` |
| [code-comments](skills/code-comments) | 规定注释该写什么、什么时候必须写、什么时候删掉，以及旧注释怎么处置。写或改代码、配置文件时使用，也用于整理遗留注释。不管 lint 规则、注释格式化、API 文档生成和提交信息。 | `npx skills add zn-craft/agent-skills --skill code-comments` |
| [style-conventions](skills/style-conventions) | 规定样式该怎么写：类名与作用域、变量与设计 token、选择器特异性、布局与响应式断点、主题与交互状态、行内样式与运行期值、全局样式边界与文件组织。新增或修改组件样式、把设计稿落成 CSS / SCSS / Less，写 CSS Modules、Vue scoped、Tailwind 或小程序 wxss，以及排查样式互相覆盖与魔法值时使用。不负责样式检查工具的配置、构建产物优化和视觉设计评审。 | `npx skills add zn-craft/agent-skills --skill style-conventions` |
| [js-best-practices](skills/js-best-practices) | JavaScript 语言层写法与结构决策：写、改或评审 JS/TS 代码时使用。规定命名、函数形态（默认箭头函数）、控制流与值处理、集合用法（数字与日期、字符串与克隆）、异步写法、错误处理，以及类与继承、循环与缓存的取舍。不负责 TypeScript 类型建模、模块目录与框架组件、注释和构建 / lint 配置。 | `npx skills add zn-craft/agent-skills --skill js-best-practices` |
| [typescript-best-practices](skills/typescript-best-practices) | TypeScript 的类型建模与写法决策：新建、修改、评审或重构 TS 代码时使用。定类型怎么建（interface / type / 联合 / 枚举 / as const）、边界数据怎么从 unknown 收窄、any 与断言怎么过渡、错误与领域概念怎么用类型表达、严格度怎么取舍，以及 `.tsx` 里组件 Props、事件、ref 和泛型组件的类型。通用 JS 风格、模块目录与 JSX 渲染，以及 tsconfig 和 lint 配置都不管。 | `npx skills add zn-craft/agent-skills --skill typescript-best-practices` |
| [react-best-practices](skills/react-best-practices) | 写、改或评审 React 组件时使用。涵盖组件拆分、状态归属、Hooks、Effect、数据请求、渲染和交互性能。涉及 SSR 或 RSC 时按项目版本查阅对应规则。不处理构建配置、TypeScript 类型设计或 CSS 规范。 | `npx skills add zn-craft/agent-skills --skill react-best-practices` |

## 新增一个 skill

```bash
node scripts/new-skill.mjs my-skill --resources references
node scripts/validate-skills.mjs
node scripts/score-skills.mjs skills/my-skill
```

补全脚手架在 `SKILL.md` 里留的 TODO，校验零错误、评分不低于 8.5，然后在两份 README 的表格里各加一行。完整约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

[MIT](LICENSE)
