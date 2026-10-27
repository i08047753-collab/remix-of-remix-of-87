import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
const AuthContext=createContext<{user:User|null;ready:boolean}>({user:null,ready:false});
export const useAuth=()=>useContext(AuthContext);
/** Only a definite rejection from the auth server ends a stored session; network blips must not sign members out. */
export const sessionRejected=(status:number|undefined)=>status===401||status===403;
export function AuthProvider({children}:{children:ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false);
 const queryClient=useQueryClient(); const router=useRouter();
 useEffect(()=>{
  let active=true;
  const {data}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!active) return;
   // The saved session is restored from storage on every load; refreshes keep it alive silently.
   if(event==='INITIAL_SESSION'||event==='TOKEN_REFRESHED'){setUser(session?.user ?? null);setReady(true);return;}
   if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) return;
   setUser(session?.user ?? null);setReady(true);
   if(event==='SIGNED_OUT') { void queryClient.cancelQueries();queryClient.clear(); }
   else void queryClient.invalidateQueries();
   void router.invalidate();
  });
  // Re-validate the restored session with the server; drop it only if the server rejects it (deleted/revoked account).
  void supabase.auth.getSession().then(async({data:{session}})=>{
   if(!active) return;
   setUser(session?.user ?? null);setReady(true);
   if(!session) return;
   const {data:fresh,error}=await supabase.auth.getUser();
   if(!active) return;
   if(fresh.user) setUser(fresh.user);
   else if(error&&sessionRejected(error.status)) await supabase.auth.signOut({scope:'local'});
  }).catch(()=>{if(active)setReady(true);});
  return ()=>{active=false;data.subscription.unsubscribe();};
 },[queryClient,router]);
 return <AuthContext.Provider value={{user,ready}}>{children}</AuthContext.Provider>;
}
