import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
// For local development, import from local copies
// In production, this would be: import { Login, Register } from 'auth-component-react';
import { Login } from './components/Login';
import { Register } from './components/Register';

const queryClient = new QueryClient();

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<any>(null);

  // Get API URLs from environment or use defaults
  // Login uses auth-service on port 8100
  const loginApiUrl = import.meta.env.VITE_LOGIN_API_URL || 'http://localhost:8100/login';
  // Registration uses user-service on port 8095
  const registerApiUrl = import.meta.env.VITE_REGISTER_API_URL || 'http://localhost:8095/signup';

  const handleLoginSuccess = (response: any) => {
    console.log('Login successful:', response);
    setAuthData(response);
    setIsAuthenticated(true);
    
    // Store token if available
    if (response.access_token) {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userId', response.username || response.userId || '');
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
    setIsAuthenticated(false);
    setAuthData(null);
    setShowRegister(false);
  };

  if (isAuthenticated) {
    return (
      <MantineProvider>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Welcome! You are authenticated.</h1>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', textAlign: 'left' }}>
            {JSON.stringify(authData, null, 2)}
          </pre>
          <button 
            onClick={handleLogout}
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              cursor: 'pointer',
              backgroundColor: '#e03131',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Logout
          </button>
        </div>
      </MantineProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {showRegister ? (
          <Register
            apiUrl={registerApiUrl}
            onSuccess={handleRegisterSuccess}
            onError={handleError}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            apiUrl={loginApiUrl}
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

