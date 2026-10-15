export const OAUTH_STATE_STORAGE_KEY = 'auth-component-react.oauth.state';
export const OAUTH_NONCE_STORAGE_KEY = 'auth-component-react.oauth.nonce';

export function persistOAuthTransaction(state: string, nonce: string) {
  sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
  sessionStorage.setItem(OAUTH_NONCE_STORAGE_KEY, nonce);
}

export function readOAuthState(): string | null {
  return sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
}

export function clearOAuthTransaction() {
  sessionStorage.removeItem(OAUTH_STATE_STORAGE_KEY);
  sessionStorage.removeItem(OAUTH_NONCE_STORAGE_KEY);
}
