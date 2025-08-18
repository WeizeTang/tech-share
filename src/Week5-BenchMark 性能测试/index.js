(() => {
  const fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", async (event) => {
    try {
      // 获取文件（在多个文件时会返回一个文件列表，本次只取一个）
      const file = event.target.files[0];
      if (!file) return;
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      const nodes = jsonData.nodes;
      console.log("subject1", subject1(nodes));
      console.log("subject2", subject2(nodes));
      console.log("subject3", subject3(nodes));
      console.log("subject4", subject4(nodes));
      benchmarkTest(nodes);
    } catch (error) {
      console.error("解析文件失败:", error);
    }
  });
})();

/**
 * 计算数据集的max、min、sum、avg、median
 * @param {*} array
 * @param {*} mode 默认值为default，如果为custom，则只返回max、min、median
 */
const calculate = (array, mode = "default") => {
  const max = Math.max(...array);
  const min = Math.min(...array);
  const median = array[Math.floor(array.length / 2)];
  if (mode !== "default") return { max, min, median };

  const sum = array.reduce((acc, item) => acc + item, 0);
  const avg = sum / array.length;
  return { max, min, sum, avg, median };
};

/**
 * 测试性能
 * @param {*} nodes
 */
const benchmarkTest = (nodes) => {
  const suite = new Benchmark.Suite();
  suite
    .add(
      "按 region 分组，计算出每一类 region 下 value 平均值、最大值、最小值、中位值、总和",
      () => subject1(nodes)
    )
    .add(
      "按 region 分组，计算每一年，每一类 region 下 value 平均值、最大值、最小值、中位值、总和",
      () => subject2(nodes)
    )
    .add(
      "按 resource 分类，计算每一类 resource 下 value 平均值、最大值、最小值、中位值、总和",
      () => subject3(nodes)
    )
    .add("找到整个数据集中，weight 最大值、最小值、中位值", () =>
      subject4(nodes)
    )
    .on("cycle", function (event) {
      // event.target 包含当前测试的详细信息
      const result = event.target;
      console.log(`[CYCLE] ${result.name}: 
        ${Math.round(result.hz)} 操作/秒 
        平均耗时: ${result.stats.mean}s`);
    })
    .on("complete", function () {
      const fastest = this.filter("fastest")[0];
      const slowest = this.filter("slowest")[0];
      console.log(`[COMPLETE] 测试完成!`);
      console.log(
        `  最快的是: ${fastest.name} (${Math.round(fastest.hz)} ops/sec)`
      );
      console.log(`  比最慢的快 ${(fastest.hz / slowest.hz).toFixed(1)} 倍`);
    })
    .run({ async: true });
};

/**
 * 【题目1】按 region 分组，计算出每一类 region 下 value 平均值、最大值、最小值、中位值、总和
 */
const subject1 = (nodes) => {
  const grouped = nodes
    .sort((a, b) => a.value - b.value)
    .reduce((acc, item) => {
      const key = item.region;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item.value);
      return acc;
    }, {});
  const result = {};
  Object.keys(grouped).forEach((key) => {
    result[key] = calculate(grouped[key]);
  });
  return result;
};

/**
 * 【题目2】按 region 分组，计算每一年，每一类 region 下 value 平均值、最大值、最小值、中位值、总和
 */
const subject2 = (nodes) => {
  const grouped = nodes
    .sort((a, b) => a.value - b.value)
    .reduce((acc, item) => {
      const region = item.region;
      if (!acc[region]) acc[region] = [];
      acc[region].push({ year: item.year, value: item.value });
      return acc;
    }, {});
  Object.keys(grouped).forEach((region) => {
    grouped[region] = grouped[region].reduce((acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item.value);
      return acc;
    }, {});
  });
  Object.keys(grouped).forEach((region) => {
    Object.keys(grouped[region]).forEach((year) => {
      grouped[region][year] = calculate(grouped[region][year]);
    });
  });
  return grouped;
};

/**
 * 【题目3】按 resource 分类，计算每一类 resource 下 value 平均值、最大值、最小值、中位值、总和
 */
const subject3 = (nodes) => {
  const grouped = nodes
    .sort((a, b) => a.value - b.value)
    .reduce((acc, item) => {
      const key = item.resource;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item.value);
      return acc;
    }, {});
  const result = {};
  Object.keys(grouped).forEach((key) => {
    result[key] = calculate(grouped[key]);
  });
  return result;
};

/**
 * 【题目4】找到整个数据集中，weight 最大值、最小值、中位值
 */
const subject4 = (nodes) => {
  let max = 0;
  let min = 0;
  const weights = [];

  for (const item of nodes) {
    const weight = item.weight;
    if (weight > max) {
      max = weight;
      weights.push(weight);
    }
    if (weight < min) {
      min = weight;
      weights.unshift(weight);
    }
  }
  const median = weights[Math.floor(weights.length / 2)];
  return { max, min, median };
};

// const suite = new Benchmark.Suite();

// // 更大的数据规模能更好地放大实现差异
// const arr = Array.from({ length: 100000 }, (_, i) => i + 1);

// suite
//   .add("使用 for 循环", () => {
//     let sum = 0;
//     for (let i = 0; i < arr.length; i++) {
//       sum += arr[i] * arr[i];
//     }
//   })
//   .add("使用 reduce 方法", () => {
//     const sum = arr.reduce((acc, val) => acc + val * val, 0);
//   });

// suite
//   .on("start", () => {
//     console.log("[START] 开始基准测试");
//   })
//   .on("cycle", (event) => {
//     const r = event.target;
//     console.log(
//       `[CYCLE] ${r.name}: ${Math.round(r.hz)} 次/秒  平均耗时: ${r.stats.mean}s`
//     );
//   })
//   .on("complete", function () {
//     console.log(`[COMPLETE] 最快的是: ${this.filter("fastest").map("name")}`);
//   });

// suite.run({ async: true });
