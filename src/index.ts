import { useState, useEffect, useMemo, useRef } from 'react';

type Snap = { [key: string]: any };
type Updater = (payload: Snap) => void;
type Reducer = (payload: Snap) => Snap;

type GetSnap = (model?: Model) => Snap;
type SetSnap = (payload: Snap | Reducer) => void;

export type Model = ({ get, set }: { get: GetSnap; set: SetSnap }) => Snap;
type UseModel = (model: Model) => Snap;

const ERR_MODEL = 'model should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_OUT_MODEL = 'model passed to get() is not initialized';
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const map: WeakMap<Model, any> = new WeakMap();

const useModel: UseModel = (model) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  if (__DEV__ && typeof model !== 'function') throw new Error(ERR_MODEL);

  // global model
  let [modelData, modelSubs]: [Snap, Updater[]] = map.get(model) || [];

  if (!modelData) {
    const get: GetSnap = (outModel) => {
      if (typeof outModel === 'undefined') return modelData;

      const outData = map.get(outModel)?.[0];
      if (__DEV__ && !outData) throw new Error(ERR_OUT_MODEL);
      return outData;
    };

    const set: SetSnap = (payload) => {
      if (typeof payload === 'function') {
        payload = payload(modelData);
      } else if (__DEV__ && notObj(payload)) {
        throw new Error(ERR_PAYLOAD);
      }

      Object.assign(modelData, payload);
      modelSubs.forEach((updater) => updater(payload));
    };

    modelData = model({ get, set });
    modelSubs = [];
    map.set(model, [modelData, modelSubs]);
  }

  // local model
  const resData = useRef<Snap>({});

  const hasState = useRef(false);
  const hasUpdate = useRef(false);
  const [, setState] = useState({});

  useMemo(() => {
    const state: Snap = {};
    const actions: Snap = {};

    resData.current = new Proxy(
      {},
      {
        get: (_, key: string) => {
          if (key in actions) return actions[key];

          const val = modelData[key];
          if (key in state) return val;

          if (typeof val !== 'function') {
            hasState.current = true;
            state[key] = val;
            return val;
          }

          actions[key] = new Proxy(val, {
            get: (fn, prop) => {
              if (prop === 'loading' && !('loading' in fn)) fn.loading = false;
              return fn[prop];
            },
            apply: (fn, that, list) => {
              const res = fn.apply(that, list);
              if (!('loading' in fn) || !res || typeof res.then !== 'function') {
                actions[key] = fn;
                return res;
              }

              const setLoading = (loading: boolean) => {
                actions[key].loading = loading;
                setState({});
              };

              actions[key] = (...args: any[]) => {
                const result = fn(...args);
                setLoading(true);
                return result.finally(() => setLoading(false));
              };

              setLoading(true);
              return res.finally(() => setLoading(false));
            },
          });

          return actions[key];
        },
        set: (_, key: string) => {
          if (!hasUpdate.current && key in state) hasUpdate.current = true;
          return true;
        },
      }
    );
  }, [modelData]);

  useEffect(() => {
    if (!hasState.current) return;

    const updater: Updater = (payload) => {
      Object.assign(resData.current, payload);
      if (hasUpdate.current) {
        hasUpdate.current = false;
        setState({});
      }
    };

    modelSubs.push(updater);
    return () => {
      modelSubs.splice(modelSubs.indexOf(updater), 1);
    };
  }, [modelSubs]);

  return resData.current;
};

export default useModel;
