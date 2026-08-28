import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useState } from "react";

import { AppShell, Empty, ErrorState, Loading } from "@/components/AppShell";
import { fetchEvents, formatDateTime, mediaUrl } from "@/lib/api";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "活动中心 · 新海高人" },
      { name: "description", content: "海林市高级中学校友活动预告与回顾，支持在线报名。" },
      { property: "og:title", content: "活动中心 · 新海高人" },
      { property: "og:description", content: "海林市高级中学校友活动预告与回顾，支持在线报名。" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [mode, setMode] = useState<"upcoming" | "past">("upcoming");
  const query = useQuery({ queryKey: ["events", mode], queryFn: () => fetchEvents(mode) });

  return (
    <AppShell title="活动中心" subtitle="相聚母校，共叙同窗情">
      <div className="flex gap-2 px-4 py-3">
        {(
          [
            ["upcoming", "即将举行"],
            ["past", "往期回顾"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
              mode === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? <ErrorState /> : null}
      {query.data && !query.data.items.length ? <Empty label="暂无活动" /> : null}

      <ul className="space-y-3 px-4 pb-4">
        {query.data?.items.map((item) => (
          <li key={item.id}>
            <Link
              to="/events/$id"
              params={{ id: String(item.id) }}
              className="block overflow-hidden rounded-2xl border border-border bg-card"
            >
              {item.cover_url ? (
                <img src={mediaUrl(item.cover_url)} alt="" className="h-36 w-full object-cover" />
              ) : null}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 font-serif text-base font-semibold leading-snug">{item.title}</h2>
                  {item.category ? (
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-primary">
                      {item.category}
                    </span>
                  ) : null}
                </div>
                {item.summary ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                ) : null}
                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateTime(item.start_time) || "时间待定"}
                  </p>
                  {item.location ? (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  ) : null}
                  <p className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    已报名 {item.registrations_count ?? 0}
                    {item.capacity ? ` / ${item.capacity}` : ""}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
