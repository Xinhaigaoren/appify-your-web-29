import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { AppShell, ErrorState, Loading } from "@/components/AppShell";
import { fetchNewsDetail, formatDate } from "@/lib/api";

export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "新闻详情 · 新海高人" },
      { name: "description", content: "阅读海林市高级中学校友会的新闻公告详情。" },
      { property: "og:title", content: "新闻详情 · 新海高人" },
      { property: "og:description", content: "阅读海林市高级中学校友会的新闻公告详情。" },
    ],
  }),
  component: NewsDetail,
});

function NewsDetail() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const query = useQuery({ queryKey: ["news-detail", slug], queryFn: () => fetchNewsDetail(slug) });
  const article = query.data?.article;

  return (
    <AppShell hideNav>
      <header className="safe-top sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur">
        <button type="button" onClick={() => router.history.back()} className="p-1 text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="truncate font-serif text-sm font-semibold">新闻详情</span>
      </header>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? <ErrorState message="新闻不存在或加载失败。" /> : null}

      {article ? (
        <article className="px-4 py-5">
          <h1 className="font-serif text-xl font-bold leading-snug">{article.title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {article.category ? `${article.category} · ` : ""}
            {formatDate(article.published_at)}
            {article.author ? ` · ${article.author}` : ""}
          </p>
          {article.cover_url ? (
            <img src={article.cover_url} alt="" className="mt-4 w-full rounded-2xl object-cover" />
          ) : null}
          <div
            className="prose-sm mt-4 space-y-3 text-sm leading-7 text-foreground [&_img]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content || article.summary || "" }}
          />
        </article>
      ) : null}
    </AppShell>
  );
}
