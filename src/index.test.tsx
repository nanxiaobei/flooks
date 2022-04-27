import React from 'react';
import { it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import create from './index';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

it('create', async () => {
  const useCounter = create((store) => ({
    count: 0,
    add() {
      const { count } = store();
      store({ count: count + 1 });
    },
    async addAsync() {
      await new Promise((resolve) => setTimeout(resolve, 0));
      store((prev) => ({ count: prev.count + 1 }));
    },
  }));

  const useOnlyFn = create((store) => ({
    fn() {
      store();
    },
  }));

  const Counter = () => {
    const { count, add, addAsync } = useCounter();
    useOnlyFn();

    return (
      <>
        <p>{count}</p>
        <button onClick={add}>add</button>
        <button onClick={addAsync} data-loading={addAsync.loading}>
          addAsync
        </button>
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
});
