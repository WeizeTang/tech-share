# 基于 Promise 封装 Ajax 请求：从 XMLHttpRequest 到现代化异步处理

## 前言

在互联网发展的早期，网页交互的方式非常简单粗暴：用户点击链接或提交表单后，浏览器会向服务器发送请求，服务器返回一个全新的页面，然后浏览器会 **刷新整个页面来显示新内容**。

这种方式的缺点很明显：**即使页面上只有一小部分内容发生了变化，浏览器也要重新加载整个页面，包括那些完全没有变化的元素。浪费了网络带宽的同时等待时间也变长了**。

AJAX（Asynchronous JavaScript and XML）技术的出现彻底改变了这种状况。它允许网页在不刷新整个页面的情况下，与服务器进行数据交换并更新页面的特定部分。这意味着用户可以享受更流畅的交互体验，页面响应更快，数据传输也更高效。

在本文中，我们将学习如何基于 Promise 来封装 AJAX 请求，让异步操作变得更加优雅。

## AJAX 的核心：XMLHttpRequest

AJAX 中的核心步骤其实主要就两步：

1. **使用 `XMLHttpRequest` 来实现客户端与服务端的通信**
2. 通过 DOM 相关 API 来操作部分需要变化的界面元素

### 什么是 XMLHttpRequest

**XMLHttpRequest（通常简称为 XHR）是浏览器提供的一个 JavaScript 对象，它的作用就像是一个"信使"，负责在网页和服务器之间传递信息。**

虽然名字里有 XML，但现在我们主要用它来处理 JSON 数据，XML 只是历史原因保留在名字中。

### 基本概念及工作流程

首先我们需要知道，通过 XMLHttpRequest 发送一次网络请求通常需要经历以下几个阶段：

| 值  | 状态               | 描述                                                                  |
| --- | ------------------ | --------------------------------------------------------------------- |
| `0` | `UNSENT`           | XMLHttpRequest 请求刚刚被创建，但还没有告诉这个信使要怎么送，送到哪里 |
| `1` | `OPENED`           | 已经告诉信使请求的方法（GET/POST）和地址，但还没有发送请求            |
| `2` | `HEADERS_RECEIVED` | 信使已经到达服务器，服务器返回了响应头信息                            |
| `3` | `LOADING`          | 信使正在接收服务器返回的数据，数据还在传输中                          |
| `4` | `DONE`             | 信使已经完成了任务，所有数据都接收完毕                                |

**我们可以通过 `XMLHttpRequest.readyState` 属性来查看当前请求处于哪个阶段。**具体的阶段说明可以查看 MDN 文档：
https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/readyState

在使用 XMLHttpRequest 发送一个 GET 请求，我们需要按照以下步骤：

1. **创建 XMLHttpRequest 对象**

   ```javascript
   const xhr = new XMLHttpRequest();
   ```

2. **执行 `open()` 方法，配置请求参数**：在 `open()` 方法中，我们需要传递三个参数。第一个参数用来表示 **请求方法（GET、POST 等）**，第二个参数用来 **指定请求的 URL 地址** ，最后一个参数用来表示是否异步（true 表示异步，false 表示同步）。

   ```javascript
   xhr.open("GET", "https://jsonplaceholder.typicode.com/posts/1", true);
   ```

3. **设置状态变化函数**：XHR 对象提供了 onreadystatechange 属性来设置一个回调函数，当 XHR 所处的阶段变化时会执行该函数。根据上面的阶段介绍可知，当 XHR 的状态为 `DONE` 时，代表已经完全接收到了响应的内容。

   ```javascript
   xhr.onreadystatechange = function () {};
   ```

   **此时我们就可以使用 `xhr.status` 和 `xhr.responseText` 来拿到响应的数据和状态码。**

4. **发送请求**：我们已经将发送请求的配置和请求后续的处理方案全部制定好了，那么下面就是发送请求了。XHR 对象提供了 send() 方法来发送请求。
   ```javascript
   xhr.send();
   ```

