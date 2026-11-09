#!/usr/bin/env node
/**
 * 校验仓库里的 skill。
 *
 *   node scripts/validate-skills.mjs                  # 校验全部语言版本
 *   node scripts/validate-skills.mjs skills            # 只校验英文树
 *   node scripts/validate-skills.mjs zh                # 只校验中文树
 *   node scripts/validate-skills.mjs skills/foo        # 只校验一个 skill
 *   node scripts/validate-skills.mjs --json            # 输出机器可读结果
 *
 * 布局：skills/<skill-name>/SKILL.md 是英文版，zh/<skill-name>/SKILL.md 是中文版，
 * 两棵树逐文件对应。零依赖，Node 18+。
 *
 * 实现按职责拆在 scripts/validate-skills/ 下，入口只负责把命令行交给 run()。
 */

import { run } from "./validate-skills/index.mjs";

await run();
