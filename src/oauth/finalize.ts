import axios from 'axios';
import type { OAuthTokenResponse } from '../types';

type Inflight = {
  controller: AbortController;
  promise: Promise<OAuthTokenResponse>;
  subscribers: number;
};

const inflight = new Map<string, Inflight>();

export function subscribeFinalize(oauthApiUrl: string, code: string): {
  promise: Promise<OAuthTokenResponse>;
  unsubscribe: () => void;
} {
  const base = oauthApiUrl.replace(/\/$/, '');
  const key = `${base}\n${code}`;
  let entry = inflight.get(key);

  if (!entry) {
    const controller = new AbortController();
    const promise = axios
      .post<OAuthTokenResponse>(`${base}/oauth2/finalize`, { code }, { signal: controller.signal })
      .then((response) => response.data);

    entry = { controller, promise, subscribers: 0 };
    inflight.set(key, entry);

    void promise.then(
      () => {
        if (inflight.get(key) === entry) inflight.delete(key);
      },
      () => {
        if (inflight.get(key) === entry) inflight.delete(key);
      },
    );
  }

  entry.subscribers += 1;
  const current = entry;
  let released = false;

  return {
    promise: current.promise,
    unsubscribe: () => {
      if (released) return;
      released = true;
      current.subscribers -= 1;
      queueMicrotask(() => {
        if (current.subscribers <= 0 && inflight.get(key) === current) {
          current.controller.abort();
          inflight.delete(key);
        }
      });
    },
  };
}

export function resetOAuthFinalizeForTests() {
  Array.from(inflight.values()).forEach((entry) => {
    entry.controller.abort();
  });
  inflight.clear();
}
