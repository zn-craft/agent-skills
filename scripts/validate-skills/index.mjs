/**
 * scripts/validate-skills/ 的对外入口，只做 re-export。
 */

export { run, usage } from "./validate-skills.mjs";
export {
  EN_ROOT,
  LANGS,
  ZH_ROOT,
  expectedName,
  findSkills,
  findStraySkillFiles,
  findVariants,
  listTreeFiles,
  variantsFromPath,
} from "./layout.mjs";
