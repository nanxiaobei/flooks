import ReactDOM from 'react-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

const run = (fn: () => void) => fn();
const batch = ReactDOM.unstable_batchedUpdates || /* c8 ignore next */ run;
const __DEV__ = process.env.NODE_ENV !== 'production';

type State = Record<string, any>;
type Listener<T> = (payload: Partial<T>) => void;
interface GetSetStore<T> {
  (): T;
  (payload: Partial<T> | ((prev: T) => Partial<T>)): void;
}
type InitStore<T> = (store: GetSetStore<T>) => T;
type UseStore<T> = () => T;

function create<T extends State>(initStore: InitStore<T>): UseStore<T> {
  if (__DEV__ && typeof initStore !== 'function') {
    throw new Error('Expected a function');
  }

  let store: T;
  const listeners = new Set<Listener<T>>();

  const getSetStore: any = (next: unknown) => {
    if (typeof next === 'undefined') return store;
    const partial = typeof next === 'function' ? next(store) : next;
    store = { ...store, ...partial };
    batch(() => listeners.forEach((listener) => listener(partial)));
  };

  /* c8 ignore start */
  getSetStore.get = () => {
    console.error(
      'get() is deprecated since v6, upgrade: https://github.com/nanxiaobei/flooks'
    );
    return {};
  };
  getSetStore.set = () => {
    console.error(
      'set() is deprecated since v6, upgrade: https://github.com/nanxiaobei/flooks'
    );
  };
  /* c8 ignore stop */

  store = initStore(getSetStore as GetSetStore<T>);

  return function useStore() {
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
}

export default create;
