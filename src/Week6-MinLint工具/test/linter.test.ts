import { expect, test, describe } from "vitest";
import { linter } from "../src/linter";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // ESM 获取当前文件的目录路径

describe("linter 测试", () => {
  // 首先应该确保 linter 传入正常和非法的参数时能够正确返回
  test("传入非法数据应该走到 reject 逻辑", async () => {
    const filePath = path.join(__dirname, "example", "abcdef.js");
    const promise = linter({
      config: { rules: {} }, // 空数据
      filePath: filePath, // 不存在的路径
    });
    // 必须将代码包装在一个函数中，否则错误将无法被捕获，测试将失败。(https://cn.vitest.dev/api/expect.html#tothrowerror)
    await expect(promise).rejects.toThrowError();
  });

  test("应该成功解析有效的 JavaScript 文件，并在所有规则通过时返回 true", async () => {
    const result = await linter({
      config: { rules: { semi: ["warning"] } },
      filePath: path.join(__dirname, "example", "simple-linter-example.js"),
    });
    expect(result).toBe(true);
  });

  test("在有语法错误时应该返回 false", async () => {
    const result = await linter({
      config: {
        rules: { "no-unused-vars": ["warning"], semi: ["warning", "always"] },
      },
      filePath: path.join(__dirname, "example", "error-linter-example.js"),
    });
    expect(result).toBe(false);
  });

  test("错误的配置不会被执行，但是应该返回 true", async () => {
    const result = await linter({
      config: { rules: { abcdef: ["error"] } }, // 不存在的规则
      filePath: path.join(__dirname, "example", "simple-linter-example.js"),
    });
    expect(result).toBe(true);
  });
});
