import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Attachment } from '@/lib/publishing-rules';
import { Button } from '@/components/ui/button';
export function AttachmentList({attachments}:{attachments:Attachment[]}) {
 const [urls,setUrls]=useState<Record<string,string>>({});
 useEffect(()=>{let active=true;setUrls({});void Promise.all(attachments.map(async a=>{
   const {data}=await supabase.storage.from('publishing-attachments').createSignedUrl(a.path,300,{download:a.name});
   return [a.path,data?.signedUrl ?? ''] as const;
 })).then(entries=>{if(active)setUrls(Object.fromEntries(entries));});return ()=>{active=false;};},[attachments]);
 if(!attachments.length)return null;
 return <ul className="mt-3 flex flex-wrap gap-2">{attachments.map(a=><li key={a.path} className="min-w-0 max-w-full"><Button asChild variant="outline" size="sm" disabled={!urls[a.path]}><a href={urls[a.path] || undefined} target="_blank" rel="noopener noreferrer" className="max-w-full"><Download className="shrink-0"/><span className="truncate">{a.name}</span></a></Button></li>)}</ul>;
}
