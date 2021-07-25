# 🍸 flooks <sup><sup><sub>v4</sub></sup></sup>

A state manager for React Hooks, with gorgeous re-render auto optimization.

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

Auto-loading ▨ Powerful modules ▨ Re-render optimization

---

English | [简体中文](./README.zh-CN.md)

---

## Install

```sh
yarn add flooks # or → npm install flooks
```

## Usage

```jsx
import useModel from 'flooks';

const counter = ({ get, set }) => ({
  count: 0,
  add() {
    const { count } = get();
    set({ count: count + 1 });
    // set(state => ({ count: state.count + 1 })); ← also support
  },
  async addAsync() {
    const { add } = get();
    // const outData = get(outModel); ← get other models
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
  },
});

function Counter() {
  const { count, add, addAsync } = useModel(counter); // try addAsync.loading!

  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addAsync}>+~ {addAsync.loading && '...'}</button>
    </>
  );
}
```

**\* Auto-loading** - If `someFn` is async, `someFn.loading` can be used as its loading state.

## Demo

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
    const { a, b } = get();
    const { x, y } = get(outModel);

    set({ a: a + b });
    set((state) => ({ a: state.a + state.b }));
  },
});
```

## Philosophy

- The philosophy of flooks is decentralization, so recommend binding a page component and a model as one.
- No need to add a file like `store.js` or `models.js`, because no need to distribute the store from top now.
- A model has its own space, when call `get(outModel)` to get other models, all models can be connected.

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)

## Pitiless Ads

If you use WeChat, please try "**FUTAKE**". It's a WeChat mini app for your inspiration moments. 🌈

![FUTAKE](https://s3.jpg.cm/2021/04/22/TDQuS.png)
