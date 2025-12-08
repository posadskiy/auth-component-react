import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, Container, Paper, Text, Button } from '@mantine/core';
// For local development, import from local copies
// In production, this would be: import { Login, Register } from 'auth-component-react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { OAuthCallback } from './OAuthCallback';

const queryClient = new QueryClient();

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<any>(null);
  const isOAuthCallback = window.location.pathname === '/oauth/callback';

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token) {
      setIsAuthenticated(true);
      // Try to restore auth data if available
      const storedAuthData = localStorage.getItem('authData');
      if (storedAuthData) {
        try {
          setAuthData(JSON.parse(storedAuthData));
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
    }
  }, []);

  // Get API URLs from environment or use defaults
  // Login uses auth-service on port 8100
  const loginApiUrl = import.meta.env.VITE_LOGIN_API_URL || 'http://localhost:8100/login';
  // OAuth uses auth-service on port 8100
  const oauthApiUrl = import.meta.env.VITE_OAUTH_API_URL || 'http://localhost:8100';
  // Registration uses user-service on port 8095
  const registerApiUrl = import.meta.env.VITE_REGISTER_API_URL || 'http://localhost:8095/signup';

  const handleLoginSuccess = (response: any) => {
    console.log('Login successful:', response);
    setAuthData(response);
    setIsAuthenticated(true);
    
    // Store token and auth data if available
    const accessToken = response.access_token || response.accessToken;
    const userId = response.username || response.userId || '';
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('userId', String(userId));
      localStorage.setItem('authData', JSON.stringify(response));
    }
  };

  const handleRegisterSuccess = (response: any) => {
    console.log('Registration successful:', response);
    // After successful registration, switch to login
    setShowRegister(false);
    alert('Registration successful! Please log in.');
  };

  const handleError = (error: Error) => {
    console.error('Auth error:', error);
    alert(`Error: ${error.message}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('authData');
    setIsAuthenticated(false);
    setAuthData(null);
    setShowRegister(false);
    // Redirect to home page
    window.location.href = '/';
  };

  // Show OAuth callback page if on that route and not yet authenticated
  if (isOAuthCallback && !isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <OAuthCallback
            oauthApiUrl={oauthApiUrl}
            onSuccess={handleLoginSuccess}
            onError={handleError}
            onContinue={() => {
              // Force re-render to show authenticated view
              window.location.href = '/';
            }}
          />
        </MantineProvider>
      </QueryClientProvider>
    );
  }

  if (isAuthenticated) {
    return (
      <MantineProvider>
        <Container size="md" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1>Welcome! You are authenticated.</h1>
            <Paper p="md" withBorder mt="xl" style={{ textAlign: 'left' }}>
              <Text fw={500} mb="xs">Authentication Data:</Text>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '1rem', 
                borderRadius: '4px', 
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(authData, null, 2)}
              </pre>
            </Paper>
            <Button 
              onClick={handleLogout}
              color="red"
              size="md"
              mt="xl"
            >
              Logout
            </Button>
          </div>
        </Container>
      </MantineProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {showRegister ? (
          <Register
            apiUrl={registerApiUrl}
            oauthApiUrl={oauthApiUrl}
            onSuccess={handleRegisterSuccess}
            onError={handleError}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            apiUrl={loginApiUrl}
            oauthApiUrl={oauthApiUrl}
            onSuccess={handleLoginSuccess}
            onError={handleError}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;

