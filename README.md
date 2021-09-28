<div align="center">
<h1>flooks <sup><sup><sub>v4</sub></sup></sup></h1>

Auto optimized React Hooks state manager, just simple enough.

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

English · [简体中文](./README.zh-CN.md)

</div>

---

[Introducing flooks v4](https://github.com/nanxiaobei/flooks/discussions/28)

## Features

- Gorgeous auto optimized re-render
- Intelligent loading state
- Interconnected modules
- Extremely simple API

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

**\* Intelligent loading state** - if `someFn` is async, `someFn.loading` is its loading state. If `someFn.loading` is not used, no extra re-render.

## Demo

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14&hidenavigation=1&theme=dark)

## Gorgeous re-render optimization

Through `proxy`, flooks realizes a gorgeous auto optimization, re-render completely on demand, when React is truly "react".

Only actually used data will be injected into the component. If not, just not injected.

### Only functions never trigger re-render

```js
const { fn } = useDemoModel(); // A component

const { b, setB } = useDemoModel(); // B component
setB(); // A no re-render
```

If only functions used in A, others update won't trigger A re-render.

### Unused state never trigger re-render

```js
const { a } = useDemoModel(); // A component

const { b, setB } = useDemoModel(); // B component
setB(); // A no re-render
```

If some state not used in A, others update won't trigger A re-render.

### Unused loading never trigger re-render

```js
const { someFn } = useDemoModel(); // A component
someFn(); // no someFn.loading, no extra re-render
```

If `someFn.loading` not used in A, `someFn()` won't trigger extra re-render.

If `someFn` is async, with normal loading solutions, even `someFn.loading` is not used, re-render will trigger at least twice (turn `true` then `false`). However, with flooks, no invisible loading updates, if `someFn.loading` is not used.

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
    const { a, b } = get(); // get own model
    const { x, y } = get(anotherModel); // get other models

    set({ a: a + b }); // payload style
    set((state) => ({ a: state.a + state.b })); // function style
  },
});

export default () => useModel(someModel);
```

**\* Interconnected modules** - call `get(anotherModel)` in `someModel` to get other models, all models can be connected.

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://lee.so/)

## FUTAKE

Try [**FUTAKE**](https://sotake.com/f) in WeChat. A mini app for your inspiration moments. 🌈

![FUTAKE](https://s3.jpg.cm/2021/09/21/IFG3wi.png)
