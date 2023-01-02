<div align="center">
<h1>flooks <sup><sup><sub>v6</sub></sup></sup></h1>

(Now Support React 18)

State Manager for React Hooks, Auto Optimized

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/nanxiaobei/flooks/test.yml?branch=main&style=flat-square)](https://github.com/nanxiaobei/flooks/actions/workflows/test.yml)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/main/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/main/LICENSE)

English · [简体中文](./README.zh-CN.md)

</div>

---

## Features

- Gorgeous auto optimized re-render
- Automatic request loading
- Extremely simple API

## Install

```sh
yarn add flooks

# npm i flooks
```

## Usage

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

**\* Automatic request loading** - if a function is async, `asyncFn.loading` is its loading state. If `asyncFn.loading` is not used, no extra re-render.

## Demo

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?file=/src/Home.jsx)

## Auto optimization

flooks realizes a gorgeous auto optimization, only actually used data will be injected into the component, re-render completely on demand, when React is truly "react".

### Why flooks over zustand?

```js
// zustand, need a selector
const { nuts, honey } = useStore((state) => ({
  nuts: state.nuts,
  honey: state.honey,
}));

// flooks, no selector needed
// but also only `nuts` or `honey` update triggers re-render, it's automatic!
const { nuts, honey } = useStore();
```

### Only functions, no re-render

```js
const { a } = useStore(); // A component, update `a`
const { fn } = useStore(); // B component, only functions, no re-render
```

### No updated state, no re-render

```js
const { a } = useStore(); // A component, update `a`
const { b } = useStore(); // B component, no `a`, no re-render
```

### No \*.loading, no extra re-render

```js
const { asyncFn } = useStore(); // A component, call `asyncFn`
asyncFn(); // No `asyncFn.loading`, no extra re-render

// With normal loading solutions, even `asyncFn.loading` is not used,
// it will re-render at least twice (turn `true` then `false`).
```

## API

### `create()`

```js
import create from 'flooks';

const useStore = create((store) => storeData);

// For `react<=17`, you can use `create.config()` to pass
// `ReactDOM.unstable_batchedUpdates` for batch updating in async updates.
//
// create.config({ batch: ReactDOM.unstable_batchedUpdates }); // at app entry
```

### `store()`

```js
import create from 'flooks';

const useStore = create((store) => ({
  fn() {
    const { a, b } = store(); // get store

    store({ a: a + b }); // update store by payload
    // or
    store((state) => ({ a: state.a + state.b })); // update store by function
  },
}));
```

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

## FUTAKE

Try [**FUTAKE**](https://sotake.com/futake) in WeChat. A mini app for your inspiration moments. 🌈

![](https://s3.bmp.ovh/imgs/2022/07/21/452dd47aeb790abd.png)
