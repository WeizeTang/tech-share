# Benchmark.js 实战：挑选更快的统计算法

## 前言

在上一篇文章中，我们已经介绍了 Benchmark.js 的使用场景与使用方法。本文将针对一个统计任务来编写解决算法，并使用 Benchmark.js 进行性能测试，来找到相对更优的算法。

**统计任务**：

1. 按 region 分组，计算出每一类 region 下 value 平均值、最大值、最小值、中位值、总和
2. 按 region 分组，计算每一年，每一类 region 下 value 平均值、最大值、最小值、中位值、总和
3. 按 resource 分类，计算每一类 resource 下 value 平均值、最大值、最小值、中位值、总和
4. 找到整个数据集中，weight 最大值、最小值、中位值

**数据集结构**：

```json
[
  {
    "id": "44",
    "sim_name": "BHS",
    "name": "Bahamas",
    "region": "Caribbean and Central America",
    "resource": "Cereals",
    "year": 2012,
    "value": 427.395,
    "weight": 969.33
  },
  ...
]
```

## 解题思路与结论

### 题目一

**题干**：按 region 分组，计算出每一类 region 下 value 平均值、最大值、最小值、中位值、总和

首先从题目中可以知道，平均值、最大值、最小值、总和这四项数据都是只要有数组就可以得出的，而中位值需要对数组进行排序后才能得出。**这就意味着凡是需要求中位值的，都需要对数组进行排序**。

所以这道题从整体上看可以分为两步：

1. 按 region 分组，每个 region 都得到一个有序数组
2. 对每个 region 的有序数组求平均值、最大值、最小值、中位值、总和

在第一步的分组过程中，其实有以下问题是值得思考的：for 循环、reduce 方法……，哪一种用来整理数据是更高效的？先排序和后排序，哪一种方式更高效？我们可以带着这两个问题来编写代码，然后使用 Benchmark.js 进行性能测试，来找到相对更优的算法。

首先我们来测试一下 for 循环和 reduce 方法谁更高效：

```js
/**
 * 使用 for 循环处理数据
 * @param {*} nodes
 * @returns
 */
const handleWithFor = (nodes) => {
  const result = {};
  for (const item of nodes) {
    const key = item.region;
    if (!result[key]) result[key] = [];
    result[key].push(item.value);
  }
  return result;
};

/**
 * 使用 reduce 方法处理数据
 * @param {*} nodes
 * @returns
 */
const handleWithReduce = (nodes) => {
  return nodes.reduce((acc, item) => {
    const key = item.region;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.value);
    return acc;
  }, {});
};
```

经过 Benchmark.js 的测试，我们得到了以下结果：

```js
[CYCLE] 使用 for 循环处理数据: 415386 操作/秒
  平均耗时: 0.000240875s
[CYCLE] 使用 reduce 方法处理数据: 409876 操作/秒
  平均耗时: 0.000243987s
```

使用 for 循环处理数据，每秒可以进行 415386 次操作。而使用 reduce 方法处理数据，每秒可以进行 409876 次操作。两者其实还是比较接近的，说明两种方法在当前这个数据集下的性能差异并不大，那后续我们将使用 reduce 方法来处理数据。

**结论**：在本任务中，for 与 reduce 差异很小；为了一致性，下文统一使用 reduce。

接下来我们再来测试一下先排序和后排序，哪一种方式更高效：

```js
/**
 * 使用先排序处理数据
 * @param {*} nodes
 * @returns
 */
const handleSortFirstThenReduce = (nodes) => {
  return nodes
    .sort((a, b) => a.value - b.value)
    .reduce((acc, item) => {
      const key = item.region;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item.value);
      return acc;
    }, {});
};

/**
 * 使用先分组处理数据
 * @param {*} nodes
 * @returns
 */
const handleGroupFirstThenReduce = (nodes) => {
  const grouped = nodes.reduce((acc, item) => {
    const key = item.region;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.value);
    return acc;
  }, {});
  for (const key in grouped) {
    grouped[key] = grouped[key].sort((a, b) => a - b);
  }
  return grouped;
};
```

经过 Benchmark.js 的测试，我们得到了以下结果

```js
[CYCLE] 使用先排序处理数据:
        230626 操作/秒
        平均耗时: 0.0000043360205177871565s
[CYCLE] 使用先分组处理数据:
        201603 操作/秒
        平均耗时: 0.000004960246456080851s
```

使用先排序处理数据，每秒可以进行 230626 次操作。而使用先分组处理数据，每秒可以进行 201603 次操作。这说明先排序处理数据的方式更高效。

综合以上结果，在第一步的分组过程中，我们选择先排序再分组，并且在分组时使用 reduce 方法来处理数据。

**结论**：先排序再分组更高效。

在已经得到每个 region 的有序数组的情况下，求平均值、最大值、最小值、中位值、总和就比较简单了，我们可以整理成一个计算的函数，后面的题目都可以使用这个函数来进行计算。

