# 🍸 flooks <sup><sup><sub>v4</sub></sup></sup>

一个 React Hooks 状态管理器，支持惊人的 Re-render 自动优化。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

自动 Loading ▨ 强大的模块化 ▨ Re-render 优化

---

[English](./README.md) | 简体中文

---

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
    // set(state => ({ count: state.count + 1 })); // ← 也支持
  },
  async addAsync() {
    const { add } = get();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
    // const outData = get(outModel); // ← 获取其它 model
  },
});

function Counter() {
  const { count, add, addAsync } = useModel(counter); // 试试 addAsync.loading!

  return (
    <div>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addAsync}>+~ {addAsync.loading && '...'}</button>
    </div>
  );
}
```

**\* 自动 Loading** - 若 `someFn` 为异步函数，`someFn.loading` 可用作其 loading state。

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

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

## 理念

- flooks 的理念是去中心化，因此建议将页面组件与 model 绑定为一个整体。
- 不需要添加类似 `store.js`、`models.js` 这样的文件，因为现在已不需要从顶层下发 store。
- model 有自己的空间，同时通过 `get(outModel)` 获取其它 model，所有 model 可实现互通。

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
