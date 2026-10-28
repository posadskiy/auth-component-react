import { describe, expect, it } from 'vitest';
import { resolveAccountOrigin, resolveLinkOrigin } from './linkOrigin';
import { passwordIssue } from './validate';

describe('resolveLinkOrigin', () => {
  it('keeps an http(s) origin and drops a trailing slash', () => {
    expect(resolveLinkOrigin('https://grammarbar.com')).toBe('https://grammarbar.com');
    expect(resolveLinkOrigin('https://grammarbar.com/')).toBe('https://grammarbar.com');
    expect(resolveLinkOrigin('http://localhost:3000')).toBe('http://localhost:3000');
  });

  it('uses the current page origin when none is provided', () => {
    expect(resolveLinkOrigin()).toBe(window.location.origin);
  });

  it('rejects a path, query, hash, userinfo, or custom scheme', () => {
    expect(() => resolveLinkOrigin('https://grammarbar.com/reset-password')).toThrow(/site origin/);
    expect(() => resolveLinkOrigin('https://grammarbar.com?token=1')).toThrow(/site origin/);
    expect(() => resolveLinkOrigin('https://grammarbar.com#reset')).toThrow(/site origin/);
    expect(() => resolveLinkOrigin('https://user:pass@grammarbar.com')).toThrow(/site origin/);
    expect(() => resolveLinkOrigin('myapp://grammarbar.com')).toThrow(/site origin/);
  });
});

describe('resolveAccountOrigin', () => {
  it('uses the account origin, or the origin of the login URL', () => {
    expect(resolveAccountOrigin('http://localhost:8100/login')).toBe('http://localhost:8100');
    expect(resolveAccountOrigin(undefined, 'http://localhost:8100/login')).toBe('http://localhost:8100');
  });
});

describe('passwordIssue', () => {
  it('requires 10 to 72 characters and rejects the email', () => {
    expect(passwordIssue('short', [])).toBe('length');
    expect(passwordIssue('a'.repeat(73), [])).toBe('length');
    expect(passwordIssue('a'.repeat(10), [])).toBeNull();
    expect(passwordIssue('a'.repeat(72), [])).toBeNull();
    expect(passwordIssue('Ada@Example.com', ['ada@example.com'])).toBe('identity');
    expect(passwordIssue('correct-horse', ['ada@example.com'])).toBeNull();
  });
});