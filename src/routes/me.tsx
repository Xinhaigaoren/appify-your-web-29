import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

import { AppShell, Loading } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSession, fetchMe, formatDate, getStoredUser, login, setSession, type AuthUser } from "@/lib/api";
import logo from "@/assets/haigao-logo.jpg.asset.json";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "我的 · 新海高人" },
      { name: "description", content: "校友登录、个人档案与校友身份认证状态查询。" },
      { property: "og:title", content: "我的 · 新海高人" },
      { property: "og:description", content: "校友登录、个人档案与校友身份认证状态查询。" },
    ],
  }),
  component: MePage,
});

function MePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    setReady(true);
    window.addEventListener("hailin-auth", sync);
    return () => window.removeEventListener("hailin-auth", sync);
  }, []);

  if (!ready) {
    return (
      <AppShell title="我的">
        <Loading />
      </AppShell>
    );
  }

  return user ? <Profile user={user} /> : <LoginForm />;
}

function LoginForm() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(account.trim(), password),
    onSuccess: (data) => {
      setSession(data.token, data.user);
      toast.success("登录成功，欢迎回来");
    },
    onError: (e: Error) => toast.error(e.message || "登录失败"),
  });

  return (
    <AppShell title="我的" subtitle="校友登录">
      <div className="px-5 py-10">
        <div className="flex flex-col items-center">
          <img src={logo.url} alt="海林市高级中学校徽" className="h-20 w-20 rounded-full ring-2 ring-accent/60" />
          <h2 className="mt-4 font-serif text-lg font-bold">新海高人</h2>
          <p className="mt-1 text-xs text-muted-foreground">使用校友会账号登录</p>
        </div>

        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!account.trim() || !password) {
              toast.error("请输入账号和密码");
              return;
            }
            mutation.mutate();
          }}
        >
          <Input
            placeholder="手机号或邮箱"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "登录中…" : "登录"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
          还没有账号？请先在校友会网站注册并提交校友认证，
          <br />
          审核通过后即可在 App 中登录使用。
        </p>
      </div>
    </AppShell>
  );
}

function Profile({ user }: { user: AuthUser }) {
  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe, retry: false });
  const profile = me.data?.profile;
  const verifications = me.data?.verifications ?? [];

  return (
    <AppShell title="我的" subtitle="个人档案与认证状态">
      <div className="px-4 py-5">
        <div className="flex items-center gap-4 rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent font-serif text-xl font-bold text-accent-foreground">
            {(me.data?.user?.display_name || user.name || "校").slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-bold">
              {me.data?.user?.display_name || user.name || "校友"}
            </p>
            <p className="truncate text-xs text-primary-foreground/75">
              {profile?.graduation_year ? `${profile.graduation_year} 届` : "海林市高级中学校友"}
              {profile?.class_name ? ` · ${profile.class_name}` : ""}
            </p>
          </div>
        </div>

        {me.isLoading ? <Loading /> : null}

        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row icon={<Phone className="h-4 w-4" />} label="手机号" value={me.data?.user?.phone || user.phone || "未填写"} />
          <Row icon={<Mail className="h-4 w-4" />} label="邮箱" value={me.data?.user?.email || user.email || "未填写"} />
          <Row
            icon={<ShieldCheck className="h-4 w-4" />}
            label="账号状态"
            value={me.data?.user?.status === "active" ? "正常" : me.data?.user?.status || "—"}
          />
        </div>

        <h2 className="mt-7 font-serif text-base font-bold">校友认证记录</h2>
        <ul className="mt-3 space-y-2">
          {verifications.map((v: any) => (
            <li key={v.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium">
                  {v.name} · {v.graduation_year || "—"} 届
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                    v.status === "approved"
                      ? "bg-accent/20 text-accent-foreground"
                      : v.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-secondary text-primary"
                  }`}
                >
                  {v.status === "approved" ? "已通过" : v.status === "rejected" ? "未通过" : "审核中"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                提交于 {formatDate(v.created_at)}
                {v.reject_reason ? ` · ${v.reject_reason}` : ""}
              </p>
            </li>
          ))}
          {!me.isLoading && !verifications.length ? (
            <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              暂无认证记录
            </li>
          ) : null}
        </ul>

        <Button
          variant="outline"
          className="mt-8 w-full"
          onClick={() => {
            clearSession();
            toast.success("已退出登录");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>
    </AppShell>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}
