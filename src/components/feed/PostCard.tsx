import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Post } from "@/data/sample";
import { memberByUsername } from "@/data/sample";
import { CategoryChip, IntentBadge } from "@/components/common/Chips";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { SafetyMenu } from "@/components/safety/SafetyMenu";
import { useLiked } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const author = memberByUsername(post.author);
  const [liked, setLiked] = useLiked();
  const isLiked = liked.includes(post.id);
  const name = author?.name ?? post.author;

  return (
    <article
      className="surface animate-rise p-5 transition-colors hover:border-primary/30"
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
    >
      <header className="flex items-start gap-3">
        <Link to="/u/$username" params={{ username: post.author }}>
          <MemberAvatar name={name} seed={post.author} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link
              to="/u/$username"
              params={{ username: post.author }}
              className="font-semibold hover:text-primary"
            >
              {name}
            </Link>
            <span dir="ltr" className="text-xs text-muted-foreground">
              @{post.author}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{post.time}</p>
        </div>
        <SafetyMenu username={post.author} targetLabel="هذا المنشور" />
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <IntentBadge intent={post.intent} />
        <CategoryChip slug={post.category} />
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug">{post.title}</h3>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{post.body}</p>

      <footer className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-sm">
        <button
          type="button"
          onClick={() => setLiked(isLiked ? liked.filter((l) => l !== post.id) : [...liked, post.id])}
          aria-pressed={isLiked}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-accent",
            isLiked ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Heart className={cn("size-4", isLiked && "fill-current")} />
          {post.likes + (isLiked ? 1 : 0)}
          <span className="sr-only">إعجاب</span>
        </button>
        <button
          type="button"
          onClick={() => toast("الردود قادمة في المرحلة التالية", { description: "تحتاج الردود إلى خادم وحسابات حقيقية." })}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
        >
          <MessageCircle className="size-4" />
          {post.replies} رد
        </button>
      </footer>
    </article>
  );
}