## 使用 Promise 封装 XMLHttpRequest

XMLHttpRequest 在现代前端开发中主要有以下两个局限：

1. **复杂的代码量**：往往通过 XMLHttpRequest 发起一次网络请求需要大量的代码，从创建实例对象到发送请求，中间还要定义状态变化的回调函数。

2. **回调地狱问题**：在实际开发场景中，往往会出现一次加载需要请求多个接口的情况。在串行调用请求时使用 XMLHttpRequest 会产生冗长的 `.then` 执行链。

ES6 语法中引入的 Promise 是解决上述问题的最佳方案，我们可以 **基于 Promise 封装 XMLHttpRequest**。其核心思路为：

- 监听 `onreadystatechange` 事件，当请求状态变为 4（完成）时进行处理
- 如果状态码是 200，调用 `resolve` 返回响应数据
- 如果状态码不是 200，调用 `reject` 返回错误信息

```javascript
const fetchCustom = (url, options) => {
  const { method = "GET", body } = options || {};
  return new Promise((resolve, reject) => {
    if (!url) reject(new Error("url is required"));
    // 创建 XMLHttpRequest 对象
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        // 当 readyState 为 4 时，表示请求已完成
        if (xhr.status === 200) {
          // 当 status 为 200 时，表示请求成功
          resolve(xhr.responseText);
        } else {
          // 当 status 不为 200 时，表示请求失败
          reject(new Error(xhr.statusText));
        }
      }
    };
    xhr.send(body);
  });
};

const res = await fetchCustom("https://jsonplaceholder.typicode.com/posts/1");
console.log(res); // {"userId": 1,"id": 1,"title": "sunt aut face..."}
```

上述封装能够处理简单的请求场景，但是仍然有一部分缺陷。

1. **缺少自动序列化和反序列化操作**：当请求响应后，响应结果是纯字符串形式的内容。当发送 POST 请求时，请求体也需要我们手动序列化。

2. **错误处理方案仍需优化**：目前无法区分具体的错误类型，并且很多错误其实根本不会有 statusText。

3. **缺少请求超时处理机制。**

### 自动序列化及错误处理优化

除了 HTTP 状态码上的错误，通常还会出现 **网络错误、跨域错误、用户在请求结束前关闭浏览器的中断错误等**。

**XMLHttpRequest 提供了 `onerror` 和 `onabort` 两个回调函数用于特殊错误的监听。** **`onerror` 可以监听网络异常错误和跨域错误等，而 `onabort` 可以用来监听中断错误。**

```javascript
const fetchCustom = (url, options) => {
  const { method = "GET", body } = options || {};
  return new Promise((resolve, reject) => {
    if (!url) reject(new Error("url is required"));
    // 创建 XMLHttpRequest 对象
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    // 统一处理错误
    const handleError = (type) => {
      return () => {
        const error = new Error(`${type} Error`);
        error.type = type;
        error.status = xhr.status;
        error.statusText = xhr.statusText || "Unknown Error";
        reject(error);
      };
    };
    // 处理错误
    xhr.onerror = handleError("Network");
    xhr.onabort = handleError("Abort");
    // 监听请求状态变化
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        // 当 readyState 为 4 时，表示请求已完成
        if (xhr.status === 200) {
          // 当 status 为 200 时，表示请求成功
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error) {
            handleError("JSON-Parse")(); // 处理 JSON 解析错误
          }
        } else if (xhr.status !== 0) {
          // 处理 HTTP 错误
          handleError("HTTP")();
        } else {
          // 当 status 为 0 时，表示请求网络层错误。但实际可能会在onError中就处理了
          handleError("Network")();
        }
      }
    };
    xhr.send(body ? JSON.stringify(body) : null);
  });
};

const res = await fetchCustom("https://www.baidu.com"); // 【跨域错误导致的】Uncaught Error: Network Error
```

