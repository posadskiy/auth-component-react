import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { resetOAuthFinalizeForTests, subscribeFinalize } from './finalize';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    get,
    isAxiosError: (error: unknown) =>
      Boolean(error && typeof error === 'object' && (error as { isAxiosError?: boolean }).isAxiosError),
    isCancel: (error: unknown) =>
      Boolean(error && typeof error === 'object' && (error as { code?: string }).code === 'ERR_CANCELED'),
  },
}));

describe('subscribeFinalize', () => {
  beforeEach(() => {
    resetOAuthFinalizeForTests();
    get.mockReset();
  });

  it('shares one request and aborts only after the last subscriber leaves', async () => {
    let signal: AbortSignal | undefined;
    get.mockImplementation((_url: string, config: { signal: AbortSignal }) => {
      signal = config.signal;
      return new Promise(() => undefined);
    });

    const first = subscribeFinalize('http://localhost:8100', 'code', 'state');
    const second = subscribeFinalize('http://localhost:8100', 'code', 'state');

    expect(axios.get).toHaveBeenCalledTimes(1);

    first.unsubscribe();
    await new Promise((resolve) => queueMicrotask(resolve));
    expect(signal?.aborted).toBe(false);

    second.unsubscribe();
    await new Promise((resolve) => queueMicrotask(resolve));
    expect(signal?.aborted).toBe(true);
  });
});
