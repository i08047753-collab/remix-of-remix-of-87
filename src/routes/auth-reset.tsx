import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
export const Route=createFileRoute('/auth-reset')({head:()=>({meta:[{title:'استعادة كلمة المرور — STORM WORLD'},{name:'description',content:'اختر كلمة مرور جديدة لحسابك في STORM WORLD.'},{property:'og:title',content:'استعادة كلمة المرور — STORM WORLD'},{property:'og:description',content:'استعد الوصول الآمن إلى حسابك.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),component:ResetPage});
function ResetPage(){const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const navigate=useNavigate();return <main className="mx-auto max-w-md px-4 py-12"><h1 className="text-2xl font-bold">كلمة مرور جديدة</h1><form className="mt-6 space-y-4" onSubmit={async e=>{e.preventDefault();if(password.length<8||busy)return;setBusy(true);const r=await supabase.auth.updateUser({password});setBusy(false);setPassword('');if(r.error)toast.error('الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.');else {toast.success('تم تغيير كلمة المرور.');void navigate({to:'/submit'});}}}><Label htmlFor="new-password">كلمة المرور الجديدة</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/><Button variant="hero" type="submit" disabled={busy}>حفظ كلمة المرور</Button></form></main>;}
