# 手写 await 实现：迭代器、生成器与异步编程的完美结合

## 一、什么是迭代器（iterator）

### 背景
在以往的JS代码中，想要遍历不同的数据类型往往都要使用不同的方式：

- 数组需要使用经典的 for 循环进行遍历
- 对象需要使用 for in 循环遍历，或者使用 Object.keys() 转换为数组后进行遍历
- 对于开发者自行定义的一些数据结构，想要对象实现遍历操作也需要开发者自行为其提供遍历方式
- 后续可能会拓展更多数据类型，这些数据类型都需要方式去遍历

这些问题就导致了初学者在学习 JavaScript 时，往往需要背下来很多数据结构的遍历方式，代码的复用性也随之降低。

于是在 ES6 语法中就引入了 迭代器 的概念。迭代器 为不同的数据结构提供了相同的遍历方式，同时还基于此拓展了很多新语法，例如解构赋值等。

### 迭代器的概念与使用

迭代器 其实本质上就是一个对象，对象上定义了一些方法，其中就包括了 `next()` 方法，该方法返回一个包含两个属性的对象：

- `value` : 当前元素的值
- `done` : 布尔值，表示遍历是否结束

我们把迭代器对象的生成函数通过 `[Symbol.iterator]` 属性挂载在一个对象上，此时该对象就成为了一个 可迭代对象。常见的可迭代对象包括：字符串、数组、Map、Set等，官方确实为这些常用的内置数据结构都定义好了迭代器。

> Symbol.iterator 是一个表达式，这是一个预定义好的、类型为 Symbol 的特殊值。通常情况下，我们会将一个数据的迭代器对象生成函数定义在其 `Symbol.iterator` 属性上，这就意味着我们可以通过 `array[Symbol.iterator]` 去访问一个数组的迭代器生成函数。

接下来我们尝试去使用数组的迭代器，那么第一步就是要通过迭代器生成函数生成迭代器，随后我们可以使用迭代器上的 next 方法进行遍历：
```javascript
const arr = ['a', 'b', 'c'];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 'a', done: false }
console.log(iterator.next()); // { value: 'b', done: false }
console.log(iterator.next()); // { value: 'c', done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

实际上，**`for...of` 循环本质上是通过调用对象的 `[Symbol.iterator]()` 方法来获取迭代器，然后重复调用迭代器的 `next()` 方法，直到 `done` 属性变为 `true`**。

由于我们之前说过，***任何实现了迭代器方法并且挂载在了 `[Symbol.iterator]` 属性上的对象都称之为可迭代对象***，这就意味着我们可以自己定义可迭代对象，比如实现平方数的集合：

```javascript
class SquareNumber {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => {
        return { value: i * i, done: i++ > 10 };
      },
    };
  }
}

const square = new SquareNumber();
for (let i of square) {
  console.log(i); // 0 1 4 9 16 25 36 49 64 81 100
}
```

## 二、什么是生成器（generator）

上文我们已经提到了迭代器，它是一种需要手动实现 `next()` 方法的对象。而 生成器 本质上则是迭代器的语法糖，可以自动生成 `next()` 方法，同时自动满足迭代器协议。

生成器可以通过 function* 来定义，就像定义一个函数一样。生成器有一个特别强大的功能，就是 **可以在其中使用 `yield` 关键字 来暂停函数的执行。** 由于其满足迭代器协议，这就意味着其执行后的结果也会提供 `next()` 方法和 `done` 属性，我们可以通过这两个内容来控制函数的执行和暂停。

```javascript
function* myGenerator() {
  console.log('第一次执行')
  const a = yield 1 + 1;
  console.log('第二次执行', a)
  const b = yield 2 * 4;
  console.log('第三次执行', b)
}

const gen = myGenerator()
console.log(gen.next()) // 第一次执行，{ value: 2, done: false }
console.log(gen.next()) // 第二次执行 undifined，{ value: 8, done: false }
console.log(gen.next()) // 第三次执行 undifined，{ value: undefined, done: true }
```

根据上面的例子我们看到，当生成器刚被执行的时候得到 `gen` 的时候，函数并不会执行，随后每次执行 `gen.next()` 时都会使生成器内的代码执行到下一个 `yield` 处。

并且我们可以发现，每次执行 `gen.next()` 时都会把 `yield` 关键字后的表达式结果作为 `value` 字段导出出来，同时还会导出一个 `done` 字段。

需要注意的是，**凡是用到在赋值表达式的右侧使用了 `yield`，其左侧的变量都不会被正常赋值，所以我们在生成器里打印的内容中存在 `undifined`。**

> yield 会暂停生成器函数的执行，导致赋值操作无法立即完成。具体来说：当执行到 yield 表达式时，生成器会立即返回右侧的值（暂停执行），不完成当前行的赋值操作。

我们可以通过在外部代码再次调用 `next()` 时，把上一次调用 `next()` 得到的 `value` 传递进参数里，此时上一个 `yield` 表达式整体会被替换为 `next()` 传入的值，从而顺利完成赋值操作。

```javascript
function* myGenerator() {
  console.log('第一次执行')
  const a = yield 1 + 1;
  console.log('第二次执行', a)
  const b = yield 2 * 4 + a;
  console.log('第三次执行', b)
}

