import axios from 'axios';

export interface AccountSession {
  id: string;
  provider?: string | null;
  userAgent?: string | null;
  clientIp?: string | null;
  createdAt?: string | null;
}

export interface AccountIdentity {
  provider: string;
  email?: string | null;
}

export interface AccountPasskey {
  id: string;
  label?: string | null;
  createdAt?: string | null;
  lastUsedAt?: string | null;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function url(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path}`;
}

export async function listSessions(apiUrl: string, token: string): Promise<AccountSession[]> {
  const response = await axios.get<AccountSession[]>(url(apiUrl, '/account/sessions'), { headers: authHeaders(token) });
  return response.data;
}

export async function revokeSession(apiUrl: string, token: string, id: string): Promise<void> {
  await axios.delete(url(apiUrl, `/account/sessions/${encodeURIComponent(id)}`), { headers: authHeaders(token) });
}

export async function changePassword(apiUrl: string, token: string, currentPassword: string, password: string): Promise<void> {
  await axios.post(url(apiUrl, '/account/password'), { currentPassword, password }, { headers: authHeaders(token) });
}

export async function setPassword(apiUrl: string, token: string, password: string): Promise<void> {
  await axios.post(url(apiUrl, '/account/password/set'), { password }, { headers: authHeaders(token) });
}

export async function changeEmail(
  apiUrl: string,
  token: string,
  email: string,
  linkOrigin: string,
  password?: string,
): Promise<void> {
  await axios.post(url(apiUrl, '/account/email'), { email, linkOrigin, password }, { headers: authHeaders(token) });
}

export async function listIdentities(apiUrl: string, token: string): Promise<AccountIdentity[]> {
  const response = await axios.get<AccountIdentity[]>(url(apiUrl, '/account/identities'), { headers: authHeaders(token) });
  return response.data;
}

export async function unlinkIdentity(apiUrl: string, token: string, provider: string): Promise<void> {
  await axios.delete(url(apiUrl, `/account/identities/${encodeURIComponent(provider)}`), { headers: authHeaders(token) });
}

export async function listPasskeys(apiUrl: string, token: string): Promise<AccountPasskey[]> {
  const response = await axios.get<AccountPasskey[]>(url(apiUrl, '/account/passkeys'), { headers: authHeaders(token) });
  return response.data;
}

export async function deletePasskey(apiUrl: string, token: string, id: string): Promise<void> {
  await axios.delete(url(apiUrl, `/account/passkeys/${encodeURIComponent(id)}`), { headers: authHeaders(token) });
}

export async function exportAccount(apiUrl: string, token: string): Promise<unknown> {
  const response = await axios.get(url(apiUrl, '/account/export'), { headers: authHeaders(token) });
  return response.data;
}

export async function eraseAccount(apiUrl: string, token: string, confirmation: string, password?: string): Promise<void> {
  await axios.post(url(apiUrl, '/account/erase'), { confirmation, password }, { headers: authHeaders(token) });
}
