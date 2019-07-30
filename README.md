# 🍸 flooks

> A state manager for React Hooks.
>
> Maybe the simplest.

![npm](https://img.shields.io/npm/v/flooks?style=flat-square)
![Travis (.org)](https://img.shields.io/travis/nanxiaobei/flooks?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)
![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)
![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)

## Installation

```shell
yarn add flooks
```

or

```shell
npm install flooks
```

## Examples

```jsx harmony
import { setModel, useModel } from 'flooks';

const model = {
  state: {
    count: 0,
  },
  actions: ({ getModel, setState }) => ({
    increment() {
      const { count } = getModel();
      setState({ count: count + 1 });
    },
    decrement() {
      const { count } = getModel();
      setState({ count: count - 1 });
    },
    async incrementAsync() {
      const { increment } = getModel();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      increment();
    },
  }),
};

setModel('counter', model);

function Counter() {
  const { count, increment, decrement, incrementAsync } = useModel('counter');
  return (
    <>
      Count: {count}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={incrementAsync}>+ async</button>
    </>
  );
}
```

## API

### setModel

```js
setModel(name, model);
```

Initial `model` is an object, like `{ state: {}, actions: ({ getModel, setState }) => ({}) }`

### useModel

```js
const model = useModel(name);
```

A React Hook, used to get a model's state and actions.

### getModel

```js
const model = getModel(name?);

// const own = getModel();
// const other = getModel('other');
```

Argument to `actions`.

Like `useModel`, but when get own model, `name` can be omitted.

### setState

```js
setState(payload);

// setState({ ...newState })
```

Argument to `actions`.

Set own model's state. (can't set other models')

## FAQ

### Automatically loading?

```js
actions: ({ getModel, setState }) => ({
  async someAsyncAction() {},
});
```

When an action is async, `someAsyncAction.loading` can be use.

### Code splitting?

Call `setModel` in components, then use libraries like [`loadable-components`](https://github.com/smooth-code/loadable-components).

### Create models together?

```js
// models.js

import { setModel } from 'flooks';

const models = { a, b, c, d };
Object.entries(models).forEach(([name, model]) => {
  setModel(name, model);
});
```

Don't forget `import './models.js'` in entry file.
