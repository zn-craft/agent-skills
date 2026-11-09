/**
 * 校验脚本的常量、路径与正则。改判据先从这里找。
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

// 本文件在 scripts/validate-skills/ 下：往上是 scripts/，再往上是仓库根。
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(MODULE_DIR, "../..");

export const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PLACEHOLDER_PATTERN = /\{\{|\bTODO\b|\bFIXME\b/;
// 语言版本目录里允许出现的顶层条目。
export const VARIANT_ENTRIES = new Set(["SKILL.md", "agents", "scripts", "references", "assets", "LICENSE", "LICENSE.txt"]);
// README 的 skills 表格行：| [名字](路径) | 说明 | 安装 |。
export const REGISTRY_ROW = /^\|\s*\[([^\]|]+)\]\(([^)]+)\)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*$/;
