import React from 'react';
import { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import use from './index';

configure({ adapter: new Adapter() });

console.error = jest.fn((msg) => {
  if (!msg.includes('test was not wrapped in act(...)')) throw new Error(msg);
});

const withoutCheck = (fn) => {
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
  withoutCheck(() => {
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
      await new Promise((resolve) => setTimeout(resolve, 0));
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

  const ErrKeys = () => {
    useCounter({});
    return null;
  };
  expect(() => {
    shallow(<ErrKeys />);
  }).toThrow();

  const Counter = () => {
    const { count } = useCounter(['count']);
    const { add, addAsync } = useCounter([]);
    const { addOutErr } = useOuter();
    return (
      <>
        <p>{count}</p>
        <button id="add" onClick={add} />
        <button id="addAsync" onClick={addAsync} />
        <button id="addOutErr" onClick={addOutErr} />
      </>
    );
  };
  const wrapper = mount(<Counter />);

  wrapper.find('#add').simulate('click');
  withoutCheck(() => {
    wrapper.find('#addAsync').simulate('click');
  });
  expect(() => {
    wrapper.find('#addOutErr').simulate('click');
  }).toThrow();

  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 0);
});
