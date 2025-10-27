import { expect, test, describe, vi } from "vitest";
import { linter } from "../src/linter";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // ESM 获取当前文件的目录路径
const exampleDir = path.join(__dirname, "example"); // 示例文件目录

describe("规则测试：no-unused-vars", () => {
  test("正常情况：没有未使用的变量，应该返回 true", async () => {
    const result = await linter({
      config: { rules: { "no-unused-vars": ["error"] } },
      filePath: path.join(exampleDir, "pass-no-unused-vars-example.js"),
    });
    expect(result).toBe(true);
  });

  test("异常情况：有未使用的变量，应该返回 false，并输出错误信息", async () => {
    const consoleSpy = vi.spyOn(console, "log"); // 监听 console.log
    const result = await linter({
      config: { rules: { "no-unused-vars": ["error"] } },
      filePath: path.join(exampleDir, "fail-no-unused-vars-example.js"),
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "a is declared but its value is never used in /Volumes/tangweize SSD/code/bare-project/test/example/fail-no-unused-vars-example.js:1:10"
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("b is declared but its value is never used")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("c is declared but its value is never used")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("d is declared but its value is never used")
    );
    expect(result).toBe(false);
    consoleSpy.mockRestore(); // 恢复原始的 console.log
  });
});

describe("规则测试：semi", () => {
  test("正常情况：传入 always 模式，没有缺少分号，应该返回 true", async () => {
    const result = await linter({
      config: { rules: { semi: ["error", "always"] } },
      filePath: path.join(exampleDir, "semi-include-example.js"),
    });
    expect(result).toBe(true);
  });

  test("正常情况：传入 never 模式，没有多余的分号，应该返回 true", async () => {
    const result = await linter({
      config: { rules: { semi: ["error", "never"] } },
      filePath: path.join(exampleDir, "semi-exclude-example.js"),
    });
    expect(result).toBe(true);
  });

  test("异常情况：传入 always 模式，缺少分号，应该返回 false，并输出错误信息", async () => {
    const consoleSpy = vi.spyOn(console, "log"); // 监听 console.log
    const result = await linter({
      config: { rules: { semi: ["error", "always"] } },
      filePath: path.join(exampleDir, "semi-exclude-example.js"),
    });
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Missing semicolon in .*semi-exclude-example\.js:1:1+$/
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Missing semicolon in .*semi-exclude-example\.js:3:1+$/
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Missing semicolon in .*semi-exclude-example\.js:5:1+$/
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Missing semicolon in .*semi-exclude-example\.js:6:1+$/
      )
    );
    consoleSpy.mockRestore(); // 恢复原始的 console.log
  });

  test("异常情况：传入 never 模式，有多余的分号，应该返回 false，并输出错误信息", async () => {
    const consoleSpy = vi.spyOn(console, "log"); // 监听 console.log
    const result = await linter({
      config: { rules: { semi: ["error", "never"] } },
      filePath: path.join(exampleDir, "semi-include-example.js"),
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Unnecessary semicolon in .*semi-include-example\.js:1:1+$/
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Unnecessary semicolon in .*semi-include-example\.js:3:1+$/
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Unnecessary semicolon in .*semi-include-example\.js:5:1+$/
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\[error\] Unnecessary semicolon in .*semi-include-example\.js:6:1+$/
      )
    );
    expect(result).toBe(false);
    consoleSpy.mockRestore(); // 恢复原始的 console.log
  });
});
