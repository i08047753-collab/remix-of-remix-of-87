import { Link } from '@tanstack/react-router';
import { CategoryChip, IntentBadge } from '@/components/common/Chips';
import { AttachmentList } from '@/components/common/AttachmentList';
import { PostSocial } from '@/components/feed/PostSocial';
import { categoryBySlug, intentByKey } from '@/data/catalog';
import type { ContentRecord } from '@/lib/publishing-rules';
import { splitHashtags } from '@/lib/hashtags';
import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportDialog } from '@/components/safety/SafetyMenu';
function ReportButton({label}:{label:string}){const [open,setOpen]=useState(false);return <><button type="button" onClick={()=>setOpen(true)} aria-label="إبلاغ عن المنشور" className="ms-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-destructive"><Flag className="size-3.5"/>إبلاغ</button><ReportDialog open={open} onOpenChange={setOpen} targetLabel={label}/></>;}
export function TaggedText({text}:{text:string}) {
 return <>{splitHashtags(text).map((p,i)=>p.tag?<Link key={i} to="/explore" search={{q:'#'+p.tag}} className="font-medium text-primary hover:underline">{p.text}</Link>:<span key={i}>{p.text}</span>)}</>;
}
export function PublishedCard({content}:{content:ContentRecord}) {
 const cat=categoryBySlug(content.category);const intent=intentByKey(content.intent);
 return <article className="surface p-5">
  <div className="flex flex-wrap items-center gap-2">{cat&&<CategoryChip slug={cat.slug}/>} {intent&&<IntentBadge intent={intent.key}/>}<span className="text-xs text-muted-foreground">{content.kind==='article'?'مقال':'منشور'} · {new Date(content.created_at).toLocaleDateString('ar-DZ')}</span><ReportButton label={`المنشور: ${content.title}`}/></div>
  <h2 className="mt-3 text-lg font-semibold">{content.title}</h2>
  <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground"><TaggedText text={content.body}/></p>
  <AttachmentList attachments={content.attachments}/>
  <PostSocial contentId={content.id}/>
 </article>;
}
