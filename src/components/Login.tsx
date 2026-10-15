import type { LoginProps } from '../types';
import { CredentialsForm } from './CredentialsForm';

export function Login(props: LoginProps) {
  return <CredentialsForm {...props} mode="login" />;
}
