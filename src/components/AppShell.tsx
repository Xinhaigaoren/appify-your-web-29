import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Newspaper, CalendarDays, MessagesSquare, User } from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/haigao-logo.jpg.asset.json";

const TABS = [
  { to: "/", label: "首页", icon: Home },
  { to: "/news", label: "新闻", icon: Newspaper },
  { to: "/events", label: "活动", icon: CalendarDays },
  { to: "/forum", label: "论坛", icon: MessagesSquare },
  { to: "/me", label: "我的", icon: User },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  hideNav,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideNav?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-background">
      {title ? (
        <header className="safe-top sticky top-0 z-30 border-b border-primary/20 bg-primary text-primary-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={logo.url}
                alt="海林市高级中学校徽"
                className="h-9 w-9 shrink-0 rounded-full ring-1 ring-accent/60"
              />
              <div className="min-w-0">
                <h1 className="truncate font-serif text-base font-bold tracking-wide">{title}</h1>
                {subtitle ? (
                  <p className="truncate text-[11px] text-primary-foreground/70">{subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <main className={`flex-1 ${hideNav ? "pb-6" : "pb-24"}`}>{children}</main>

      {hideNav ? null : (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[520px] border-t border-border bg-card/95 pt-1 backdrop-blur">
          <ul className="grid grid-cols-5">
            {TABS.map((tab) => {
              const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
              const Icon = tab.icon;
              return (
                <li key={tab.to}>
                  <Link
                    to={tab.to}
                    className={`flex flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-accent" : ""}`} strokeWidth={active ? 2.4 : 1.8} />
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function Loading({ label = "加载中…" }: { label?: string }) {
  return <div className="py-16 text-center text-sm text-muted-foreground">{label}</div>;
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="mx-4 my-10 rounded-2xl border border-border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground">{message || "内容加载失败，请检查网络后重试。"}</p>
    </div>
  );
}

export function Empty({ label }: { label: string }) {
  return <div className="py-16 text-center text-sm text-muted-foreground">{label}</div>;
}
