import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

type Client = SupabaseClient<Database>;

export async function getSchuldnerList(client: Client) {
  return client
    .from("schuldner")
    .select("id, aktenzeichen, vorname, nachname, nettoeinkommen, created_at")
    .order("created_at", { ascending: false });
}

export async function getSchuldnerById(client: Client, id: string) {
  return client
    .from("schuldner")
    .select("*")
    .eq("id", id)
    .single();
}

export async function createSchuldner(
  client: Client,
  data: Database["public"]["Tables"]["schuldner"]["Insert"]
) {
  return client.from("schuldner").insert(data).select().single();
}

export async function updateSchuldner(
  client: Client,
  id: string,
  data: Database["public"]["Tables"]["schuldner"]["Update"]
) {
  return client.from("schuldner").update(data).eq("id", id).select().single();
}
