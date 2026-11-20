import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@schuldenpro/db";

type Option = { value: string; label: string };

export async function loadFormOptions(supabase: SupabaseClient<Database>): Promise<{
  faelle: Option[];
  glaeubigerListe: Option[];
  vertreterListe: Option[];
}> {
  const [faelleRes, glRes, vtRes] = await Promise.all([
    supabase
      .from("fall")
      .select("id, aktenzeichen, schuldner:schuldner_id(vorname, nachname)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("glaeubiger").select("id, name").order("name").limit(500),
    supabase
      .from("glaeubiger_vertreter")
      .select("id, firma, ansprechpartner")
      .order("firma")
      .limit(500),
  ]);

  const faelle: Option[] = (faelleRes.data ?? []).map((f) => {
    const sch = Array.isArray(f.schuldner) ? f.schuldner[0] : f.schuldner;
    const mandant = sch ? `${sch.vorname ?? ""} ${sch.nachname ?? ""}`.trim() : "?";
    const az = f.aktenzeichen ? ` (${f.aktenzeichen})` : "";
    return { value: f.id, label: `${mandant}${az}` };
  });

  const glaeubigerListe: Option[] = (glRes.data ?? []).map((g) => ({
    value: g.id,
    label: g.name,
  }));

  const vertreterListe: Option[] = (vtRes.data ?? []).map((v) => ({
    value: v.id,
    label: v.firma ?? v.ansprechpartner ?? v.id,
  }));

  return { faelle, glaeubigerListe, vertreterListe };
}
