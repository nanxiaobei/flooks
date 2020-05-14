import { useState, useEffect } from 'react';

const run = Symbol();

type Deps = undefined | string[];
type ModelData = { [key: string]: any };
type LitModel = ModelData & { [run]: { deps: Deps; setState: (newState: ModelData) => void }[] };

type Now = (next?: undefined | Model | ModelData) => any;
export type Model = (now: Now) => ModelData;
type UseModel = (model: Model, deps?: Deps) => LitModel;

const ERR_PAYLOAD = 'payload should be an object';
const ERR_MODEL = 'model should be a function';
const ERR_KEYS = 'deps should be an array';
const ERR_OUT_MODEL = 'model passed to now() is not initialized';
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const setLoading = (litModel: LitModel, key: string, loading: boolean) => {
  litModel[key].loading = loading;
  const subs = litModel[run];
  const update = {};

  subs.forEach(({ deps, setState }) => {
    if (!deps || deps.includes(key)) setState(update);
  });
};

const map: WeakMap<Model | Function, any> = new WeakMap();

const useModel: UseModel = (model, deps) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  if (__DEV__) {
    if (typeof model !== 'function') throw new Error(ERR_MODEL);
    if (deps !== undefined && !Array.isArray(deps)) throw new Error(ERR_KEYS);
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

      subs.forEach(({ deps, setState }) => {
        if (!deps || nextKeys.some((key) => deps.includes(key))) setState(update);
      });
    };

    const modelData = model(now);

    Object.entries(modelData).forEach(([key, val]) => {
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
    if (deps && deps.length === 0) return;
    const subs = litModel[run];
    const item = { deps, setState };
    subs.push(item);
    return () => {
      subs.splice(subs.indexOf(item), 1);
    };
  }, []);

  return litModel;
};

export default useModel;
