import { useState, useEffect } from 'react';

const run = Symbol();

type Model = { [key: string]: any };
type Sub = { keys: string[]; setModel: (payload: Model) => void };
type Stack = (Model & { [run]: Sub[] })[];
type Use = (model?: Model) => any;

const MIS_USE = (act: string): string => `To ${act} a model, param to use() should be an object`;
const isObj = (val: any): boolean => Object.prototype.toString.call(val) === '[object Object]';
const showErr = (msg: string) => {
  throw new Error(msg);
};

const stack: Stack = [];

const use: Use = (model) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  const currentModel = stack[0];

  // getter
  if (model === undefined) {
    if (currentModel) return currentModel;
    if (__DEV__) showErr(MIS_USE('create'));
    return;
  }

  // setter
  if (currentModel) {
    if (__DEV__ && !isObj(model)) showErr(MIS_USE('set'));

    const newModel = { ...Object.assign(currentModel, model) };
    const subs = currentModel[run];
    const updateKeys = Object.keys(model);
    subs.forEach(({ keys, setModel }) => {
      if (updateKeys.some((key) => keys.includes(key))) setModel(newModel);
    });
    return;
  }

  // creator
  if (__DEV__ && !isObj(model)) showErr(MIS_USE('create'));

  const litProto = Object.defineProperty({}, run, { value: [] });
  const litModel = Object.setPrototypeOf({}, litProto);

  const setLoading = (key: string, loading: boolean) => {
    litModel[key].loading = loading;
    use({ [key]: litModel[key] });
  };

  Object.entries(model).forEach(([key, val]) => {
    if (typeof val !== 'function') {
      litModel[key] = val;
      return;
    }
    litModel[key] = (...args: any) => {
      stack.unshift(litModel);
      const res = val(...args);
      if (!res || typeof res.then !== 'function') {
        stack.shift();
        return res;
      }
      return new Promise((resolve, reject) => {
        setLoading(key, true);
        const pro = res.then(resolve).catch(reject);
        pro.finally(() => {
          setLoading(key, false);
          stack.shift();
        });
      });
    };
  });

  return (...keys: string[]) => {
    try {
      const [, setModel] = useState();
      const empty = keys.length === 0;

      useEffect(() => {
        const subs = litModel[run];
        const item = { keys: empty ? Object.keys(litModel) : keys, setModel };
        subs.push(item);
        return () => {
          subs.splice(subs.indexOf(item), 1);
        };
      }, []);

      if (empty) return litModel;

      return keys.reduce((obj: Model, key) => {
        obj[key] = litModel[key];
        return obj;
      }, {});
    } catch {
      return litModel;
    }
  };
};

export default use;
