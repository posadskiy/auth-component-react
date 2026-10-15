# Auth Component React

React login, registration, and OAuth callback components built with Mantine 7 and TypeScript.

## Installation

```bash
npm install auth-component-react @mantine/core react react-dom
```

Import Mantine's stylesheet once in the host application:

```tsx
import '@mantine/core/styles.css';
```

## Usage

```tsx
import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Login, Register } from 'auth-component-react';

function App() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <MantineProvider>
        <Register
          apiUrl="http://localhost:8095/signup"
          oauthApiUrl="http://localhost:8100"
          providers={['apple', 'google']}
          onSuccess={() => setShowRegister(false)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      </MantineProvider>
    );
  }

  return (
    <MantineProvider>
      <Login
        apiUrl="http://localhost:8100/login"
        oauthApiUrl="http://localhost:8100"
        providers={['apple', 'google']}
        onSuccess={(response) => {
          localStorage.setItem('token', response.access_token);
        }}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    </MantineProvider>
  );
}
```

Password login posts `{ username, password }` to `apiUrl` and expects `{ access_token, expires_in, username?, userId? }`.

Registration posts `{ username, email, password }` to `apiUrl` and expects `{ id, username, email }`.

OAuth does not derive its base URL from `apiUrl`. Pass `oauthApiUrl` or `authApi.oauthAuthorize`. Authorize requests go to `${oauthApiUrl}/oauth2/authorize/{provider}` and must return `{ authorizationUri, state, nonce? }`. The component stores `state` for the callback and only redirects to HTTPS URLs, or HTTP on localhost.

### Custom API

```tsx
<Login
  authApi={{
    login: async (username, password) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
  }}
  onSuccess={(response) => {
    localStorage.setItem('token', response.access_token);
  }}
/>
```

### OAuth callback

Mount this on the provider redirect URL. It sends `code` and `state` to `${oauthApiUrl}/oauth2/finalize` only when `state` matches the value stored before the redirect.

```tsx
<OAuthCallback
  oauthApiUrl="http://localhost:8100"
  returnPath="/"
  onSuccess={(tokens) => {
    localStorage.setItem('token', tokens.accessToken);
  }}
  onError={(error) => {
    console.error(error);
  }}
/>
```

`onSuccess` receives the tokens. The component does not render them.

### Providers

`providers` sets which buttons appear, and in which order. Each entry is a provider id or `{ id, label }`.

```tsx
<Login
  apiUrl="http://localhost:8100/login"
  oauthApiUrl="http://localhost:8100"
  providers={['github', { id: 'apple', label: 'Sign in with Apple' }]}
  allowedOAuthHosts={['appleid.apple.com', 'github.com']}
/>
```

The boolean flags `enableApple`, `enableGoogle`, `enableFacebook`, `enableMicrosoft`, `enableGithub`, and `enableDiscord` still work when `providers` is omitted. `enableOAuth={false}` hides every provider button.

### Labels

Pass `labels` to replace any built-in string, including provider button text. Login and register success callbacks are typed separately: `AuthResponse` and `RegisterResponse`.

The card does not force a viewport height. Center it in the host layout. `className` and `style` apply to the card.

## Development

```bash
npm install
npm test
npm run build
```

GitHub Actions runs the same test and compile steps on pushes to `main` and `master`, and on pull requests.

The example app lives in `example/`.

## License

MIT
