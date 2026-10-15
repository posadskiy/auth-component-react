import { useRef, useState } from 'react';
import type { AuthLabels } from '../labels';
import { mapAuthError } from '../errors';
import { beginOAuthAuthorization } from '../oauth/authorize';
import type { OAuthProvider } from '../types';

export function useOAuthAction(options: {
  oauthApiUrl?: string;
  oauthReturnTo?: string;
  allowedOAuthHosts?: string[];
  onError?: (error: Error) => void;
  disabled: boolean;
  labels: AuthLabels;
}) {
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const start = (provider: OAuthProvider) => {
    if (options.disabled || pendingRef.current) return;
    pendingRef.current = true;

    setError(null);
    setActiveProvider(provider);

    try {
      beginOAuthAuthorization({
        provider,
        oauthApiUrl: options.oauthApiUrl,
        oauthReturnTo: options.oauthReturnTo,
        allowedOAuthHosts: options.allowedOAuthHosts,
      });
    } catch (caught) {
      const mapped = mapAuthError(caught, 'oauth', options.labels);
      setError(mapped.message);
      options.onError?.(mapped.error);
      pendingRef.current = false;
      setActiveProvider(null);
    }
  };

  return { activeProvider, error, start };
}
