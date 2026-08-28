import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, ErrorState, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchEventDetail, formatDateTime, mediaUrl, registerEvent } from "@/lib/api";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "活动详情 · 新海高人" },
      { name: "description", content: "查看校友活动的时间地点与详情，并在线提交报名。" },
      { property: "og:title", content: "活动详情 · 新海高人" },
      { property: "og:description", content: "查看校友活动的时间地点与详情，并在线提交报名。" },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const query = useQuery({ queryKey: ["event", id], queryFn: () => fetchEventDetail(id) });
  const event = query.data?.event;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remark, setRemark] = useState("");

  const mutation = useMutation({
    mutationFn: () => registerEvent(Number(event?.id), { name, phone, remark }),
    onSuccess: () => {
      toast.success("报名已提交，请等待工作人员确认");
      setName("");
      setPhone("");
      setRemark("");
      query.refetch();
    },
    onError: (e: Error) => toast.error(e.message || "报名失败"),
  });

  return (
    <AppShell hideNav>
      <header className="safe-top sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur">
        <button type="button" onClick={() => router.history.back()} className="p-1 text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="truncate font-serif text-sm font-semibold">活动详情</span>
      </header>

      {query.isLoading ? <Loading /> : null}
      {query.isError ? <ErrorState message="活动不存在或加载失败。" /> : null}

      {event ? (
        <div className="pb-8">
          {event.cover_url ? <img src={mediaUrl(event.cover_url)} alt="" className="h-48 w-full object-cover" /> : null}
          <div className="px-4 py-5">
            <h1 className="font-serif text-xl font-bold leading-snug">{event.title}</h1>
            <div className="mt-3 space-y-1.5 rounded-2xl bg-secondary p-4 text-xs text-primary">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(event.start_time) || "时间待定"}
                {event.end_time ? ` 至 ${formatDateTime(event.end_time)}` : ""}
              </p>
              {event.location ? (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words">{event.location}</span>
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                已报名 {event.registrations_count ?? 0}
                {event.capacity ? ` / ${event.capacity} 人` : ""}
              </p>
            </div>

            <div
              className="mt-5 space-y-3 text-sm leading-7 [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: event.content || event.summary || "" }}
            />

            <section className="mt-8 rounded-2xl border border-border bg-card p-4">
              <h2 className="font-serif text-base font-bold">在线报名</h2>
              <form
                className="mt-3 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim() || !phone.trim()) {
                    toast.error("请填写姓名和手机号");
                    return;
                  }
                  mutation.mutate();
                }}
              >
                <Input placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} />
                <Input
                  placeholder="手机号"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Textarea
                  placeholder="备注（毕业年份、随行人数等）"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "提交中…" : "提交报名"}
                </Button>
              </form>
            </section>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
