"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/schuldner-server";
import { forderungSchema } from "@schuldenpro/db";

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors: Record<string, string> };

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteForderung(id: string): Promise<DeleteResult> {
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);

  const { error } = await supabase.from("forderung").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/cockpit/forderungen");
  revalidatePath("/cockpit");
  return { ok: true };
}

export async function saveForderung(input: unknown, id?: string): Promise<SaveResult> {
  const parsed = forderungSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Validierung fehlgeschlagen",
      fieldErrors,
    };
  }

  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);

  const query = id
    ? supabase.from("forderung").update(parsed.data).eq("id", id).select("id").single()
    : supabase.from("forderung").insert(parsed.data).select("id").single();

  const { data, error } = await query;
  if (error) return { ok: false, error: error.message, fieldErrors: {} };

  revalidatePath("/cockpit/forderungen");
  revalidatePath(`/cockpit/forderungen/${data.id}`);
  return { ok: true, id: data.id };
}