```js
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
```

那么第一题我们就完成了：

```js
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
```

### 题目二

**题干**：按 region 分组，计算每一年，每一类 region 下 value 平均值、最大值、最小值、中位值、总和

这道题的解题思路和第一题类似，只是在对每个 region 进行分组后，同时要对该 region 下的每一年进行分组。

那这里我们将使用两种不同的方法来实现这个功能，并比较它们的性能。

```js
/**
 * 使用 for 循环处理数据
 * @param {*} nodes
 * @returns
 */
const handleWithFor = (nodes) => {
  const result = {};
  for (const item of nodes) {
    const key = item.region;
    if (!result[key]) result[key] = {};
    if (!result[key][item.year]) result[key][item.year] = [];
    result[key][item.year].push(item.value);
  }
  return result;
};

/**
 * 使用 reduce 方法处理数据
 * @param {*} nodes
 * @returns
 */
const handleWithReduce = (nodes) => {
  return nodes.reduce((acc, item) => {
    const key = item.region;
    if (!acc[key]) acc[key] = {};
    if (!acc[key][item.year]) acc[key][item.year] = [];
    acc[key][item.year].push(item.value);
    return acc;
  }, {});
};
```

经过 Benchmark.js 的测试，我们得到了以下结果：

```js
[CYCLE] 使用 for 循环处理数据:
        124310 操作/秒
        平均耗时: 0.000008045780457804578s
[CYCLE] 使用 reduce 方法处理数据:
        141817 操作/秒
        平均耗时: 0.000007051329555610937s
```

可以发现，在部分复杂数据处理场景中，使用 reduce 方法处理数据的方式更高效。而题干中求平均值、最大值、最小值、中位值、总和的方法就和第一题一样，我们直接拿来用即可。

**结论**：在 region×year 的双层分组场景下，reduce 实测略快。

```js
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
```

### 题目三

**题干**：按 resource 分类，计算每一类 resource 下 value 平均值、最大值、最小值、中位值、总和

这道题的解题思路和第一题类似，只是需要将 resource 也作为分组的关键字，我们如法炮制即可。

**说明**：仅替换分组键为 `resource`，复用 `calculate`。

```js
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
```

### 题目四

**题干**：找到整个数据集中，weight 最大值、最小值、中位值

这道题的解题思路比较简单，我们可以思考更多不同的解法，然后使用 Benchmark.js 进行性能测试，来找到相对更优的算法。

实际上，我们之前一直在使用整理好的有序数据进行计算，但是这道题的数据不需要整理，只是因为需要求中位数而缺少排序。在这种情况下，我们可以有以下两种做法：

1. 先使用 sort 方法排序，再按照要求计算最大值、最小值、中位值
2. 直接遍历全部数据，遍历的过程中记录最大值、最小值、中位值

```js
/**
 * 先使用 sort 方法排序，再按照要求计算最大值、最小值、中位值
 * @param {*} nodes
 * @returns
 */
const handleWithSort = (nodes) => {
  return calculate(
    nodes.sort((a, b) => a.weight - b.weight).map((item) => item.weight),
    "custom"
  );
};

/**
 * 直接遍历全部数据，遍历的过程中记录最大值、最小值、中位值
 * @param {*} nodes
 * @returns
 */
const handleWithLoop = (nodes) => {
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
```

经过 Benchmark.js 的测试，我们得到了以下结果：

```js
[CYCLE] 使用 sort 方法排序，再按照要求计算最大值、最小值、中位值:
        324393 操作/秒
        平均耗时: 0.0000030826845895551607s
[CYCLE] 直接遍历全部数据，遍历的过程中记录最大值、最小值、中位值:
        2392805 操作/秒
        平均耗时: 4.179194854840152e-7s
[COMPLETE] 测试完成!
  最快的是: 直接遍历全部数据，遍历的过程中记录最大值、最小值、中位值 (2392805 ops/sec)
  比最慢的快 7.4 倍
```

很明显，直接遍历全部数据，遍历的过程中记录最大值、最小值、中位值的方式更高效。

**结论**：无需全量排序时，直接遍历更快（本次约快 7.4 倍）。

那么第四题我们就完成了：

```js
/**
 * 【题目4】找到整个数据集中，weight 最大值、最小值、中位值
 */
const subject4 = (nodes) => {
  const result = {};
  let max = 0;
  let min = 0;
  const weights = [];

  for (const item of nodes) {
    const weight = item.weight;
    if (weight > max) {
      max = weight;
      weights.push(weight);
    }
  }
};
```

## 总结

本文通过 Benchmark.js 针对统计任务的不同实现方案进行了性能测试，并根据性能测试结果找到了相对更优的算法。事实上，不同的数据集、不同的算法实现方式，都会得到不同的结果。所以，在实际开发中，我们需要根据具体的需求和数据集，通过对比不同算法实现方式的性能，选择最合适的算法实现方式。
