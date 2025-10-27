import type { Config } from "../interface/config";

/**
 * 默认配置
 */
export const defaultConfig: Config = {
  rules: {
    semi: ["error", "always"],
    "no-unused-vars": ["error"],
  },
};

/**
 * 合并配置
 * @param baseConfig 基础配置
 * @param overrideConfig 覆盖配置
 * @returns 合并后的配置
 */
export const mergeConfig = (baseConfig: Config, overrideConfig: Config) => {
  return { ...baseConfig, ...overrideConfig, rules: { ...baseConfig.rules, ...overrideConfig.rules } };
};