import React from 'react';
import { test, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import create from './index';

test('create', async () => {
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(() => create()).toThrow();

  const { getByText } = render(<Counter />);

  fireEvent.click(getByText('add'));
  expect(getByText('1')).toBeInTheDocument();

  fireEvent.click(getByText('addAsync'));

  await waitFor(() => {
    expect(getByText('2')).toBeInTheDocument();
  });

  fireEvent.click(getByText('addAsync'));

  await waitFor(() => {
    expect(getByText('3')).toBeInTheDocument();
  });
});
