[中文](CONTRIBUTING.md) | [English](CONTRIBUTING.en.md)

# 贡献指南

## 新增一个 skill

```bash
node scripts/new-skill.mjs my-skill --resources references,scripts
node scripts/validate-skills.mjs
```

`new-skill.mjs` 从 `templates/skill` 复制骨架到 `skills/my-skill/` 和 `zh/my-skill/`，并替换掉名称和描述。也可以直接手工建这两棵目录，只要结构一致。

写完之后：

1. `node scripts/validate-skills.mjs` 零错误（每个语言版本单独查）。
2. `node scripts/score-skills.mjs skills/<skill-name>` 不低于 8.5 分（每个语言版本单独打分）。
3. 在 `README.md` 和 `README.en.md` 的表格里登记：`README.md` 的说明列抄中文版 `description`，`README.en.md` 抄英文版。之后改了就两处一起改。
4. 提交 PR。CI 会跑同一套校验和评分。

`README.en.md` 是 `README.md` 的英文对照版，`CONTRIBUTING.en.md` 是本文件的英文对照版。一份改了，成对的另一份跟着一起改，别只改一边。

## 一条好 skill 的标准

- **`description` 决定它会在什么时候被选中**：写清"做什么 + 什么时候用"，带上典型触发说法，别写成能力清单。
- **中英必须同步**：`skills/<name>/` 是英文版（对外推广的默认版本），`zh/<name>/` 是中文版（开发和校对源）。新建、修改、删除一边，就在同一次改动里同步另一边；两份的 `description` 各用各自语言，README 的表格行跟着一起改。
- **正文只写非显而易见的信息**：目标 agent 本身已经很能干，不要写通用建议、重复的政策或者敷衍的步骤。
- **渐进披露**：`SKILL.md` 保持精简，把大段文档放 `references/`，在正文里说明什么时候去读。
- **用 `scripts/` 固化重复或易错的步骤**，而不是每次重写一遍。
- **自包含**：skill 目录里用到的东西都要跟着目录一起被安装。
- 不要往 skill 目录里放 `README.md`、changelog 之类的附属文档。
- 不要用符号链接，Codex 官方安装器会拒绝含符号链接的 skill。

## 目录与命名

```text
skills/<skill-name>/        英文版，默认被安装器和目录站发现
├── SKILL.md                必需
├── agents/openai.yaml
├── scripts/
├── references/
└── assets/

zh/<skill-name>/            中文版，开发和校对源，结构同上
```

- 名称用小写字母、数字、连字符，≤64 字符；两棵树的目录名相同。
- 英文版的 `name` 等于 skill 名，中文版是 `<skill-name>-zh`。
- 两棵树都保持扁平，文件名一一对应；对不上的地方校验会告警。
- `skills/<skill-name>/SKILL.md` 和 `zh/<skill-name>/SKILL.md` 是安装契约，改动前先确认安装脚本和目录站都还能用。
- `scripts/` 下的脚本超过约 300 行（或 15 KB）就按 `js-module-structure` 的分工拆开，入口 `scripts/<name>.mjs` 路径保持不变，实现放 `scripts/<name>/`，常量和方法各归各的文件。

## 改动安装脚本后

`install-skill.sh` 和 `install-skill.ps1` 是对等的两个入口，改动时一起改，并各自验证一次：

```bash
bash scripts/install-skill.sh <skill-name> --agent codex --dest /tmp/agent-skills-test
bash scripts/install-skill.sh <skill-name> --agent claude --global --lang zh
bash scripts/install-skill.sh <skill-name> --agent claude --project
```

```powershell
.\scripts\install-skill.ps1 <skill-name> -Agent codex -Dest $env:TEMP\agent-skills-test
.\scripts\install-skill.ps1 <skill-name> -Agent claude -Global -Lang zh
.\scripts\install-skill.ps1 <skill-name> -Agent claude -Project
```

确认这几点，再提交：

- `--global` / `-Global` 落到 `$<NAME>_HOME/skills`（未设置时 `~/.<name>/skills`），`--project` / `-Project` 落到当前目录的 `./.<name>/skills`。
- `--dest` / `-Dest` 直接指定目录，与 `--global`/`--project` 互斥；两者都没给时报错退出，而不是装进默认 agent。
- `--lang` / `-Lang` 只接受 `en` / `zh`；不给时优先英文版，没有英文版才装中文版，两者都不存在时报错并列出可装的 skill。
- 装出的目录完整：`SKILL.md` 加该语言版本自己的 `agents/`、`references/`、`scripts/`；英文版来自 `skills/<名>/`，中文版来自 `zh/<名>/`，装出来分别是 `<名>` 和 `<名>-zh`。
