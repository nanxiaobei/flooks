import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createModel, useModel } from './index';

configure({ adapter: new Adapter() });

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (args[0].includes('Warning: An update to %s inside a test was not wrapped in act')) return;
    console.error(...args);
  });
});

test('createModel', () => {
  expect(() => {
    createModel();
  }).toThrow();
  expect(() => {
    createModel({});
  }).toThrow();
  const warn = jest.spyOn(console, 'warn');
  const model = { name: 'exist', state: {}, actions: () => ({}) };
  createModel(model);
  createModel(model);
  expect(warn).toBeCalled();
});

test('useModel', () => {
  expect(() => {
    useModel();
  }).toThrow();
  expect(() => {
    useModel('test');
  }).toThrow();
});

test('component', (done) => {
  createModel({
    name: 'counter',
    state: {
      count: 0,
    },
    actions: ({ getModel, setState }) => ({
      increase() {
        const { count } = getModel();
        setState({ count: count + 1 });
      },
      async increaseAsync() {
        const { increase } = getModel();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        increase();
      },
    }),
  });

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
  wrapper.find('.increase').simulate('click');
  wrapper.find('.increase-async').simulate('click');
  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
