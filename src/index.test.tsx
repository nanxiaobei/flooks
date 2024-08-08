import '@testing-library/jest-dom';
import { fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import ReactDOM from 'react-dom';
import { expect, test, vi } from 'vitest';
import create from './index';

const getHookErr = (hook: () => void) => {
  let err;
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    renderHook(hook);
  } catch (e) {
    err = (e as { message?: string }).message;
  }
  spy.mockRestore();
  return err;
};

test('create', async () => {
  const useCounter = create((store) => ({
    count: 0,
    text: 'hello',
    add() {
      const { count } = store();
      store({ count: count + 1 });
    },
    async addAsync() {
      await new Promise((resolve) => setTimeout(resolve, 0));
      store((prev) => ({ count: prev.count + 1 }));
    },
    setText() {
      store({ text: 'world' });
    },
  }));

  const useSub = () => {
    const counter = useCounter();
    return counter.sub;
  };

  const Counter = () => {
    const counter = useCounter();

    return (
      <>
        <p>{counter.count}</p>
        <button onClick={counter.add}>add</button>
        <button
          onClick={() => counter.addAsync()}
          data-loading={counter.addAsync.loading}
        >
          addAsync
        </button>
        <button onClick={() => counter.setText()}>setText</button>
      </>
    );
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  expect(() => create()).toThrow();
  expect(getHookErr(useSub)).toEqual('sub not exist');

  const { getByText, queryByText } = render(<Counter />);

  fireEvent.click(getByText('add'));
  expect(getByText('1')).toBeInTheDocument();

  fireEvent.click(getByText('addAsync'));
  await waitFor(() => expect(getByText('2')).toBeInTheDocument());

  fireEvent.click(getByText('addAsync'));
  await waitFor(() => expect(getByText('3')).toBeInTheDocument());

  fireEvent.click(getByText('setText'));
  expect(queryByText('hello')).not.toBeInTheDocument();
});

test('create.config', () => {
  create.config({ batch: ReactDOM.unstable_batchedUpdates });
});
