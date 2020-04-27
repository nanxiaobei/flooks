import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import use from './index';

configure({ adapter: new Adapter() });

console.error = jest.fn((msg) => {
  if (!msg.includes('test was not wrapped in act(...)')) throw new Error(msg);
});

const runNoCheck = (fn) => {
  process.env.NODE_ENV = 'production';
  fn();
  process.env.NODE_ENV = 'test';
};

test('use', () => {
  expect(() => {
    use();
  }).toThrow();
  expect(() => {
    use([]);
  }).toThrow();
  runNoCheck(() => {
    use();
  });
});

test('render', (done) => {
  const counter = use({
    count: 0,
    add() {
      const { count } = use();
      use({ count: count + 1 });
    },
    async addAsync() {
      const { add } = use();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      add();
    },
  });
  const outer = use({
    addOutErr() {
      const { add } = counter();
      add();
      use([]);
    },
  });
  const useCounter = counter;
  const useOuter = outer;

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
  runNoCheck(() => {
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
