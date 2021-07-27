# flooks <sup><sup><sub>v4</sub></sup></sup>

A state manager for React Hooks, with gorgeous auto optimized re-render.

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

English | [简体中文](./README.zh-CN.md)

---

## Features

- Auto optimized re-render
- Auto loading state
- Connected modules

## Install

```sh
yarn add flooks

# npm install flooks
```

## Usage

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

**\* Auto loading state** - If `someFn` is async, `someFn.loading` can be used as its loading state.

## Demo

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

## Auto optimization

Through `proxy`, flooks realizes a gorgeous auto optimization, re-render completely on demand.

### Only functions will never trigger a re-render

```js
const { fn1, fn2 } = useModel(someModel);
```

Call `set(newState)` inside `someModel` will never trigger a re-render, if only destructured functions from `useModel(someModel)`.

### Unused state will never trigger a re-render

```js
const { a } = useModel(someModel);
```

Call `set({ b: 1 })` inside `someModel` will never trigger a re-render, if `b` is not destructured from `useModel(someModel)`.

### Unused loading will never trigger a re-render

```js
const { someFn } = useModel(someModel);

// someFn.loading
```

Usually if `someFn` is async, re-render will trigger at least twice (turn `true` then `false`) even `somefn.loading` is not used. However, with flooks, invisible loading update will never be triggered, unless `somefn.loading` was added to code.

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
    const { a, b } = get(); // get own model
    const { x, y } = get(outModel); // get other models

    set({ a: a + b }); // payload style
    set((state) => ({ a: state.a + state.b })); // function style
  },
});
```

**\* Connected modules** - call `get(outModel)` inside `someModel` to get other models, all models can be connected.

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)

## Pitiless Ads

If you use WeChat, please try "**FUTAKE**". It's a WeChat mini app for your inspiration moments. 🌈

![FUTAKE](https://s3.jpg.cm/2021/04/22/TDQuS.png)
