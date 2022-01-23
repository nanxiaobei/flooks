import { useState, useEffect, useRef } from 'react';

const ERR_INIT_STORE = 'initStore should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_USE_OUT_STORE = 'useOutStore passed to get() is not initialized';

const EMPTY_OBJ = {};
const NOOP = () => undefined;
const __DEV__ = process.env.NODE_ENV !== 'production';
const notObj = (val: any) => Object.prototype.toString.call(val) !== '[object Object]';

const map = new WeakMap();

type State = { [key: string]: any };
type GetStore<T> = <U = T>(useOutStore?: () => U) => U;
type SetStore<T> = (partialState: Partial<T> | ((prevState: T) => Partial<T>)) => void;
type InitStore<T> = ({ get, set }: { get: GetStore<T>; set: SetStore<T> }) => T;
type UseStore<T> = () => T;

function create<T extends State>(initStore: InitStore<T>): UseStore<T> {
  if (__DEV__ && typeof initStore !== 'function') throw new Error(ERR_INIT_STORE);

  const listeners: ((partialState: Partial<T>) => void)[] = [];

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
      Object.assign(store, payload as Partial<T>);
      listeners.forEach((listener) => listener(payload as Partial<T>));
    },
  });

  const useStore = () => {
    const proxy = useRef<T>(EMPTY_OBJ as T);
    const onMount = useRef<() => void>(NOOP);

    const [, setState] = useState(() => {
      let hasVal = false;
      let hasUpdate = false;

      const handler = {
        get(target: T, key: keyof T) {
          const val = store[key];

          if (typeof val !== 'function') {
            hasVal = true;
            target[key] = val;
            return target[key];
          }

          target[key] = new Proxy(val, {
            get: (fn: any, fnKey) => {
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

              target[key] = ((...newArgs: any[]) => {
                const newRes = fn(...newArgs);
                setLoading(true);
                return newRes.finally(() => setLoading(false));
              }) as T[keyof T];

              setLoading(true);
              return res.finally(() => setLoading(false));
            },
          });

          return target[key];
        },

        set(target: T, key: keyof T, val: T[keyof T]) {
          if (key in target && val !== target[key]) {
            hasUpdate = true;
            target[key] = val;
          }
          return true;
        },
      };

      proxy.current = new Proxy({} as T, handler as ProxyHandler<T>);

      const listener = (partialState: Partial<T>) => {
        Object.assign(proxy.current, partialState);
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

    return proxy.current;
  };

  map.set(useStore, store);
  return useStore;
}

export default create;
