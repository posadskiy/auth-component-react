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
  nonce: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  userId: number;
  provider: string;
  providerUserId: string;
}

export type OAuthProvider = 'google' | 'facebook';

export interface AuthApi {
  login: (username: string, password: string) => Promise<AuthResponse>;
  register?: (username: string, email: string, password: string) => Promise<AuthResponse | RegisterResponse>;
  oauthAuthorize?: (provider: OAuthProvider) => Promise<OAuthAuthorizationResponse>;
}

export interface AuthComponentProps {
  apiUrl?: string;
  authApi?: AuthApi;
  oauthApiUrl?: string;
  onSuccess?: (response: AuthResponse | RegisterResponse) => void;
  onError?: (error: Error) => void;
  showRegisterLink?: boolean;
  showLoginLink?: boolean;
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
  enableOAuth?: boolean;
}

export interface LoginProps extends AuthComponentProps {
  title?: string;
  submitButtonText?: string;
}

export interface RegisterProps extends AuthComponentProps {
  title?: string;
  submitButtonText?: string;
}