const gen = myGenerator()
console.log(gen.next()) // 第一次执行，{ value: 2, done: false }
console.log(gen.next(666)) // 第二次执行 666，{ value: 674, done: false }
console.log(gen.next(4)) // 第三次执行 4，{ value: undefined, done: true }
```

从上面的例子中可见，我们在第一次执行 `next()` 后得到了结果 `2`，这是第一个 `yield` 关键字后面的表达式的执行结果。第二次执行 `next()` 时传入了 `666`，可以发现直接将 a 赋值为了 `666`，这就说明 **无论 `yield` 后面的结果是什么，`next()` 中传递的参数都能直接将这个结果覆盖掉**。

## 三、通过生成器模拟 await 功能

### 背景与原理

在了解迭代器和生成器的概念后，我们可以发现生成器有一个非常强大的能力：**它可以在 `yield` 关键字处暂停执行，等待外部调用 `next()` 方法继续执行**。这个特性让我们可以用同步的写法来处理异步操作，这就是 `async/await` 语法的核心思想。

`async/await` 的底层实现就是基于生成器的。我们可以通过生成器来模拟 `await` 的功能。

### 核心思路

1. 使用 `function*` 定义生成器函数，在需要等待异步操作的地方使用 `yield`, 后面跟的是返回 Promise 的异步函数
2. 编写一个 `run` 函数来自动处理生成器的执行，当遇到 Promise 时等待其完成
3. 如果一次 Promise 完成后，返回的 done 属性为 false，根据返回的 done 属性决定是否要递归调用 `run` 函数
4. 递归调用时将上一次Promise返回的值，传递给 `next()`

### 实现代码

```javascript
function* asyncFunc() {
  console.log("asyncFunc start");
  let result1 = yield asyncFunc1();
  console.log("result1", result1);
  let result2 = yield asyncFunc2(result1);
  console.log("result2", result2);
  return result2;
}

function asyncFunc1() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("AsyncFunc1 Done"), 1000);
  });
}
function asyncFunc2(arg) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`AsyncFunc2 Done with ${arg}`), 1000);
  });
}

const generator = asyncFunc();

function run(generator, tempResult) {
  const result = generator.next(tempResult);
  if (result.value instanceof Promise) {
    // 如果result.value是Promise，则等待Promise完成
    result.value
      .then((res) => {
        run(generator, res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  } else if (result.done) {
    // 如果result.done为true，则返回result.value
    return result.value;
  } else {
    // 如果result.value不是Promise，则直接执行下一个yield
    run(generator, result.value);
  }
}

run(generator);
// asyncFunc start
// 1000毫秒 —— AsyncFunc1 Done
// 2000毫秒 —— AsyncFunc2 Done with AsyncFunc1 Done
```


让我们看一下上面这段代码的执行过程：

**第一次调用 `run(generator)`**：
   - `generator.next()` 执行到第一个 `yield asyncFunc1()`
   - 返回 `{ value: Promise, done: false }`
   - 等待 Promise 完成（1秒后）

**第一个 Promise 完成后**：
   - 调用 `run(generator, "AsyncFunc1 Done")`
   - `result1` 被赋值为 `"AsyncFunc1 Done"`
   - 执行到第二个 `yield asyncFunc2(result1)`
   - 返回新的 Promise

**第二个 Promise 完成后**：
   - 调用 `run(generator, "AsyncFunc2 Done with AsyncFunc1 Done")`
   - `result2` 被赋值
   - 生成器执行完毕，返回最终结果

上面这段代码示例中展示的只是理想情况下的场景，因为我们每次执行 Promise 时都会得到正确的返回。**在实际开发过程中，异步函数可能会出现异常，而我们现在的代码示例中不具备抛出错误的能力。**

除了 `next()` 方法，**生成器还为我们提供了 `throw()` 方法。该方法允许从外部向生成器内部抛出错误**，我们可以借助该方法正确处理 Promise 内部的异常并继续向外抛出。

```javascript
function* asyncFunc() {
  try {
    console.log("asyncFunc start");
    let result1 = yield asyncFunc1();
    console.log("result1", result1);
    let result2 = yield asyncFunc2(result1);
    console.log("result2", result2);
    return result2;
  } catch (error) {
    console.log("error", error);
  }
}
function asyncFunc1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject("AsyncFunc1 Error"), 1000);
  });
}
function asyncFunc2(arg) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`AsyncFunc2 Done with ${arg}`), 1000);
  });
}

const generator = asyncFunc();

function run(generator, tempResult) {
  const result = generator.next(tempResult);
  if (result.value instanceof Promise) {
    // 如果result.value是Promise，则等待Promise完成
    result.value
      .then((res) => {
        run(generator, res);
      })
      .catch((err) => {
        generator.throw(err);
      });
  } else if (result.done) {
    // 如果result.done为true，则返回result.value
    return result.value;
  } else {
    // 如果result.value不是Promise，则直接执行下一个yield
    run(generator, result.value);
  }
}

run(generator);
// asyncFunc start
// 1000毫秒 —— AsyncFunc1 Error
// error AsyncFunc1 Error
```

## 四、总结

通过本文的学习，我们从 JavaScript 的迭代器开始，逐步深入到了生成器的概念，最终模拟了 `async/await` 语法的实现。实际上，理解这些底层机制可以帮助我们更深入的理解 `async/await` 语法，同时也让我们更好的理解 ES6 提供给我们的新语法和异步编程的新范式。