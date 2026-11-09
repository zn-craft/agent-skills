/**
 * scripts/score-skills/ 的对外入口，只做 re-export。
 */

export { DIMENSIONS } from "./checks.mjs";
export { buildContext, collectEntries, findVariants, markdownFiles, parseFrontmatter, referenceFiles } from "./context.mjs";
export { addDeduction, clampDeductions } from "./deductions.mjs";
export { pad, reportPath, round, toPosix } from "./format.mjs";
export { changedSkillVariants, printReport, run, scoreSkill, usage } from "./score-skills.mjs";
export { VAGUE_PHRASES } from "./score-skills.config.mjs";
export { cjkCount, estimateTokens, excerpt, hasConcreteArtifact, lineOf, scanPhrases } from "./text.mjs";
