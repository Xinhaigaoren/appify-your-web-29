import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell, Empty, ErrorState, Loading } from "@/components/AppShell";
import { fetchNews, formatDate, mediaUrl } from "@/lib/api";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "新闻公告 · 新海高人" },
      { name: "description", content: "海林市高级中学校友会最新新闻、母校动态与校友会公告。" },
      { property: "og:title", content: "新闻公告 · 新海高人" },
      { property: "og:description", content: "海林市高级中学校友会最新新闻、母校动态与校友会公告。" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [category, setCategory] = useState("全部");
  const query = useQuery({
    queryKey: ["news", category],
    queryFn: () => fetchNews({ category }),
  });

  const categories = ["全部", ...(query.data?.categories ?? [])];

  return (
    <AppShell title="新闻公告" subtitle="母校动态与校友会通知">
      <div className="sticky top-[64px] z-20 -mx-0 flex gap-2 overflow-x-auto border-b border-border bg-background px-4 py-3">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? <ErrorState /> : null}
      {query.data && !query.data.items.length ? <Empty label="暂无新闻" /> : null}

      <ul className="space-y-3 p-4">
        {query.data?.items.map((item) => (
          <li key={item.id}>
            <Link
              to="/news/$slug"
              params={{ slug: item.slug }}
              className="flex gap-3 rounded-2xl border border-border bg-card p-3"
            >
              {item.cover_url ? (
                <img src={mediaUrl(item.cover_url)} alt="" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 font-serif text-sm font-semibold leading-snug">{item.title}</h2>
                {item.summary ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                ) : null}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {item.category ? `${item.category} · ` : ""}
                  {formatDate(item.published_at)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
