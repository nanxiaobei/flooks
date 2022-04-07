import React from 'react';
import { it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import create from './index';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

it('create', async () => {
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

  const useErrStore = create(({ get, set }) => ({
    errPayload() {
      set([]);
    },
    errOutStore() {
      const { add } = get(useCounter);
      add();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
        <button onClick={add}>add</button>
        <button onClick={addAsync} data-loading={addAsync.loading}>
          addAsync
        </button>
        <button onClick={toggle}>toggle</button>
        <button onClick={errPayload}>errPayload</button>
        <button onClick={errOutStore}>errOutStore</button>
      </>
    );
  };

  render(<Counter />);

  const error = (fn: () => void) => expect(fn).toThrow();
  const click = async (btn: string) => fireEvent.click(screen.getByText(btn));

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  error(() => create());

  click('add');
  click('addAsync');
  click('addAsync');
  click('toggle');
  click('errPayload');
  click('errOutStore');
});
