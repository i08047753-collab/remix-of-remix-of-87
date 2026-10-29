import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

// Extra confirmation layer for the moderation panel; real access still requires the admin role.
const ADMIN_PANEL_CODE = '67';

export const checkIsAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    return { admin: !role.error && role.data === true };
  });

export const verifyAdminCode = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ code: z.string().max(20) }).parse(v))
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (role.error || role.data !== true) return { ok: false };
    return { ok: data.code.trim() === ADMIN_PANEL_CODE };
  });
