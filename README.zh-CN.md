<div align="center">
<h1>flooks <sup><sup><sub>v6</sub></sup></sup></h1>

(现已支持 React 18)

React Hooks 状态管理器，性能自动优化

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/nanxiaobei/flooks/test.yml?branch=main&style=flat-square)](https://github.com/nanxiaobei/flooks/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/main/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/main/LICENSE)

[English](./README.md) · 简体中文

</div>

---

## 特性

- 惊人的 re-render 自动优化
- 自动 request loading
- 极其简单的 API

## 安装

```sh
pnpm add flooks
# or
yarn add flooks
# or
npm i flooks
```

## 使用

```jsx
import create from 'flooks';

const useCounter = create((store) => ({
  count: 0,
  add() {
    const { count } = store();
    store({ count: count + 1 });
  },
  async addAsync() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { add } = store();
    add();
  },
}));

function Counter() {
  const { count, add, addAsync } = useCounter();

  return (
    <div>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addAsync}>+~ {addAsync.loading && '...'}</button>
    </div>
  );
}
```

**\* 自动的 request loading** - 若函数为异步，`asyncFn.loading` 为其 loading state。若 `asyncFn.loading` 未使用，不触发额外 re-render。

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?file=/src/Home.jsx)

## 自动优化

flooks 实现了惊人的自动优化，只有真正用到的数据才会注入组件，完全按需 re-render，React 真正变为 "react"。

### 为什么 flooks 比 zustand 简单？

```js
// zustand，需要 selector
const { nuts, honey } = useStore((state) => ({
  nuts: state.nuts,
  honey: state.honey,
}));

// flooks，无需 selector
// 但也只有 `nuts` 或 `honey` 更新会触发重新渲染，这是自动的！
const { nuts, honey } = useStore();
```

### 只有函数，无 re-render

```js
const { a } = useStore(); // A 组件，更新 `a`
const { fn } = useStore(); // B 组件，只有函数，无 re-render
```

### 无被更新 state，无 re-render

```js
const { a } = useStore(); // A 组件，更新 `a`
const { b } = useStore(); // B 组件，无 `a`，无 re-render
```

### 无 \*.loading，无额外 re-render

```js
const { asyncFn } = useStore(); // A 组件，调用 `asyncFn`
asyncFn(); // 无 `asyncFn.loading`，无额外 re-render

// 普通 loading 方案中，即使 `async.loading` 未用到，
// 也会 re-render 至少两次（先 `true` 然后 `false`）。
```

## API

### `create()`

```js
import create from 'flooks';

const useStore = create((store) => storeData);

// 对于 `react<=17`，可以使用 `create.config()` 传入
// `ReactDOM.unstable_batchedUpdates` 用于异步更新的批量更新。
//
// create.config({ batch: ReactDOM.unstable_batchedUpdates }); // 在 app 入口处
```

### `store()`

```js
import create from 'flooks';

const useStore = create((store) => ({
  fn() {
    const { a, b } = store(); // 获取 store

    store({ a: a + b }); // 对象形式更新 store
    // or
    store((state) => ({ a: state.a + state.b })); // 函数形式更新 store
  },
}));
```

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

## FUTAKE

试试 [**FUTAKE**](https://sotake.com/f) 小程序，你的灵感相册。🌈

![](https://s3.bmp.ovh/imgs/2022/07/21/452dd47aeb790abd.png)
