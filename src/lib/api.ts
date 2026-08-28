export const API_BASE_URL = "https://hailin-alumni-api.onrender.com";

const TOKEN_KEY = "hailin_token";
const USER_KEY = "hailin_user";

export type AuthUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("hailin-auth"));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("hailin-auth"));
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T = any>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = false } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE_URL}${path}`, init);

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || data?.ok === false) {
    if (res.status === 401 && auth) clearSession();
    throw new ApiError(data?.message || `请求失败（${res.status}）`, res.status);
  }
  return data as T;
}

/* ---------- 数据类型 ---------- */

export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
  category: string | null;
  author: string | null;
  published_at: string | null;
  view_count: number | null;
  content?: string | null;
};

export type EventItem = {
  id: number;
  slug: string | null;
  title: string;
  summary: string | null;
  cover_url: string | null;
  category: string | null;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  signup_deadline: string | null;
  capacity: number | null;
  registrations_count: number | string | null;
  content?: string | null;
};

export type ForumPost = {
  id: number;
  category_id: number | null;
  category_name: string | null;
  author_name: string | null;
  title: string;
  content?: string | null;
  view_count: number | null;
  reply_count: number | null;
  is_pinned: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ForumReply = {
  id: number;
  author_name: string | null;
  content: string;
  created_at: string | null;
};

export const fetchNews = (params: { page?: number; category?: string; q?: string } = {}) => {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", "20");
  if (params.category && params.category !== "全部") qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  return api<{ items: NewsItem[]; total: number; categories: string[] }>(`/api/news?${qs}`);
};

export const fetchNewsDetail = (slug: string) =>
  api<{ article: NewsItem }>(`/api/news/${encodeURIComponent(slug)}`);

export const fetchEvents = (mode: "upcoming" | "past" = "upcoming") =>
  api<{ items: EventItem[] }>(`/api/events?mode=${mode}`);

export const fetchEventDetail = (id: string) =>
  api<{ event: EventItem }>(`/api/events/${encodeURIComponent(id)}`);

export const fetchForumPosts = (params: { page?: number; categoryId?: number; q?: string } = {}) => {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", "20");
  if (params.categoryId) qs.set("categoryId", String(params.categoryId));
  if (params.q) qs.set("q", params.q);
  return api<{ items: ForumPost[]; total: number }>(`/api/forum/posts?${qs}`);
};

export const fetchForumCategories = () =>
  api<{ categories: { id: number; name: string; post_count: number }[] }>(`/api/forum/categories`);

export const fetchForumPost = (id: string) =>
  api<{ post: ForumPost; replies: ForumReply[] }>(`/api/forum/posts/${encodeURIComponent(id)}`);

export const login = (loginName: string, password: string) =>
  api<{ token: string; user: AuthUser }>(`/api/auth/login`, {
    method: "POST",
    body: { email: loginName, password },
  });

export const fetchMe = () =>
  api<{ user: any; profile: any; verifications: any[] }>(`/api/alumni/me`, { auth: true });

export const registerEvent = (id: number, body: { name: string; phone: string; remark?: string }) =>
  api(`/api/events/${id}/register`, { method: "POST", body });

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${formatDate(value)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function mediaUrl(url: string | null | undefined) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
