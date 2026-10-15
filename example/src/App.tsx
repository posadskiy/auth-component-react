import { useEffect, useState } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountName, setAccountName] = useState('Signed in');
  const isOAuthCallback = window.location.pathname === '/oauth/callback';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('accountName');
    if (token) {
      setIsAuthenticated(true);
      if (storedName) setAccountName(storedName);
    }
  }, []);

  const loginApiUrl = import.meta.env.VITE_LOGIN_API_URL || 'http://localhost:8100/login';
  const oauthApiUrl = import.meta.env.VITE_OAUTH_API_URL || 'http://localhost:8100';
  const registerApiUrl = import.meta.env.VITE_REGISTER_API_URL || 'http://localhost:8095/signup';

  const oauthReturnTo = `${window.location.origin}/oauth/callback`;

  const handleLoginSuccess = (response: AuthResponse | OAuthTokenResponse) => {
    const accessToken = response.access_token;
    const userId = 'user_id' in response ? response.user_id : response.userId;
    const name = accountLabel(response);
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('userId', userId ? String(userId) : '');
      localStorage.setItem('accountName', name);
    }
    setAccountName(name);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  const handleError = (error: Error) => {
    console.error('Auth error:', error);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('accountName');
    setIsAuthenticated(false);
    setAccountName('Signed in');
    setShowRegister(false);
    window.location.href = '/';
  };

  if (isOAuthCallback && !isAuthenticated) {
    return (
      <MantineProvider>
        <AuthLayout>
          <OAuthCallback
            oauthApiUrl={oauthApiUrl}
            returnPath="/"
            onSuccess={handleLoginSuccess}
            onError={handleError}
            onContinue={() => {
              window.location.href = '/';
            }}
          />
        </AuthLayout>
      </MantineProvider>
    );
  }

  if (isAuthenticated) {
    return (
      <MantineProvider>
        <AuthLayout>
          <Paper p="xl" withBorder>
            <Text ta="center" fw={500} mb="md">
              Welcome, {accountName}.
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
