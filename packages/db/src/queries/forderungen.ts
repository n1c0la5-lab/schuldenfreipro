import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

type Client = SupabaseClient<Database>;

export async function getForderungenBySchuldner(client: Client, schuldnerId: string) {
  return client
    .from("forderung")
    .select("*, glaeubiger(name, typ)")
    .eq("schuldner_id", schuldnerId)
    .order("created_at", { ascending: false });
}

export async function createForderung(
  client: Client,
  data: Database["public"]["Tables"]["forderung"]["Insert"]
) {
  return client.from("forderung").insert(data).select().single();
}

export async function updateForderungStatus(
  client: Client,
  id: string,
  status: string
) {
  return client.from("forderung").update({ status }).eq("id", id).select().single();
}
