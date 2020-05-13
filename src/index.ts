import { useState, useEffect } from 'react';

const run = Symbol();

type Sub = { keys: undefined | string[]; setModel: (payload: Model) => void };
type Model = { [key: string]: any; [run]?: Sub[] };
type Use = (model?: Model) => any;

const ERR_USE = 'use() as getter should be placed at the top of a function';
const ERR_KEYS = 'keys should be an array';
const errUse = (act: string): string => `To ${act} a model, param to use() should be an object`;
const isObj = (val: any): boolean => Object.prototype.toString.call(val) === '[object Object]';

const stack: Model[] = [];
let asyncCount = 0;

const setLoading = (model: Model, key: string, loading: boolean) => {
  model[key].loading = loading;
  const subs = model[run];
  const update = {};

  // @ts-ignore
  subs.forEach(({ keys, setModel }) => {
    if (!keys || keys.includes(key)) setModel(update);
  });
};

const use: Use = (model) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  const currentModel = stack[0];

  // getter
  if (model === undefined) {
    if (currentModel) return currentModel;
    if (__DEV__) {
      /* istanbul ignore next */
      if (asyncCount > 0) throw new Error(ERR_USE);
      throw new Error(errUse('initialize'));
    }
    return;
  }

  // setter
  if (currentModel) {
    if (__DEV__ && !isObj(model)) throw new Error(errUse('set'));

    Object.assign(currentModel, model);
    const subs = currentModel[run];
    const payloadKeys = Object.keys(model);
    const update = {};

    // @ts-ignore
    subs.forEach(({ keys, setModel }) => {
      if (!keys || payloadKeys.some((key) => keys.includes(key))) setModel(update);
    });
    return;
  }

  // initializer
  if (__DEV__ && !isObj(model)) throw new Error(errUse('initialize'));

  const proto = Object.defineProperty({}, run, { value: [] });
  const litModel = Object.setPrototypeOf({}, proto);

  Object.entries(model).forEach(([key, val]) => {
    if (typeof val !== 'function') {
      litModel[key] = val;
    } else {
      litModel[key] = (...args: any) => {
        stack.unshift(litModel);
        const res = val(...args);
        stack.shift();

        if (!res || typeof res.then !== 'function') return res;

        asyncCount++;
        setLoading(litModel, key, true);
        return res.finally(() => {
          setLoading(litModel, key, false);
          asyncCount--;
        });
      };
    }
  });

  return (keys?: string[]) => {
    try {
      const [, setState] = useState();
      if (__DEV__ && keys !== undefined && !Array.isArray(keys)) throw new Error(ERR_KEYS);
      useEffect(() => {
        if (Array.isArray(keys) && keys.length === 0) return;
        const subs = litModel[run];
        const item = { keys, setModel: setState };
        subs.push(item);
        return () => {
          subs.splice(subs.indexOf(item), 1);
        };
      }, []);
      return litModel;
    } catch (err) {
      if (__DEV__ && err.message === ERR_KEYS) throw new Error(err);
      return litModel;
    }
  };
};

export default use;
