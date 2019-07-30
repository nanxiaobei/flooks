# 🍸 flooks <sup><sup><sub><sub>福禄克斯</sub></sub></sup></sup>

一个 React Hooks 状态管理器。也许是最简单的那个。^\_^

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![Travis (.org)](https://img.shields.io/travis/nanxiaobei/flooks?style=flat-square)](https://travis-ci.org/nanxiaobei/flooks)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

🍰 简单易用 | 🍭 自动 loading | 🍕 模块化 | 🥂 灵活

---

[English](./README.md) | 简体中文

---

## 安装

```shell
yarn add flooks
```

或

```shell
npm install flooks
```

## 使用

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
      <button onClick={incrementAsync}>+ async{incrementAsync.loading && '...'}</button>
    </>
  );
}
```

## 示例

[![Edit flooks](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/flooks-gqye5)

## API

### setModel

```js
setModel(name, model);
```

接受一个 `name` 字符串和一个初始化 `model` 对象，生成一个具有名称空间的 model。

初始化 `model` 包含一个 `state` 对象和一个 `actions` 函数。

### useModel

```js
const model = useModel(name);
```

一个 React Hook。接收一个 model 的 name，返回一个 model 对象，包含所有 state 和 actions。

### getModel

```js
const model = getModel(name?);
```

传入 `actions` 的参数。用法同 `useModel` 一致，但当获取自身 model 时，`name` 可以忽略。

即 `getModel()` 获取自身 model，`getModel('other')` 获取其它 model。

### setState

```js
setState(payload);
```

传入 `actions` 的参数。更新自身 model 的 state，使用 `payload` 对象，无法更新其它 model。

## FAQ

### 自动 loading ？

```js
actions: ({ getModel, setState }) => ({
  async someAsyncAction() {},
});
```

当一个 action 为异步时，`someAsyncAction.loading` 可供使用。

### 代码分割？

天然支持。在组件中调用 `setModel`，然后使用像 [`loadable-components`](https://github.com/smooth-code/loadable-components) 这样的库。

### 统一设置 model？

```js
import { setModel } from 'flooks';
import a from '...';
...

const models = { a, b, c, d };
Object.entries(models).forEach(([name, model]) => {
  setModel(name, model);
});
```

不推荐统一设置。在组件中分别调用 `setModel`，这样更加清晰和灵活。

## 理念

1\. 我们的理念是去中心化，因此我们建议将 model 和路由入口组件绑定为一个模块，在组件中调用 `setModel` 来绑定二者。

2\. 不需要添加像 `store.js` 或 `models.js` 这样的文件，因为我们现在不需要从顶部分发 store。没有了中心化的 store，只是 model 和组件。

3\. 一个模块有自己的空间，使用 `useModel` 和 `getModel`，可以访问到其他所有 model。所以模块都是独立的，但同时也是连接的。

4\. 不要使用 `setmodel` 多次调用一个 model，如果有一个 "common" model 在多个地方使用，建议在骨架组件中初始化 "common" model，比如 `App.jsx`。

5\. 就这些，完事啦~

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
