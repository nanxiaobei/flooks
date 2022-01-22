import { useState, useEffect, useRef } from 'react';

type State = { [key: string]: any };
type Listener = (newState: State) => void;
type Handler = { get: (t: State, k: string) => any; set: (t: State, k: string, v: any) => true };

type GetStore = (useOutStore?: () => State) => State | undefined;
type SetStore = (payload: State | ((prevState: State) => State)) => void;
type InitStore = ({ get, set }: { get: GetStore; set: SetStore }) => State;

const ERR_INIT_STORE = 'initStore should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_USE_OUT_STORE = 'useOutStore passed to get() is not initialized';

const __DEV__ = process.env.NODE_ENV !== 'production';
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const map: WeakMap<() => State, State> = new WeakMap();

function create(initStore: InitStore): () => State;

function create(initStore: InitStore) {
  if (__DEV__ && typeof initStore !== 'function') throw new Error(ERR_INIT_STORE);

  const listeners: Listener[] = [];

  const store = initStore({
    get(useOutStore) {
      if (typeof useOutStore === 'undefined') return store;
      const outStore = map.get(useOutStore);
      if (__DEV__ && !outStore) throw new Error(ERR_USE_OUT_STORE);
      return outStore;
    },
    set(payload) {
      if (typeof payload === 'function') {
        payload = payload(store);
      } else if (__DEV__ && notObj(payload)) {
        throw new Error(ERR_PAYLOAD);
      }
      Object.assign(store, payload);
      listeners.forEach((listener) => listener(payload));
    },
  });

  const useStore = () => {
    const piece = useRef<any>();
    const onMount = useRef<any>();

    const [, setState] = useState(() => {
      let hasVal = false;
      let hasUpdate = false;

      const handler: Handler = {
        get(target, key) {
          const val = store[key];

          if (typeof val !== 'function') {
            hasVal = true;
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

        set(target, key, val) {
          if (key in target && val !== target[key]) {
            hasUpdate = true;
            target[key] = val;
          }
          return true;
        },
      };

      piece.current = new Proxy({}, handler);

      const listener: Listener = (newState) => {
        Object.assign(piece.current, newState);
        if (hasUpdate) {
          hasUpdate = false;
          setState((s) => !s);
        }
      };
      listeners.push(listener);
      const unsubscribe = () => {
        listeners.splice(listeners.indexOf(listener), 1);
      };

      onMount.current = () => {
        handler.get = (target, key) => target[key];
        return hasVal ? unsubscribe : unsubscribe();
      };

      return false;
    });

    useEffect(() => onMount.current(), []);
    return piece.current;
  };

  map.set(useStore, store);
  return useStore;
}

export default create;
