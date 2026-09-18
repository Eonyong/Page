"use client";
// 브라우저 쪽 관리자 키 보관/호출 도우미 (sessionStorage — 탭 닫으면 사라짐)
const KEY = "admin_key";
export function getKey() { try { return sessionStorage.getItem(KEY) ?? ""; } catch { return ""; } }
export function setKey(v: string) { try { sessionStorage.setItem(KEY, v); } catch {} }
export function clearKey() { try { sessionStorage.removeItem(KEY); } catch {} }
export async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(path, { ...init, headers: { "content-type": "application/json", "x-admin-key": getKey(), ...(init.headers ?? {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data;
}
