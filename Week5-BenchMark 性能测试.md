# 前端性能基准测试入门：用 Benchmark.js 做出数据驱动的选择

## 背景

在前端开发过程中，会有一些需要注重代码性能的场景，比如：一个复杂功能依赖的数据基于嵌套数组实现（比如支持拖拽的行程规划需要有行程单、日期、时间、地点等多种维度的数据）、一个功能需要前端来做大量数据的计算。

在这些场景中，同样的操作我们会针对不同的实现方式进行测试，来得到不同实现方式的性能差异，便于选择最优的实现方式。

### 为什么使用 Benchmark.js

我最开始其实也有这样的疑问，为什么不能 **直接在本地执行一遍代码，然后自己计算执行时间来** 测试性能？

详细了解相关资料后发现会有以下几个问题：

1. **计时精度问题**: JavaScript 自带的 Date.now() 最小单位是毫秒，对于 CPU 执行代码的耗时来说精度是不够的。同时，如果代码执行时间过短，可能无法准确测量。
2. **引擎优化问题**: JavaScript 引擎会对代码进行优化，比如：一段代码会有“冷启动”和“热状态”的差异，有些没有被使用到的执行结果会被直接优化掉等等。
3. **单次测试不具备参考性**: 单次测试可能会受到很多因素的影响，可能一段代码第一次的执行用了 3 毫秒，第二次只用了 1 毫秒等等。

专业的事情还是要交给专业的人去做，就好像在实验室进行专业温度测量不会使用体温计一样。我们可以使用 Benchmark.js 为我们进行更加精确的基准测试。

## Benchmark.js 基本使用

Benchmark.js 官方的文档写的比较晦涩，不太利于新手阅读，下面会通过一个简单的例子来介绍如何使用 Benchmark.js 进行性能测试。

### 引入或安装 Benchmark.js

在浏览器环境中可以使用 CDN 引入，在 Node.js 环境中可以使用 npm 安装。

需要特别注意的是：benchmark.js 依赖于 lodash.js，所以通过 Script 引入时需要先引入 lodash.js。（使用 npm 安装时会自动处理依赖，无需手动引入 lodash）

```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/benchmark@2.1.4/benchmark.min.js"></script>
```

```bash
npm install benchmark
```

### 创建套件

Benchmark.js 默认提供了一个构造函数，我们可以通过这个构造函数来创建一个性能测试的实例，通常会把这个内容叫做 **`suite` 套件**。在 Benchmark.js 里，**每次测试都是以一个 `suite` 套件为范围的**。

```javascript
const Benchmark = require("benchmark");
const suite = new Benchmark.Suite();
```

### 添加测试用例

**有了套件之后，我们就可以往套件中添加测试用例了**。假设我们有一段简单的数据，需要计算出数组中每个元素的平方最后加和。那实现方式可能会包含以下两种：

1. 提前定义好一个变量，使用 `for` 循环遍历数组，然后计算每个元素的平方最后加到这个变量中。
2. 使用 `reduce` 方法，直接计算出数组中每个元素的平方最后加和。

**我们可以使用 `suite.add` 方法来往套件中添加测试用例**。这个方法接收两个参数：第一个参数是测试用例的名称，第二个参数是测试用例的函数。

```javascript
const suite = new Benchmark.Suite();
const arr = [1, 2, 3, 4, 5]; // 测试数据
suite.add("使用 for 循环", () => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] * arr[i];
  }
});
suite.add("使用 reduce 方法", () => {
  const sum = arr.reduce((acc, val) => acc + val * val, 0);
});
```

### 监听测试过程中的事件

**suite 还提供了 `on` 方法，可以监听测试用例的开始、结束、完成等事件**。

```javascript
suite.on("事件的名字", 触发的回调函数);
```

常见的监听事件包括：

- `start`：整个测试环节开始时触发
- `cycle`：每个测试用例完成一个循环周期时触发
- `complete`：所有测试用例都执行完毕时触发

比如：如果给之前添加的测试用例添加 `cycle` 事件，那么每次单个测试用例执行完，都会触发 `cycle` 事件。我们也可以在 `complete` 事件中统计并输出本次测试中最快的用例。

```javascript
suite.on("cycle", (event) => {
  const result = event.target;
  const name = result.name;
  const hz = Math.round(result.hz);
  const mean = result.stats.mean;
  console.log(`[CYCLE] ${name}: ${hz} 次/秒  平均耗时: ${mean}s`);
});
```

```javascript
suite.on("complete", function () {
  const fastest = this.filter("fastest").map("name");
  console.log(`[COMPLETE] 最快的是: ${fastest}`);
});
```

cycle 事件的回调函数参数中提供了很多有用的信息，比如 `event.target.hz` 表示当前测试用例的执行频率，`event.target.stats.mean` 表示当前测试用例的平均执行时间。我们可以在回调函数中打印出这些信息，来查看测试用例的执行情况。

### 执行测试

**有了套件和测试用例之后，我们就可以执行测试了**。执行测试的命令是 `suite.run()`。执行测试后，会自动触发 `start` 事件，然后依次触发 `cycle` 事件，最后触发 `complete` 事件。

`suite.run` 方法接收一个对象作为参数，这个对象中可以配置一些选项。**通常情况下，我们只需要配置 `async: true` 以异步方式启动测试，避免长时间阻塞页面交互**。

```javascript
suite.run({ async: true });
```

### 完整代码

```javascript
const suite = new Benchmark.Suite();

// 更大的数据规模能更好地放大实现差异
const arr = Array.from({ length: 100000 }, (_, i) => i + 1);

suite
  .add("使用 for 循环", () => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i] * arr[i];
    }
  })
  .add("使用 reduce 方法", () => {
    const sum = arr.reduce((acc, val) => acc + val * val, 0);
  });

suite
  .on("start", () => {
    console.log("[START] 开始基准测试");
  })
  .on("cycle", (event) => {
    const r = event.target;
    console.log(
      `[CYCLE] ${r.name}: ${Math.round(r.hz)} 次/秒  平均耗时: ${r.stats.mean}s`
    );
  })
  .on("complete", function () {
    console.log(`[COMPLETE] 最快的是: ${this.filter("fastest").map("name")}`);
  });

suite.run({ async: true });

// [START] 开始基准测试
// [CYCLE] 使用 for 循环: 15875 次/秒  平均耗时: 0.00006299306622951745s
// [CYCLE] 使用 reduce 方法: 1936 次/秒  平均耗时: 0.0005163982717989002s
// [COMPLETE] 最快的是: 使用 for 循环
```

由上述代码测试结果可见，在更大的数据规模下，使用 `for` 方法的执行速度比使用 `reduce` 方法的执行速度快很多。

## 总结

本文从为什么不能直接用 Date.now() 计时出发，说明了 Benchmark.js 在计时精度、引擎优化与多次运行统计上的优势，并给出 suite、add、on、run 的基本实践路径。

更多内容可以参考 [Benchmark.js 官方文档](https://benchmarkjs.com/)
