# flooks <sup><sup><sub>v4</sub></sup></sup>

一个 React Hooks 状态管理器，支持惊人的自动 re-render 优化。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

[English](./README.md) | 简体中文

---

## 特性

- 自动 re-render 优化
- 自动 loading state
- 可连通的模块化

## 安装

```sh
yarn add flooks

# npm install flooks
```

## 使用

```jsx
import useModel from 'flooks';

const counter = ({ get, set }) => ({
  count: 0,
  add() {
    const { count } = get();
    set({ count: count + 1 });
  },
  async addAsync() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { add } = get();
    add();
  },
});

function Counter() {
  const { count, add, addAsync } = useModel(counter);

  return (
    <div>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addAsync}>+~ {addAsync.loading && '...'}</button>
    </div>
  );
}
```

**\* 自动 loading state** - 若 `someFn` 为异步函数，`someFn.loading` 可用作其 loading state。

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

## 自动优化

通过 `proxy`，flooks 实现了惊人的自动优化，完全按需 re-render。

### 只有函数永远不会触发 re-render

```js
const { fn1, fn2 } = useModel(someModel);
```

在 `someModel` 中调用 `set(newState)` 永远不会触发 re-render，如果只从 `useModel(someModel)` 中解构出了函数。

### 未使用的 state 永远不会触发 re-render

```js
const { a } = useModel(someModel);
```

在 `someModel` 中调用 `set({ b: 1 })` 永远不会触发 re-render，如果未从 `useModel(someModel)` 中解构出 `b`。

### 未使用的 loading 不会触发 re-render

```js
const { someFn } = useModel(someModel);

// someFn.loading
```

通常，如果 `someFn` 是异步函数，即使不使用 `somefn.loading`，re-render 也会触发至少两次（先变为 `true` 然后变成 `false`）。但若使用 flooks，隐形的 loading 更新将永远不会 re-render，除非代码中使用了 `somefn.loading`。

## API

### `useModel()`

```js
const { a, b } = useModel(someModel);
```

### `get()` & `set()`

```js
import outModel from './outModel';

const someModel = ({ get, set }) => ({
  someFn() {
    const { a, b } = get(); // 获取自身 model
    const { x, y } = get(outModel); // 获取其它 model

    set({ a: a + b }); // 对象形式
    set((state) => ({ a: state.a + state.b })); // 函数形式
  },
});
```

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
