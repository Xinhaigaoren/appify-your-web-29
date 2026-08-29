import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "私聊 · 新海高人校友App" },
      { name: "description", content: "海林市高级中学校友私聊：与同窗一对一交流，敬请期待。" },
      { property: "og:title", content: "私聊 · 新海高人校友App" },
      { property: "og:description", content: "与校友一对一交流，敬请期待。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell title="私聊" subtitle="校友一对一交流">
      <div className="mx-4 mt-10 rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
          <MessagesSquare className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-base font-bold">私聊功能即将上线</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          完成校友认证后，你将可以在这里与同届、同班校友一对一沟通。
        </p>
      </div>
    </AppShell>
  );
}
