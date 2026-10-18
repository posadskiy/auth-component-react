import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Register } from './Register';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post,
    isAxiosError: (error: unknown) =>
      Boolean(error && typeof error === 'object' && (error as { isAxiosError?: boolean }).isAxiosError),
    isCancel: () => false,
  },
}));

describe('Register', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('uses sign-up copy for Apple and shows a conflict as an account error', async () => {
    const user = userEvent.setup();
    post.mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed with status code 409',
      response: { status: 409, data: { message: 'duplicate' } },
    });

    render(
      <MantineProvider>
        <Register apiUrl="http://localhost:8095/signup" providers={['apple', 'google']} />
      </MantineProvider>,
    );

    expect(screen.getByRole('button', { name: 'Sign up with Apple' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('autocomplete', 'new-password');

    await user.type(screen.getByRole('textbox', { name: /username/i }), 'ada');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'ada@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'secret');
    await user.click(screen.getByRole('button', { name: 'Register' }));
    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/^password/i));
    await user.type(screen.getByLabelText(/^password/i), 'secret12');
    await user.type(screen.getByLabelText(/confirm password/i), 'secret12');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with these details already exists');
    expect(post).toHaveBeenCalledWith(
      'http://localhost:8095/signup',
      {
        username: 'ada',
        email: 'ada@example.com',
        password: 'secret12',
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
