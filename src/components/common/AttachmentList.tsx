import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Attachment } from '@/lib/publishing-rules';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

type Urls = Record<string, { view: string; download: string }>;

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  const [urls, setUrls] = useState<Urls>({});
  const [zoom, setZoom] = useState<Attachment | null>(null);
  useEffect(() => {
    let active = true;
    setUrls({});
    void Promise.all(attachments.map(async a => {
      const bucket = supabase.storage.from('publishing-attachments');
      const [view, dl] = await Promise.all([bucket.createSignedUrl(a.path, 3600), bucket.createSignedUrl(a.path, 3600, { download: a.name })]);
      return [a.path, { view: view.data?.signedUrl ?? '', download: dl.data?.signedUrl ?? '' }] as const;
    })).then(entries => { if (active) setUrls(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, [attachments]);
  if (!attachments.length) return null;
  const media = attachments.filter(a => a.type.startsWith('image/') || a.type.startsWith('video/'));
  const files = attachments.filter(a => !media.includes(a));
  return (
    <div className="mt-3 space-y-2">
      {media.length > 0 && (
        <div className={media.length > 1 ? 'grid grid-cols-2 gap-2' : ''}>
          {media.map(a => {
            const u = urls[a.path]?.view;
            if (!u) return <div key={a.path} className="aspect-video animate-pulse rounded-xl bg-muted" />;
            return a.type.startsWith('video/')
              ? <video key={a.path} src={u} controls playsInline preload="metadata" className="max-h-[70vh] w-full rounded-xl bg-muted object-contain" />
              : <button key={a.path} type="button" onClick={() => setZoom(a)} className="block w-full overflow-hidden rounded-xl bg-muted" aria-label={`تكبير ${a.name}`}>
                  <img src={u} alt={a.name} loading="lazy" className="max-h-[70vh] w-full object-cover transition-transform hover:scale-[1.02]" />
                </button>;
          })}
        </div>
      )}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">{files.map(a => <li key={a.path} className="min-w-0 max-w-full"><Button asChild variant="outline" size="sm" disabled={!urls[a.path]}><a href={urls[a.path]?.download || undefined} target="_blank" rel="noopener noreferrer" className="max-w-full"><Download className="shrink-0" /><span className="truncate">{a.name}</span></a></Button></li>)}</ul>
      )}
      <Dialog open={!!zoom} onOpenChange={o => !o && setZoom(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">{zoom?.name}</DialogTitle>
          {zoom && <img src={urls[zoom.path]?.view} alt={zoom.name} className="max-h-[85vh] w-full rounded-lg object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
