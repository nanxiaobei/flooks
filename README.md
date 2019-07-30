# 🍸 flooks

A state manager for React Hooks

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
import { createModel, useModel } from 'flooks';

createModel({
  name: 'counter',
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
});

const Counter = () => {
  const { count, increment, decrement, incrementAsync } = useModel('counter');

  return (
    <>
      Count: {count}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={incrementAsync}>+ async</button>
    </>
  );
};
```

## API

### createModel

```js
createModel(model);
```

Initial `model` is an object, like `{ name: 'demo', state: {}, actions: ({ getModel, setState }) => ({}) }`

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

Call `createModel` in components, then use libraries like [`loadable-components`](https://github.com/smooth-code/loadable-components).

### Create models together?

```js
// models.js

import { createModel } from 'flooks';
import a from './a/model';
import b from './b/model';
import c from './c/model';

const models = [a, b, c];
models.forEach(createModel);
```

Don't forget `import './models.js'` in entry file.
