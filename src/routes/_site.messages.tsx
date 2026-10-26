import { createFileRoute } from '@tanstack/react-router';
import { DirectMessages } from '@/components/chat/DirectMessages';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute('/_site/messages')({
  validateSearch: (search: Record<string, unknown>): { c?: string } =>
    typeof search['c'] === 'string' && UUID.test(search['c']) ? { c: search['c'] } : {},
  head: () => ({
    meta: [
      { title: 'الرسائل الخاصة — STORM WORLD' },
      { name: 'description', content: 'راسل أعضاء STORM WORLD بشكل خاص وآمن.' },
      { property: 'og:title', content: 'الرسائل الخاصة — STORM WORLD' },
      { property: 'og:description', content: 'محادثات خاصة بين أعضاء مجتمع STORM WORLD.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { c } = Route.useSearch();
  return <DirectMessages activeId={c} />;
}
