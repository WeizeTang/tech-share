import noUnusedVars from "./no-unused-vars.js";
import semi from "./semi.js";
import type { Rule } from "../interface/rules.js";

const RulesMap: Record<string, Rule> = {
  /** 变量声明但未使用 */
  "no-unused-vars": noUnusedVars,
  /** 结尾分号 */
  semi: semi,
};

export default RulesMap;
