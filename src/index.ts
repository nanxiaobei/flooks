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
interface GetModel {
  (modelName?: string): State | Actions;
}
interface SetState {
  (state?: State): void;
}
interface ActionsCreator {
  ({ getModel, setState }: { getModel: GetModel; setState: SetState }): Actions;
}
interface SetModel {
  (name: string, model: { state: State; actions: ActionsCreator }): void;
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
 * Set a model with model's name and the initial model
 */
export const setModel: SetModel = (name, model) => {
  let state: State;
  let actionsCreator: ActionsCreator;

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
    ({ state, actions: actionsCreator } = model);
    if (!isObject(state)) {
      throw new Error(notObject('state'));
    }
    if (typeof actionsCreator !== 'function') {
      throw new Error(notFunction('actions'));
    }
  } else {
    ({ state, actions: actionsCreator } = model);
  }

  const getModel: GetModel = (modelName = name) => {
    const { state, actions } = models[modelName];
    return { ...state, ...actions };
  };
  const setState: SetState = (payload) => {
    const { state, setters } = models[name];
    const newState = { ...state, ...payload };
    models[name].state = newState;
    setters.forEach((setter) => {
      setter(newState);
    });
  };

  const setLoading = (actionName: string, isLoading: boolean) => {
    models[name].actions[actionName].loading = isLoading;
    setState();
  };

  const actions: Actions = {};
  Object.entries(actionsCreator({ getModel, setState })).forEach(([actionName, action]) => {
    actions[actionName] = function(...args) {
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

  models[name] = { state, actions, setters: [] };
};

/**
 * Get a model with model's name
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
