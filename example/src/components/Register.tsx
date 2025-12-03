import { useState } from 'react';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { RegisterProps, AuthResponse, RegisterResponse } from '../types';

export function Register({
  apiUrl,
  authApi,
  onSuccess,
  onError,
  showLoginLink = true,
  onSwitchToLogin,
  title = 'Create an account',
  submitButtonText = 'Register',
}: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Create API function based on provided props
  const registerFn = authApi?.register || (async (username: string, email: string, password: string): Promise<AuthResponse | RegisterResponse> => {
    if (!apiUrl) {
      throw new Error('Either apiUrl or authApi.register must be provided');
    }
    // Use /signup endpoint
      const response = await axios.post<RegisterResponse>(apiUrl, { username, email, password });
      return response.data;
  });

  const registerMutation = useMutation({
    mutationFn: () => registerFn(username, email, password),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      const err = error instanceof Error ? error : new Error('Registration failed');
      onError?.(err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <Container size="xs" h="100vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper radius="md" p="xl" withBorder style={{ width: '100%' }}>
        <Title ta="center" mb="md">{title}</Title>
        {showLoginLink && (
          <Text ta="center" c="dimmed" mb="xl">
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <Anchor component="button" type="button" size="sm" onClick={onSwitchToLogin}>
                Sign in
              </Anchor>
            ) : (
              <Anchor component="span" size="sm">
                Sign in
              </Anchor>
            )}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              required
              label="Username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={registerMutation.isError ? 'Registration failed' : null}
            />

            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" loading={registerMutation.isPending} fullWidth mt="xl">
              {submitButtonText}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

