import 'jsdom-global/register';
import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { renderHook } from '@testing-library/react-hooks';
import create from './index.ts';

configure({ adapter: new Adapter() });

console.error = jest.fn((msg) => {
  if (msg.includes('test was not wrapped in act(...)')) return;
  throw new Error(msg);
});

test('create', (done) => {
  const useCounter = create(({ get, set }) => ({
    count: 0,
    open: false,
    add() {
      const { count } = get();
      set({ count: count + 1 });
    },
    async addAsync() {
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      const { add } = get();
      add();
    },
    toggle() {
      set((state) => ({ open: !state.open }));
    },
  }));

  const useErrStore = create(({ get, set }) => ({
    errPayload() {
      set([]);
    },
    errOutStore() {
      const { add } = get(useCounter);
      add();
      const { notExist } = get(1);
    },
  }));

  const Counter = () => {
    const { count, add, addAsync } = useCounter();
    const { open, toggle } = useCounter();
    const { errPayload, errOutStore } = useErrStore();

    return (
      <>
        <p>{count}</p>
        <p>{open}</p>
        <button id="add" onClick={add} />
        <button id="addAsync" onClick={addAsync} data-loading={addAsync.loading} />
        <button id="toggle" onClick={toggle} />
        <button id="errPayload" onClick={errPayload} />
        <button id="errOutStore" onClick={errOutStore} />
      </>
    );
  };

  const wrapper = mount(<Counter />);
  const error = (fn) => expect(fn).toThrow();
  const click = (el) => wrapper.find(el).simulate('click');

  click('#add');
  click('#addAsync');
  click('#addAsync');
  click('#toggle');
  error(() => create());
  error(() => click('#errPayload'));
  error(() => click('#errOutStore'));

  const useOldStyle = () => create(() => ({}));
  renderHook(useOldStyle);

  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 0);
});
