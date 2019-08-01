import { useState, useEffect } from 'react';

interface State {
  [stateName: string]: any;
}
interface Actions {
  [actionName: string]: { (...args: any[]): any; loading?: boolean };
}
interface Setter {
  (state: State | ((prevState: State) => State)): void;
}
interface Models {
  [modelName: string]: { state: State; actions: Actions; setters: Setter[] };
}
interface MiddlewareStore {
  [modelName: string]: { (): void } [];
}
interface Middlewares {
  [modelName: string]: { (): void };
}
interface GetMiddlewares {
  ({ model, setState }: { model: GetModel; setState: SetState }): Middlewares;
}
interface GetModel {
  (modelName?: string): State | Actions;
}
interface SetState {
  (state?: State): void;
}
interface GetActions {
  ({ model, setState }: { model: GetModel; setState: SetState }): Actions;
}
interface SetModel {
  (name: string, model: { state: State; actions: GetActions; middlewares?: GetMiddlewares }): void;
}
interface UseModel {
  (modelName: string): State | Actions;
}

/**
 * Utils
 */
const notString = (key: string): string => `"${key}" must be a string`;
const notObject = (key: string): string => `"${key}" must be an object`;
const notFunction = (key: string): string => `"${key}" must be a function`;
const modelExist = (name: string): string => `"${name}" model already exists`;
const modelNotExist = (name: string): string => `"${name}" model dose not exist`;

const isObject = (data: any): boolean => Object.prototype.toString.call(data) === '[object Object]';

/**
 * Models' store
 */
const models: Models = {};

/**
 * Middlewares' store
 */
const middlewares: MiddlewareStore = {};

/**
 * Initialize a model
 */
export const setModel: SetModel = (name, model) => {
  let state: State;
  let getActions: GetActions;
  let getMiddlewares: GetMiddlewares;

  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string') {
      throw new Error(notString('name'));
    }
    if (name in models) {
      console.warn(modelExist(name));
      return;
    }
    if (!isObject(model)) {
      throw new Error(notObject('model'));
    }
    ({ state, actions: getActions, middlewares: getMiddlewares } = model);
    if (!isObject(state)) {
      throw new Error(notObject('state'));
    }
    if (typeof getActions !== 'function') {
      throw new Error(notFunction('actions'));
    }
    if (getMiddlewares && typeof getMiddlewares !== 'function') {
      throw new Error(notFunction('middlewares'));
    }
  } else {
    ({ state, actions: getActions, middlewares: getMiddlewares } = model);
  }

  const getModel: GetModel = (modelName = name) => {
    const { state, actions } = models[modelName];
    return { ...state, ...actions };
  };
  const setState: SetState = (payload) => {
    const { state, setters } = models[name];
    const newState = { ...state, ...payload };
    models[name].state = newState;
    (middlewares[name] || []).forEach(action => {
      action();
    });
    setters.forEach((setter) => {
      setter(newState);
    });
  };

  const setLoading = (actionName: string, isLoading: boolean) => {
    models[name].actions[actionName].loading = isLoading;
    setState();
  };

  const oldActions = getActions({ model: getModel, setState });
  const newActions: Actions = {};
  Object.entries(oldActions).forEach(([actionName, action]) => {
    newActions[actionName] = function(...args) {
      const res = action(...args);
      if (!res || typeof res.then !== 'function') return res;
      setLoading(actionName, true);
      return new Promise((resolve, reject) => {
        res
          .then(resolve)
          .catch(reject)
          .finally(() => {
            setLoading(actionName, false);
          });
      });
    };
  });

  if (getMiddlewares) {
    Object.entries(getMiddlewares({ model: getModel, setState }))
      .forEach(([modelName, action]) => {
      const oldMiddlewares = middlewares[modelName] || [];
      middlewares[modelName] = [...oldMiddlewares, action];
    });
  }

  models[name] = { state, actions: newActions, setters: [] };
};

/**
 * Returns the initialized model
 */
export const useModel: UseModel = (name) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string') {
      throw new Error(notString('name'));
    }
    if (!(name in models)) {
      throw new Error(modelNotExist(name));
    }
  }

  const [, setState] = useState();
  const { state, actions, setters } = models[name];
  useEffect(() => {
    const index = setters.length;
    setters.push(setState);
    return () => {
      setters.splice(index, 1);
    };
  }, [setters]);
  return { ...state, ...actions };
};
