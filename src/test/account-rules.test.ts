import { describe, expect, it } from 'vitest';
import { AUTH_MESSAGES, PASSWORD_MAX, PASSWORD_MIN, validateRegistration } from '@/lib/account-rules';

describe('registration rules', () => {
  it('rejects mismatched password confirmation with the Arabic mismatch message', () => {
    const r = validateRegistration({ username: 'nour_sci', password: 'galaxy-2026', confirm: 'galaxy-2027' });
    expect(r).toEqual({ ok: false, field: 'confirm', error: AUTH_MESSAGES.passwordMismatch });
    expect(AUTH_MESSAGES.passwordMismatch).toBe('كلمتا المرور غير متطابقتين.');
  });

  it('requires passwords of 8 to 72 characters', () => {
    expect(PASSWORD_MIN).toBe(8);
    expect(PASSWORD_MAX).toBe(72);
    expect(validateRegistration({ username: 'nour_sci', password: 'short7!', confirm: 'short7!' }).ok).toBe(false);
    expect(validateRegistration({ username: 'nour_sci', password: 'a'.repeat(73), confirm: 'a'.repeat(73) }).ok).toBe(false);
    expect(validateRegistration({ username: 'nour_sci', password: 'a'.repeat(8), confirm: 'a'.repeat(8) }).ok).toBe(true);
  });

  it('normalizes usernames to lowercase so duplicates differ only by case', () => {
    expect(validateRegistration({ username: ' Nour_Sci ', password: 'galaxy-2026', confirm: 'galaxy-2026' })).toEqual({ ok: true, username: 'nour_sci' });
  });

  it('rejects usernames outside the allowed format', () => {
    const r = validateRegistration({ username: 'نور', password: 'galaxy-2026', confirm: 'galaxy-2026' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.field).toBe('username');
  });

  it('uses the same message for unknown usernames and wrong passwords', () => {
    expect(AUTH_MESSAGES.invalidCredentials).toBe('اسم المستخدم أو كلمة المرور غير صحيحة.');
  });
});

import { sessionRejected } from '@/lib/account-rules';
describe('saved session', () => {
  it('ends the session only when the server rejects it', () => {
    expect(sessionRejected(401)).toBe(true);
    expect(sessionRejected(403)).toBe(true);
  });
  it('keeps the member signed in on network or server hiccups', () => {
    expect(sessionRejected(undefined)).toBe(false);
    expect(sessionRejected(0)).toBe(false);
    expect(sessionRejected(500)).toBe(false);
  });
});
