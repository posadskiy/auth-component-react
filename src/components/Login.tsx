import { useState } from 'react';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { LoginProps, AuthResponse } from '../types';

export function Login({
  apiUrl,
  authApi,
  onSuccess,
  onError,
  showRegisterLink = true,
  onSwitchToRegister,
  title = 'Welcome back!',
  submitButtonText = 'Sign in',
}: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Create API function based on provided props
  const loginFn = authApi?.login || (async (username: string, password: string): Promise<AuthResponse> => {
    if (!apiUrl) {
      throw new Error('Either apiUrl or authApi.login must be provided');
    }
    const response = await axios.post<AuthResponse>(apiUrl, { username, password });
    return response.data;
  });

  const loginMutation = useMutation({
    mutationFn: () => loginFn(username, password),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      const err = error instanceof Error ? error : new Error('Login failed');
      onError?.(err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <Container size="xs" h="100vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper radius="md" p="xl" withBorder style={{ width: '100%' }}>
        <Title ta="center" mb="md">{title}</Title>
        {showRegisterLink && (
          <Text ta="center" c="dimmed" mb="xl">
            Don't have an account yet?{' '}
            {onSwitchToRegister ? (
              <Anchor component="button" type="button" size="sm" onClick={onSwitchToRegister}>
                Create account
              </Anchor>
            ) : (
              <Anchor component="span" size="sm">
                Create account
              </Anchor>
            )}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              required
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={loginMutation.isError ? 'Invalid credentials' : null}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" loading={loginMutation.isPending} fullWidth mt="xl">
              {submitButtonText}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}


