import { useCallback, useMemo, useReducer, useRef } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

let batchUpdate = (callback: () => void) => {
  callback();
};
const __DEV__ = process.env.NODE_ENV !== 'production';

type Obj = Record<string, any>;
type Setter<T> = (partial: Partial<T>) => void;
type Payload<T> = Partial<T> | ((prevState: T) => Partial<T>);

type Store<T> = {
  (): T;
  (payload: Payload<T>): void;
};
type InitObj<T> = (store: Store<T>) => T;

const create = <T extends Obj>(initObj: InitObj<T>): (() => T) => {
  if (__DEV__ && typeof initObj !== 'function') {
    throw new Error('Expected a function');
  }

  let state = {} as T;
  const setters = new Set<Setter<T>>();

  function store(payload?: Payload<T>) {
    // get state
    if (typeof payload === 'undefined') {
      return state;
    }

    // set state
    batchUpdate(() => {
      const newState = typeof payload === 'function' ? payload(state) : payload;
      state = { ...state, ...newState };
      setters.forEach((setter) => setter(newState));
    });
  }

  type K = keyof T;

  const obj = initObj(store as Store<T>);

  Object.keys(obj).forEach((key: K) => {
    const value = obj[key];
    if (typeof value !== 'function') {
      state[key] = value;
    }
  });

  return function useStore() {
    const proxy = useRef<T>({} as T);
    const [, dispatch] = useReducer((s) => ++s, 0);

    // component level data
    const stateDeps = useRef<Set<K>>();
    stateDeps.current = new Set();
    const actions = useRef<T>({} as T);

    // init proxy
    useMemo(() => {
      proxy.current = new Proxy({} as T, {
        get(_target, p) {
          const key = p as K;

          if (key in state) {
            stateDeps.current!.add(key);
            return state[key];
          }

          if (key in actions.current) {
            return actions.current[key];
          }

          // action utils
          const keyGetter = (fnTarget: T[K], fnKey: string) => {
            if (fnKey === 'loading' && !('loading' in fnTarget)) {
              fnTarget.loading = false;
            }
            return fnTarget[fnKey];
          };

          const addLoading = (fnTarget: T[K]) => {
            if ('loading' in fnTarget) {
              actions.current[key].loading = true;
              dispatch();
              setTimeout(() => {
                actions.current[key].loading = false;
              });
            }
          };

          // init actions.current
          const rawFn = obj[key];
          const fakeFn = (() => {}) as T[K];

          actions.current[key] = new Proxy(fakeFn, {
            get: keyGetter,
            apply: async (fnTarget: T[K], _this, args) => {
              addLoading(fnTarget);
              const res = rawFn(...args);

              if (typeof res?.then !== 'function') {
                actions.current[key] = rawFn;
                return res;
              }

              actions.current[key] = new Proxy(fakeFn, {
                get: keyGetter,
                apply: async (newFnTarget: T[K], _newThis, newArgs) => {
                  addLoading(newFnTarget);
                  return rawFn(...newArgs);
                },
              });

              return res;
            },
          });

          return actions.current[key];
        },
      });
    }, []);

    // set useSyncExternalStore
    const subscribe = useCallback((triggerUpdate: () => void) => {
      const setter = (newState: Partial<T>) => {
        for (const key of stateDeps.current!) {
          if (key in newState) {
            triggerUpdate();
            return;
          }
        }
      };

      setters.add(setter);
      return () => {
        setters.delete(setter);
      };
    }, []);

    const getSnapshot = useCallback(() => {
      return state;
    }, []);

    useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    // return proxy
    return proxy.current;
  };
};

create.config = ({ batch }: { batch: typeof batchUpdate }) => {
  batchUpdate = batch;
};

export default create;
