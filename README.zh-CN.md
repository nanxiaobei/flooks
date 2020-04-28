# 🍸 flooks 2.0

一个 React Hooks 状态管理器，也许是最简单的那个。

[![npm](https://img.shields.io/npm/v/flooks?style=flat-square)](https://www.npmjs.com/package/flooks)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nanxiaobei/flooks/Test?style=flat-square)](https://github.com/nanxiaobei/flooks/actions?query=workflow%3ATest)
[![Codecov](https://img.shields.io/codecov/c/github/nanxiaobei/flooks?style=flat-square)](https://codecov.io/gh/nanxiaobei/flooks)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/flooks?style=flat-square)](https://bundlephobia.com/result?p=flooks)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/src/index.ts)
[![GitHub](https://img.shields.io/github/license/nanxiaobei/flooks?style=flat-square)](https://github.com/nanxiaobei/flooks/blob/master/LICENSE)

自动 loading 处理 ▧ 模块化 ▧ 按需重新渲染

---

[English](./README.md) | 简体中文

---

## 安装

```sh
yarn add flooks
```

或

```sh
npm install flooks
```

## 使用

最简洁的 API，只有 `use`：

```js
// counter.js

import use from 'flooks';

const counter = {
  count: 0,
  add() {
    const { count } = use(); // ---- `use` 用作 getter
    use({ count: count + 1 }); // -- `use` 用作 setter
  },
};

export default use(counter); // ---- `use` 用作初始化
```

```js
// trigger.js

import use from 'flooks';
import counter from './counter'; // 引入为 `counter`，model getter

const trigger = {
  // `addLater.loading` 状态可用
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

import useCounter from './counter'; // 引入为 `useCounter`，React Hooks
import useTrigger from './trigger';

function Demo() {
  const { count, add } = useCounter(['count']); // `deps` 控制重新渲染
  const { addLater } = useTrigger();
  return (
    <>
      <p>{count}</p>
      <button onClick={add}>+</button>
      <button onClick={addLater}>+ ⌛{addLater.loading && '...'}</button>
    </>
  );
}
```

\* **自动 loading：** 当 model 方法 `someMethod` 为异步时，`someMethod.loading` 可用作其 loading 状态。

## 示例

[≡ 在线示例 ≡](https://codesandbox.io/s/flooks-20-e4fsq)

## API

### `use()` 作为 getter，获取自身 model

```js
const ownModel = use();
```

在 model 内调用，若不传入参数，`use` 将用作 getter。

### `use(payload)` 作为 setter，更新自身 model

```js
use(payload);
```

在 model 内调用，若传入 `payload` 对象，`use` 将用作 setter。`payload` 应该为对象。

### `use(model)` 用作初始化，返回 React Hooks，同时也是 model getter

```js
const useSomeModel /* = someModel */ = use(model);
```

在 model 外调用，返回 `useSomeModel` Hooks，同时也是 `someModel` model getter（为规避 React Hooks ESLint 命名规则，故在 model 中使用时，建议命名与 Hooks 不同）。

\* **按需重新渲染：** **`useSomeModel(deps)`** 的 `deps` 参数，与 `React.useEffect` 的相同：

- 若不传入参数，所有 model 更新都将触发重新渲染
- 若传入空数组（`[]`），永不触发重新传染
- 如果传入依赖列表（`['a', 'b']`），仅当依赖列表中的项变化时触发重新渲染

## 理念

- 我们的理念是去中心化，因此建议将单个组件与 model 绑定为一个整体。
- 不需要添加类似 `store.js`、`models.js` 这样的文件，因为现在已不需要从顶层下发 store。
- model 有自己的地盘，同时通过在 model 中调用 `someModel()`，所有 model 都可以实现互通。

## 协议

[MIT License](https://github.com/nanxiaobei/flooks/blob/master/LICENSE) (c) [nanxiaobei](https://mrlee.me/)
