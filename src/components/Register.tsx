import { useState } from 'react';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack, Divider } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { RegisterProps, AuthResponse, RegisterResponse, OAuthProvider, OAuthAuthorizationResponse } from '../types';

export function Register({
                             apiUrl,
                             authApi,
                             oauthApiUrl,
                             onSuccess,
                             onError,
                             showLoginLink = true,
                             onSwitchToLogin,
                             title = 'Create an account',
                             submitButtonText = 'Register',
                             enableOAuth = true,
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

    // OAuth authorization function
    const oauthAuthorizeFn = authApi?.oauthAuthorize || (async (provider: OAuthProvider): Promise<OAuthAuthorizationResponse> => {
        const baseUrl = oauthApiUrl || apiUrl?.replace('/signup', '') || '';
        if (!baseUrl) {
            throw new Error('Either oauthApiUrl, apiUrl, or authApi.oauthAuthorize must be provided for OAuth');
        }
        const response = await axios.get<OAuthAuthorizationResponse>(`${baseUrl}/oauth2/authorize/${provider}`);
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

    const oauthMutation = useMutation({
        mutationFn: (provider: OAuthProvider) => oauthAuthorizeFn(provider),
        onSuccess: (data) => {
            // Redirect to OAuth provider
            window.location.href = data.authorizationUri;
        },
        onError: (error) => {
            const err = error instanceof Error ? error : new Error('OAuth authorization failed');
            onError?.(err);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate();
    };

    const handleOAuthClick = (provider: OAuthProvider) => {
        oauthMutation.mutate(provider);
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

                {enableOAuth && (
                    <Stack gap="sm" mb="xl">
                        <Button
                            variant="default"
                            fullWidth
                            onClick={() => handleOAuthClick('google')}
                            loading={oauthMutation.isPending}
                            leftSection={
                                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <g fill="#000" fillRule="evenodd">
                                        <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
                                        <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.08-1.79 2.68l2.78 2.15c1.63-1.5 2.69-3.7 2.69-6.33z" fill="#4285F4"/>
                                        <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
                                        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.78-2.15c-.76.53-1.78.9-3.18.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
                                    </g>
                                </svg>
                            }
                        >
                            Continue with Google
                        </Button>
                        <Button
                            variant="default"
                            fullWidth
                            onClick={() => handleOAuthClick('facebook')}
                            loading={oauthMutation.isPending}
                            leftSection={
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 9C18 4.03 13.97 0 9 0S0 4.03 0 9c0 4.5 3.29 8.22 7.59 8.9v-6.29H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.12 0-1.47.69-1.47 1.41V9h2.49l-.4 2.61h-2.09V17.9C14.71 17.22 18 13.5 18 9z" fill="#1877F2"/>
                                </svg>
                            }
                        >
                            Continue with Facebook
                        </Button>
                    </Stack>
                )}

                {enableOAuth && (
                    <Divider label="Or continue with email" labelPosition="center" my="xl" />
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
