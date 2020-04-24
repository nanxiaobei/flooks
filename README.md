# 🍸 flooks

A state manager for React Hooks. Maybe the simplest.

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

🍰 Simple | 🍭 Auto loading | 🍕 Modules | 🥂 Flexible

---

English | [简体中文](./README.zh-CN.md)

---

<details>
<summary>
<strong>Take a look at flooks 2.0 💭 (Next generation of simplicity 🤳)</strong>
</summary>

---

The Simplest API of only `get`, `set`, `use`, like it? try it now.

```shell script
yarn add flooks@next
```

```jsx harmony
import { get, set, use } from 'flooks';

const counter = {
  count: 0,
  add() {
    const { count } = get();
    set({ count: count + 1 });
  },
  sub() {
    const { count } = get();
    set({ count: count - 1 });
  },
  async addLater() {
    const { add } = get();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
  },
};

const useCounter = use(counter);

function Counter() {
  const { count, add, sub, addLater } = useCounter();
  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={sub}>-</button>
      <button onClick={addLater}>+ ⌛ {addLater.loading && '...'}</button>
    </>
  );
}
```

</details>

## Install

```sh
yarn add flooks
```

or

```sh
npm install flooks
```

## Usage

```jsx harmony
import { setModel, useModel } from 'flooks';

const counter = {
  state: {
    count: 0,
  },
  actions: ({ model, setState }) => ({
    increment() {
      const { count } = model();
      setState({ count: count + 1 });
    },
    decrement() {
      const { count } = model();
      setState({ count: count - 1 });
    },
    async incrementAsync() {
      const { increment } = model();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      increment();
    },
  }),
};

setModel('counter', counter);

function Counter() {
  const { count, increment, decrement, incrementAsync } = useModel('counter');
  return (
    <>
      Count: {count}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={incrementAsync}>+ async{incrementAsync.loading && '...'}</button>
    </>
  );
}
```

## Demo

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14)

## API

### 1. setModel()

```js
setModel(name, model);
```

Accepts a name string and an model object, initialize the model.

The model object needs to contain a `state` object and an `actions` function.

### 2. useModel()

```js
const { someState, someAction } = useModel(name, onlyActions?);
```

A React Hook. Accepts a name, returns the initialized model with its state and actions.

If only use actions, pass `true` for `onlyActions` to avoid a component rerender.

### 3. ({ model, setState }) => realActions

```js
actions: ({ model, setState }) => ({ someAction() {} });
```

The argument of `actions` contains two functions, `model()` and `setState()`, can be used in every action.

#### 3.1. model()

```js
const { someState, someAction } = model(name?);
```

Returns the same as `useModel()`, but when get own model, `name` can be omitted.

i.e. `model()` for own model, `model('other')` for other models.

#### 3.2. setState()

```js
setState(payload);
```

Update own model's state with the `payload` object, can't update other models'.

## FAQ

### 1. Auto loading?

```js
actions: ({ model, setState }) => ({
  async someAsyncAction() {},
});
```

When an action is async, `someAsyncAction.loading` can be use.

### 2. Code splitting?

Supported naturally. Call `setModel()` in components, then use libraries like [`loadable-components`](https://github.com/smooth-code/loadable-components).

### 3. Set models together?

```js
import { setModel } from 'flooks';
import a from '...';
...

const models = { a, b, c };
Object.entries(models).forEach(([name, model]) => {
  setModel(name, model);
});
```

This is not recommended. Call `setModel()` separately in components, which is more clear and flexible.

## Philosophy

1\. Our philosophy is decentralization, so we recommend to bind a model and a route entry component as one module, call `setModel()` in the component to bind two.

2\. No need to add a file like `store.js` or `models.js`, because no need to distribute the store from top now. Without the centralized store, just the modules consisting of components and models in the lower level.

3\. A model has its own space, with `useModel()` and `model()`, all other models can be reached. Models are independent, but also connected.

4\. Don't initialize a model multiple times using `setModel()`, if have a "common" model used in several places, recommend to to initialize it in an upper component, such as `App.jsx`.

5\. That's all, enjoy it~

## License

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
