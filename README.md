# 🍸 flooks <sup><sup><sub>v2</sub></sup></sup>

A state manager for React Hooks, maybe the simplest.

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

Auto loading handing ▧ Modules ▧ Rerender control

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

The simplest API of only `use`:

```js
// counter.js

import use from 'flooks';

const counter = {
  count: 0,
  add() {
    const { count } = use(); // ---- `use` as a getter
    use({ count: count + 1 }); // -- `use` as a setter
  },
};

export default use(counter); // ---- `use` as an initializer
```

```js
// trigger.js

import use from 'flooks';
import counter from 'path/to/counter'; // import as `counter`, a model getter¹

const trigger = {
  async addLater() {
    const { add } = counter();
    await new Promise((resolve = setTimeout(resolve, 1000)));
    add();
  },
};

export default use(trigger);
```

```jsx harmony
// Demo.jsx

import useCounter from 'path/to/counter'; // import as `useCounter`, a React Hook²
import useTrigger from 'path/to/trigger';

function Demo() {
  const { count, add } = useCounter(['count']); // `deps` for ＜rerender control＞
  const { addLater } = useTrigger(); // `addLater.loading` ＜auto loading＞ state
  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addLater}>+ ⌛{addLater.loading && '...'}</button>
    </>
  );
}
```

\* **Auto loading:** When a model method `someMethod` is async, `someMethod.loading` can be used as its loading state.

## Demo

[≡ Live demo ≡](https://codesandbox.io/s/flooks-gqye5)

## API

### `use()` as a getter, to get own model

```js
const ownModel = use();
```

Inside a model, if no param is passed, `use` will be a getter.

### `use(payload)` as a setter, to update own model

```js
use(payload);
```

Inside a model, if passed an `payload` object, `use` will be a setter. `payload` should be an object.

### `use(model)` as an initializer, returns a React Hook, also a model getter

```js
const useSomeModel /* = someModel */ = use(model);
```

Call outside of a model, returns `useSomeModel` Hook, also is `someModel` model getter (To escape React Hooks ESLint naming rule, therefore, when used in a model, recommended naming it different from hooks).

\* **Rerender control:** **`useSomeModel(deps)`** has `deps` param, the same as that of `React.useEffect`:

- If pass nothing, all updates in the model will trigger a rerender
- If pass an empty array (`[]`), it will never trigger a rerender
- If pass a dependency list (`['a', 'b']`), it will trigger a rerender only when one of the dependencies changes

## Philosophy

- Our philosophy is decentralization, so we recommend binding one component and one model as one piece.
- No need to add a file like `store.js` or `models.js`, because no need to distribute the store from top now.
- A model has its own space, when call `someModel()` in other models, all models can be connected.

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