在上面的代码中，我们通过 `handleError` 函数统一处理各种错误类型，方便开发者进行针对性的错误处理。同时在成功响应时自动调用 `JSON.parse()` 解析响应数据，并增加了解析失败的错误处理。

> 实际上当网络异常时， `onerror` 和 `onreadystatechange` 都会触发，原因是 XMLHttpRequest 无论请求的成功与否都会经历状态变化，这些状态变化通常都会被 `onreadystatechange` 所捕获。通常 `status` 为 `0` 时也代表了网络错误。

> 📚 从设计角度上， `onerror` 是浏览器专门为了检测到底层网络故障而提供的回调函数。

### 处理请求超时的场景

**`XMLHttpRequest` 对象上提供了 `timeout` 属性，用于指定请求的超时时间，当超过设定的时间后，会触发对应的 `ontimeout` 回调方法。**

当请求超时情况发生时，我们希望返回一个失败的响应结果，并停止请求的继续执行。前文我们提到过，`XMLHttpRequest` 对象有一个监测请求中断的回调函数 `onabort`，同时他还有一个配套的方法 `abort()`，我们可以同时手动触发该方法来实现请求的中止。

```javascript
const fetchCustom = (url, options) => {
  const { method = "GET", body, timeout = 1000 } = options || {};
  return new Promise((resolve, reject) => {
    if (!url) reject(new Error("url is required"));
    // 创建 XMLHttpRequest 对象
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    // 设置超时时间
    xhr.timeout = timeout;
    // 设置是否超时
    let isTimeout = false;
    // 设置超时时间（定时器双层保护）
    let timeoutTimer = setTimeout(() => {
      isTimeout = true;
      xhr.abort(); // 主动中止请求
      handleError("Timeout")();
    }, timeout);

    // 统一清理定时器
    const clearTimeoutTimer = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    };

    // 统一处理错误
    const handleError = (type) => {
      return () => {
        const _type = isTimeout ? "Timeout" : type;
        clearTimeoutTimer();
        const error = new Error(`${_type} Error`);
        error.type = _type;
        error.status = xhr.status;
        error.statusText = xhr.statusText || "Unknown Error";
        reject(error);
      };
    };
    // 处理错误
    xhr.ontimeout = handleError("Timeout"); // 处理超时错误
    xhr.onerror = handleError("Network");
    xhr.onabort = handleError("Abort");

    // 监听请求状态变化
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        // 当 readyState 为 4 时，表示请求已完成
        clearTimeoutTimer(); // 请求完成无论成功与否都属于请求完成，都需要清理定时器
        if (xhr.status === 200) {
          // 当 status 为 200 时，表示请求成功
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error) {
            handleError("JSON-Parse")(); // 处理 JSON 解析错误
          }
        } else if (xhr.status !== 0) {
          // 处理 HTTP 错误
          handleError("HTTP")();
        } else {
          // 当 status 为 0 时，表示请求网络层错误。但实际可能会在onError中就处理了
          handleError("Network")();
        }
      }
    };
    xhr.send(body ? JSON.stringify(body) : null);
  });
};

const res = await fetchCustom(
  "https://jsonplaceholder.typic123ode.com/posts/1"
); // Timeout of 1000ms
```

在上述代码中，我们使用了原生 xhr.timeout + JavaScript 定时器的双重超时保护机制。

由于部分浏览器可能会存在不同的回调函数的执行时机错乱的问题，我们在 `handleError` 里增加了判断，如果是请求超时的场景下即便优先触发了 `onerror()` 也会返回 Timeout 类型的错误。

## 总结

本文深入探讨了如何基于 Promise 封装 XMLHttpRequest 来创建现代化的 Ajax 请求工具。从基础的 XMLHttpRequest 使用到 Promise 封装，再到错误处理和超时机制的完善，逐步构建了一个功能完整的异步请求库。
