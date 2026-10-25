import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { registerWithUsername, signInWithUsername } from '@/lib/account-auth.functions';
import { AUTH_MESSAGES, PASSWORD_MAX, PASSWORD_MIN, validateRegistration, type RegistrationField } from '@/lib/account-rules';
import { USERNAME_MAX } from '@/lib/rules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
export const Route=createFileRoute('/auth')({
 head:()=>({meta:[{title:'تسجيل الدخول للنشر — STORM WORLD'},{name:'description',content:'سجّل دخولك باسم المستخدم وكلمة المرور لإرسال منشوراتك ومقالاتك للمراجعة.'},{property:'og:title',content:'تسجيل الدخول — STORM WORLD'},{property:'og:description',content:'حساب آمن للنشر في مجتمع STORM WORLD.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),component:AuthPage
});
function AuthPage(){
 const {user}=useAuth(); const navigate=useNavigate();
 const signIn=useServerFn(signInWithUsername); const register=useServerFn(registerWithUsername);
 const [mode,setMode]=useState<'login'|'signup'>('login');const [username,setUsername]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [busy,setBusy]=useState(false);
 const [error,setError]=useState<{field?:RegistrationField;message:string}|null>(null);
 useEffect(()=>{if(user)void navigate({to:'/submit',replace:true});},[user,navigate]);
 const switchMode=()=>{setMode(mode==='signup'?'login':'signup');setError(null);setPassword('');setConfirm('');};
 const submit=async(e:React.FormEvent)=>{e.preventDefault();if(busy)return;setError(null);
  if(mode==='signup'){const check=validateRegistration({username,password,confirm});if(!check.ok){setError({field:check.field,message:check.error});return;}}
  else if(!username.trim()||!password){setError({message:AUTH_MESSAGES.invalidCredentials});return;}
  setBusy(true);
  try {
   const r=mode==='signup'?await register({data:{username,password,confirm}}):await signIn({data:{username,password}});
   if(!r.ok){setError({field:r.field,message:r.error});return;}
   const s=await supabase.auth.setSession(r.session);
   if(s.error)throw new Error();
   toast.success(mode==='signup'?'تم إنشاء حسابك، مرحباً بك!':'تم تسجيل الدخول.');
   await navigate({to:'/submit'});
  }catch{setError({message:AUTH_MESSAGES.unavailable});}finally{setBusy(false);setPassword('');setConfirm('');}
 };
 const fieldError=(f:RegistrationField)=>error?.field===f?<p id={`${f}-error`} className="text-sm text-destructive">{error.message}</p>:null;
 return <main className="mx-auto max-w-md px-4 py-10"><Logo/><h1 className="mt-8 text-2xl font-bold">{mode==='signup'?'إنشاء حساب':'تسجيل الدخول'}</h1>
 <form className="mt-6 space-y-4" onSubmit={submit} noValidate><div className="space-y-2"><Label htmlFor="username">اسم المستخدم</Label><Input id="username" dir="ltr" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={e=>setUsername(e.target.value)} required maxLength={USERNAME_MAX} aria-invalid={error?.field==='username'} aria-describedby={error?.field==='username'?'username-error':undefined}/>{mode==='signup'&&!fieldError('username')&&<p className="text-xs text-muted-foreground">حروف إنجليزية وأرقام و _ فقط، من 3 إلى {USERNAME_MAX} حرفاً.</p>}{fieldError('username')}</div>
 <div className="space-y-2"><Label htmlFor="password">كلمة المرور</Label><Input id="password" type="password" autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} aria-invalid={error?.field==='password'} aria-describedby={error?.field==='password'?'password-error':undefined}/>{fieldError('password')}</div>
 {mode==='signup'&&<div className="space-y-2"><Label htmlFor="confirm">تأكيد كلمة المرور</Label><Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required maxLength={PASSWORD_MAX} aria-invalid={error?.field==='confirm'} aria-describedby={error?.field==='confirm'?'confirm-error':undefined}/>{fieldError('confirm')}</div>}
 {error&&!error.field&&<p role="alert" className="text-sm text-destructive">{error.message}</p>}
 <Button type="submit" variant="hero" className="w-full" disabled={busy}>{busy?'جارٍ الإرسال…':mode==='signup'?'إنشاء حساب':'تسجيل الدخول'}</Button></form>
 <div className="mt-4 flex flex-wrap gap-2"><Button variant="link" onClick={switchMode}>{mode==='signup'?'لدي حساب':'إنشاء حساب جديد'}</Button><Button variant="link" asChild><Link to="/feed">العودة للمجتمع</Link></Button></div></main>;
}
