import 'jsdom-global/register';
import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import useModel from './index.ts';

configure({ adapter: new Adapter() });

console.error = jest.fn((msg) => {
  if (!msg.includes('test was not wrapped in act(...)')) throw new Error(msg);
});

test('useModel', (done) => {
  const counter = ({ get, set }) => ({
    count: 0,
    open: false,
    add() {
      const { count } = get();
      set({ count: count + 1 });
    },
    async addAsync() {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const { add } = get();
      add();
    },
    toggle() {
      set((state) => ({ open: !state.open }));
    },
  });

  const error = ({ get, set }) => ({
    errPayload() {
      set([]);
    },
    errOutModel() {
      const { add } = get(counter);
      add();
      const { notExist } = get(1);
    },
  });

  const Counter = () => {
    const { count, add, addAsync } = useModel(counter);
    const { open, toggle } = useModel(counter);
    const { errPayload, errOutModel } = useModel(error);

    return (
      <>
        <p>{count}</p>
        <p>{open}</p>
        <button id="add" onClick={add} />
        <button id="addAsync" onClick={addAsync} data-loading={addAsync.loading} />
        <button id="toggle" onClick={toggle} />
        <button id="errPayload" onClick={errPayload} />
        <button id="errOutModel" onClick={errOutModel} />
      </>
    );
  };

  const wrapper = mount(<Counter />);
  const click = (el) => wrapper.find(el).simulate('click');
  const threw = (fn) => expect(fn).toThrow();

  click('#add');
  click('#addAsync');
  click('#toggle');

  threw(() => useModel());
  threw(() => click('#errPayload'));
  threw(() => click('#errOutModel'));

  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 0);
});
