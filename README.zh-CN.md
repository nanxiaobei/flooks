# 🍸 flooks <sup><sup><sub><sub>伏鹿可思</sub></sub></sup></sup>

一个 React Hooks 状态管理器。也许是最简单的那个。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

🍰 简洁 | 🍭 自动 loading | 🍕 模块化 | 🥂 灵动

---

[English](./README.md) | 简体中文

---

<details>
<summary>
<strong>看一眼 flooks 2.0 💭 下一代简洁设计 🤳）</strong>
</summary>

---

最简单的 API，只有 `now`、`use`，怎么样？现在就试试吧。

[▷ 在线示例](https://codesandbox.io/s/flooks-20-e4fsq)

```shell script
yarn add flooks@next
```

```jsx harmony
import { now, use } from 'flooks';

const useCounter = use({
  count: 0,
  add() {
    const { count } = now();
    now({ count: count + 1 });
  },
  sub() {
    const { count } = now();
    now({ count: count - 1 });
  },
  async addLater() {
    const { add } = now();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    add();
  },
});

function Counter() {
  const { count, add, sub, addLater } = useCounter();
  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={sub}>-</button>
      <button onClick={addLater}>+ ⌛{addLater.loading && '...'}</button>
    </>
  );
}
```

</details>

## 安装

```sh
yarn add flooks
```

或

```sh
npm install flooks
```

## 使用

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

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5?fontsize=14)

## API

### 1. setModel()

```js
setModel(name, model);
```

接收名称字符串和 model 对象两个参数，初始化 model。

model 对象中需包含 `state` 对象和 `actions` 函数。

### 2. useModel()

```js
const { someState, someAction } = useModel(name, onlyActions?);
```

React Hook。接收 model 名称，返回初始化后的 model，包含其所有 state 和 actions。

若只用到 actions，`onlyActions` 可传入 `true` 以阻止组件重新渲染。

### 3. ({ model, setState }) => realActions

```js
actions: ({ model, setState }) => ({ someAction() {} });
```

`actions` 参数中可拿到两个函数，`model()` 和 `setState()`，可在每个 action 中使用。

#### 3.1. model()

```js
const { someState, someAction } = model(name?);
```

返回与 `useModel()` 一致，但当获取自身 model 时，`name` 可忽略。

即 `model()` 获取自身 model，`model('other')` 获取其它 model。

#### 3.2. setState()

```js
setState(payload);
```

更新自身 model 的 state，传入 `payload` 对象。无法更新其它 model。

## FAQ

### 1. 自动 loading ？

```js
actions: ({ model, setState }) => ({
  async someAsyncAction() {},
});
```

当 action 为异步时，`someAsyncAction.loading` 可供使用。

### 2. 代码分割？

天然支持。在组件中调用 `setModel()`，然后使用像 [`loadable-components`](https://github.com/smooth-code/loadable-components) 这样的库。

### 3. 统一设置 model？

```js
import { setModel } from 'flooks';
import a from '...';
...

const models = { a, b, c };
Object.entries(models).forEach(([name, model]) => {
  setModel(name, model);
});
```

不推荐统一设置。请在组件中分别调用 `setModel()`，可以更加清晰和灵活。

## 理念

1\. 我们的理念是去中心化，因此建议将 model 和路由入口组件绑定为一个模块，组件中调用 `setModel()` 来绑定二者。

2\. 不需要添加 `store.js` 或 `models.js` 这样的文件，因为不需要从顶部分发 store。没有中心化的 store，只有下层路由组件和 model 组成的不同模块。

3\. model 有自己的命名空间，使用 `useModel()` 和 `model()`，可访问到其他所有的 model。model 均是独立的，但同时也是连接的。

4\. 不要使用 `setmodel()` 多次初始化同一个 model，如果有一个 "common" model 在多个地方使用，建议在某个上层组件中进行初始化，比如 `App.jsx`。

5\. 就这些，完事啦~

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
