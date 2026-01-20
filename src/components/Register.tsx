import React, { useState } from 'react';
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
                             enableGoogle = false,
                             enableFacebook = false,
                             enableApple = false,
                             enableMicrosoft = false,
                             enableGithub = false,
                             enableDiscord = false,
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

    const enabledProviders = [
        enableGoogle && 'google',
        enableFacebook && 'facebook',
        enableApple && 'apple',
        enableMicrosoft && 'microsoft',
        enableGithub && 'github',
        enableDiscord && 'discord',
    ].filter(Boolean) as OAuthProvider[];

    const providerButtons: Array<{
        provider: OAuthProvider;
        label: string;
        variant?: 'default' | 'filled' | 'outline' | 'light' | 'subtle' | 'transparent' | 'gradient';
        color?: string;
        icon: React.ReactNode;
    }> = [
        {
            provider: 'apple',
            label: 'Sign in with Apple',
            variant: 'filled',
            color: 'dark',
            icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M14.777 9.613c.01 2.01 1.76 2.68 1.78 2.69-.015.048-.279.953-.922 1.887-.555.816-1.132 1.63-2.04 1.646-.894.016-1.18-.533-2.203-.533-1.024 0-1.341.517-2.188.549-.877.032-1.544-.883-2.104-1.697-1.144-1.66-2.015-4.69-.843-6.737.583-1.012 1.627-1.655 2.757-1.672.862-.016 1.677.588 2.203.588.525 0 1.52-.727 2.566-.62.437.018 1.664.177 2.45 1.332-.063.04-1.462.853-1.434 2.568zM12.356 2.87c.487-.592.814-1.416.725-2.24-.702.028-1.554.467-2.06 1.06-.452.52-.85 1.356-.743 2.16.784.06 1.59-.396 2.078-.98z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            provider: 'google',
            label: 'Continue with Google',
            variant: 'default',
            icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <g fill="#000" fillRule="evenodd">
                        <path
                            d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
                            fill="#EA4335"
                        />
                        <path
                            d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.08-1.79 2.68l2.78 2.15c1.63-1.5 2.69-3.7 2.69-6.33z"
                            fill="#4285F4"
                        />
                        <path
                            d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.78-2.15c-.76.53-1.78.9-3.18.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z"
                            fill="#34A853"
                        />
                    </g>
                </svg>
            ),
        },
        {
            provider: 'facebook',
            label: 'Continue with Facebook',
            variant: 'default',
            icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18 9C18 4.03 13.97 0 9 0S0 4.03 0 9c0 4.5 3.29 8.22 7.59 8.9v-6.29H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.12 0-1.47.69-1.47 1.41V9h2.49l-.4 2.61h-2.09V17.9C14.71 17.22 18 13.5 18 9z"
                        fill="#1877F2"
                    />
                </svg>
            ),
        },
        {
            provider: 'microsoft',
            label: 'Continue with Microsoft',
            variant: 'default',
            icon: (
                <svg width="18" height="18" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#F25022" d="M9 2H2v7h7V2z" />
                    <path fill="#00A4EF" d="M9 11H2v7h7v-7z" />
                    <path fill="#7FBA00" d="M18 2h-7v7h7V2z" />
                    <path fill="#FFB900" d="M18 11h-7v7h7v-7z" />
                </svg>
            ),
        },
        {
            provider: 'github',
            label: 'Continue with GitHub',
            variant: 'default',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="currentColor"
                        d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.22-.02-2.21-3.2.7-3.88-1.37-3.88-1.37-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.74 1.27 3.41.97.1-.75.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.99 0 2 .13 2.94.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.8 1.09.8 2.2 0 1.59-.02 2.88-.02 3.27 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
                    />
                </svg>
            ),
        },
        {
            provider: 'discord',
            label: 'Continue with Discord',
            variant: 'default',
            icon: (
                <svg width="18" height="18" viewBox="0 0 245 240" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="#5865F2"
                        d="M104.4 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zm36.2 0c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.3-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1z"
                    />
                    <path
                        fill="#5865F2"
                        d="M189.5 20h-134C38.7 20 26 32.7 26 48.2v134.6c0 15.5 12.7 28.2 28.5 28.2h114l-5.3-18.4 12.8 11.9 12.1 11.2 21.5 19V48.2c0-15.5-12.7-28.2-28.5-28.2zm-38.6 137.4s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.5 5.9-5 2.1-9.8 3.4-14.5 4.3-9.6 1.8-18.4 1.3-25.9-.1-5.7-1.1-10.6-2.6-14.7-4.3-2.3-.9-4.8-2-7.3-3.4-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.2-1.8-1-2.8-1.7-2.8-1.7s4.8 8 17.5 11.8c-3 3.8-6.7 8.3-6.7 8.3-22.1-.7-30.5-15.2-30.5-15.2 0-32.2 14.5-58.3 14.5-58.3 14.5-10.8 28.2-10.5 28.2-10.5l1 1.2c-18 5.2-26.3 13.1-26.3 13.1s2.2-1.2 5.9-2.8c10.7-4.7 19.2-6 22.7-6.3.6-.1 1.1-.2 1.7-.2 6.1-.8 13-1 20.2-.2 9.5 1.1 19.7 3.9 30.1 9.6 0 0-7.9-7.5-24.9-12.7l1.4-1.6s13.7-.3 28.2 10.5c0 0 14.5 26.1 14.5 58.3 0 0-8.5 14.5-30.6 15.2z"
                    />
                </svg>
            ),
        },
    ];

    const hasOAuthProviders = enableOAuth && enabledProviders.length > 0;

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

                {hasOAuthProviders && (
                    <Stack gap="sm" mb="xl">
                        {providerButtons
                            .filter((btn) => enabledProviders.includes(btn.provider))
                            .map((btn) => (
                                <Button
                                    key={btn.provider}
                                    variant={btn.variant || 'default'}
                                    color={btn.color}
                                    fullWidth
                                    onClick={() => handleOAuthClick(btn.provider)}
                                    loading={oauthMutation.isPending}
                                    leftSection={btn.icon}
                                    radius="md"
                                >
                                    {btn.label}
                                </Button>
                            ))}
                    </Stack>
                )}

                {hasOAuthProviders && (
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
