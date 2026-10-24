import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import '@lovable.dev/cloud-auth-js/styles.css';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
export const Route=createFileRoute('/auth')({
 head:()=>({meta:[{title:'تسجيل الدخول للنشر — STORM WORLD'},{name:'description',content:'سجّل دخولك بأمان لإرسال منشوراتك ومقالاتك للمراجعة.'},{property:'og:title',content:'تسجيل الدخول — STORM WORLD'},{property:'og:description',content:'حساب آمن للنشر في مجتمع STORM WORLD.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),component:AuthPage
});
function AuthPage(){
 const {user}=useAuth(); const navigate=useNavigate();
 const [mode,setMode]=useState<'login'|'signup'|'reset'>('login');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{if(user)void navigate({to:'/submit',replace:true});},[user,navigate]);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();if(busy)return;
  if(!z.string().email().max(254).safeParse(email.trim()).success || (mode!=='reset' && password.length<8)){toast.error('أدخل بريداً صحيحاً وكلمة مرور من 8 أحرف على الأقل.');return;}
  setBusy(true);
  try {
   if(mode==='reset'){const r=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/auth-reset'});if(r.error)throw new Error();toast.success('إذا كان الحساب موجوداً، ستصلك رسالة الاستعادة.');}
   else if(mode==='signup'){const r=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/auth'}});if(r.error)throw new Error();toast.success('تحقق من بريدك لتأكيد الحساب.');}
   else {const r=await supabase.auth.signInWithPassword({email:email.trim(),password});if(r.error)throw new Error();await navigate({to:'/submit'});}
  }catch{toast.error('تعذّر تسجيل الدخول أو إرسال الطلب. تحقق من معلوماتك وحاول لاحقاً.');}finally{setBusy(false);setPassword('');}
 };
 const social=async(provider:'google'|'lovable')=>{const r=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin+'/auth'});if(r.error)toast.error('تعذّر تسجيل الدخول.');};
 return <main className="mx-auto max-w-md px-4 py-10"><Logo/><h1 className="mt-8 text-2xl font-bold">{mode==='signup'?'إنشاء حساب':mode==='reset'?'استعادة كلمة المرور':'تسجيل الدخول'}</h1>
 <form className="mt-6 space-y-4" onSubmit={submit}><div className="space-y-2"><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" type="email" dir="ltr" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/></div>
 {mode!=='reset'&&<div className="space-y-2"><Label htmlFor="password">كلمة المرور</Label><Input id="password" type="password" autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} maxLength={128}/></div>}
 <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy?'جارٍ الإرسال…':mode==='signup'?'إنشاء حساب':mode==='reset'?'أرسل رابط الاستعادة':'تسجيل الدخول'}</Button></form>
 <div className="mt-4 space-y-3"><Button variant="outline" className="w-full" onClick={()=>void social('google')}>المتابعة مع Google</Button><Button className="lovable-auth-button w-full" onClick={()=>void social('lovable')}>Continue with Lovable</Button></div>
 <div className="mt-4 flex flex-wrap gap-2"><Button variant="link" onClick={()=>setMode(mode==='signup'?'login':'signup')}>{mode==='signup'?'لدي حساب':'إنشاء حساب جديد'}</Button><Button variant="link" onClick={()=>setMode('reset')}>نسيت كلمة المرور</Button><Button variant="link" asChild><Link to="/feed">العودة للمجتمع</Link></Button></div></main>;
}
