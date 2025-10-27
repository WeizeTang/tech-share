import chalk from "chalk";

interface OutputOptions {
  type: "error" | "warning";
  message: string;
  filePath: string;
  line: number;
  column: number;
}

/**
 * 输出报错信息
 * @param options 报错信息
 */
export const output = (options: OutputOptions) => {
  const color = options.type === "error" ? "red" : "yellow";
  console.log(
    `[${chalk[color].bold(options.type)}] ${
      options.message
    } in ${chalk.cyan.bold(options.filePath)}:${chalk.cyan.bold(
      options.line
    )}:${chalk.cyan.bold(options.column)}`
  );
};
