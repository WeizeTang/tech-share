import { output } from "../utils/output";
import type { Rule } from "../interface/rules";

const noUnusedVars: Rule = {
  meta: { docs: "disallow unused variables" },
  create(ctx) {
    const { options } = ctx;
    const [outputType = "error"] = options;
    let variables: any = [];
    let exportedVariables: any = [];
    return {
      // 变量声明
      VariableDeclarator(node) {
        variables.push(node.id);
      },
      // 默认导入的变量也要加进去
      ImportDefaultSpecifier(node) {
        variables.push(node.local);
      },
      // 具名导入的内容
      ImportSpecifier(node) {
        variables.push(node.local);
      },
      // * as 导入的内容
      ImportNamespaceSpecifier(node) {
        variables.push(node.local);
      },
      // 标识符（变量使用和声明）
      Identifier(node) {
        // 如果使用了（发现了同名标识符），则从variables中移除
        if (!variables.includes(node)) {
          // !variables.includes(node) 是因为 Identifier 也会出现在变量定义里，要排除掉
          variables = variables.filter((item: any) => item.name !== node.name);
        }
      },
      // 如果是导出的变量，则可以忽略
      ExportNamedDeclaration(node) {
        if (node.declaration?.type === "VariableDeclaration")
          exportedVariables.push(
            ...node.declaration.declarations.map((item: any) => item.id)
          );
      },
      Validate() {
        variables = variables.filter(
          (item: any) => !exportedVariables.includes(item)
        ); // 过滤掉导出的变量
        for (const variable of variables) {
          output({
            type: outputType as "error" | "warning",
            message: `${variable.name} is declared but its value is never used`,
            filePath: ctx.filePath,
            line: variable.loc?.start.line ?? 1,
            column: (variable.loc?.start.column ?? 0) + 1,
          });
        }
        return variables.length > 0;
      },
    };
  },
};

export default noUnusedVars;
