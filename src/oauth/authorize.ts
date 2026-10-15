import axios from 'axios';
import { navigation } from '../navigation';
import type { AuthApi, OAuthAuthorizationResponse, OAuthProvider } from '../types';
import { persistOAuthTransaction } from './storage';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function assertSafeAuthorizationUri(uri: string, allowedHosts?: string[]): URL {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    throw new Error('OAuth provider returned an invalid authorization URL.');
  }

  const hostname = url.hostname.toLowerCase();
  const isLocal = LOCAL_HOSTS.has(hostname);
  const https = url.protocol === 'https:';
  const localHttp = url.protocol === 'http:' && isLocal;

  if (!https && !localHttp) {
    throw new Error('OAuth authorization URL must use HTTPS.');
  }

  if (allowedHosts && allowedHosts.length > 0) {
    const allowed = new Set(allowedHosts.map((host) => host.toLowerCase()));
    if (!allowed.has(hostname)) {
      throw new Error('OAuth authorization URL host is not allowed.');
    }
  }

  return url;
}

export async function beginOAuthAuthorization(options: {
  provider: OAuthProvider;
  oauthApiUrl?: string;
  authApi?: AuthApi;
  allowedOAuthHosts?: string[];
}): Promise<void> {
  const { provider, oauthApiUrl, authApi, allowedOAuthHosts } = options;

  if (!authApi?.oauthAuthorize && !oauthApiUrl) {
    throw new Error('Either oauthApiUrl or authApi.oauthAuthorize must be provided for OAuth');
  }

  const data = authApi?.oauthAuthorize
    ? await authApi.oauthAuthorize(provider)
    : (await axios.get<OAuthAuthorizationResponse>(`${oauthApiUrl}/oauth2/authorize/${provider}`)).data;

  if (!data?.state) {
    throw new Error('OAuth provider response did not include a state value.');
  }
  if (!data.authorizationUri) {
    throw new Error('OAuth provider response did not include an authorization URL.');
  }

  assertSafeAuthorizationUri(data.authorizationUri, allowedOAuthHosts);
  persistOAuthTransaction(data.state, data.nonce ?? '');
  navigation.assign(data.authorizationUri);
}
