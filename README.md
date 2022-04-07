<div align="center">
<h1>flooks <sup><sup><sub>v5</sub></sup></sup></h1>

(Now Support React 18)

State Manager for React Hooks, Auto Optimized

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
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
- Interconnected stores
- Extremely simple API

## Install

```sh
yarn add flooks

# npm i flooks
```

## Usage

```jsx
import create from 'flooks';

const useCounter = create(({ get, set }) => ({
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

const useStore = create(initStore);
```

### `get()` & `set()`

```js
import create from 'flooks';
import useOutStore from './useOutStore';

const useStore = create(({ get, set }) => ({
  fn() {
    const { a, b } = get(); // get own store
    const { x, y } = get(useOutStore); // get other stores

    set({ a: a + b }); // payload style
    // or
    set((state) => ({ a: state.a + state.b })); // function style
  },
}));
```

**\* Interconnected stores** - call `get(useOutStore)` to get other stores, all stores can be connected.

## From v4 to v5

```diff
- import useStore from 'flooks';
+ import create from 'flooks';

- import { outStore } from './useOutStore';
+ import useOutStore from './useOutStore';

- const counter = ({ get, set }) => ({
+ const useCounter = create(({ get, set }) => ({
    count: 0,
    add() {
-     const { count } = get(outStore);
+     const { count } = get(useOutStore);
    },
- });
+ }));

- const useCounter = () => useStore(counter);

  export default useCounter;
```

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

## FUTAKE

Try [**FUTAKE**](https://sotake.com/f) in WeChat. A mini app for your inspiration moments. 🌈

![FUTAKE](https://s3.jpg.cm/2021/09/21/IFG3wi.png)
