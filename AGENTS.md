<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- The whole UI is Arabic RTL (`<html lang="ar" dir="rtl">`); use logical utilities (`ms-`, `ps-`, `start-`, `text-start`) instead of left/right so layout stays correct.
- App pages live under the pathless `_site` layout (header + mobile bottom nav); `/` (welcome) and `/onboarding` render without it — keeps the first-visit flow focused.
- Theme is a `.dark` class on `<html>`, set before paint by `THEME_BOOT_SCRIPT` in `src/lib/app-state.ts` and stored via `useTheme` — avoids a flash of the wrong theme.
- Publishing uses Lovable Cloud Auth and `publishing_content`; profiles and previous drafts remain in `useLocalStore` and are never silently migrated or cleared. Static shared sample collections remain empty to avoid fabricated activity.
- Publishing writes and moderation run only through authenticated server functions; browser write grants are absent, the access code is server-only, administrator roles are separate, and database functions atomically enforce submission limits and review transitions to prevent direct-API bypass.
- Attachments are uploaded by the verified server to a private bucket after allowlist, size, and signature checks; readers receive short-lived download URLs only for owner/admin-visible or published content. Generated Cloud integration files stay untouched.
- One root AuthProvider owns session subscriptions and account-cache cleanup; public submit/admin screens use inline sign-in prompts and every private operation authenticates again on the server.
- Any control that is not backed by a server must be visibly labelled as a demo (`DemoNote` or toast copy) — the brief forbids implying auth, messaging or moderation work before they do.
- Business rules (username format/uniqueness, bio limit, submissions start as pending) live in `src/lib/rules.ts` with tests in `src/test/rules.test.ts` — the server must enforce the same rules later.
- Onboarding answers are private; public profiles show only fields the member opts in to show.

- Chat uses authenticated server functions for identity, idempotent message writes and verified private uploads; browser upload capabilities are single-path and message/file reads require membership.
