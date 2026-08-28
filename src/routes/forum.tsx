import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Eye, Pin } from "lucide-react";
import { useState } from "react";

import { AppShell, Empty, ErrorState, Loading } from "@/components/AppShell";
import { fetchForumCategories, fetchForumPosts, formatDate } from "@/lib/api";

export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      { title: "校友论坛 · 新海高人" },
      { name: "description", content: "海高校友交流社区：同窗寻人、经验分享、母校话题讨论。" },
      { property: "og:title", content: "校友论坛 · 新海高人" },
      { property: "og:description", content: "海高校友交流社区：同窗寻人、经验分享、母校话题讨论。" },
    ],
  }),
  component: ForumPage,
});

function ForumPage() {
  const [categoryId, setCategoryId] = useState(0);
  const categories = useQuery({ queryKey: ["forum-cats"], queryFn: fetchForumCategories });
  const posts = useQuery({
    queryKey: ["forum-posts", categoryId],
    queryFn: () => fetchForumPosts(categoryId ? { categoryId } : {}),
  });

  return (
    <AppShell title="校友论坛" subtitle="同窗话题，畅所欲言">
      <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
        <Chip active={categoryId === 0} onClick={() => setCategoryId(0)} label="全部" />
        {categories.data?.categories.map((c) => (
          <Chip
            key={c.id}
            active={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
            label={`${c.name} ${c.post_count ?? 0}`}
          />
        ))}
      </div>

      {posts.isLoading ? <Loading /> : null}
      {posts.isError ? <ErrorState /> : null}
      {posts.data && !posts.data.items.length ? <Empty label="暂无帖子" /> : null}

      <ul className="divide-y divide-border">
        {posts.data?.items.map((post) => (
          <li key={post.id}>
            <Link
              to="/forum/$id"
              params={{ id: String(post.id) }}
              className="block px-4 py-4 active:bg-secondary"
            >
              <h2 className="flex items-start gap-1.5 font-serif text-sm font-semibold leading-snug">
                {post.is_pinned ? <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /> : null}
                <span className="min-w-0">{post.title}</span>
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {post.category_name ? (
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-primary">{post.category_name}</span>
                ) : null}
                <span>{post.author_name || "校友"}</span>
                <span>{formatDate(post.updated_at || post.created_at)}</span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.reply_count ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.view_count ?? 0}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}
