import { useState, useEffect, useMemo, useRef } from 'react';

type Data = { [key: string]: any };
type UseModel = () => Data;
type Updater = (payload: Data) => void;
type Reducer = (payload: Data) => Data;

type GetData = (useModel?: UseModel) => Data;
type SetData = (payload: Data | Reducer) => void;
type Model = ({ get, set }: { get: GetData; set: SetData }) => Data;
type Create = (model: Model) => UseModel;

type Noop = () => void;
type Handler = { get: (t: any, k: string) => any; set: (t: any, k: string, v: any) => true };

const ERR_MODEL = 'model should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_OUT_MODEL = 'useOutModel passed to get() is not initialized';
const MIGRATE_URL = 'https://github.com/nanxiaobei/flooks#from-v4-to-v5';
const MIGRATE_ERR = `flooks v5 installed, sorry for breaking changes. Simple migrate guide: ${MIGRATE_URL}`;

const emptyObj = {};
const noop = () => undefined;
const __DEV__ = process.env.NODE_ENV !== 'production';
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const map: WeakMap<Model, any> = new WeakMap();

const create: Create = (model) => {
  if (__DEV__ && typeof model !== 'function') throw new Error(ERR_MODEL);

  try {
    useState(0); // eslint-disable-line react-hooks/rules-of-hooks
    throw new Error(MIGRATE_ERR);
  } catch (err: any) {
    if (err.message === MIGRATE_ERR) throw err;
  }

  const modelSubs: Updater[] = [];
  const modelData = model({
    get(useOutModel) {
      if (typeof useOutModel === 'undefined') return modelData;
      const outData = map.get(useOutModel);
      if (__DEV__ && !outData) throw new Error(ERR_OUT_MODEL);
      return outData;
    },
    set(payload) {
      if (typeof payload === 'function') {
        payload = payload(modelData);
      } else if (__DEV__ && notObj(payload)) {
        throw new Error(ERR_PAYLOAD);
      }
      Object.assign(modelData, payload);
      modelSubs.forEach((updater) => updater(payload));
    },
  });

  const useModel: UseModel = () => {
    const ownData = useRef(emptyObj);
    const [, setState] = useState(false);
    const onEffect = useRef<Noop>(noop);

    useMemo(() => {
      let hasState = false;
      let hasUpdate = false;

      const target: Data = {};
      const handler: Handler = {
        get(_, key) {
          const val = modelData[key];

          if (typeof val !== 'function') {
            hasState = true;
            target[key] = val;
            return target[key];
          }

          target[key] = new Proxy(val, {
            get: (fn, fnKey) => {
              if (fnKey === 'loading' && !('loading' in fn)) fn.loading = false;
              return fn[fnKey];
            },

            apply: (fn, _this, args) => {
              const res = fn(...args);
              if (!('loading' in fn) || !res || typeof res.then !== 'function') {
                target[key] = fn;
                return res;
              }

              const setLoading = (loading: boolean) => {
                target[key].loading = loading;
                setState((s) => !s);
              };

              target[key] = (...newArgs: any[]) => {
                const newRes = fn(...newArgs);
                setLoading(true);
                return newRes.finally(() => setLoading(false));
              };

              setLoading(true);
              return res.finally(() => setLoading(false));
            },
          });

          return target[key];
        },

        set(_, key, val) {
          if (key in target) {
            hasUpdate = true;
            target[key] = val;
          }
          return true;
        },
      };

      ownData.current = new Proxy(target, handler);

      const updater: Updater = (payload) => {
        Object.assign(ownData.current, payload);

        if (hasUpdate) {
          hasUpdate = false;
          setState((s) => !s);
        }
      };

      modelSubs.push(updater);

      onEffect.current = () => {
        if (hasState) {
          handler.get = (_, key) => target[key];
          return () => modelSubs.splice(modelSubs.indexOf(updater), 1);
        }
        modelSubs.splice(modelSubs.indexOf(updater), 1);
        ownData.current = target;
      };
    }, []);

    useEffect(() => onEffect.current(), []);
    return ownData.current;
  };

  map.set(useModel, modelData);
  return useModel;
};

export default create;
