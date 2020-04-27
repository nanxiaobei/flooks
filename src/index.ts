import { useState, useEffect } from 'react';

const run = Symbol();

type Model = { [key: string]: any };
type Sub = { keys: string[]; setModel: (payload: Model) => void };
type Stack = (Model & { [run]: Sub[] })[];
type Use = (model?: Model) => any;

const ERR_KEYS = 'keys should be an array';
const errUse = (act: string): string => `To ${act} a model, param to use() should be an object`;
const isObj = (val: any): boolean => Object.prototype.toString.call(val) === '[object Object]';

const stack: Stack = [];

const setLoading = (model: Model, key: string, loading: boolean) => {
  model[key].loading = loading;
  use({ [key]: model[key] });
};

const use: Use = (model) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  const currentModel = stack[0];

  // getter
  if (model === undefined) {
    if (currentModel) return currentModel;
    if (__DEV__) throw new Error(errUse('initialize'));
    return;
  }

  // setter
  if (currentModel) {
    if (__DEV__ && !isObj(model)) throw new Error(errUse('set'));

    Object.assign(currentModel, model);
    const subs = currentModel[run];
    const updateKeys = Object.keys(model);
    subs.forEach(({ keys, setModel }) => {
      if (updateKeys.some((key) => keys.includes(key))) setModel(model);
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
        if (!res || typeof res.then !== 'function') {
          stack.shift();
          return res;
        }
        return new Promise((resolve, reject) => {
          setLoading(litModel, key, true);
          const pro = res.then(resolve).catch(reject);
          pro.finally(() => {
            setLoading(litModel, key, false);
            stack.shift();
          });
        });
      };
    }
  });

  return (keys?: string[]) => {
    try {
      const [, setState] = useState();
      if (__DEV__ && keys !== undefined && !Array.isArray(keys)) throw new Error(ERR_KEYS);
      useEffect(() => {
        const newKeys = keys === undefined ? Object.keys(model) : keys;
        if (newKeys.length === 0) return;
        const subs = litModel[run];
        const item = { keys: newKeys, setModel: setState };
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
