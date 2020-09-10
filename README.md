# 🍸 flooks <sup><sup><sub>3.0</sub></sup></sup>

A state manager for React Hooks, maybe the simplest.

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

Auto loading state ▨ Modules ▨ Re-render control

---

English × [简体中文](./README.zh-CN.md)

---

## Install

```sh
yarn add flooks

# or

npm install flooks
```

## Example

```js
// counter model

const counter = (now) => ({
  count: 0,
  add() {
    const { count } = now(); // <----- now()        :: get own model
    now({ count: count + 1 }); // <--- now(payload) :: set own model
  },
});

export default counter;
```

```js
// trigger model

import counter from './counter';

const trigger = (now) => ({
  async addLater() {
    const { add } = now(counter); // <-- now(model) :: get other models
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
  },
});

export default trigger;
```

```jsx
// App component

import useModel from 'flooks';
import counter from './counter';
import trigger from './trigger';

function App() {
  const { count, add } = useModel(counter, ['count']); // <-- ['count'] :: re-render control
  const { addLater } = useModel(trigger); // <-------- addLater.loading :: auto loading state

  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addLater}>+ ⌛{addLater.loading && '...'}</button>
    </>
  );
}
```

**\* Auto loading state** - When `someFn` is async, `someFn.loading` can be used as its loading state.

## Demo

[∷ Live demo ∷](https://codesandbox.io/s/flooks-gqye5)

## API

### `useModel(model, deps)`

A React Hook, pass a `model`, returns the model data.

**\* Re-render control** - `deps` is optional, the same as that of `React.useEffect`.

```js
const { a, b } = useModel(someModel, ['a', 'b']);

// useModel(model) <-------------- now(payload) always trigger a re-render
// useModel(model, []) <---------- now(payload) never trigger a re-render
// useModel(model, ['a', 'b']) <-- now(payload) trigger a re-render when a or b inside payload
```

### `now()`

`now` is the param to `model`, can be used in 3 ways.

```js
import anotherModel from './anotherModel';

const ownModel = (now) => ({
  fn() {
    const { a, b } = now(); // <-------------- 1. get own model
    now({ a: a + b }); // <------------------- 2. update own model (payload is an object)
    const { x, y } = now(anotherModel); // <-- 3. get other models
  },
});
```

## Philosophy

- The philosophy of flooks is decentralization, so recommend binding a page component and a model as one.
- No need to add a file like `store.js` or `models.js`, because no need to distribute the store from top now.
- A model has its own space, when call `now(anotherModel)` to get other models, all models can be connected.

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
