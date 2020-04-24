import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { use, get, set } from './index';

configure({ adapter: new Adapter() });

const mockConsole = (msg) => {
  if (!msg.includes('test was not wrapped in act(...)')) throw new Error(msg);
};
console.error = jest.fn(mockConsole);

const devProdEnv = (fn) => {
  fn();
  process.env.NODE_ENV = 'production';
  fn();
  process.env.NODE_ENV = 'test';
};

test('get', () => {
  expect(() => {
    get();
  }).toThrow();
});

test('set', () => {
  devProdEnv(() => {
    expect(() => {
      set();
    }).toThrow();
  });
});

test('use', () => {
  devProdEnv(() => {
    expect(() => {
      use();
    }).toThrow();
  });
});

test('render', (done) => {
  const useCounter = use({
    count: 0,
    add() {
      const { count } = get();
      set({ count: count + 1 });
    },
    async addAsync() {
      const { add } = get();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      add();
    },
  });
  const useOutErr = use({
    addOutErr() {
      const { add } = useCounter();
      add();
      set();
    },
  });

  function Counter() {
    const { count } = useCounter('count');
    const { add, addAsync } = useCounter();
    const { addOutErr } = useOutErr('addOutErr');
    return (
      <>
        <p>{count}</p>
        <button id="add" onClick={add} />
        <button id="addAsync" onClick={addAsync} />
        <button id="addOutErr" onClick={addOutErr} />
      </>
    );
  }

  const wrapper = mount(<Counter />);

  wrapper.find('#add').simulate('click');
  wrapper.find('#addAsync').simulate('click');
  expect(() => {
    wrapper.find('#addOutErr').simulate('click');
  }).toThrow();

  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
