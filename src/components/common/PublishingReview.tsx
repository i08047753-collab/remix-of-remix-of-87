import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { Check, X, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { listReviewContent, moderateContent } from '@/lib/publishing.functions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AttachmentList } from './AttachmentList';
import { cn } from '@/lib/utils';
export function PublishingReview(){
 const {user}=useAuth();const queryClient=useQueryClient();const fetch=useServerFn(listReviewContent);const moderate=useServerFn(moderateContent);
 const query=useQuery({queryKey:['publishing-review',user?.id],queryFn:()=>fetch(),enabled:!!user});
 const [selectedId,setSelectedId]=useState<string>();const [note,setNote]=useState('');const [busy,setBusy]=useState(false);
 const items=query.data?.items ?? [];const selected=items.find(i=>i.id===selectedId) ?? items[0];
 const act=async(action:'approve'|'reject'|'publish')=>{if(!selected||busy)return;setBusy(true);try{const r=await moderate({data:{id:selected.id,action,note}});if(!r.ok){toast.error(r.error);return;}toast.success('تم تحديث حالة المحتوى.');await queryClient.invalidateQueries({queryKey:['publishing-review']});await queryClient.invalidateQueries({queryKey:['published-content']});}catch{toast.error('تعذّر تحديث الحالة.');}finally{setBusy(false);}};
 if(!user)return <p className="surface p-6 text-muted-foreground"><Link to="/auth" className="text-primary hover:underline">سجّل دخولك</Link> بحساب مسؤول للوصول للمراجعة.</p>;
 if(query.isLoading)return <p className="text-muted-foreground">جارٍ تحميل المراجعة…</p>;
 if(query.isError)return <p className="text-destructive">تعذّر تحميل المراجعة.</p>;
 if(!query.data?.allowed)return <p className="surface p-6 text-muted-foreground">المراجعة متاحة للمسؤولين فقط.</p>;
 if(!items.length)return <p className="surface p-6 text-center text-muted-foreground">لا توجد منشورات متاحة للمراجعة.</p>;
 return <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]"><ul className="space-y-2">{items.map(i=><li key={i.id}><Button variant="outline" className={cn('h-auto w-full flex-col items-start whitespace-normal p-3 text-start',selected?.id===i.id&&'border-primary bg-accent')} onClick={()=>{setSelectedId(i.id);setNote('');}}><span className="text-xs text-muted-foreground">{i.kind==='article'?'مقال':'منشور'} · {i.status==='pending'?'قيد المراجعة':'مقبول'}</span><span>{i.title}</span></Button></li>)}</ul>{selected&&<section className="surface space-y-4 p-5"><h3 className="text-lg font-semibold">{selected.title}</h3><p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{selected.body}</p><AttachmentList attachments={selected.attachments}/><Textarea aria-label="ملاحظة المراجعة" placeholder="ملاحظة لطيفة للعضو" value={note} maxLength={500} onChange={e=>setNote(e.target.value)}/><div className="flex flex-wrap gap-2"><Button variant="success" disabled={busy||selected.status!=='pending'} onClick={()=>void act('approve')}><Check/>قبول</Button><Button variant="destructive" disabled={busy} onClick={()=>void act('reject')}><X/>رفض</Button><Button variant="hero" disabled={busy||selected.status!=='approved'} onClick={()=>void act('publish')}><Megaphone/>نشر</Button></div></section>}</div>;
}
