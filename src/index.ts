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
  (state: State): void;
}
interface GetActions {
  ({ model, setState }: { model: GetModel; setState: SetState }): Actions;
}
interface SetModel {
  (name: string, model: { state: State; actions: GetActions }): void;
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
 * Initialized models
 */
const models: Models = {};

/**
 * Initialize a model
 */
export const setModel: SetModel = (name, model) => {
  let state;
  let getActions;

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
    ({ state, actions: getActions } = model);
    if (!isObject(state)) {
      throw new Error(notObject('state'));
    }
    if (typeof getActions !== 'function') {
      throw new Error(notFunction('actions'));
    }
  } else {
    ({ state, actions: getActions } = model);
  }

  const getModel = (modelName = name) => {
    const { state, actions } = models[modelName];
    return { ...state, ...actions };
  };
  const setState: SetState = (payload) => {
    if (process.env.NODE_ENV !== 'production') {
      if (!isObject(payload)) {
        throw new Error(notObject('payload'));
      }
    }
    const { state, setters } = models[name];
    const newState = { ...state, ...payload };
    models[name].state = newState;
    setters.forEach((setter) => {
      setter(newState);
    });
  };

  const actions: Actions = {};
  const setLoading = (actionName: string, showLoading: boolean) => {
    actions[actionName].loading = showLoading;
    setState({});
  };

  const rawActions = getActions({ model: getModel, setState });
  Object.entries(rawActions).forEach(([actionName, rawAction]) => {
    actions[actionName] = (...args) => {
      const res = rawAction(...args);
      if (!res || typeof res.then !== 'function') return res;
      return new Promise((resolve, reject) => {
        setLoading(actionName, true);
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
 * Use a initialized model
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
