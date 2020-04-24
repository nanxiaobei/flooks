import { useState, useEffect } from 'react';

const run = Symbol();

type Model = { [key: string]: any };
type Getter = () => Model;
type Setter = (payload: Model) => void;
type Stack = Model & { [run]: { keys: string[]; setModel: Setter }[] }[];
type User = (model: Model) => (...keys: string[]) => Model;

const errMisUse = (api: string): string => `Please call \`${api}()\` inside a model`;
const errNotObj = (key: string): string => `\`${key}\` should be an object`;
const notObj = (data: any): boolean => Object.prototype.toString.call(data) !== '[object Object]';
const warn = (msg: string) => {
  throw new Error(msg);
};

const stack: Stack = [];

export const get: Getter = () => {
  const currentModel = stack[0];
  if (process.env.NODE_ENV !== 'production' && notObj(currentModel)) warn(errMisUse('get'));

  return currentModel;
};

export const set: Setter = (payload) => {
  const currentModel = stack[0];
  if (process.env.NODE_ENV !== 'production') {
    if (notObj(currentModel)) warn(errMisUse('set'));
    if (notObj(payload)) warn(errNotObj('payload'));
  }

  const newModel = { ...Object.assign(currentModel, payload) };
  const subs = currentModel[run];
  const updateKeys = Object.keys(payload);
  subs.forEach(({ keys, setModel }) => {
    if (updateKeys.some((key) => keys.includes(key))) setModel(newModel);
  });
};

export const use: User = (model) => {
  if (process.env.NODE_ENV !== 'production' && notObj(model)) warn(errNotObj('model'));
  const litModel = Object.setPrototypeOf({}, Object.defineProperty({}, run, { value: [] }));

  const setLoading = (key: string, loading: boolean) => {
    litModel[key].loading = loading;
    set({ [key]: litModel[key] });
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

  return (...keys) => {
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

export default { use, get, set };
