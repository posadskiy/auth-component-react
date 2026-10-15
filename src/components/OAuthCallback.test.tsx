import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetOAuthFinalizeForTests } from '../oauth/finalize';
import { persistOAuthTransaction } from '../oauth/storage';
import { OAuthCallback } from './OAuthCallback';

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

function renderCallback(search: string, props: Partial<React.ComponentProps<typeof OAuthCallback>> = {}) {
  window.history.pushState({}, '', `/oauth/callback${search}`);
  const onSuccess = props.onSuccess ?? vi.fn();
  const onError = props.onError ?? vi.fn();
  render(
    <MantineProvider>
      <OAuthCallback oauthApiUrl="http://localhost:8100" onSuccess={onSuccess} onError={onError} {...props} />
    </MantineProvider>,
  );
  return { onSuccess, onError };
}

describe('OAuthCallback', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetOAuthFinalizeForTests();
    get.mockReset();
    window.history.pushState({}, '', '/oauth/callback');
  });

  it('rejects a missing code without calling finalize', async () => {
    const { onSuccess, onError } = renderCallback('');

    expect(await screen.findByText('Missing OAuth code in callback URL.')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('rejects a missing or mismatched state without calling finalize', async () => {
    const missing = renderCallback('?code=abc');
    expect(await screen.findByText('Missing OAuth state in callback URL.')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
    expect(missing.onSuccess).not.toHaveBeenCalled();

    persistOAuthTransaction('expected', 'nonce');
    const mismatch = renderCallback('?code=abc&state=other');
    expect(await screen.findByText('OAuth state did not match this sign-in attempt.')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
    expect(mismatch.onError).toHaveBeenCalled();
  });

  it('finalizes a matching state and does not render tokens', async () => {
    persistOAuthTransaction('good', 'nonce');
    get.mockResolvedValue({
      data: {
        accessToken: 'super-secret-token',
        refreshToken: 'refresh-secret',
        expiresIn: 3600,
        tokenType: 'Bearer',
        userId: '7',
        provider: 'apple',
        providerUserId: 'provider-user',
      },
    });

    const { onSuccess } = renderCallback('?code=abc&state=good', { returnPath: '/home' });

    expect(await screen.findByText('Sign-in successful!')).toBeInTheDocument();
    expect(screen.queryByText('super-secret-token')).not.toBeInTheDocument();
    expect(screen.queryByText('refresh-secret')).not.toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'super-secret-token', userId: '7' }));
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:8100/oauth2/finalize',
      expect.objectContaining({ params: { code: 'abc', state: 'good' } }),
    );
    expect(window.location.pathname).toBe('/home');
    expect(sessionStorage.getItem('auth-component-react.oauth.state')).toBeNull();
  });
});
