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

English | [简体中文](./README.zh-CN.md)

---

## Install

```sh
yarn add flooks
```

or

```sh
npm install flooks
```

## Example

```js
// counter.js

const counter = (now) => ({
  count: 0,
  add() {
    const { count } = now(); // <---- get own model
    now({ count: count + 1 }); // <-- set own model
  },
});

export default counter;
```

```js
// trigger.js

import counter from 'path/to/counter';

const trigger = (now) => ({
  async addLater() {
    const { add } = now(counter); // <-- get other models
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
  },
});

export default trigger;
```

```jsx
// Demo.jsx

import useModel from 'flooks';
import counter from 'path/to/counter';
import trigger from 'path/to/trigger';

function Demo() {
  const { count, add } = useModel(counter, ['count']); // <-- `deps` re-render control
  const { addLater } = useModel(trigger); // <-- `addLater.loading` auto loading state
  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addLater}>+ ⌛{addLater.loading && '...'}</button>
    </>
  );
}
```

**\* Auto loading state:** When `someFn` is async, `someFn.loading` can be used as its loading state.

## Demo

[∷ Live demo ∷](https://codesandbox.io/s/flooks-gqye5)

## API

### `useModel(model, deps)`

```js
const { a, b } = useModel((now) => data, ['a', 'b']);
```

A React Hook, pass a model `function`, returns the model data.

**\* Re-render control:** `deps` is optional, the same as that of `React.useEffect`:

- If pass nothing, all updates in the model will trigger a re-render
- If pass an empty array (`[]`), it will never trigger a re-render
- If pass a dependency list (`['a', 'b']`), it will trigger a re-render only when any dependency changes

### `now()`

```js
import someModel from 'path/to/someModel';

const { a, b } = now(); // get own model
const { c, d } = now(someModel); // get other models
now(payload); // set own model
```

- `now()` to get own model
- `now(someModel)` to get other models, `someModel` is a function
- `now(payload)` to update own model, `payload` is an object

## Philosophy

- The philosophy of flooks is decentralization, so recommend binding one component and one model as one.
- No need to add a file like `store.js` or `models.js`, because no need to distribute the store from top now.
- A model has its own space, when call `now(someModel)` to get other models, all models can be connected.

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
