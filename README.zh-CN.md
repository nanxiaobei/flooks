<div align="center">
<h1>flooks <sup><sup><sub>v4</sub></sup></sup></h1>

可自动优化的 React Hooks 状态管理器。小巧、简洁、流畅。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

[English](./README.md) · 简体中文

</div>

---

[flooks v4 介绍](https://github.com/nanxiaobei/flooks/discussions/29)

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

const useCounter = () => useModel(counter);

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

**\* 聪明的 loading state** - 若 `someFn` 为异步函数，`someFn.loading` 为其 loading state。若 `someFn.loading` 未使用，绝不触发额外 re-render。

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

## 惊人的 re-render 优化

借助 `proxy`，flooks 实现了惊人的自动优化，完全按需 re-render，React 真正变为 "react"。

只有真正在组件中用到的某个数据，才会注入组件，若未用到，则不会注入。

### 只使用函数绝不触发 re-render

```js
const { fn } = useDemoModel(); // A 组件

const { b, setB } = useDemoModel(); // B 组件
setB(); // A 无 re-render
```

若 A 中只使用函数，则其它组件更新不触发 A re-render。

### 未使用的 state 绝不触发 re-render

```js
const { a } = useDemoModel(); // A 组件

const { b, setB } = useDemoModel(); // B 组件
setB(); // A 无 re-render
```

若 A 中未使用某些 state，则其它组件更新不触发 A re-render。

### 未使用的 loading 绝不触发 re-render

```js
const { someFn } = useDemoModel(); // A 组件
someFn(); // 无 someFn.loading，无额外 re-render
```

若 A 中未使用 `someFn.loading`，`someFn()` 不触发额外 re-render。

若 `someFn` 为异步，普通 loading 方案中，即使 `somefn.loading` 未用到，re-render 也会触发至少两次（先 `true` 然后 `false`）。但使用 flooks，若 `somefn.loading` 未用到，则完全不会存在隐形 loading 更新。

## API

### `useModel()`

```js
import useModel from 'flooks';

const useSomeModel = () => useModel(someModel);
```

### `get()` & `set()`

```js
import useModel from 'flooks';
import { anotherModel } from './useAnotherModel';

const someModel = ({ get, set }) => ({
  someFn() {
    const { a, b } = get(); // 获取自身 model
    const { x, y } = get(anotherModel); // 获取其它 model

    set({ a: a + b }); // 对象形式
    set((state) => ({ a: state.a + state.b })); // 函数形式
  },
});

export default () => useModel(someModel);
```

**\* 彼此互通的模块化** - 在 `someModel` 中调用 `get(anotherModel)` 获取其他 model，所有 model 均可互通。

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://lee.so/)

## FUTAKE

试试 [**FUTAKE**](https://sotake.com/f) 小程序，你的灵感相册。🌈

![FUTAKE](https://s3.jpg.cm/2021/09/21/IFG3wi.png)
