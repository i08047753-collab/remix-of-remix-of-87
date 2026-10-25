import { validateUsername } from './rules';

export const PASSWORD_MIN = 8;
/** The auth provider hashes passwords with bcrypt, which ignores bytes past 72. */
export const PASSWORD_MAX = 72;
export const LOGIN_FAILURES_PER_USERNAME = 10;
export const LOGIN_FAILURES_PER_CLIENT = 30;
export const LOGIN_WINDOW_SECONDS = 15 * 60;
export const REGISTRATIONS_PER_CLIENT = 5;
export const REGISTRATION_WINDOW_SECONDS = 60 * 60;

export const AUTH_MESSAGES = {
  invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
  duplicateUsername: 'اسم المستخدم هذا مسجّل بالفعل، اختر اسماً آخر.',
  passwordMismatch: 'كلمتا المرور غير متطابقتين.',
  passwordLength: `كلمة المرور يجب أن تكون بين ${PASSWORD_MIN} و${PASSWORD_MAX} حرفاً.`,
  weakPassword: 'كلمة المرور ضعيفة أو ظهرت في تسريبات سابقة، اختر كلمة أقوى.',
  tooManyAttempts: 'محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً.',
  unavailable: 'تعذّر إكمال الطلب الآن. حاول لاحقاً.',
} as const;

export type RegistrationField = 'username' | 'password' | 'confirm';
export type RegistrationCheck =
  | { ok: true; username: string }
  | { ok: false; field: RegistrationField; error: string };

export function passwordLengthOk(password: string) {
  const bytes = new TextEncoder().encode(password).length;
  return password.length >= PASSWORD_MIN && bytes <= PASSWORD_MAX;
}

/** Shared by the form and the server; the server is the authority. */
export function validateRegistration(input: { username: unknown; password: unknown; confirm: unknown }): RegistrationCheck {
  const username = typeof input.username === 'string' ? input.username : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const confirm = typeof input.confirm === 'string' ? input.confirm : '';
  const name = validateUsername(username);
  if (!name.ok) return { ok: false, field: 'username', error: name.error };
  if (!passwordLengthOk(password)) return { ok: false, field: 'password', error: AUTH_MESSAGES.passwordLength };
  if (password !== confirm) return { ok: false, field: 'confirm', error: AUTH_MESSAGES.passwordMismatch };
  return { ok: true, username: name.value };
}
