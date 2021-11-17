import 'jsdom-global/register';
import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import create from './index.ts';

configure({ adapter: new Adapter() });

console.error = jest.fn((msg) => {
  if (!msg.includes('test was not wrapped in act(...)')) throw new Error(msg);
});

const error = (fn) => expect(fn).toThrow();
const click = (wrapper, el) => wrapper.find(el).simulate('click');

test('create', (done) => {
  const useCounter = create(({ get, set }) => ({
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
  }));

  const useErrModel = create(({ get, set }) => ({
    errPayload() {
      set([]);
    },
    errOutModel() {
      const { add } = get(useCounter);
      add();
      const { notExist } = get(1);
    },
  }));

  const Counter = () => {
    const { count, add, addAsync } = useCounter();
    const { open, toggle } = useCounter();
    const { errPayload, errOutModel } = useErrModel();

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

  click(wrapper, '#add');
  click(wrapper, '#addAsync');
  click(wrapper, '#addAsync');
  click(wrapper, '#toggle');

  error(() => create());
  error(() => click(wrapper, '#errPayload'));
  error(() => click(wrapper, '#errOutModel'));

  setTimeout(() => {
    wrapper.unmount();
    done();
  }, 0);
});
