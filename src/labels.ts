import type { OAuthProvider } from './oauth/providerIds';

export interface AuthLabels {
  username: string;
  usernamePlaceholder: string;
  registerUsernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  email: string;
  emailPlaceholder: string;
  noAccount: string;
  createAccount: string;
  haveAccount: string;
  signIn: string;
  orContinueWithEmail: string;
  invalidCredentials: string;
  accountExists: string;
  genericError: string;
  oauthError: string;
  callbackPendingTitle: string;
  callbackPendingMessage: string;
  callbackSuccessTitle: string;
  callbackSuccessMessage: string;
  callbackErrorTitle: string;
  callbackMissingCode: string;
  continue: string;
  provider: Record<OAuthProvider, string>;
  registerProvider: Record<OAuthProvider, string>;
}

const providerLabels: Record<OAuthProvider, string> = {
  apple: 'Sign in with Apple',
  google: 'Continue with Google',
  facebook: 'Continue with Facebook',
  microsoft: 'Continue with Microsoft',
  github: 'Continue with GitHub',
  discord: 'Continue with Discord',
};

export const defaultLabels: AuthLabels = {
  username: 'Username',
  usernamePlaceholder: 'Enter your username',
  registerUsernamePlaceholder: 'Your username',
  password: 'Password',
  passwordPlaceholder: 'Your password',
  email: 'Email',
  emailPlaceholder: 'your@email.com',
  noAccount: "Don't have an account yet?",
  createAccount: 'Create account',
  haveAccount: 'Already have an account?',
  signIn: 'Sign in',
  orContinueWithEmail: 'Or continue with email',
  invalidCredentials: 'Invalid credentials',
  accountExists: 'An account with these details already exists',
  genericError: 'Something went wrong. Please try again.',
  oauthError: 'OAuth authorization failed',
  callbackPendingTitle: 'Finishing up…',
  callbackPendingMessage: 'Completing sign-in with your provider',
  callbackSuccessTitle: 'Success!',
  callbackSuccessMessage: 'Sign-in successful!',
  callbackErrorTitle: 'Error',
  callbackMissingCode: 'Missing OAuth code in callback URL.',
  continue: 'Continue',
  provider: providerLabels,
  registerProvider: {
    ...providerLabels,
    apple: 'Sign up with Apple',
  },
};

export function resolveLabels(overrides?: Partial<AuthLabels>): AuthLabels {
  if (!overrides) return defaultLabels;
  return {
    ...defaultLabels,
    ...overrides,
    provider: { ...defaultLabels.provider, ...overrides.provider },
    registerProvider: { ...defaultLabels.registerProvider, ...overrides.registerProvider },
  };
}
