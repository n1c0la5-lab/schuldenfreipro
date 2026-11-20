import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { pickWritableSchuldner, supabaseServer } from "@/lib/schuldner-server";

const LIST_FIELDS = "id, vorname, nachname, geburtsdatum, telefon, email, updated_at, fall(aktenzeichen)";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  let query = supabase.from("schuldner").select(LIST_FIELDS);

  if (q.length > 0) {
    const like = `%${q}%`;
    // Aktenzeichen-Suche bewusst nur auf Name fuer jetzt — nested filter auf fall.aktenzeichen folgt mit Combobox/Volltextsuche
    query = query.or(`vorname.ilike.${like},nachname.ilike.${like}`);
  }

  const { data: schuldner, error } = await query.order("nachname").limit(100);

  if (error) {
    console.error("[/api/schuldner] schuldner query failed:", error);
    return NextResponse.json(
      { error: "Datenbankfehler", message: error.message, details: error },
      { status: 500 }
    );
  }

  const ids = (schuldner ?? []).map((s) => s.id);
  const fristen: Record<string, string> = {};

  if (ids.length > 0) {
    // forderung -> fall -> schuldner (Schema seit Migration 002)
    const { data: faelle, error: fallErr } = await supabase
      .from("fall")
      .select("schuldner_id, forderung(datum_frist, updated_at)")
      .in("schuldner_id", ids);

    if (fallErr) {
      console.error("[/api/schuldner] fall/forderung nested query failed:", fallErr);
      return NextResponse.json(
        { error: "Datenbankfehler (Fristen)", message: fallErr.message, details: fallErr },
        { status: 500 }
      );
    }

    const latestActivity: Record<string, string> = {};
    for (const fall of faelle ?? []) {
      const sid = fall.schuldner_id;
      const forderungen = (fall.forderung ?? []) as Array<{
        datum_frist: string | null;
        updated_at: string | null;
      }>;
      for (const f of forderungen) {
        if (f.datum_frist && (!fristen[sid] || f.datum_frist < fristen[sid])) {
          fristen[sid] = f.datum_frist;
        }
        if (f.updated_at && (!latestActivity[sid] || f.updated_at > latestActivity[sid])) {
          latestActivity[sid] = f.updated_at;
        }
      }
    }

    for (const s of schuldner ?? []) {
      const forderungUpdated = latestActivity[s.id];
      if (forderungUpdated && (!s.updated_at || forderungUpdated > s.updated_at)) {
        s.updated_at = forderungUpdated;
      }
    }
  }

  // aktenzeichen aus nested fall auf Top-Level ziehen (kompatibel mit Client-Liste)
  const flat = (schuldner ?? []).map((s) => {
    const faelle = (s as unknown as { fall?: Array<{ aktenzeichen: string | null }> }).fall ?? [];
    const aktenzeichen = faelle[0]?.aktenzeichen ?? null;
    const { fall: _unused, ...rest } = s as unknown as Record<string, unknown>;
    return { ...rest, aktenzeichen };
  });

  return NextResponse.json({
    data: flat,
    count: flat.length,
    fristen,
  });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { error: "Ungueltige Anfrage", message: "JSON-Body erwartet" },
      { status: 400 }
    );
  }

  const fields = pickWritableSchuldner(body);
  if (!fields.vorname || !fields.nachname) {
    return NextResponse.json(
      { error: "Pflichtfelder fehlen", message: "vorname und nachname sind Pflicht" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("schuldner").insert(fields).select().single();

  if (error) {
    return NextResponse.json(
      { error: "Datenbankfehler", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
