import { useState, useEffect } from 'react';

const run = Symbol();

type Model = { [key: string]: any };
type Sub = { keys: string[]; setModel: (payload: Model) => void };
type Stack = (Model & { [run]: Sub[] })[];
type Now = (payload?: undefined | Model) => any;
type Use = (model: Model) => (...keys: string[]) => Model;

const MIS_USE = (api: string): string => `Please call \`${api}()\` inside a model`;
const NOT_OBJ = (key: string): string => `\`${key}\` should be an object`;
const isDev = (env: string | undefined): boolean => env !== 'production';
const nonObj = (data: any): boolean => Object.prototype.toString.call(data) !== '[object Object]';
const err = (msg: string) => {
  throw new Error(msg);
};

const stack: Stack = [];

export const now: Now = (payload) => {
  const currentModel = stack[0];
  const __DEV__ = isDev(process.env.NODE_ENV);
  if (__DEV__) if (nonObj(currentModel)) err(MIS_USE('set'));

  if (payload === undefined) return currentModel;

  if (__DEV__) if (nonObj(payload)) err(NOT_OBJ('payload'));
  const newModel = { ...Object.assign(currentModel, payload) };
  const subs = currentModel[run];
  const updateKeys = Object.keys(payload);
  subs.forEach(({ keys, setModel }) => {
    if (updateKeys.some((key) => keys.includes(key))) setModel(newModel);
  });
};

export const use: Use = (model) => {
  if (isDev(process.env.NODE_ENV)) if (nonObj(model)) err(NOT_OBJ('model'));
  const litProto = Object.defineProperty({}, run, { value: [] });
  const litModel = Object.setPrototypeOf({}, litProto);

  const setLoading = (key: string, loading: boolean) => {
    litModel[key].loading = loading;
    now({ [key]: litModel[key] });
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
