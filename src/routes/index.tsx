import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, ChevronRight, Users, BookOpen, Handshake } from "lucide-react";

import { AppShell, Loading } from "@/components/AppShell";
import { fetchEvents, fetchNews, formatDate } from "@/lib/api";
import logo from "@/assets/haigao-logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "新海高人 · 海林市高级中学校友App" },
      {
        name: "description",
        content: "海林市高级中学校友移动端：校友新闻、活动报名、校友论坛与个人档案，一站连接母校与同窗。",
      },
      { property: "og:title", content: "新海高人 · 海林市高级中学校友App" },
      {
        property: "og:description",
        content: "校友新闻、活动报名、校友论坛与个人档案，一站连接母校与同窗。",
      },
    ],
  }),
  component: Index,
});

const QUICK = [
  { to: "/news", label: "新闻公告", icon: BookOpen },
  { to: "/events", label: "活动报名", icon: CalendarDays },
  { to: "/forum", label: "校友论坛", icon: Users },
  { to: "/me", label: "校友认证", icon: Handshake },
] as const;

function Index() {
  const news = useQuery({ queryKey: ["news", "home"], queryFn: () => fetchNews({ page: 1 }) });
  const events = useQuery({ queryKey: ["events", "upcoming"], queryFn: () => fetchEvents("upcoming") });

  return (
    <AppShell>
      <section className="safe-top relative overflow-hidden bg-primary px-5 pb-10 pt-8 text-primary-foreground">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <img src={logo.url} alt="海林市高级中学校徽" className="h-14 w-14 rounded-full ring-2 ring-accent/70" />
          <div className="min-w-0">
            <h1 className="font-serif text-xl font-bold tracking-wide">新海高人</h1>
            <p className="truncate text-xs text-primary-foreground/70">海林市高级中学校友会</p>
          </div>
        </div>
        <p className="relative mt-5 font-serif text-2xl leading-snug">
          连接母校<span className="text-accent"> · </span>凝聚校友
          <br />
          服务社会
        </p>
        <p className="relative mt-2 text-sm text-primary-foreground/75">
          Hailin Senior High School Alumni Association
        </p>
      </section>

      <section className="-mt-6 px-4">
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
          {QUICK.map((item) => (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-2 py-2">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] text-muted-foreground">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <SectionHeader title="最新公告" to="/news" />
      <div className="space-y-3 px-4">
        {news.isLoading ? <Loading /> : null}
        {news.data?.items?.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            to="/news/$slug"
            params={{ slug: item.slug }}
            className="flex gap-3 rounded-2xl border border-border bg-card p-3"
          >
            {item.cover_url ? (
              <img src={item.cover_url} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
            ) : null}
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-serif text-sm font-semibold leading-snug">{item.title}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {item.category ? `${item.category} · ` : ""}
                {formatDate(item.published_at)}
              </p>
            </div>
          </Link>
        ))}
        {!news.isLoading && !news.data?.items?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">暂无公告</p>
        ) : null}
      </div>

      <SectionHeader title="近期活动" to="/events" />
      <div className="space-y-3 px-4">
        {events.isLoading ? <Loading /> : null}
        {events.data?.items?.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            to="/events/$id"
            params={{ id: String(item.id) }}
            className="block rounded-2xl border border-border bg-card p-4"
          >
            <h3 className="font-serif text-sm font-semibold">{item.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(item.start_time) || "待定"}
              </span>
              {item.location ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
              ) : null}
            </div>
          </Link>
        ))}
        {!events.isLoading && !events.data?.items?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">暂无进行中的活动</p>
        ) : null}
      </div>
    </AppShell>
  );
}

function SectionHeader({ title, to }: { title: string; to: "/news" | "/events" }) {
  return (
    <div className="mt-7 flex items-center justify-between px-4 pb-3">
      <h2 className="font-serif text-base font-bold">
        <span className="mr-2 inline-block h-4 w-1 translate-y-0.5 rounded bg-accent" />
        {title}
      </h2>
      <Link to={to} className="inline-flex items-center text-xs text-muted-foreground">
        更多 <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
