# 用 Node.js 开发命令行工具：打造你的高效 CLI

## 前言

“命令行工具”是指用户能在终端里直接输入命令运行的程序，例如我们经常使用到的 `npm install`、`git commit` 等等都是命令行工具为我们提供的命令。

在现代前端开发中，无论是开发脚手架、构建工具、自动化工具等等都会使用到命令，本文将从零开始帮助大家学会如何为自己的程序开发一个命令行工具。

## 如何开发一个命令行工具

### 基础的命令行工具

实际上，想要开发一个基础的命令行工具非常简单，我们只需要借助 `npm` 提供的 `bin` 属性即可。

`bin` 属性是 npm 包的一个配置项，其目的就是告诉 npm 包：**我需要把项目里的某个文件当做命令行工具来使用，当用户安装我这个包时，要把哪个文件变成可执行命令。**

#### **1. 定义我们需要让用户输入命令执行的代码文件**

首先，我们得有一个文件，这个文件是我们想要让用户输入命令运行的文件，我们可以使用 JavaScript 文件来编写。例如：

```js
#!/usr/bin/env node

// 文件执行的代码部分
console.log("Hello, world!");
```

**注意**：上面第一行的 `#!/usr/bin/env node` 叫 shebang，目的是**让系统知道这个文件要用 Node 来执行**。

> shebang 指脚本第一行的 #! 以及其后的解释器路径。当你把脚本当作可执行文件直接运行时，操作系统会读这一行，用指定的解释器来运行脚本，而不是把它当作二进制可执行文件。

#### **2. 在 `package.json` 文件中配置 `bin` 属性**

编写好代码文件后，我们需要在 `package.json` 文件中配置 `bin` 属性来指定命令行工具的入口文件。

```js
"bin": {
  // 假设我在项目根目录下创建了一个叫做 my-command.js 的文件，那么我需要在这里配置它
  "my-command": "./my-command.js"
}
```

#### **3. 测试命令行工具**

我们可以在项目目录下执行 `npm link` 命令来把当前项目链接到全局，这样就相当于我们在本地模拟全局安装了当前项目的 NPM 包。此时，我们就可以在终端里直接输入 `my-command` 命令来执行我们编写的命令行工具了。

### 使用 `Commander.js` 让命令行工具更强大

虽然我们已经可以开发一个基础的命令行工具了，但是它还远远不够强大。例如，我们想要让命令行工具支持传递参数，支持多个命令，支持子命令等等，这些虽然我们可以手动实现，但是如果我们使用 `Commander.js` 这个库，就可以非常方便的实现这些功能。

实际上，`Commander.js` 官方提供了中文文档并且列举了它支持的所有功能和参数，大家如果时间充足可以阅读一下官方文档：[Commander.js 中文文档](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md)。

#### **1. 声明 program 对象**

我们首先需要声明一个 `program` 对象，这个对象是 `Commander.js` 的核心对象，相当于是我们命令的起源，后面我们对命令行工具的所有定义（名称、描述、版本、选项、参数等）都会挂在这个对象上。

**声明 `program` 对象有两种方式：**

- Commander.js 内部创建并具名导出了一个 `program` 对象的实例，我们可以直接使用。
- 手动通过构造函数创建一个 `program` 对象的实例。

```js
// 方式一：使用 Commander.js 内部创建并具名导出的 program 对象
import { program, Command } from "commander";

// 方式二：手动通过构造函数创建一个 program 对象的实例
const myProgram = new Command();
```

#### **2. 使用 program 对象上的一些常用方法来配置命令行工具**

- **`program.parse()` 解析命令行参数**
  我们编写命令行工具总共需要两步：定义和解析（也可以理解为运行）。**我们下文所讲解的所有参数都是用来定义命令行工具的，但是如果仅仅定义不去运行，那么我们定义的内容就不会真的生效**。这就像在使用 express 框架时，我们定义了路由，但是如果没有使用 `app.listen()` 启动服务器，那么我们的路由就不会真的生效。

  **注意：`.parse()` 方法建议放在所有参数定义之后。**

  > `.parse()`是 Commander CLI 的**“启动指令”**，它会去解析用户在命令行输入的参数，然后执行对应的命令逻辑（包括内置的 `--help` / `--version` 等）。

- **`program.name()` 配置命令行工具的名称**
  我们可以使用 `program.name()` 方法来配置命令行工具的名称,`.name()` 不会改变程序逻辑，但是它会让你的命令行工具在报错或者显示帮助文案的时候显示你配置的名称（不配置可能会使用文件路径）。

  ```js
  program.name("my-command");
  ```

- **`program.version()` 配置命令行工具的版本**
  我们可以使用 `program.version()` 方法来配置命令行工具的版本，配置版本后，我们可以在命令行工具中使用 `-v` 或者 `--version` 来查看命令行工具的版本，例如：`my-command -v` 或者 `my-command --version`。

  ```js
  program.name("my-command").version("1.0.0");
  ```

- **`program.description()` 和 `program.summary()` 配置命令行工具的描述**
  `description()` 和 `summary()` 方法和之前两个方法一样，不会改变程序逻辑，属于是补充命令行工具基础信息的方法。`summary` 方法相对来说更加简洁，通常只会配置一条简短的描述。

  ```js
  program
    .name("my-command")
    .version("1.0.0")
    .description("这是一个命令行工具，可以完成一些奇怪的操作");
  program.name("my-command").version("1.0.0").summary("这是一个命令行工具");
  ```

