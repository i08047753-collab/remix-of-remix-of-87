import { useState } from 'react';
import { Check, Copy, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { fileSize, type ChatMessage } from '@/lib/chat-rules';
import { toast } from 'sonner';

export function ChatMessageItem({message,own}:{message:ChatMessage;own:boolean}) {
 const [copied,setCopied]=useState(false);
 const [avatarFailed,setAvatarFailed]=useState(false);
 const [mediaFailed,setMediaFailed]=useState(false);
 const a=message.attachment;
 return <li className={`group flex items-end gap-2.5 motion-safe:animate-rise ${own?'flex-row':'flex-row-reverse'}`}>
  {message.avatar_url && !avatarFailed ? <img src={message.avatar_url} alt={message.username} referrerPolicy="no-referrer" onError={()=>setAvatarFailed(true)} className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"/> : <MemberAvatar name={message.username} seed={message.sender_id} className="size-9 text-sm"/>}
  <div className={`min-w-0 max-w-[85%] sm:max-w-[72%] ${own?'':'text-start'}`}>
   <div className={`mb-1.5 flex items-center gap-2 px-1 ${own?'':'flex-row-reverse'}`}><span title={message.sender_id} className="truncate text-xs font-semibold text-muted-foreground">{message.username}<span className="ms-1 font-normal opacity-60">#{message.sender_id.slice(0,6)}</span></span>{own && <span className="text-[10px] text-primary">أنت</span>}</div>
   <div className={`overflow-hidden rounded-2xl border px-4 py-3 shadow-card ${own?'rounded-br-sm border-primary/20 bg-accent text-accent-foreground':'rounded-bl-sm border-border bg-card text-card-foreground'}`}>
    {a && <div className={message.body?'mb-3':''}>
     {a.type.startsWith('image/') && <a href={a.url} target="_blank" rel="noopener noreferrer"><img src={a.url} alt={a.name} className="max-h-80 w-full rounded-lg object-contain" loading="lazy"/></a>}
     {a.type.startsWith('video/') && <><video src={a.url} controls playsInline preload="metadata" onError={()=>setMediaFailed(true)} onLoadedData={()=>setMediaFailed(false)} className="max-h-80 w-full rounded-lg" aria-label={a.name}/>{mediaFailed&&<p role="status" className="mt-2 text-xs text-warning">تعذّر تشغيل هذا الفيديو هنا. يمكنك تنزيله ومشاهدته على جهازك.</p>}</>}
     <div className="mt-2 flex min-w-0 items-center gap-2">{!a.type.startsWith('image/') && !a.type.startsWith('video/') && <FileText className="size-8 shrink-0 text-storm"/>}<div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{a.name}</p><p className="text-[10px] text-muted-foreground" dir="ltr">{fileSize(a.size)}</p></div><Button asChild variant="ghost" size="icon" className="size-8 shrink-0" title="تنزيل الملف"><a href={a.downloadUrl} target="_blank" rel="noopener noreferrer" aria-label={`تنزيل ${a.name}`}><Download className="size-4"/></a></Button></div>
    </div>}
    {message.body && <p dir="auto" className="whitespace-pre-wrap break-words text-sm leading-7 [overflow-wrap:anywhere]">{message.body}</p>}
    <div className="mt-1 flex items-center justify-end gap-1.5"><time dateTime={message.created_at} className="text-[10px] text-muted-foreground" title={new Date(message.created_at).toLocaleString('ar-DZ')}>{new Date(message.created_at).toLocaleTimeString('ar-DZ',{hour:'2-digit',minute:'2-digit'})}</time>{own && <Check className="size-3 text-primary"/>}{message.body && <Button variant="ghost" size="icon" className="size-6 text-muted-foreground" title="نسخ الرسالة" aria-label="نسخ الرسالة" onClick={async()=>{try{await navigator.clipboard.writeText(message.body);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch{toast.error('تعذّر نسخ الرسالة.');}}}>{copied?<Check className="size-3"/>:<Copy className="size-3"/>}</Button>}</div>
   </div>
  </div>
 </li>;
}