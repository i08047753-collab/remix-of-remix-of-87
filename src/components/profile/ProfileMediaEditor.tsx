import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useAuth } from '@/lib/auth-context';
import { getMyProfileMedia, getProfileMedia, removeProfileImage, uploadProfileImage } from '@/lib/profile-media.functions';

type Kind = 'avatar' | 'cover';

export function ProfileMediaEditor({ username }: { username: string }) {
  const { user, ready } = useAuth();
  const qc = useQueryClient();
  const fetchMine = useServerFn(getMyProfileMedia);
  const upload = useServerFn(uploadProfileImage);
  const remove = useServerFn(removeProfileImage);
  const { data } = useQuery({ queryKey: ['profile-media', 'me', user?.id], queryFn: () => fetchMine(), enabled: !!user });
  const [pending, setPending] = useState<{ kind: Kind; file: File; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.preview); }, [pending]);

  if (!ready) return null;
  if (!user) return <p className="surface p-4 text-sm text-muted-foreground">سجّل الدخول لتغيير صورتك الشخصية وصورة الغلاف.</p>;

  const pick = (kind: Kind) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return void toast.error('الصيغ المدعومة: JPG، PNG، WebP فقط.');
    if (file.size > 5 * 1024 * 1024) return void toast.error('الحد الأقصى لحجم الصورة 5 MB.');
    setPending({ kind, file, preview: URL.createObjectURL(file) });
  };
  const refresh = () => qc.invalidateQueries({ queryKey: ['profile-media'] });
  const save = async () => {
    if (!pending) return;
    setBusy(true);
    const fd = new FormData(); fd.set('kind', pending.kind); fd.set('file', pending.file);
    const r = await upload({ data: fd }).catch(() => ({ ok: false, error: 'تعذّر رفع الصورة.' }));
    setBusy(false);
    if (!r.ok) return void toast.error(r.error ?? 'تعذّر رفع الصورة.');
    toast.success('تم حفظ الصورة'); setPending(null); await refresh();
  };
  const del = async (kind: Kind) => {
    setBusy(true);
    await remove({ data: { kind } }).catch(() => toast.error('تعذّر الحذف.'));
    setBusy(false); toast.success('تم حذف الصورة'); await refresh();
  };

  const cover = pending?.kind === 'cover' ? pending.preview : data?.coverUrl;
  const avatar = pending?.kind === 'avatar' ? pending.preview : data?.avatarUrl;

  return (
    <section className="surface overflow-hidden">
      <div className="relative h-36 bg-gradient-storm sm:h-44">
        {cover && <img src={cover} alt="صورة الغلاف" className="size-full object-cover" />}
        <div className="absolute bottom-2 end-2 flex gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => coverInput.current?.click()}><ImagePlus />{data?.coverUrl ? 'تغيير الغلاف' : 'إضافة غلاف'}</Button>
          {data?.coverUrl && !pending && <Button size="icon" variant="secondary" className="size-8" disabled={busy} onClick={() => del('cover')} aria-label="حذف الغلاف"><Trash2 /></Button>}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
        <div className="relative -mt-10">
          {avatar ? <img src={avatar} alt="الصورة الشخصية" className="size-20 rounded-full object-cover ring-4 ring-background" /> : <MemberAvatar name={username} seed={username} className="size-20 text-3xl ring-4 ring-background" />}
          <button type="button" disabled={busy} onClick={() => avatarInput.current?.click()} aria-label="تغيير الصورة الشخصية" className="absolute -bottom-1 -end-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"><Camera className="size-4" /></button>
        </div>
        {data?.avatarUrl && !pending && <Button size="sm" variant="ghost" disabled={busy} onClick={() => del('avatar')}><Trash2 />حذف الصورة الشخصية</Button>}
        {pending && (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">معاينة {pending.kind === 'avatar' ? 'الصورة الشخصية' : 'الغلاف'} — لم تُحفظ بعد</span>
            <Button size="sm" variant="hero" disabled={busy} onClick={save}>{busy && <Loader2 className="animate-spin" />}حفظ</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setPending(null)}>إلغاء</Button>
          </div>
        )}
      </div>
      <input ref={avatarInput} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={pick('avatar')} />
      <input ref={coverInput} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={pick('cover')} />
    </section>
  );
}

export function usePublicProfileMedia(username: string) {
  const fetchMedia = useServerFn(getProfileMedia);
  return useQuery({ queryKey: ['profile-media', 'public', username], queryFn: () => fetchMedia({ data: { username } }), staleTime: 5 * 60_000 });
}
