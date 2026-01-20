# Auth Component React

A reusable React component library for authentication (Login and Register) built with Mantine UI and TypeScript.

## Installation

```bash
npm install auth-component-react
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom @mantine/core @tanstack/react-query
```

## Usage

### Basic Usage with API URL

```tsx
import { Login, Register } from 'auth-component-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';

const queryClient = new QueryClient();

function App() {
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (response) => {
    console.log('Login successful:', response);
    // Store token, redirect, etc.
    localStorage.setItem('token', response.access_token);
  };

  const handleRegisterSuccess = (response) => {
    console.log('Registration successful:', response);
    // Handle registration success
  };

  const handleError = (error) => {
    console.error('Auth error:', error);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {showRegister ? (
          <Register
            apiUrl="http://localhost:8100/login"
            onSuccess={handleRegisterSuccess}
            onError={handleError}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            apiUrl="http://localhost:8095/signup"
            onSuccess={handleLoginSuccess}
            onError={handleError}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </MantineProvider>
    </QueryClientProvider>
  );
}
```

### Using Custom API Functions

```tsx
import { Login, Register, AuthApi } from 'auth-component-react';

const customAuthApi: AuthApi = {
  login: async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
  register: async (username: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  },
};

function App() {
  return (
    <Login
      authApi={customAuthApi}
      onSuccess={(response) => {
        console.log('Logged in:', response);
      }}
      onError={(error) => {
        console.error('Error:', error);
      }}
    />
  );
}
```

### With React Router

```tsx
import { useNavigate } from 'react-router-dom';
import { Login, Register } from 'auth-component-react';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      apiUrl="http://localhost:8100"
      onSuccess={(response) => {
        localStorage.setItem('token', response.access_token);
        navigate('/dashboard');
      }}
      onError={(error) => {
        console.error('Login failed:', error);
      }}
      onSwitchToRegister={() => navigate('/register')}
    />
  );
}

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Register
      apiUrl="http://localhost:8095"
      onSuccess={(response) => {
        console.log('Registered:', response);
        navigate('/login');
      }}
      onError={(error) => {
        console.error('Registration failed:', error);
      }}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
}
```

### Enabling OAuth providers

OAuth buttons render only when you pass provider flags. If no flags are set, the forms fall back to username/password only.

```tsx
<Login
  apiUrl="http://localhost:8100/login"
  oauthApiUrl="http://localhost:8100"
  enableOAuth
  enableApple
  enableMicrosoft
  enableGithub
  enableDiscord
  onSuccess={(res) => console.log(res)}
/>
```

> Use `oauthApiUrl` to point to your backend base (without `/login` or `/signup`). Authorize requests go to `${oauthApiUrl}/oauth2/authorize/{provider}`.

## Props

### Login Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiUrl` | `string` | No* | - | Base URL for the authentication API |
| `authApi` | `AuthApi` | No* | - | Custom API functions object |
| `oauthApiUrl` | `string` | No | - | Base URL for OAuth endpoints (defaults to `apiUrl` without `/login`) |
| `enableOAuth` | `boolean` | No | `true` | Master toggle for showing OAuth buttons |
| `enableGoogle` | `boolean` | No | `false` | Show Google button when true |
| `enableFacebook` | `boolean` | No | `false` | Show Facebook button when true |
| `enableApple` | `boolean` | No | `false` | Show Sign in with Apple button when true |
| `enableMicrosoft` | `boolean` | No | `false` | Show Microsoft button when true |
| `enableGithub` | `boolean` | No | `false` | Show GitHub button when true |
| `enableDiscord` | `boolean` | No | `false` | Show Discord button when true |
| `onSuccess` | `(response: AuthResponse) => void` | No | - | Callback when login succeeds |
| `onError` | `(error: Error) => void` | No | - | Callback when login fails |
| `showRegisterLink` | `boolean` | No | `true` | Show link to registration page |
| `onSwitchToRegister` | `() => void` | No | - | Callback when user clicks register link |
| `title` | `string` | No | `"Welcome back!"` | Title text for the login form |
| `submitButtonText` | `string` | No | `"Sign in"` | Text for the submit button |

*Either `apiUrl` or `authApi` must be provided.

### Register Component

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiUrl` | `string` | No* | - | Base URL for the authentication API |
| `authApi` | `AuthApi` | No* | - | Custom API functions object |
| `oauthApiUrl` | `string` | No | - | Base URL for OAuth endpoints (defaults to `apiUrl` without `/signup`) |
| `enableOAuth` | `boolean` | No | `true` | Master toggle for showing OAuth buttons |
| `enableGoogle` | `boolean` | No | `false` | Show Google button when true |
| `enableFacebook` | `boolean` | No | `false` | Show Facebook button when true |
| `enableApple` | `boolean` | No | `false` | Show Sign in with Apple button when true |
| `enableMicrosoft` | `boolean` | No | `false` | Show Microsoft button when true |
| `enableGithub` | `boolean` | No | `false` | Show GitHub button when true |
| `enableDiscord` | `boolean` | No | `false` | Show Discord button when true |
| `onSuccess` | `(response: AuthResponse \\| RegisterResponse) => void` | No | - | Callback when registration succeeds |
| `onError` | `(error: Error) => void` | No | - | Callback when registration fails |
| `showLoginLink` | `boolean` | No | `true` | Show link to login page |
| `onSwitchToLogin` | `() => void` | No | - | Callback when user clicks login link |
| `title` | `string` | No | `"Create an account"` | Title text for the registration form |
| `submitButtonText` | `string` | No | `"Register"` | Text for the submit button |

*Either `apiUrl` or `authApi` must be provided.

## API Endpoints

When using `apiUrl`, the component expects these endpoints:

### Login
- **POST** `/login`
- **Request Body**: `{ username: string, password: string }`
- **Response**: `{ access_token: string, expires_in: number, username?: string }`

### Register
- **POST** `/v0/auth/register` (tries first) or `/signup` (fallback)
- **Request Body**: `{ username: string, email: string, password: string }`
- **Response**: `{ access_token?: string, expires_in?: number, id: string, username: string, email: string }`

## Features

- ✅ Login and Registration forms
- ✅ Customizable API integration (URL or functions)
- ✅ Error handling with callbacks
- ✅ Success callbacks
- ✅ Loading states
- ✅ Form validation
- ✅ Mantine UI components
- ✅ TypeScript support
- ✅ React Query integration
- ✅ Responsive design

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build
```

## Example

See the `example/` directory for a complete working example.

## License

MIT


