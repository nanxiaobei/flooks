# 🍸 flooks <sup><sup><sub>3.0</sub></sup></sup>

一个 React Hooks 状态管理器，也许是最简单的那个。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

自动 Loading state ▨ 模块化 ▨ 按需触发 Re-render

---

[English](./README.md) × 简体中文

---

## 安装

```sh
yarn add flooks

# 或

npm install flooks
```

## 示例

```js
// counter model

const counter = (now) => ({
  count: 0,
  add() {
    const { count } = now(); // <----- now()        :: 获取自身 model
    now({ count: count + 1 }); // <--- now(payload) :: 更新自身 model
  },
});

export default counter;
```

```js
// trigger model

import counter from './counter';

const trigger = (now) => ({
  async addLater() {
    const { add } = now(counter); // <-- now(model) :: 获取其它 model
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
  },
});

export default trigger;
```

```jsx
// App 组件

import useModel from 'flooks';
import counter from './counter';
import trigger from './trigger';

function App() {
  const { count, add } = useModel(counter, ['count']); // <-- ['count'] :: 按需触发 Re-render
  const { addLater } = useModel(trigger); // <-------- addLater.loading :: 自动 Loading state

  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addLater}>+ ⌛{addLater.loading && '...'}</button>
    </>
  );
}
```

**\* 自动 Loading state** - 当 `someFn` 为异步时，`someFn.loading` 可用作其 loading 状态。

## 演示

[∷ 在线演示 ∷](https://codesandbox.io/s/flooks-gqye5)

## API

### `useModel(model, deps)`

React Hooks，传入 `model`，返回 model 数据。

**\* 按需触发 Re-render** - `deps` 参数可选，与 `React.useEffect` 的相同。

```js
const { a, b } = useModel(someModel, ['a', 'b']);

// useModel(model) <-------------- now(payload) 每次都触发 Re-render
// useModel(model, []) <---------- now(payload) 永不触发 Re-render
// useModel(model, ['a', 'b']) <-- now(payload) 将触发 Re-render，当 a 或 b 在 payload 中时
```

### `now()`

`now` 为 `model` 的参数，有 3 种使用方式。

```js
import anotherModel from './anotherModel';

const ownModel = (now) => ({
  fn() {
    const { a, b } = now(); // <-------------- 1. 获取自身 model
    now({ a: a + b }); // <------------------- 2. 更新自身 model（payload 为对象）
    const { x, y } = now(anotherModel); // <-- 3. 获取其它 model
  },
});
```

## 理念

- flooks 的理念是去中心化，因此建议将每个页面组件与 model 绑定为一个整体。
- 不需要添加类似 `store.js`、`models.js` 这样的文件，因为现在已不需要从顶层下发 store。
- model 有自己的空间，同时通过 `now(anotherModel)` 获取其它 model，所有 model 可实现互通。

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
