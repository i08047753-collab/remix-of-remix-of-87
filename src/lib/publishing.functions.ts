import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { attachmentSchema, contentSchema, EXT_BY_TYPE, MAX_ATTACHMENTS, validateFileBytes, validateFileMetadata, type Attachment, type ContentRecord } from './publishing-rules';
import { matchesPublishingCode } from './publishing-security.server';

const unavailable = 'تعذّر إكمال الطلب. حاول لاحقاً.';
const normalizeRows = (rows: Database['public']['Tables']['publishing_content']['Row'][]): ContentRecord[] => rows.map(r => ({...r, attachments: z.array(attachmentSchema).parse(r.attachments)}));

export const submitContent = createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    // Never include submitted access codes or file bytes in validation errors.
    if (!(input instanceof FormData)) throw new Error('طلب غير صالح.');
    return input;
  })
  .handler(async ({data,context}) => {
    const parsed = contentSchema.safeParse(Object.fromEntries(['kind','title','body','category','intent'].map(k => [k,data.get(k)])));
    if (!parsed.success) return {ok:false as const, error:'تحقق من العنوان والتفاصيل والمجال قبل الإرسال.'};
    const candidate = data.get('accessCode');
    if (typeof candidate !== 'string' || candidate.length > 256) return {ok:false as const,error:'رمز النشر غير صالح.'};
    const files = data.getAll('files');
    if (files.length > MAX_ATTACHMENTS || files.some(f => !(f instanceof File))) return {ok:false as const,error:'يمكن إرفاق ثلاثة ملفات كحد أقصى.'};
    for (const f of files) {
      if (!(f instanceof File)) return {ok:false as const,error:'ملف غير صالح.'};
      const error = validateFileMetadata(f);
      if (error) return {ok:false as const,error};
    }
    // Auth middleware has verified identity. Privileged writes are needed because
    // browser INSERT/UPDATE grants are intentionally absent to prevent code bypass.
    const {supabaseAdmin} = await import('@/integrations/supabase/client.server');
    const reservation = await supabaseAdmin.rpc('reserve_publishing_attempt',{p_user:context.userId});
    if (reservation.error || !reservation.data) return {ok:false as const,error:'وصلت إلى حد المحاولات. انتظر قبل إعادة الإرسال.'};
    if (!matchesPublishingCode(candidate, process.env['PUBLISHING_ACCESS_CODE'])) return {ok:false as const,error:'رمز النشر غير صالح.'};
    const mark = await supabaseAdmin.from('publishing_attempts').update({failed:false}).eq('id',reservation.data);
    if (mark.error) return {ok:false as const,error:unavailable};
    const attachments = [];
    const uploaded: string[] = [];
    try {
      for (const f of files) {
        if (!(f instanceof File)) throw new Error('INVALID_FILE');
        const bytes = new Uint8Array(await f.arrayBuffer());
        if (!validateFileBytes(bytes,f.type)) throw new Error('INVALID_FILE');
        const ext = EXT_BY_TYPE[f.type];
        if (!ext) throw new Error('INVALID_FILE');
        const path = `${context.userId}/${crypto.randomUUID()}.${ext}`;
        const upload = await supabaseAdmin.storage.from('publishing-attachments').upload(path,bytes,{contentType:f.type,upsert:false});
        if (upload.error) throw new Error('UPLOAD_FAILED');
        uploaded.push(path);
        attachments.push({name:f.name.replace(/[^\p{L}\p{N} ._-]/gu,'_').slice(0,120),path,type:f.type as Attachment['type'],size:bytes.length});
      }
      const c=parsed.data;
      const result=await supabaseAdmin.rpc('create_publishing_content',{p_user:context.userId,p_kind:c.kind,p_title:c.title,p_body:c.body,p_category:c.category,p_intent:c.intent,p_attachments:attachments});
      if (result.error || !result.data) throw new Error(result.error?.message.includes('SUBMISSION_LIMIT') ? 'LIMIT' : result.error?.message.includes('DUPLICATE_CONTENT') ? 'DUPLICATE' : 'SAVE_FAILED');
      return {ok:true as const,id:result.data};
    } catch (e) {
      if (uploaded.length) await supabaseAdmin.storage.from('publishing-attachments').remove(uploaded);
      const message=e instanceof Error ? e.message : '';
      return {ok:false as const,error:message==='INVALID_FILE'?'محتوى الملف لا يطابق نوعه أو يحتوي على عناصر غير مسموحة.':message==='LIMIT'?'انتظر دقيقة بين كل إرسال وآخر.':message==='DUPLICATE'?'هذا المحتوى أُرسل بالفعل.':unavailable};
    }
  });

export const listMyContent = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data,error}=await context.supabase.from('publishing_content').select('*').eq('owner_id',context.userId).order('created_at',{ascending:false}).limit(100);
  if(error) throw new Error(unavailable);
  return normalizeRows(data ?? []);
});
export const listReviewContent = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) return {allowed:false,items:[] as ContentRecord[]};
  const {data,error}=await context.supabase.from('publishing_content').select('*').in('status',['pending','approved']).order('created_at',{ascending:true}).limit(100);
  if(error) throw new Error(unavailable);
  return {allowed:true,items:normalizeRows(data ?? [])};
});
export const moderateContent = createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator((v:unknown) => { const p=z.object({id:z.string().uuid(),action:z.enum(['approve','reject','publish']),note:z.string().trim().max(500)}).safeParse(v); if(!p.success) throw new Error('طلب غير صالح.'); return p.data; })
 .handler(async ({data,context}) => {
   const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
   if(role.error || !role.data) return {ok:false,error:'هذا الإجراء متاح للمسؤول فقط.'};
   const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
   const result=await supabaseAdmin.rpc('moderate_publishing_content',{p_actor:context.userId,p_id:data.id,p_action:data.action,p_note:data.note});
   return result.error ? {ok:false,error:'تعذّر تغيير الحالة. أعد تحميل القائمة.'} : {ok:true,error:''};
 });
export const listPublishedContent=createServerFn({method:'GET'}).handler(async () => {
  const key=process.env['SUPABASE_PUBLISHABLE_KEY']; const url=process.env['SUPABASE_URL'];
  if(!key || !url) throw new Error(unavailable);
  const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers); if(key.startsWith('sb_') && headers.get('Authorization')===`Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey',key); return fetch(input,{...init,headers});}}});
  const {data,error}=await client.from('publishing_content').select('id,kind,title,body,category,intent,status,attachments,created_at,published_at').eq('status','published').order('published_at',{ascending:false}).limit(100);
  if(error) throw new Error(unavailable);
  return (data ?? []).map(r => ({...r, owner_id:'', note:'', attachments:z.array(attachmentSchema).parse(r.attachments)}));
});
