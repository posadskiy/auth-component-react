import { useId, useState, type FormEvent } from 'react';
import { Alert, Anchor, Divider, Paper, PasswordInput, Stack, Text, TextInput, Title, Button } from '@mantine/core';
import axios from 'axios';
import { mapAuthError } from '../errors';
import { resolveLabels } from '../labels';
import { resolveProviders } from '../oauth/resolveProviders';
import type { AuthResponse, LoginProps, RegisterProps, RegisterResponse } from '../types';
import { OAuthButtons } from './OAuthButtons';
import { useOAuthAction } from './useOAuthAction';

type CredentialsFormProps = (LoginProps & { mode: 'login' }) | (RegisterProps & { mode: 'register' });

export function CredentialsForm(props: CredentialsFormProps) {
  const {
    mode,
    apiUrl,
    authApi,
    oauthApiUrl,
    oauthReturnTo,
    onError,
    enableOAuth,
    providers: providerOptions,
    enableGoogle,
    enableFacebook,
    enableApple,
    enableMicrosoft,
    enableGithub,
    enableDiscord,
    allowedOAuthHosts,
    labels: labelOverrides,
    className,
    style,
    title,
    submitButtonText,
  } = props;

  const labels = resolveLabels(labelOverrides);
  const errorId = useId();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const providers = resolveProviders(
    {
      enableOAuth,
      providers: providerOptions,
      enableGoogle,
      enableFacebook,
      enableApple,
      enableMicrosoft,
      enableGithub,
      enableDiscord,
    },
    mode,
    labels,
  );

  const oauth = useOAuthAction({
    oauthApiUrl,
    oauthReturnTo,
    allowedOAuthHosts,
    onError,
    disabled: submitting,
    labels,
  });

  const busy = submitting || oauth.activeProvider !== null;
  const switchToRegister = mode === 'login' ? props.onSwitchToRegister : undefined;
  const switchToLogin = mode === 'register' ? props.onSwitchToLogin : undefined;
  const showRegisterLink = mode === 'login' ? props.showRegisterLink !== false : false;
  const showLoginLink = mode === 'register' ? props.showLoginLink !== false : false;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    setFormError(null);
    setUsernameError(null);
    setSubmitting(true);

    try {
      if (props.mode === 'login') {
        if (!authApi?.login && !apiUrl) {
          throw new Error('Either apiUrl or authApi.login must be provided');
        }
        const response = authApi?.login
          ? await authApi.login(username.trim(), password)
          : (await axios.post<AuthResponse>(apiUrl as string, { username: username.trim(), password })).data;
        props.onSuccess?.(response);
      } else {
        if (!authApi?.register && !apiUrl) {
          throw new Error('Either apiUrl or authApi.register must be provided');
        }
        const payload = { username: username.trim(), email: email.trim(), password };
        const response = authApi?.register
          ? await authApi.register(payload.username, payload.email, payload.password)
          : (await axios.post<RegisterResponse>(apiUrl as string, payload)).data;
        props.onSuccess?.(response);
      }
    } catch (caught) {
      const mapped = mapAuthError(caught, mode, labels);
      if (mapped.field === 'username') setUsernameError(mapped.message);
      else setFormError(mapped.message);
      onError?.(mapped.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder className={className} style={{ width: '100%', ...style }}>
      <Title ta="center" mb="md">
        {title ?? (mode === 'login' ? 'Welcome back!' : 'Create an account')}
      </Title>

      {showRegisterLink && switchToRegister && (
        <Text ta="center" c="dimmed" mb="xl">
          {labels.noAccount}{' '}
          <Anchor component="button" type="button" size="sm" onClick={switchToRegister}>
            {labels.createAccount}
          </Anchor>
        </Text>
      )}

      {showLoginLink && switchToLogin && (
        <Text ta="center" c="dimmed" mb="xl">
          {labels.haveAccount}{' '}
          <Anchor component="button" type="button" size="sm" onClick={switchToLogin}>
            {labels.signIn}
          </Anchor>
        </Text>
      )}

      <OAuthButtons
        providers={providers}
        activeProvider={oauth.activeProvider}
        disabled={submitting}
        error={oauth.error}
        onSelect={oauth.start}
      />

      {providers.length > 0 && <Divider label={labels.orContinueWithEmail} labelPosition="center" my="xl" />}

      <form onSubmit={handleSubmit} aria-describedby={formError ? errorId : undefined}>
        <Stack>
          {formError && (
            <Alert id={errorId} color="red" role="alert">
              {formError}
            </Alert>
          )}

          <TextInput
            required
            name="username"
            autoComplete="username"
            label={labels.username}
            placeholder={mode === 'login' ? labels.usernamePlaceholder : labels.registerUsernamePlaceholder}
            value={username}
            disabled={busy}
            onChange={(event) => setUsername(event.target.value)}
            error={usernameError}
          />

          {mode === 'register' && (
            <TextInput
              required
              name="email"
              type="email"
              autoComplete="email"
              label={labels.email}
              placeholder={labels.emailPlaceholder}
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}

          <PasswordInput
            required
            name="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            label={labels.password}
            placeholder={labels.passwordPlaceholder}
            value={password}
            disabled={busy}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" loading={submitting} disabled={oauth.activeProvider !== null} fullWidth mt="xl">
            {submitButtonText ?? (mode === 'login' ? 'Sign in' : 'Register')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
