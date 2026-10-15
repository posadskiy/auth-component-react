import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { navigation } from '../navigation';
import { OAUTH_NONCE_STORAGE_KEY, OAUTH_STATE_STORAGE_KEY } from '../oauth/storage';
import { Login } from './Login';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    get,
    post,
    isAxiosError: (error: unknown) =>
      Boolean(error && typeof error === 'object' && (error as { isAxiosError?: boolean }).isAxiosError),
    isCancel: () => false,
  },
}));

function renderLogin(props: Partial<React.ComponentProps<typeof Login>> = {}) {
  return render(
    <MantineProvider>
      <Login
        apiUrl="http://localhost:8100/login"
        oauthApiUrl="http://localhost:8100"
        providers={['apple', 'google']}
        {...props}
      />
    </MantineProvider>,
  );
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('Login', () => {
  beforeEach(() => {
    sessionStorage.clear();
    get.mockReset();
    post.mockReset();
    vi.spyOn(navigation, 'assign').mockImplementation(() => undefined);
  });

  it('shows loading only on the clicked provider and ignores another provider', async () => {
    const user = userEvent.setup();
    const pending = deferred<{ data: { authorizationUri: string; state: string; nonce: string } }>();
    get.mockReturnValue(pending.promise);
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in with Apple' }));

    const apple = screen.getByRole('button', { name: 'Sign in with Apple' });
    const google = screen.getByRole('button', { name: 'Continue with Google' });
    expect(apple).toHaveAttribute('data-loading');
    expect(google).not.toHaveAttribute('data-loading');
    expect(google).toBeDisabled();

    await user.click(google);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();

    pending.resolve({
      data: { authorizationUri: 'https://appleid.apple.com/auth/authorize', state: 'state-1', nonce: 'nonce-1' },
    });

    await vi.waitFor(() => {
      expect(navigation.assign).toHaveBeenCalledWith('https://appleid.apple.com/auth/authorize');
    });
    expect(sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY)).toBe('state-1');
    expect(sessionStorage.getItem(OAUTH_NONCE_STORAGE_KEY)).toBe('nonce-1');
  });

  it('does not submit the password form while a provider request is in flight', async () => {
    const user = userEvent.setup();
    get.mockReturnValue(new Promise(() => undefined));
    renderLogin();

    await user.type(screen.getByRole('textbox', { name: /username/i }), 'ada');
    await user.type(screen.getByLabelText(/password/i), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign in with Apple' }));

    const form = screen.getByRole('textbox', { name: /username/i }).closest('form');
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('shows invalid credentials for a 401 and the server message for other failures', async () => {
    const user = userEvent.setup();
    post.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed with status code 401',
      response: { status: 401, data: { message: 'nope' } },
    });
    renderLogin();

    await user.type(screen.getByRole('textbox', { name: /username/i }), 'ada');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();

    post.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed with status code 500',
      response: { status: 500, data: { message: 'Database unavailable' } },
    });
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Database unavailable');
  });

  it('shows an OAuth error and does not redirect to an unsafe authorization url', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    get.mockResolvedValue({ data: { authorizationUri: 'http://evil.example/auth', state: 'state-1' } });
    renderLogin({ onError });

    await user.click(screen.getByRole('button', { name: 'Sign in with Apple' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('OAuth authorization URL must use HTTPS.');
    expect(navigation.assign).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('keeps provider flags and hides a register link that has no handler', () => {
    render(
      <MantineProvider>
        <Login apiUrl="http://localhost:8100/login" enableOAuth enableApple enableGoogle />
      </MantineProvider>,
    );

    expect(screen.getByRole('button', { name: 'Sign in with Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password');
  });

  it('renders providers in the given order and a working register link', async () => {
    const user = userEvent.setup();
    const onSwitchToRegister = vi.fn();
    renderLogin({ providers: ['github', 'apple'], onSwitchToRegister });

    const github = screen.getByRole('button', { name: 'Continue with GitHub' });
    const apple = screen.getByRole('button', { name: 'Sign in with Apple' });
    expect(github.compareDocumentPosition(apple) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSwitchToRegister).toHaveBeenCalledOnce();
  });
});
