import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { chatFileSchema, chatSendSchema, validateChatBytes, type ChatMessage } from './chat-rules';

const failure='تعذّر إكمال الطلب. تحقق من اتصالك وحاول مجدداً.';
export const prepareChatUpload=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator((v:unknown)=>chatFileSchema.parse(v)).handler(async ({data,context})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const recent=await supabaseAdmin.from('chat_uploads').select('id',{count:'exact',head:true}).eq('owner_id',context.userId).gt('created_at',new Date(Date.now()-3600000).toISOString());
  if(recent.error || (recent.count ?? 0)>=30) throw new Error('وصلت إلى حد رفع الملفات. حاول لاحقاً.');
  const id=crypto.randomUUID(); const path=`${context.userId}/${id}.${data.name.split('.').at(-1)?.toLowerCase()}`;
  const row=await supabaseAdmin.from('chat_uploads').insert({id,owner_id:context.userId,path,name:data.name.replace(/[\u0000-\u001f/\\]/g,'_'),mime:data.type,size:data.size});
  if(row.error) throw new Error(failure);
  const signed=await supabaseAdmin.storage.from('chat-attachments').createSignedUploadUrl(path,{upsert:false});
  if(signed.error || !signed.data) throw new Error(failure);
  // Browser must receive its reachable storage origin, never the server-local origin.
  const publicOrigin=import.meta.env['VITE_SUPABASE_URL'];
  return {id,url:signed.data.signedUrl.replace(new URL(signed.data.signedUrl).origin,new URL(publicOrigin).origin)};
 });
export const verifyChatUpload=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator((v:unknown)=>z.object({id:z.string().uuid()}).parse(v)).handler(async ({data,context})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const row=await supabaseAdmin.from('chat_uploads').select('*').eq('id',data.id).eq('owner_id',context.userId).single();
  if(row.error || !row.data) throw new Error(failure);
  const upload=row.data;
  if(upload.cancelled) throw new Error('أُلغي هذا المرفق.');
  if(upload.verified) return {id:upload.id};
  if(Date.now()-new Date(upload.created_at).getTime()>3600000) throw new Error('انتهت صلاحية المرفق. أعد رفعه.');
  const stored=await supabaseAdmin.storage.from('chat-attachments').download(upload.path);
  if(stored.error || !stored.data) throw new Error(failure);
  const bytes=new Uint8Array(await stored.data.arrayBuffer());
  if(stored.data.size!==upload.size || !validateChatBytes(bytes,upload.mime)) {
   await supabaseAdmin.storage.from('chat-attachments').remove([upload.path]);
   throw new Error('محتوى الملف لا يطابق نوعه أو غير مسموح.');
  }
  // Upload capabilities never target the finalized object. Validate exact bytes,
  // then write a new immutable path inaccessible to the browser's upload ticket.
  const finalPath=`${context.userId}/verified/${crypto.randomUUID()}.${upload.path.split('.').at(-1)}`;
  const final=await supabaseAdmin.storage.from('chat-attachments').upload(finalPath,bytes,{contentType:upload.mime,upsert:false});
  if(final.error) throw new Error(failure);
  const mark=await supabaseAdmin.rpc('claim_chat_upload',{p_user:context.userId,p_id:upload.id,p_path:finalPath});
  if(mark.error || !mark.data) { await supabaseAdmin.storage.from('chat-attachments').remove([finalPath]); throw new Error(failure); }
  await supabaseAdmin.storage.from('chat-attachments').remove([upload.path]);
  return {id:upload.id};
 });
export const discardChatUpload=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator((v:unknown)=>z.object({id:z.string().uuid()}).parse(v)).handler(async ({data,context})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  // Verified objects may already be in a concurrent send. Never delete them here.
  const row=await supabaseAdmin.rpc('cancel_chat_upload',{p_user:context.userId,p_id:data.id});
  if(!row.error && row.data) await supabaseAdmin.storage.from('chat-attachments').remove([row.data]);
  return {ok:true};
 });
export const sendChatMessage=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator((v:unknown)=>chatSendSchema.parse(v)).handler(async ({data,context})=>{
  const verified=await context.supabase.auth.getUser();
  if(verified.error || !verified.data.user) throw new Error('سجّل الدخول لإرسال رسالة.');
  const user=verified.data.user;
  const metadata=user.user_metadata;
  const name=[metadata['username'],metadata['preferred_username'],metadata['full_name'],metadata['name']].find(v=>typeof v==='string' && v.trim());
  const username=typeof name==='string' ? name.trim().slice(0,80) : `عضو ${user.id.slice(0,8)}`;
  const candidate=metadata['avatar_url'] ?? metadata['picture'];
  let avatar:string|null=null;
  if(typeof candidate==='string') { try { if(new URL(candidate).protocol==='https:') avatar=candidate; } catch { /* no avatar */ } }
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const result=await supabaseAdmin.rpc('send_chat_message',{p_sender:context.userId,p_client:data.clientId,p_username:username,p_avatar:avatar ?? '',p_body:data.body,...(data.attachmentId?{p_attachment:data.attachmentId}:{})});
  if(result.error || !result.data) throw new Error(result.error?.message.includes('CHAT_RATE_LIMIT')?'انتظر لحظتين قبل إرسال الرسالة التالية.':failure);
  return {id:result.data};
 });
export const listChatMessages=createServerFn({method:'POST'}).middleware([requireSupabaseAuth])
 .inputValidator((v:unknown)=>z.object({before:z.object({time:z.string().datetime(),id:z.string().uuid()}).optional(),ids:z.array(z.string().uuid()).max(100).optional()}).parse(v))
 .handler(async ({data,context})=>{
  let query=context.supabase.from('chat_messages').select('*').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(40);
  if(data.before) query=query.or(`created_at.lt.${data.before.time},and(created_at.eq.${data.before.time},id.lt.${data.before.id})`);
  if(data.ids) query=query.in('id',data.ids);
  const rows=await query;
  if(rows.error) throw new Error(failure);
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const messages:ChatMessage[]=await Promise.all((rows.data ?? []).map(async m=>{
   let attachment:ChatMessage['attachment']=null;
   if(m.attachment_id) {
    const upload=await supabaseAdmin.from('chat_uploads').select('*').eq('id',m.attachment_id).eq('verified',true).maybeSingle();
    if(upload.data) {
     const u=upload.data;
     const [inline,download]=await Promise.all([supabaseAdmin.storage.from('chat-attachments').createSignedUrl(u.path,900),supabaseAdmin.storage.from('chat-attachments').createSignedUrl(u.path,900,{download:u.name})]);
     const origin=import.meta.env['VITE_SUPABASE_URL'];
     const browserUrl=(url:string)=>url.replace(new URL(url).origin,new URL(origin).origin);
     attachment={id:u.id,name:u.name,type:u.mime,size:u.size,url:inline.data?browserUrl(inline.data.signedUrl):'',downloadUrl:download.data?browserUrl(download.data.signedUrl):''};
    }
   }
   return {...m,attachment};
  }));
  return {messages:messages.reverse(),hasMore:(rows.data?.length ?? 0)===40};
 });