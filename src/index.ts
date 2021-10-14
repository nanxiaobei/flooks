import { useState, useEffect, useMemo, useRef } from 'react';

type Snap = { [key: string]: any };
type Updater = (payload: Snap) => void;
type Reducer = (payload: Snap) => Snap;

type GetSnap = (model?: Model) => Snap;
type SetSnap = (payload: Snap | Reducer) => void;

export type Model = ({ get, set }: { get: GetSnap; set: SetSnap }) => Snap;
type UseModel = (model: Model) => Snap;

type Noop = () => void;
type Handler = { get: (_: any, k: string) => any; set: (_: any, k: string, v: any) => true };

const ERR_MODEL = 'model should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_OUT_MODEL = 'model passed to get() is not initialized';
const noop = () => null;
const emptyObj: any = {};
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const map: WeakMap<Model, any> = new WeakMap();

const useModel: UseModel = (model) => {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  if (__DEV__ && typeof model !== 'function') throw new Error(ERR_MODEL);

  // global model
  let [globalModel, globalSubs]: [Snap, Updater[]] = map.get(model) || [];

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
  const localModel = useRef<Snap>({});
  const localHandler = useRef<Handler>(emptyObj);
  const localData = useRef<Snap>({});

  const hasState = useRef(false);
  const [, setState] = useState({});
  const hasUpdate = useRef(false);
  const offUpdater = useRef<Noop>(noop);

  useMemo(() => {
    localHandler.current = {
      get: (_, key) => {
        const val = globalModel[key];

        if (typeof val !== 'function') {
          hasState.current = true;
          localData.current[key] = val;
          return localData.current[key];
        }

        localData.current[key] = new Proxy(val, {
          get: (fn, prop) => {
            if (prop === 'loading' && !('loading' in fn)) fn.loading = false;
            return fn[prop];
          },

          apply: (fn, __, list) => {
            const fnRes = fn(...list);
            if (!('loading' in fn) || !fnRes || typeof fnRes.then !== 'function') {
              localData.current[key] = fn;
              return fnRes;
            }

            const setLoading = (loading: boolean) => {
              localData.current[key].loading = loading;
              setState({});
            };

            localData.current[key] = (...args: any[]) => {
              const result = fn(...args);
              setLoading(true);
              return result.finally(() => setLoading(false));
            };

            setLoading(true);
            return fnRes.finally(() => setLoading(false));
          },
        });

        return localData.current[key];
      },

      set: (_, key, val) => {
        if (key in localData.current) {
          hasUpdate.current = true;
          localData.current[key] = val;
        }
        return true;
      },
    };

    localModel.current = new Proxy({}, localHandler.current);
  }, [globalModel]);

  useMemo(() => {
    const localUpdater: Updater = (payload) => {
      Object.assign(localModel.current, payload);

      if (hasUpdate.current) {
        setState({});
        hasUpdate.current = false;
      }
    };

    globalSubs.push(localUpdater);

    offUpdater.current = () => {
      globalSubs.splice(globalSubs.indexOf(localUpdater), 1);
    };
  }, [globalSubs]);

  useEffect(() => {
    if (hasState.current) {
      localHandler.current.get = (_, key) => localData.current[key];
      return offUpdater.current;
    }

    localModel.current = localData.current;
    offUpdater.current();
  }, []);

  return localModel.current;
};

export default useModel;
