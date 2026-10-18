import { useState } from 'react';
import { Button, MantineProvider, Paper, Text } from '@mantine/core';
import { Login, OAuthCallback, Register, type AuthResponse, type OAuthTokenResponse } from 'auth-component-react';

function accountLabel(data: AuthResponse | OAuthTokenResponse | null): string {
  if (!data) return 'Signed in';
  if ('username' in data && data.username) return data.username;
  if ('user_id' in data && data.user_id) return data.user_id;
  if ('userId' in data && data.userId) return String(data.userId);
  return 'Signed in';
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>{children}</div>
    </div>
  );
}

function App() {
  const [showRegister, setShowRegister] = useState(false);
  // Memory only. A reload clears the session. The access token is not rendered or written to storage.
  const [session, setSession] = useState<{ accessToken: string; accountName: string } | null>(null);
  const isOAuthCallback = window.location.pathname === '/oauth/callback';

  const loginApiUrl = import.meta.env.VITE_LOGIN_API_URL || 'http://localhost:8100/login';
  const oauthApiUrl = import.meta.env.VITE_OAUTH_API_URL || 'http://localhost:8100';
  const registerApiUrl = import.meta.env.VITE_REGISTER_API_URL || 'http://localhost:8095/signup';
  const oauthReturnTo = `${window.location.origin}/oauth/callback`;

  const handleLoginSuccess = (response: AuthResponse | OAuthTokenResponse) => {
    if (!response.access_token) return;
    setSession({
      accessToken: response.access_token,
      accountName: accountLabel(response),
    });
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  const handleError = (error: Error) => {
    console.error(error.message);
  };

  const handleLogout = () => {
    setSession(null);
    setShowRegister(false);
    window.history.replaceState({}, '', '/');
  };

  if (isOAuthCallback && !session) {
    return (
      <MantineProvider>
        <AuthLayout>
          <OAuthCallback
            oauthApiUrl={oauthApiUrl}
            returnPath="/"
            onSuccess={handleLoginSuccess}
            onError={handleError}
          />
        </AuthLayout>
      </MantineProvider>
    );
  }

  if (session) {
    return (
      <MantineProvider>
        <AuthLayout>
          <Paper p="xl" withBorder>
            <Text ta="center" fw={500} mb="md">
              Welcome, {session.accountName}.
            </Text>
            <Button onClick={handleLogout} color="red" fullWidth>
              Logout
            </Button>
          </Paper>
        </AuthLayout>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider>
      <AuthLayout>
        {showRegister ? (
          <Register
            apiUrl={registerApiUrl}
            oauthApiUrl={oauthApiUrl}
            oauthReturnTo={oauthReturnTo}
            providers={['apple', 'google', 'github']}
            onSuccess={handleRegisterSuccess}
            onError={handleError}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            apiUrl={loginApiUrl}
            oauthApiUrl={oauthApiUrl}
            oauthReturnTo={oauthReturnTo}
            providers={['apple', 'google', 'github']}
            onSuccess={handleLoginSuccess}
            onError={handleError}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </AuthLayout>
    </MantineProvider>
  );
}

export default App;
