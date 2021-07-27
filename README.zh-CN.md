<div align="center">
<h1>flooks <sup><sup><sub>v4</sub></sup></sup></h1>

一个 React Hooks 状态管理器，支持惊人的 re-render 自动优化。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

[English](./README.md) · 简体中文

</div>

---

## 特性

- 惊人的 re-render 自动优化
- 聪明的 loading state
- 彼此互通的模块化
- 极其简单的 API

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

**\* 聪明的 loading state** - 若 `someFn` 为异步函数，`someFn.loading` 为其 loading state。若 `someFn.loading` 未使用，绝不触发额外 re-render。

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

## 惊人的 re-render 优化

通过 `proxy`，flooks 实现了惊人的自动优化，完全按需 re-render，React 真正变为 "react"。

`useModel(someModel)` 的返回是一个 proxy，只有真正使用时，才会将值注入组件。完全自动，若未使用，state 甚至不存在！

### 只使用函数绝不触发 re-render

```js
const { fn1, fn2 } = useModel(someModel);

set({ a: 1 }); // 无 re-render
```

> 若只从 `useModel(someModel)` 中解构出函数，在 `someModel` 中调用 `set()` 不触发 re-render。

### 未使用的 state 绝不触发 re-render

```js
const { a } = useModel(someModel);

set({ b: 1 }); // 无 re-render
```

> 若未从 `useModel(someModel)` 中解构出某 state，在 `someModel` 中调用 `set()` 不触发 re-render。

### 未使用的 loading 绝不触发 re-render

```js
const { someFn } = useModel(someModel);

// 无 someFn.loading，无 re-render
```

> 若代码中未使用 `someFn.loading`，调用 `someFn()` 不触发额外 re-render。
>
> 普通的 loading 解决方案中，即使 `somefn.loading` 未使用，re-render 也会触发至少两次（先 `true` 然后 `false`）。但使用 flooks，如果 `somefn.loading` 未使用，绝没有隐形的 loading 更新。

## API

### `useModel()`

```js
import useModel from 'flooks';

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

**\* 彼此互通的模块化** - 在 `someModel` 中调用 `get(outModel)` 获取其他 model，所有 model 均可互通。

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
