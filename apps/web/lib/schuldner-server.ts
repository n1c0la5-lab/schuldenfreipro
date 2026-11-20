import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";

export const SCHULDNER_WRITABLE_FIELDS = [
  "vorname",
  "nachname",
  "geburtsdatum",
  "email",
  "telefon",
  "strasse",
  "plz",
  "ort",
  "nettoeinkommen",
  "unterhaltspflichten",
  "p_konto",
  "fruehere_insolvenz_jahr",
] as const;

export function pickWritableSchuldner(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SCHULDNER_WRITABLE_FIELDS) {
    if (key in body && body[key] !== undefined && body[key] !== "") {
      out[key] = body[key];
    }
  }
  return out;
}

export function supabaseServer(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
}