- **`program.help()` 和 `program.outputHelp()` 让命令行工具展示帮助信息**
  `help()` 和 `outputHelp()` 方法可以让命令行工具在用户输入 `--help` 或者 `-h` 时展示帮助信息（二选一）。帮助信息会展示命令行工具的名称、版本、描述、用法、选项、参数等信息。

  通常情况下，**_`--help` 仅仅只是我们执行命令所携带的参数，这就意味着即便我们是查看帮助，命令也会被执行_**。`help()` 方法可以让命令行工具在展示帮助信息并退出程序，不会执行命令。而 `outputHelp()` 方法展示帮助信息但不退出程序，可以继续执行命令。

  ```js
  program.name("my-command").version("1.0.0").help();
  program.name("my-command").version("1.0.0").outputHelp();
  ```

- **`program.action()` 添加命令行工具的执行逻辑**
  `action()` 方法可以添加命令行工具的执行逻辑，参数是一个回调函数，这个回调函数会在命令行工具执行时被调用。

  ```js
  program
    .name("my-command")
    .version("1.0.0")
    .action(() => {
      console.log("执行命令");
    });
  ```

- **`program.command()` 添加子命令**
  每个命令行工具都有一个主命令，主命令就是你整个 CLI 程序的入口命令。通常是在 `package.json` 文件中的 `bin` 属性上配置的，例如：`"bin": { "my-command": "./my-command.js" }`，这里的 `my-command` 就是主命令。

  `command()` 方法可以添加子命令，通常情况下，我们会将子命令作为命令行工具的子功能，例如：`my-command build` 表示构建命令，`my-command dev` 表示启动命令，`my-command test` 表示测试命令。

  ```js
  program.name("my-command").version("1.0.0");

  program.command("build", "构建命令").action(() => {
    console.log("构建命令");
  });
  program.command("test", "测试命令").action(() => {
    console.log("测试命令");
  });
  ```

  > 需要特别注意，在添加子命令之后，你可以通过链式调用的方式向子命令上添加部分上文我们所介绍的参数，例如子命令的描述。但是**不能添加版本号、名称、帮助信息等参数**。

- **`program.option()` 添加选项参数**

  在我们使用 vite 提供的命令行工具的时候，可以通过 `--port` 来配置端口号，这就是选项参数。Commander.js 提供了 `option()` 方法来添加选项参数，格式如下：

  `program.option(flags, description, defaultValue);`

  - `flags`：选项的标志，例如：`-p, --port`
  - `description`：选项的描述，例如：`配置端口号`
  - `defaultValue`：选项的默认值，例如：`8080`。（可以不写）

  在这里需要特别强调一下 `flags` 参数的规则（下文的 flag 可替换为任何参数名））：
  |写法|含义|用户输入举例|
  |---|---|---|
  |`--flag`| 布尔选项（出现即为 true）|--isDevelopment|
  |`--flag <value>`|必填参数选项|--output result.png|
  |`--flag [value]`|可选参数选项（可带值或不带值）|--color red 或 --color|
  |`-f, --flag`|同时定义短、长选项|-d, --debug|
  |`-f, --flag <value>`|短长写法一起定义，参数取任意一个都生效|-e 5 或 --example 5|

  在前文我们提到过，我们可以在 `.action()` 方法中定义命令行工具的执行逻辑，这个方法的参数是一个回调函数，回调函数会允许接收两个参数：args, options。其中，args 我们后文会讲解，options 是命令行工具的选项参数。我们可以直接消费这个参数，例如：

  ```js
  program.option("-p, --port <port>", "配置端口号", 8080);
  program.action((args, options) => {
    console.log("端口号：", options.port);
  });
  ```

### 使用 chalk 让你的命令行工具更炫酷

chalk 是一个用于在 Node.js 控制台输出中添加颜色、样式和高亮效果的库。其最常用的功能就是**让你在终端内打印彩色文字**。

```js
import chalk from "chalk";

console.log(chalk.blue("Hello world!")); // 蓝色
console.log(chalk.red("Error!")); // 红色
console.log(chalk.green("Success!")); // 绿色
```

Chalk 不仅支持彩色文字，还支持斜体、粗体、下划线、删除线等样式。使用方法都非常简单，具体用法可以参照官方提供的指南：[Chalk Readme](https://github.com/chalk/chalk#readme)。

注意：从 Chalk v5 开始，chalk 被改为了纯 ESM 模块，因此我们需要使用 `import` 来导入。如果需要 CommonJS 支持，可以使用 Chalk 4。

> Chalk 5 is ESM. If you want to use Chalk with TypeScript or a build tool, you will probably want to use Chalk 4 for now.
> —— Chalk Readme

## 总结

本文从手动实现简单的命令行工具，到使用 `Commander.js` 为命令行工具添加更多功能，再到使用 `chalk` 让你的命令行工具更炫酷，帮助大家学会如何为自己的程序开发一个命令行工具。在前端开发中，我们经常会为自己的工具开发命令来便于其他人使用，后续的文章中也会从实战的角度带大家使用 `Commander.js` 和 `chalk` 。
