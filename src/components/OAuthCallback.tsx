import { useEffect, useState, useRef } from 'react';
import { Container, Paper, Title, Text, Loader, Stack, Button } from '@mantine/core';
import axios from 'axios';
import { OAuthTokenResponse } from '../types';

export interface OAuthCallbackProps {
  oauthApiUrl: string;
  onSuccess: (data: OAuthTokenResponse) => void;
  onError: (error: Error) => void;
  onContinue?: () => void;
}

export function OAuthCallback({ oauthApiUrl, onSuccess, onError, onContinue }: OAuthCallbackProps) {
  const [status, setStatus] = useState<'pending' | 'error' | 'success'>('pending');
  const [message, setMessage] = useState<string>('Completing sign-in…');
  const [authData, setAuthData] = useState<OAuthTokenResponse | null>(null);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Prevent multiple calls (e.g., in React Strict Mode)
    if (hasCalledRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setStatus('error');
      setMessage('Missing OAuth code in callback URL.');
      onError(new Error('Missing OAuth code in callback URL.'));
      return;
    }

    hasCalledRef.current = true;

    const finalize = async () => {
      try {
        const response = await axios.get<OAuthTokenResponse>(`${oauthApiUrl}/oauth2/finalize`, {
          params: { code },
        });
        setStatus('success');
        setMessage('Sign-in successful!');
        setAuthData(response.data);
        onSuccess(response.data);
        // Update URL to home page without full page reload
        window.history.replaceState({}, '', '/');
      } catch (err) {
        const error = err instanceof Error ? err : new Error('OAuth finalize failed');
        setStatus('error');
        setMessage(error.message);
        onError(error);
      }
    };

    finalize();
  }, [oauthApiUrl]); // Removed onSuccess and onError from dependencies

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Container size="xs" h="100vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper radius="md" p="xl" withBorder style={{ width: '100%' }}>
        <Stack align="center" gap="md">
          <Title order={3}>
            {status === 'pending' ? 'Finishing up…' : status === 'success' ? 'Success!' : 'Error'}
          </Title>
          {status === 'pending' ? (
            <>
              <Loader />
              <Text c="dimmed">Completing sign-in with your provider</Text>
            </>
          ) : status === 'success' ? (
            <>
              <Text c="green" fw={500}>{message}</Text>
              {authData && (
                <Paper p="md" withBorder style={{ width: '100%', marginTop: '1rem' }}>
                  <Text size="sm" c="dimmed" mb="xs">Authentication Details:</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(authData, null, 2)}
                  </pre>
                </Paper>
              )}
              <Button onClick={handleContinue} fullWidth mt="md">
                Continue
              </Button>
            </>
          ) : (
            <Text c="red">{message}</Text>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

