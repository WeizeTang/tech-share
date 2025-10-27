import rulesMap from "./rules/index.js";
import { traverse } from "estraverse";
import { parse } from "espree";
import fs from "fs";
import type { RuleVisitorNode } from "./interface/rules";
import type { Config } from "./interface/config";
import type { Token } from "./interface/node";

interface LinterOptions {
  config: Config;
  filePath: string;
}

const getListeners = (config: Config, tokens: Token[], filePath: string) => {
  const listeners: Record<string, RuleVisitorNode[]> = {};
  for (const [rule, options] of Object.entries(config.rules)) {
    const ruleInstance = rulesMap[rule]; // 获取单条规则实例
    const listener = ruleInstance?.create({ tokens, options, filePath }); // 创建规则监听器
    if (!listener) continue;
    // 将监听器添加到 listeners 中，key 为节点类型，value 为节点类型对应的监听器
    for (const key in listener) {
      if (Array.isArray(listeners[key])) listeners[key].push(listener[key]);
      else listeners[key] = [listener[key]];
    }
  }
  return listeners;
};

/**
 * 处理单个文件代码的语法错误
 */
export const linter = ({ config, filePath }: LinterOptions) => {
  return new Promise((resolve, reject) => {
    try {
      // 解析代码为AST
      const ast = parse(fs.readFileSync(filePath, "utf-8"), {
        ecmaVersion: "latest",
        sourceType: "module",
        tokens: true,
        loc: true,
        range: true,
      });

      // 获取监听器
      const listeners = getListeners(config, (ast as any).tokens, filePath);

      // 遍历 AST 执行监听器逻辑
      traverse(ast as any, {
        enter: function (node) {
          if (!listeners.hasOwnProperty(node.type)) return;
          for (const listener of listeners[node.type]) {
            listener(node);
          }
        },
        leave: function (node) {
          if (node.type !== "Program") return; // 只执行 Program 节点的 Validate 监听器逻辑
          if (!listeners.hasOwnProperty("Validate")) resolve(true); // 如果没有 Validate 监听器，则直接返回

          // 执行 Validate 监听器逻辑
          let hasError = false;
          for (const listener of listeners["Validate"]) {
            const hasErrorResult = listener();
            if (hasErrorResult) hasError = true;
          }
          resolve(!hasError);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};
