# AGENTS.md

## 仓库用途

沉淀可复用的 Agent Skill，供他人**按单个 skill** 安装使用（不是整仓库克隆）。

## 目录约定

- `skills/<skill-name>/`：英文版，目录名即 skill 名（小写字母、数字、连字符，≤64 字符）。这是对外推广的版本，安装器和目录站默认发现它。
- `zh/<skill-name>/`：中文版，开发和校对源。不在 `skills/` 下，默认不被发现，但能按路径安装（`npx skills add zn-craft/agent-skills/zh/<skill-name>`）。
- 两棵树一一对应：同名目录、同名文件，`skills/<名>/x` 对应 `zh/<名>/x`。文件名对不上时校验会告警。
- 英文版的 `name` 等于 skill 名，中文版是 `<skill-name>-zh`；frontmatter 都要有 `name` 和 `description`，`description` 用各自语言写。
- 每棵树里的可选子目录：`agents/`（Codex UI 元数据）、`scripts/`（可执行脚本）、`references/`（按需加载的文档）、`assets/`（产出用的模板、图标等）。
- 不要往 skill 目录里放 `README.md`、changelog 之类附属文档。
- skill 目录内不要使用符号链接，Codex 官方安装器会直接拒绝含有符号链接的 skill。
- 两棵树都保持扁平，不再用分类目录。
- 一个 skill 的两种语言共用 `skill-memory/<skill-name>.md`。
- **中英必须同步**：新建、修改、删除 `skills/<名>/` 里的任何东西，同一次改动里把 `zh/<名>/` 一起改；反过来 `zh/<名>/` 有任何改动，同一次改动里把 `skills/<名>/` 一起改。删 skill 就是两棵目录一起删。

## 新增或修改 skill

1. 生成骨架：`node scripts/new-skill.mjs <skill-name>`（按需加 `--resources references,scripts`），会同时建好 `skills/<skill-name>/` 和 `zh/<skill-name>/`。
2. 编辑两份 `SKILL.md`：`name` 按目录约定写死；`description` 各用各自语言，写清"做什么 + 什么时候用"。
3. 两种语言的规则保持一致：条数、命名、案例一一对应，改一份就在同一次改动里同步另一份，不许一边多一条、一边少一条。
4. 校验：`node scripts/validate-skills.mjs`，必须零错误。
5. 打分：`node scripts/score-skills.mjs skills/<skill-name>`，低于 8.5 分按提示改到达标。
6. 在 `README.md` 和 `README.en.md` 的 skills 表格里登记这一条：`README.md` 的说明列抄中文版 `description`，`README.en.md` 抄英文版，两份一起改。
7. 改过 `scripts/install-skill.*` 时，本地验证一次单条安装：
   `bash scripts/install-skill.sh <skill-name> --agent claude --dest <临时目录>` 和
   `.\scripts\install-skill.ps1 <skill-name> -Agent claude -Dest <临时目录>`。
8. skill描述和正文要言简并赅，观点和行为明确，不要冗余文字和重复描述，同时表达的话术要去ai化。
9. skill之间不应该相互依赖，描述不能有其他的skill内容，每个 skill 都是独立的，不能有任何与 agent 相关的内容，例如 `claude` 相关的配置、指令、示例等。
10. 改了 `description`、适用范围或能力清单，同一处改动里把 `README.md` 和 `README.en.md` 的表格行一起改，不要只改一边。
11. 中英成对的文件（`README.md` / `README.en.md`、`CONTRIBUTING.md` / `CONTRIBUTING.en.md`）改一份就得改两份，别只改一边。
12. skill 要问用户决策时，答案写进项目里的 `skill-memory/<skill-name>.md`：需要提问的 skill 在正文里写明，动笔前先读这个文件，命中记录就照做、不再问；
    没记录时把用户答完的结论写进去，只记跨会话还成立的结论和一句理由，不抄对话。一个 skill 一个文件，目录跟项目一起提交，换人换机器都读得到；
    目录和文件没有就新建，答案变了就地改，不留历史，记录和仓库现状冲突时以现状为准并更新记录。

## 脚本组织

`scripts/` 下的脚本内容多了要拆，按 `js-module-structure` 的分工来：入口 `scripts/<name>.mjs` 路径保持不变（CI、README、文档都按它调用），实现放 `scripts/<name>/`；`index.mjs` 只做 re-export，`<name>.config.mjs` 收常量、路径、正则和词表，其余文件一个文件一件事。单个文件超过约 300 行或 15 KB 就该拆。

skill 自带的 `scripts/` 同理按职责拆，入口文件名不要改，SKILL.md 里写的调用命令得一直有效。

## 安装契约（改动前先确认不会破坏）

- 英文版必须能通过 `skills/<skill-name>/SKILL.md` 单独下载，中文版通过 `zh/<skill-name>/SKILL.md`，这两个路径不要挪动。
- 安装脚本按这两条路径定位语言版本；中文版不在 `skills/` 下，所以不会被安装器和目录站默认收录。
- `scripts/install-skill.*` 是通用 agent 工具，不绑定具体 agent，也**没有默认 agent**：不给 `--agent` / `-Agent` 又
  不给 `--dest` / `-Dest` 时必须报错退出，不能回退到 Codex 之类的默认目录。
- `--lang` / `-Lang` 选 `en` 或 `zh`，不给时优先英文版、没有英文版才装中文版；装出来分别是 `<name>` 和 `<name>-zh`。
- 两个安装范围：全局 `--global`（默认）解析 `$<NAME>_HOME/skills`，未设置时退回 `~/.<name>/skills`；
  项目 `--project` 解析当前目录下的 `./.<name>/skills`。新增 agent 不需要改脚本。
- `--dest` / `-Dest` 直接指定目录，与 `--global`/`--project` 互斥。
