import { createServerFn } from '@tanstack/react-start';
import {
  AUTH_MESSAGES,
  LOGIN_FAILURES_PER_CLIENT,
  LOGIN_FAILURES_PER_USERNAME,
  LOGIN_WINDOW_SECONDS,
  REGISTRATIONS_PER_CLIENT,
  REGISTRATION_WINDOW_SECONDS,
  passwordLengthOk,
  validateRegistration,
  type RegistrationField,
} from './account-rules';
import { normalizeUsername } from './rules';
import { clientKey, internalAccountEmail, passwordClient, usernameKey } from './account-auth.server';

type SessionTokens = { access_token: string; refresh_token: string };
type AuthResult = { ok: true; session: SessionTokens } | { ok: false; error: string; field?: RegistrationField };

// Validators never echo input: passwords must not appear in errors or logs.
const readCredentials = (input: unknown) => {
  const v = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const str = (x: unknown) => (typeof x === 'string' && x.length <= 256 ? x : '');
  return { username: str(v['username']), password: str(v['password']), confirm: str(v['confirm']) };
};

async function exchangePassword(email: string, password: string): Promise<SessionTokens | null> {
  const { data, error } = await passwordClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) return null;
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}

export const signInWithUsername = createServerFn({ method: 'POST' })
  .inputValidator(readCredentials)
  .handler(async ({ data }): Promise<AuthResult> => {
    const username = normalizeUsername(data.username);
    if (!/^[a-z0-9_]{3,20}$/.test(username) || !passwordLengthOk(data.password)) return { ok: false, error: AUTH_MESSAGES.invalidCredentials };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [client, user] = await Promise.all([clientKey(), usernameKey(username)]);
    const [byClient, byUser] = await Promise.all([
      supabaseAdmin.rpc('auth_rate_allowed', { p_kind: 'login_client', p_key: client, p_limit: LOGIN_FAILURES_PER_CLIENT, p_window_seconds: LOGIN_WINDOW_SECONDS }),
      supabaseAdmin.rpc('auth_rate_allowed', { p_kind: 'login_user', p_key: user, p_limit: LOGIN_FAILURES_PER_USERNAME, p_window_seconds: LOGIN_WINDOW_SECONDS }),
    ]);
    if (byClient.error || byUser.error) return { ok: false, error: AUTH_MESSAGES.unavailable };
    if (!byClient.data || !byUser.data) return { ok: false, error: AUTH_MESSAGES.tooManyAttempts };
    const fail = async (): Promise<AuthResult> => {
      await Promise.all([
        supabaseAdmin.rpc('auth_rate_record', { p_kind: 'login_client', p_key: client }),
        supabaseAdmin.rpc('auth_rate_record', { p_kind: 'login_user', p_key: user }),
      ]);
      return { ok: false, error: AUTH_MESSAGES.invalidCredentials };
    };
    const mapping = await supabaseAdmin.from('account_usernames').select('user_id').eq('username', username).maybeSingle();
    if (mapping.error) return { ok: false, error: AUTH_MESSAGES.unavailable };
    if (!mapping.data) return fail();
    const account = await supabaseAdmin.auth.admin.getUserById(mapping.data.user_id);
    if (account.error || !account.data.user?.email) return fail();
    const session = await exchangePassword(account.data.user.email, data.password);
    return session ? { ok: true, session } : fail();
  });

export const registerWithUsername = createServerFn({ method: 'POST' })
  .inputValidator(readCredentials)
  .handler(async ({ data }): Promise<AuthResult> => {
    const check = validateRegistration(data);
    if (!check.ok) return { ok: false, error: check.error, field: check.field };
    const username = check.username;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const client = await clientKey();
    const allowed = await supabaseAdmin.rpc('auth_rate_allowed', { p_kind: 'register_client', p_key: client, p_limit: REGISTRATIONS_PER_CLIENT, p_window_seconds: REGISTRATION_WINDOW_SECONDS });
    if (allowed.error) return { ok: false, error: AUTH_MESSAGES.unavailable };
    if (!allowed.data) return { ok: false, error: AUTH_MESSAGES.tooManyAttempts };
    const existing = await supabaseAdmin.from('account_usernames').select('user_id').eq('username', username).maybeSingle();
    if (existing.error) return { ok: false, error: AUTH_MESSAGES.unavailable };
    if (existing.data) return { ok: false, error: AUTH_MESSAGES.duplicateUsername, field: 'username' };
    await supabaseAdmin.rpc('auth_rate_record', { p_kind: 'register_client', p_key: client });
    const email = internalAccountEmail();
    // New members get no role rows: administrator privileges are only granted separately.
    const created = await supabaseAdmin.auth.admin.createUser({ email, password: data.password, email_confirm: true, user_metadata: { username } });
    if (created.error || !created.data.user) {
      const weak = created.error?.code === 'weak_password' || /password/i.test(created.error?.message ?? '');
      return weak ? { ok: false, error: AUTH_MESSAGES.weakPassword, field: 'password' } : { ok: false, error: AUTH_MESSAGES.unavailable };
    }
    const userId = created.data.user.id;
    const mapped = await supabaseAdmin.from('account_usernames').insert({ user_id: userId, username });
    if (mapped.error) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return mapped.error.code === '23505'
        ? { ok: false, error: AUTH_MESSAGES.duplicateUsername, field: 'username' }
        : { ok: false, error: AUTH_MESSAGES.unavailable };
    }
    const session = await exchangePassword(email, data.password);
    return session ? { ok: true, session } : { ok: false, error: AUTH_MESSAGES.unavailable };
  });
