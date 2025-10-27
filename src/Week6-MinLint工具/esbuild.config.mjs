import { build } from "esbuild";

await build({
  // 入口文件
  entryPoints: ["src/cli.ts"],
  // 输出文件
  outfile: "dist/bundle.js",
  // 平台
  platform: "node",
  // 转换格式
  format: "esm",
  // 是否打包
  bundle: true,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
