import type { AuthResponse, OAuthTokenResponse, RegisterResponse } from './types';

export function isAuthResponse(value: unknown): value is AuthResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.access_token === 'string' && record.access_token.length > 0 && typeof record.expires_in === 'number';
}

export function isRegisterResponse(value: unknown): value is RegisterResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && typeof record.username === 'string' && typeof record.email === 'string';
}

export function isOAuthTokenResponse(value: unknown): value is OAuthTokenResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.access_token === 'string' &&
    record.access_token.length > 0 &&
    typeof record.refresh_token === 'string' &&
    record.refresh_token.length > 0 &&
    typeof record.user_id === 'string' &&
    record.user_id.length > 0
  );
}
