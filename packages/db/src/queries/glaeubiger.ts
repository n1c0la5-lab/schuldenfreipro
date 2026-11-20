import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

type Client = SupabaseClient<Database>;

export async function searchGlaeubiger(client: Client, query: string) {
  // pg_trgm Fuzzy-Matching via Supabase RPC oder textSearch
  return client
    .from("glaeubiger")
    .select("id, name, typ, vergleichsbereitschaft")
    .ilike("name", `%${query}%`)
    .limit(10);
}

export async function getGlaeubigerById(client: Client, id: number) {
  return client
    .from("glaeubiger")
    .select("*")
    .eq("id", id)
    .single();
}
