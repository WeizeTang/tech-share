import type { Token } from "./node";

export interface Rule {
  meta: { docs: string };
  create(ctx: RuleContext): RuleListener;
}

export interface RuleContext {
  /** 所有 token */
  tokens: Token[];
  /** 规则配置 */
  options: string[];
  /** 文件路径 */
  filePath: string;
}

/** Listener 是每个规则的回调函数，如：{ VariableDeclarator: (node: VariableDeclarator) => void } */
export interface RuleListener {
  [key: string]: RuleVisitorNode;
}

export type RuleVisitorNode = (node?: any) => void | boolean;
