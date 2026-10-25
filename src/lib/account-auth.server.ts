import { createClient } from '@supabase/supabase-js';
import { getRequestHeader } from '@tanstack/react-start/server';
import type { Database } from '@/integrations/supabase/types';

/** Accounts are keyed by an internal address nobody sees or types; usernames map to it server-side. */
export const internalAccountEmail = () => `${crypto.randomUUID()}@accounts.stormworld.app`;

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

/** Rate-limit keys are hashed so raw IPs and usernames are never stored in the limiter table. */
export async function clientKey() {
  const ip = getRequestHeader('cf-connecting-ip') ?? getRequestHeader('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return sha256(`client:${ip}`);
}
export const usernameKey = (username: string) => sha256(`user:${username}`);

/** Session-less publishable client used only to exchange a password for a session. */
export function passwordClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('CONFIG');
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
