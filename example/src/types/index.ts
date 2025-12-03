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

export interface AuthApi {
  login: (username: string, password: string) => Promise<AuthResponse>;
  register?: (username: string, email: string, password: string) => Promise<AuthResponse | RegisterResponse>;
}

export interface AuthComponentProps {
  apiUrl?: string;
  authApi?: AuthApi;
  onSuccess?: (response: AuthResponse | RegisterResponse) => void;
  onError?: (error: Error) => void;
  showRegisterLink?: boolean;
  showLoginLink?: boolean;
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
}

export interface LoginProps extends AuthComponentProps {
  title?: string;
  submitButtonText?: string;
}

export interface RegisterProps extends AuthComponentProps {
  title?: string;
  submitButtonText?: string;
}

