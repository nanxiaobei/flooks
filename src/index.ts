import { useState, useEffect, useMemo, useRef } from 'react';

type Snap = { [key: string]: any };
type Updater = (payload: Snap) => void;
type Reducer = (payload: Snap) => Snap;

type GetSnap = (model?: Model) => Snap;
type SetSnap = (payload: Snap | Reducer) => void;

export type Model = ({ get, set }: { get: GetSnap; set: SetSnap }) => Snap;
type UseModel = (model: Model) => Snap;

type Noop = () => (() => void) | void;
type Handler = { get: (t: any, k: string) => any; set: (t: any, k: string, v: any) => true };

const __DEV__ = process.env.NODE_ENV !== 'production';
const ERR_MODEL = 'model should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_OUT_MODEL = 'model passed to get() is not initialized';
const emptyObj = {};
const noop = () => () => null;
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const map: WeakMap<Model, any> = new WeakMap();

const useModel: UseModel = (model) => {
  if (__DEV__ && typeof model !== 'function') throw new Error(ERR_MODEL);

  const localModel = useRef(emptyObj);
  const [, setState] = useState(false);
  const onEffect = useRef<Noop>(noop);

  useMemo(() => {
    let [globalModel, globalSubs]: [Snap, Updater[]] = map.get(model) || [];

    // global model
    if (!globalModel) {
      const get: GetSnap = (outModel) => {
        if (typeof outModel === 'undefined') return globalModel;

        const outData = map.get(outModel)?.[0];
        if (__DEV__ && !outData) throw new Error(ERR_OUT_MODEL);
        return outData;
      };

      const set: SetSnap = (payload) => {
        if (typeof payload === 'function') {
          payload = payload(globalModel);
        } else if (__DEV__ && notObj(payload)) {
          throw new Error(ERR_PAYLOAD);
        }

        Object.assign(globalModel, payload);
        globalSubs.forEach((updater) => updater(payload));
      };

      globalModel = model({ get, set });
      globalSubs = [];

      map.set(model, [globalModel, globalSubs]);
    }

    // local model
    let hasState = false;
    let hasUpdate = false;

    const localTarget = {};
    const localHandler: Handler = {
      get: (target, key) => {
        const val = globalModel[key];

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

      set: (target, key, val) => {
        if (key in target) {
          target[key] = val;
          hasUpdate = true;
        }
        return true;
      },
    };

    localModel.current = new Proxy(localTarget, localHandler);

    const localUpdater: Updater = (payload) => {
      Object.assign(localModel.current, payload);

      if (hasUpdate) {
        setState((s) => !s);
        hasUpdate = false;
      }
    };

    globalSubs.push(localUpdater);

    onEffect.current = () => {
      if (hasState) {
        localHandler.get = (target, key) => target[key];
        return () => globalSubs.splice(globalSubs.indexOf(localUpdater), 1);
      }

      globalSubs.splice(globalSubs.indexOf(localUpdater), 1);
      localModel.current = localTarget;
    };
  }, [model]);

  useEffect(() => onEffect.current(), []);

  return localModel.current;
};

export default useModel;
