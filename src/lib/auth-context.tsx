import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
const AuthContext=createContext<{user:User|null;ready:boolean}>({user:null,ready:false});
export const useAuth=()=>useContext(AuthContext);
export function AuthProvider({children}:{children:ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false);
 const queryClient=useQueryClient(); const router=useRouter();
 useEffect(()=>{
  let active=true;
  supabase.auth.getUser().then(({data})=>{if(active){setUser(data.user);setReady(true);}}).catch(()=>{if(active){setUser(null);setReady(true);}});
  const {data}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) return;
   setUser(session?.user ?? null);setReady(true);
   if(event==='SIGNED_OUT') { void queryClient.cancelQueries();queryClient.clear(); }
   else void queryClient.invalidateQueries();
   void router.invalidate();
  });
  return ()=>{active=false;data.subscription.unsubscribe();};
 },[queryClient,router]);
 return <AuthContext.Provider value={{user,ready}}>{children}</AuthContext.Provider>;
}
