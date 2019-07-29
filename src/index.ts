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
interface CreateModel {
  (model: {
    name: string;
    state: State;
    actions: ({ getModel, setState }: { getModel: GetModel; setState: SetState }) => Actions;
  }): void;
}
interface UseModel {
  (modelName: string): State | Actions;
}

const isObject = (obj: any) => Object.prototype.toString.call(obj) === '[object Object]';

const models: Models = {};

export const createModel: CreateModel = (model) => {
  if (!isObject(model)) {
    throw new Error('"model" must be an object');
  }
  const { name, state, actions: actionsCreator } = model;
  if (typeof name !== 'string' || !isObject(state) || typeof actionsCreator !== 'function') {
    throw new Error('"model" must be { name: string, state: object, actions: function }');
  }
  if (name in models) {
    console.warn(`"${name}" model already exists`);
    return;
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

export const useModel: UseModel = (name) => {
  if (typeof name !== 'string') {
    throw new Error('"name" must be a string');
  }
  if (!(name in models)) {
    throw new Error(`"${name}" model dose not exist`);
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
