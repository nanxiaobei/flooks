import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { setModel, useModel } from './index';

configure({ adapter: new Adapter() });

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (args[0].includes('Warning: An update to %s inside a test was not wrapped in act')) return;
    console.error(...args);
  });
});

test('setModel', () => {
  expect(() => {
    setModel();
  }).toThrow();

  const warn = jest.spyOn(console, 'warn');
  const model = { state: {}, actions: () => ({}) };
  setModel('exist', model);
  setModel('exist', model);
  expect(warn).toBeCalled();

  expect(() => {
    setModel('modelType');
  }).toThrow();

  expect(() => {
    setModel('modelKeysType', {});
  }).toThrow();

  expect(() => {
    setModel('modelKeysType', { state: {} });
  }).toThrow();
});

test('useModel', () => {
  expect(() => {
    useModel();
  }).toThrow();

  expect(() => {
    useModel('modelNotExist');
  }).toThrow();
});

test('component', (done) => {
  process.env.NODE_ENV = 'production';
  const model = {
    state: {
      count: 0,
    },
    actions: ({ model, setState }) => ({
      increase() {
        const { count } = model();
        setState({ count: count + 1 });
      },
      async increaseAsync() {
        const { increase } = model();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        increase();
      },
    }),
  };
  setModel('counter', model);
  function Counter() {
    const { count, increase, increaseAsync } = useModel('counter');
    return (
      <>
        <p>{count}</p>
        <button className="increase" onClick={increase}>
          +1
        </button>
        <button className="increase-async" onClick={increaseAsync}>
          +1 Async{increaseAsync.loading && '...'}
        </button>
      </>
    );
  }
  const wrapper = mount(<Counter />);
  process.env.NODE_ENV = 'test';

  wrapper.find('.increase').simulate('click');
  wrapper.find('.increase-async').simulate('click');
  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});

test('invalidMiddleware', () => {
  const invalidMiddleware = { state: {}, actions: () => ({}), middlewares: {} };

  expect(() => {
    setModel('invalidMiddleware', invalidMiddleware);
  }).toThrow();
});

test('middleware', (done) => {
  const modelCount1 = {
    state: { count1: 0 },
    actions: ({ model, setState }) => ({
      increase() {
        const { count1 } = model();
        setState({ count1: count1 + 1 });
      },
    }),
  };
  const modelCount2 = {
    state: { count2: 0 },
    actions: () => ({}),
    middlewares: ({ model, setState }) => ({
      count1: (state, prevState) => {
        if (state.count1 !== prevState.count1) {
          const { count2 } = model();
          setState({ count2: count2 + 1 });
        }
      },
    }),
  };
  const modelCount3 = {
    state: { count3: 0 },
    actions: () => ({}),
    middlewares: ({ model, setState }) => ({
      count1: (state, prevState) => {
        if (state.count1 !== prevState.count1) {
          const { count3 } = model();
          setState({ count3: count3 + 1 });
        }
      },
      count2: (state, prevState) => {
        if (state.count2 !== prevState.count2) {
          const { count3 } = model();
          setState({ count3: count3 + 1 });
        }
      },
    }),
  };

  setModel('count1', modelCount1);
  setModel('count2', modelCount2);
  setModel('count3', modelCount3);

  function Counter() {
    const { count1, increase } = useModel('count1');
    const { count2 } = useModel('count2');
    const { count3 } = useModel('count3');
    return (
      <>
        <p id="count1">{count1}</p>
        <p id="count2">{count2}</p>
        <p id="count3">{count3}</p>
        <button className="increase" onClick={increase}>
          +1
        </button>
      </>
    );
  }
  const wrapper = mount(<Counter />);

  wrapper.find('.increase').simulate('click');

  setTimeout(() => {
    expect(wrapper.find('#count1').text()).toBe('1');
    expect(wrapper.find('#count2').text()).toBe('1');
    expect(wrapper.find('#count3').text()).toBe('2');
    wrapper.unmount();
    done();
  }, 100);
});
