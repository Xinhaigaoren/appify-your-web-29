import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Loader2,
  LogIn,
  MessagesSquare,
  Send,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import {
  createConversation,
  fetchConversation,
  fetchConversations,
  fetchDirectory,
  fetchMe,
  formatDateTime,
  getToken,
  sendChatMessage,
  type ChatMessage,
  type Conversation,
  type DirectoryAlumni,
} from "@/lib/api";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "私聊 · 新海高人校友App" },
      { name: "description", content: "海林市高级中学校友私聊：与认证校友一对一交流。" },
      { property: "og:title", content: "私聊 · 新海高人校友App" },
      { property: "og:description", content: "与校友一对一交流。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => !!getToken());
  const [myId, setMyId] = useState<number | null>(null);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(!!getToken());
    window.addEventListener("hailin-auth", sync);
    return () => window.removeEventListener("hailin-auth", sync);
  }, []);

  const loadList = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchConversations();
      setConversations(data.conversations ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((d) => {
        setMyId(d.user?.user_id ?? d.user?.id ?? null);
        setMyStatus(d.user?.status ?? null);
      })
      .catch(() => {});
    loadList();
    const t = window.setInterval(() => loadList(true), 15000);
    return () => window.clearInterval(t);
  }, [loggedIn, loadList]);

  if (!loggedIn) {
    return (
      <AppShell title="私聊" subtitle="校友一对一交流">
        <div className="mx-4 mt-10 rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
            <LogIn className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-serif text-base font-bold">请先登录</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            登录并完成校友认证后，即可与校友一对一私聊。
          </p>
          <Link
            to="/me"
            className="mt-5 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            去登录
          </Link>
        </div>
      </AppShell>
    );
  }

  if (activeId !== null) {
    return (
      <ChatThread
        conversationId={activeId}
        myId={myId}
        onBack={() => {
          setActiveId(null);
          loadList(true);
        }}
      />
    );
  }

  return (
    <AppShell
      title="私聊"
      subtitle="校友一对一交流"
      action={
        <button
          type="button"
          aria-label="发起新会话"
          onClick={() => setPickerOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"
        >
          <UserPlus className="h-4.5 w-4.5" />
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="mx-4 mt-10 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            私聊仅对已通过认证的校友开放{myStatus ? `（当前状态：${myStatus}）` : ""}。
          </p>
          <button
            type="button"
            onClick={() => loadList()}
            className="mt-4 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            重试
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="mx-4 mt-10 rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
            <MessagesSquare className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-serif text-base font-bold">还没有会话</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            点击右上角按钮，从校友通讯录中发起第一次对话。
          </p>
        </div>
      ) : (
        <ul className="mx-4 mt-3 space-y-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left active:bg-secondary/60"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary font-serif text-base font-bold text-primary">
                  {(c.peer_name || "校")[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {c.peer_name || "校友"}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDateTime(c.last_message_at)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {c.last_message || "开始聊天吧"}
                    </span>
                    {c.unread_count > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                        {c.unread_count > 99 ? "99+" : c.unread_count}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && (
        <NewChatPicker
          onClose={() => setPickerOpen(false)}
          onCreated={(id) => {
            setPickerOpen(false);
            setActiveId(id);
          }}
        />
      )}
    </AppShell>
  );
}

/* ---------- 会话详情 ---------- */

function ChatThread({
  conversationId,
  myId,
  onBack,
}: {
  conversationId: number;
  myId: number | null;
  onBack: () => void;
}) {
  const [peerName, setPeerName] = useState("校友");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        const data = await fetchConversation(conversationId);
        setPeerName(data.peer_name || "校友");
        setMessages((prev) => (silent && prev.length === data.messages.length ? prev : data.messages));
        setLoadError(null);
      } catch (e) {
        if (!silent) setLoadError(e instanceof Error ? e.message : "加载失败");
      }
    },
    [conversationId],
  );

  useEffect(() => {
    load();
    const t = window.setInterval(() => load(true), 5000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await sendChatMessage(conversationId, content);
      setDraft("");
      await load(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "发送失败");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell
      title={peerName}
      subtitle="私聊"
      action={
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"
          aria-label="返回会话列表"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      }
    >
      <div className="flex flex-col px-4 pb-24 pt-3">
        {loadError ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{loadError}</p>
        ) : messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            打个招呼，开始与 {peerName} 的对话吧
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = myId !== null && m.sender_id === myId;
              return (
                <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      mine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-card"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatDateTime(m.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-lg items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={`发消息给 ${peerName}…`}
            className="max-h-28 flex-1 resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !draft.trim()}
            aria-label="发送"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- 发起新会话 ---------- */

function NewChatPicker({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: number) => void;
}) {
  const [alumni, setAlumni] = useState<DirectoryAlumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    fetchDirectory()
      .then((d) => setAlumni(d.items ?? d.directory ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "加载通讯录失败"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = alumni.filter((a) => {
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    return [a.display_name, a.class_name, a.company, a.graduation_year && String(a.graduation_year)]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(s));
  });

  const start = async (peerId: number) => {
    setCreating(peerId);
    try {
      const d = await createConversation(peerId);
      onCreated(d.conversation.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "创建会话失败");
      setCreating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex max-h-[75vh] w-full max-w-lg flex-col rounded-t-3xl border-t border-border bg-background p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center font-serif text-base font-bold">发起新会话</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索姓名 / 班级 / 届别…"
          className="mt-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">没有找到相关校友</p>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((a) => (
                <li key={a.user_id}>
                  <button
                    type="button"
                    disabled={creating !== null}
                    onClick={() => start(a.user_id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left active:bg-secondary/60 disabled:opacity-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-serif text-sm font-bold text-primary">
                      {(a.display_name || "校")[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {a.display_name || "校友"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {[a.graduation_year && `${a.graduation_year} 届`, a.class_name, a.company]
                          .filter(Boolean)
                          .join(" · ") || "认证校友"}
                      </span>
                    </span>
                    {creating === a.user_id && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
