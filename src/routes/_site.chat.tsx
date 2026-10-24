import { createFileRoute } from '@tanstack/react-router';
import { GroupChat } from '@/components/chat/GroupChat';
export const Route=createFileRoute('/_site/chat')({
 head:()=>({meta:[{title:'الدردشة الجماعية — STORM WORLD'},{name:'description',content:'دردشة جماعية مباشرة لأعضاء STORM WORLD حول العلوم والفلك والفضاء.'},{property:'og:title',content:'الدردشة الجماعية — STORM WORLD'},{property:'og:description',content:'ملتقى محبّي العلوم والفضاء في STORM WORLD.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:GroupChat,
});