import ReactDOM from 'react-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

const ERR_INIT = 'initStore should be a function';
const ERR_PAYLOAD = 'payload should be an object or a function';
const ERR_OUT_STORE = 'useOutStore passed to get() is not initialized';

const run = (fn: () => void) => fn();
const batch = ReactDOM.unstable_batchedUpdates || /* c8 ignore next */ run;
const __DEV__ = process.env.NODE_ENV !== 'production';
const obj = (x: any) => Object.prototype.toString.call(x) === '[object Object]';

const map = new WeakMap();

type State = Record<string, any>;
type Listener<T> = (payload: Partial<T>) => void;
type GetStore<T> = <U = T>(useOutStore?: () => U) => U;
type SetStore<T> = (payload: Partial<T> | ((prev: T) => Partial<T>)) => void;
type InitStore<T> = ({ get, set }: { get: GetStore<T>; set: SetStore<T> }) => T;
type UseStore<T> = () => T;

function create<T extends State>(initStore: InitStore<T>): UseStore<T> {
  if (__DEV__ && typeof initStore !== 'function') throw new Error(ERR_INIT);

  const listeners = new Set<Listener<T>>();

  let store = initStore({
    get(useOutStore) {
      if (typeof useOutStore === 'undefined') return store;
      const outStore = map.get(useOutStore);
      if (__DEV__ && !outStore) throw new Error(ERR_OUT_STORE);
      return outStore;
    },
    set(payload) {
      if (typeof payload === 'function') {
        payload = payload(store);
      } else if (__DEV__ && !obj(payload)) {
        throw new Error(ERR_PAYLOAD);
      }
      store = { ...store, ...payload };
      batch(() => {
        listeners.forEach((listener) => listener(payload as Partial<T>));
      });
    },
  });

  const useStore = () => {
    const proxy = useRef<T>({} as T);
    const handler = useRef<ProxyHandler<T>>({});
    const hasState = useRef(false);
    const hasUpdate = useRef(false);
    const [, setState] = useState(false);

    useMemo(() => {
      handler.current = {
        get(target: T, key: keyof T) {
          const val = store[key];

          if (typeof val !== 'function') {
            hasState.current = true;
            target[key] = val;
            return target[key];
          }

          target[key] = new Proxy(val, {
            get: (fn: any, fnKey) => {
              if (fnKey === 'loading' && !('loading' in fn)) {
                fn.loading = false;
              }
              return fn[fnKey];
            },

            apply: (fn, _this, args) => {
              const res = fn(...args);
              if (
                !('loading' in fn) ||
                !res ||
                typeof res.then !== 'function'
              ) {
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
            hasUpdate.current = true;
            target[key] = val;
          }
          return true;
        },
      } as ProxyHandler<T>;

      proxy.current = new Proxy({} as T, handler.current);
    }, []);

    useEffect(() => {
      handler.current.get = (target: T, key: string) => target[key];
    }, []);

    const subscribe = useCallback((update: () => void) => {
      if (!hasState.current) return () => undefined;

      const listener: Listener<T> = (payload) => {
        Object.assign(proxy.current, payload);
        if (hasUpdate.current) {
          hasUpdate.current = false;
          update();
        }
      };
      listeners.add(listener);
      return () => listeners.delete(listener);
    }, []);

    const getSnapshot = useCallback(() => store, []);

    useSyncExternalStore(subscribe, getSnapshot);

    return proxy.current;
  };

  map.set(useStore, store);
  return useStore;
}

export default create;
