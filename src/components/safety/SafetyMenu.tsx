import { useState } from "react";
import { Flag, MoreHorizontal, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useBlocked } from "@/lib/app-state";

const REASONS = [
  "كلام غير محترم أو تنمّر",
  "طلب معلومات شخصية أو تواصل خاص",
  "محتوى غير مناسب للطلاب",
  "معلومة علمية مضللة عمداً",
  "إزعاج أو إعلانات",
];

export function ReportDialog({
  open,
  onOpenChange,
  targetLabel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  targetLabel: string;
}) {
  const [reason, setReason] = useState<string>(REASONS[0] ?? "");
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">الإبلاغ عن {targetLabel}</DialogTitle>
          <DialogDescription>
            بلاغك سري، ولن يعرف صاحب المحتوى من أبلغ عنه. سيراجعه فريق الإشراف.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
          {REASONS.map((r) => (
            <Label
              key={r}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
            >
              <RadioGroupItem value={r} />
              {r}
            </Label>
          ))}
        </RadioGroup>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="تفاصيل إضافية (اختياري)"
          maxLength={300}
        />
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              setNote("");
              toast("شكلُ البلاغ جاهز", {
                description: "في هذه النسخة التجريبية لا يُرسل البلاغ لأي أحد بعد.",
              });
            }}
          >
            <Flag />
            إرسال البلاغ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SafetyMenu({ username, targetLabel }: { username: string; targetLabel: string }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [blocked, setBlocked] = useBlocked();
  const isBlocked = blocked.includes(username);
  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="خيارات الأمان">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setReportOpen(true)}>
            <Flag />
            إبلاغ عن {targetLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setBlocked(isBlocked ? blocked.filter((b) => b !== username) : [...blocked, username]);
              toast(isBlocked ? `ألغيت حظر @${username}` : `حظرت @${username}`, {
                description: isBlocked ? undefined : "لن تظهر لك منشوراته بعد الآن على هذا الجهاز.",
              });
            }}
          >
            {isBlocked ? <ShieldCheck /> : <ShieldOff />}
            {isBlocked ? "إلغاء الحظر" : `حظر @${username}`}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} targetLabel={targetLabel} />
    </>
  );
}
