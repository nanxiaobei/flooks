import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { now, use } from './index';

configure({ adapter: new Adapter() });

console.error = jest.fn((msg) => {
  if (!msg.includes('test was not wrapped in act(...)')) throw new Error(msg);
});

const runProdEnv = (fn) => {
  process.env.NODE_ENV = 'production';
  fn();
  process.env.NODE_ENV = 'test';
};

test('now', () => {
  expect(() => {
    now();
  }).toThrow();
});

test('use', () => {
  expect(() => {
    use();
  }).toThrow();

  runProdEnv(() => {
    expect(() => {
      use();
    }).toThrow();
  });
});

test('render', (done) => {
  const useCounter = use({
    count: 0,
    add() {
      const { count } = now();
      now({ count: count + 1 });
    },
    async addAsync() {
      const { add } = now();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      add();
    },
  });
  const useOuter = use({
    addOutErr() {
      const { add } = useCounter();
      add();
      now([]);
    },
  });

  function Counter() {
    const { count } = useCounter('count');
    const { add, addAsync } = useCounter();
    const { addOutErr } = useOuter('addOutErr');
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
  runProdEnv(() => {
    wrapper.find('#addAsync').simulate('click');
  });
  expect(() => {
    wrapper.find('#addOutErr').simulate('click');
  }).toThrow();

  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 1000);
});
