import { output } from "../utils/output";
import type { Node } from "../interface/node";
import type { Rule } from "../interface/rules";

const semi: Rule = {
  meta: { docs: "disallow semi" },
  create(ctx) {
    const { tokens, options } = ctx;
    const [outputType = "error", ruleValue = "always"] = options;
    /** 错误列表，后续直接输出报错 */
    const errorList: Node[] = [];
    /**
     * 判断节点是否以分号结尾
     * @param node 节点
     * @returns 是否以分号结尾
     */
    const judgeHasSemi = (node: Node) => {
      const findToken = tokens.find(
        (token) =>
          token.end === node.end &&
          token.type === "Punctuator" &&
          token.value === ";"
      );
      return Boolean(findToken);
    };

    const isNeedAddError = (node: Node) => {
      const hasSemi = judgeHasSemi(node);
      return (
        (!hasSemi && ruleValue === "always") ||
        (hasSemi && ruleValue === "never")
      );
    };

    const handleAddError = (node: Node) => {
      // 防止嵌套语句添加多次错误
      const end = node.end;
      if (errorList.some((item) => item.end === end)) return; // 如果错误列表中已经同一个分号结尾的节点，则不添加
      errorList.push(node);
    };

    return {
      VariableDeclaration: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ExpressionStatement: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ImportDeclaration: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ExportAllDeclaration: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ExportDefaultDeclaration: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ExportNamedDeclaration: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ReturnStatement: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      ThrowStatement: (node) => {
        if (isNeedAddError(node)) handleAddError(node);
      },
      Validate: () => {
        for (const node of errorList) {
          output({
            type: outputType as "error" | "warning",
            message:
              ruleValue === "always"
                ? "Missing semicolon"
                : "Unnecessary semicolon",
            filePath: ctx.filePath,
            line: node.loc?.start.line ?? 1,
            column: (node.loc?.start.column ?? 0) + 1,
          });
        }
        return errorList.length > 0;
      },
    };
  },
};

export default semi;
