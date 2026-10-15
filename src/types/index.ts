import type { CSSProperties } from 'react';
import type { AuthLabels } from '../labels';
import type { OAuthProvider } from '../oauth/providerIds';

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  username?: string;
  userId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
}

export interface OAuthAuthorizationResponse {
  authorizationUri: string;
  state: string;
  nonce?: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userId: string;
  provider: string;
  providerUserId: string;
}

export type { OAuthProvider } from '../oauth/providerIds';

export type OAuthProviderOption = OAuthProvider | { id: OAuthProvider; label?: string };

export interface AuthApi {
  login: (username: string, password: string) => Promise<AuthResponse>;
  register?: (username: string, email: string, password: string) => Promise<RegisterResponse>;
  oauthAuthorize?: (provider: OAuthProvider) => Promise<OAuthAuthorizationResponse>;
}

export interface AuthComponentProps {
  apiUrl?: string;
  authApi?: AuthApi;
  oauthApiUrl?: string;
  onError?: (error: Error) => void;
  enableOAuth?: boolean;
  providers?: OAuthProviderOption[];
  enableGoogle?: boolean;
  enableFacebook?: boolean;
  enableApple?: boolean;
  enableMicrosoft?: boolean;
  enableGithub?: boolean;
  enableDiscord?: boolean;
  allowedOAuthHosts?: string[];
  labels?: Partial<AuthLabels>;
  className?: string;
  style?: CSSProperties;
}

export interface LoginProps extends AuthComponentProps {
  onSuccess?: (response: AuthResponse) => void;
  showRegisterLink?: boolean;
  onSwitchToRegister?: () => void;
  title?: string;
  submitButtonText?: string;
}

export interface RegisterProps extends AuthComponentProps {
  onSuccess?: (response: RegisterResponse) => void;
  showLoginLink?: boolean;
  onSwitchToLogin?: () => void;
  title?: string;
  submitButtonText?: string;
}
