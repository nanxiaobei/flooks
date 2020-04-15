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
export interface Model {
  state: State;
  actions: GetActions;
}
interface SetModel {
  (name: string, model: Model): void;
}
interface UseModel {
  (modelName: string, onlyActions?: boolean): State | Actions;
}

/**
 * Utils
 */
const notBoolean = (key: string): string => `"${key}" must be a boolean`;
const notString = (key: string): string => `"${key}" must be a string`;
const notObject = (key: string): string => `"${key}" must be an object`;
const notFunction = (key: string): string => `"${key}" must be a function`;
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
  let initialState;
  let getActions;

  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string') {
      throw new Error(notString('name'));
    }
    if (name in models) return;

    if (!isObject(model)) {
      throw new Error(notObject('model'));
    }
    ({ state: initialState, actions: getActions } = model);
    if (!isObject(initialState)) {
      throw new Error(notObject('state'));
    }
    if (typeof getActions !== 'function') {
      throw new Error(notFunction('actions'));
    }
  } else {
    if (name in models) return;
    ({ state: initialState, actions: getActions } = model);
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

  models[name] = { state: initialState, actions, setters: [] };
};

/**
 * Use a initialized model
 */
export const useModel: UseModel = (name, onlyActions) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof name !== 'string') {
      throw new Error(notString('name'));
    }
    if (typeof onlyActions !== 'undefined' && typeof onlyActions !== 'boolean') {
      throw new Error(notBoolean('onlyActions'));
    }
    if (!(name in models)) {
      throw new Error(modelNotExist(name));
    }
  }

  const [, setState] = useState();
  const { state, actions, setters } = models[name];
  useEffect(() => {
    if (onlyActions) return undefined;
    setters.push(setState);
    return () => {
      const index = setters.indexOf(setState);
      setters.splice(index, 1);
    };
  }, [setters]);
  return { ...state, ...actions };
};


/**
 * Get a initialized model outside component
 */
export const getModel: GetModel = (modelName) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof modelName !== 'string') {
      throw new Error(notString('modelName'));
    }
    if (!(modelName in models)) {
      throw new Error(modelNotExist(modelName));
    }
  }

  const { state, actions } = models[modelName || ''];
  return { ...state, ...actions };
};