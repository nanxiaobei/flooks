import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

let run = (fn: () => void) => fn();
const __DEV__ = process.env.NODE_ENV !== 'production';

type State = Record<string, any>;
type GetSetStore<T> = {
  (): T;
  (s: Partial<T> | ((state: T) => Partial<T>)): void;
};
type InitStore<T> = (getSetStore: GetSetStore<T>) => T;

const create = <T extends State>(initStore: InitStore<T>): (() => T) => {
  if (__DEV__ && typeof initStore !== 'function') {
    throw new Error('Expected a function');
  }

  let store: T;
  const listeners = new Set<(partial: Partial<T>) => void>();

  function getSetStore(s?: unknown) {
    if (typeof s === 'undefined') return store;
    const partial = typeof s === 'function' ? s(store) : s;
    store = { ...store, ...partial };
    run(() => listeners.forEach((listener) => listener(partial)));
  }

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

              target[key] = ((...newArgs: unknown[]) => {
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

      const listener = (partial: Partial<T>) => {
        Object.assign(proxy.current, partial);
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
};

create.config = ({ batch }: { batch: () => void }) => {
  run = batch;
};

export default create;
