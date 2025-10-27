import { mergeConfig, defaultConfig } from "./utils/config";
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { linter } from "./linter";

/**
 * 获取配置
 * @param configPath 配置文件路径
 * @returns 配置
 */
const getConfig = (configPath?: string) => {
  try {
    if (!configPath) return defaultConfig; // 没有配置文件，使用默认配置
    const realPath = path.resolve(process.cwd(), configPath);
    const configContent = fs.readFileSync(realPath, "utf-8");
    return mergeConfig(defaultConfig, JSON.parse(configContent));
  } catch (error) {
    return defaultConfig;
  }
};

const handler = async (target: string, options: { config?: string }) => {
  const config = getConfig(options.config);
  const files = globSync(target, { cwd: process.cwd() });
  if (files.length === 0) return;
  const results = [];
  for (const file of files) {
    const result = await linter({ config, filePath: file });
    results.push(result);
  }
  if (results.every((result) => result)) {
    process.exit(0); // 全部通过，退出进程
  } else {
    process.exit(1); // 有失败，退出进程
  }
};

export default handler;
