import { useState, useEffect } from 'react';

const run = Symbol();

type Keys = undefined | string[];
type RawModel = { [key: string]: any };
type LitModel = RawModel & { [run]: { keys: Keys; setState: (newState: RawModel) => void }[] };

type Now = (next?: undefined | Model | RawModel) => any;
export type Model = (now: Now) => RawModel;
type UseModel = (model: Model, keys?: Keys) => LitModel;

const ERR_PAYLOAD = 'payload should be an object';
const ERR_MODEL = 'model should be a function';
const ERR_KEYS = 'keys should be an array';
const ERR_OUT_MODEL = 'model passed to now() is not initialized';
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const setLoading = (litModel: LitModel, key: string, loading: boolean) => {
  litModel[key].loading = loading;
  const subs = litModel[run];
  const update = {};

  subs.forEach(({ keys, setState }) => {
    if (!keys || keys.includes(key)) setState(update);
  });
};

const map: WeakMap<Model | Function, any> = new WeakMap();

const useModel: UseModel = (model, keys) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  if (__DEV__) {
    if (typeof model !== 'function') throw new Error(ERR_MODEL);
    if (keys !== undefined && !Array.isArray(keys)) throw new Error(ERR_KEYS);
  }

  let litModel: LitModel = map.get(model);
  if (!litModel) {
    const proto = Object.defineProperty({}, run, { value: [] });
    litModel = Object.setPrototypeOf({}, proto);

    const now: Now = (next) => {
      // get own
      if (next === undefined) return litModel;

      // get others
      if (typeof next === 'function') {
        const outModel = map.get(next);
        if (__DEV__ && !outModel) throw new Error(ERR_OUT_MODEL);
        return outModel;
      }

      // set own
      if (__DEV__ && notObj(next)) throw new Error(ERR_PAYLOAD);

      Object.assign(litModel, next);
      const subs = litModel[run];
      const nextKeys = Object.keys(next);
      const update = {};

      subs.forEach(({ keys, setState }) => {
        if (!keys || nextKeys.some((key) => keys.includes(key))) setState(update);
      });
    };

    const rawModel = model(now);

    Object.entries(rawModel).forEach(([key, val]) => {
      if (typeof val !== 'function') {
        litModel[key] = val;
      } else {
        litModel[key] = (...args: any) => {
          const res = val(...args);
          if (!res || typeof res.then !== 'function') return res;
          setLoading(litModel, key, true);
          return res.finally(() => {
            setLoading(litModel, key, false);
          });
        };
      }
    });

    map.set(model, litModel);
  }

  const [, setState] = useState();

  useEffect(() => {
    if (keys && keys.length === 0) return;
    const subs = litModel[run];
    const item = { keys, setState };
    subs.push(item);
    return () => {
      subs.splice(subs.indexOf(item), 1);
    };
  }, []);

  return litModel;
};

export default useModel;
