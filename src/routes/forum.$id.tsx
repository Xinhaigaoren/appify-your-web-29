import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { AppShell, ErrorState, Loading } from "@/components/AppShell";
import { fetchForumPost, formatDateTime } from "@/lib/api";

export const Route = createFileRoute("/forum/$id")({
  head: () => ({
    meta: [
      { title: "帖子详情 · 新海高人" },
      { name: "description", content: "查看海高校友论坛的帖子内容与校友回复。" },
      { property: "og:title", content: "帖子详情 · 新海高人" },
      { property: "og:description", content: "查看海高校友论坛的帖子内容与校友回复。" },
    ],
  }),
  component: PostDetail,
});

function PostDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const query = useQuery({ queryKey: ["forum-post", id], queryFn: () => fetchForumPost(id) });
  const post = query.data?.post;

  return (
    <AppShell hideNav>
      <header className="safe-top sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur">
        <button type="button" onClick={() => router.history.back()} className="p-1 text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="truncate font-serif text-sm font-semibold">帖子详情</span>
      </header>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? <ErrorState message="帖子不存在或加载失败。" /> : null}

      {post ? (
        <div className="px-4 py-5">
          <h1 className="font-serif text-lg font-bold leading-snug">{post.title}</h1>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {post.author_name || "校友"} · {formatDateTime(post.created_at)}
            {post.category_name ? ` · ${post.category_name}` : ""}
          </p>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7">{post.content}</div>

          <h2 className="mt-8 font-serif text-base font-bold">
            回复 <span className="text-muted-foreground">({query.data?.replies?.length ?? 0})</span>
          </h2>
          <ul className="mt-3 space-y-3">
            {query.data?.replies?.map((reply) => (
              <li key={reply.id} className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[11px] text-muted-foreground">
                  {reply.author_name || "校友"} · {formatDateTime(reply.created_at)}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{reply.content}</p>
              </li>
            ))}
            {!query.data?.replies?.length ? (
              <li className="py-6 text-center text-sm text-muted-foreground">暂无回复</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </AppShell>
  );
}
