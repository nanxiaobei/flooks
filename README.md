<div align="center">
<h1>flooks <sup><sup><sub>v5</sub></sup></sup></h1>

Auto optimized React Hooks state manager. Tiny, simple, smooth.

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
- Intelligent loading state
- Interconnected modules
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

**\* Intelligent loading state** - if a function is async, `asyncFn.loading` is its loading state. If `asyncFn.loading` is not used, no extra re-render.

## Demo

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

## Auto optimization

Through `proxy`, flooks realizes a gorgeous auto optimization, re-render completely on demand, when React is truly "react".

Only actually used data will be injected into the component. If not, just not injected.

### Only functions, no re-render

```js
const { a } = useDemoModel(); // A component, update a
const { fn } = useDemoModel(); // B component, only functions, no re-render
```

### No updated state, no re-render

```js
const { a } = useDemoModel(); // A component, update a
const { b } = useDemoModel(); // B component, no `a`, no re-render
```

### No \*.loading, no extra re-render

```js
const { asyncFn } = useDemoModel(); // A component, call asyncFn
asyncFn(); // No asyncFn.loading, no extra re-render

// With normal loading solutions, even `asyncFn.loading` is not used,
// it will re-render at least twice (turn `true` then `false`).
```

## API

### `create()`

```js
import create from 'flooks';

const useSomeModel = create(someModel);
```

### `get()` & `set()`

```js
import create from 'flooks';
import useAnotherModel from './useAnotherModel';

const useSomeModel = create(({ get, set }) => ({
  someFn() {
    const { a, b } = get(); // get own model
    const { x, y } = get(useAnotherModel); // get other models

    set({ a: a + b }); // payload style
    // or
    set((state) => ({ a: state.a + state.b })); // function style
  },
}));
```

**\* Interconnected modules** - call `get(useAnotherModel)` in `someModel` to get other models, all models can be connected.

## Migrate to v5

```diff
-import useModel from 'flooks';
+import create from 'flooks';
-import { someModel } from './useSomeModel';
+import useSomeModel from './useSomeModel';

-const counter = ({ get, set }) => ({
+const useCounter = create(({ get, set }) => ({
  count: 0,
  add() {
-    const { count } = get(homeModel);
+    const { count } = get(useSomeModel);
  },
-});
+}));

-export default () => useModel(counter);
+export default useCounter;
```

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/main/LICENSE) (c) [nanxiaobei](https://lee.so/)

## FUTAKE

Try [**FUTAKE**](https://sotake.com/f) in WeChat. A mini app for your inspiration moments. 🌈

![FUTAKE](https://s3.jpg.cm/2021/09/21/IFG3wi.png)
