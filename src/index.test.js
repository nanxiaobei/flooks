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
  // "production" start
  const model = {
    state: {
      count: 0,
    },
    actions: ({ model, setState }) => ({
      showError() {
        setState();
      },
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
    const { count, showError, increase, increaseAsync } = useModel('counter');
    return (
      <>
        <p>{count}</p>
        <button className="show-error" onClick={showError}>
          show error
        </button>
        <button className="increase" onClick={increase}>
          +1
        </button>
        <button className="increase-async" onClick={increaseAsync}>
          +1 async{increaseAsync.loading && '...'}
        </button>
      </>
    );
  }
  const wrapper = mount(<Counter />);
  wrapper.find('.show-error').simulate('click');
  process.env.NODE_ENV = 'test';
  // "production" end

  expect(() => {
    wrapper.find('.show-error').simulate('click');
  }).toThrow();
  wrapper.find('.increase').simulate('click');
  wrapper.find('.increase-async').simulate('click');
  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
