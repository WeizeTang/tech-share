#!/usr/bin/env node

import { program } from "commander";
import * as handler from "../dist/bundle.js";

program
  .name("minlint")
  .version("1.0.0")
  .argument("<file>", "指定文件")
  .option("-c, --config <file>", "指定配置文件")
  .action((target, options) => {
    handler.default(target, options);
  });

program.parse();
