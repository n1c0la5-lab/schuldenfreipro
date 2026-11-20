import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // forderung -> fall -> schuldner (Schema seit Migration 002)
  const { data: faelle, error } = await supabase
    .from("fall")
    .select(
      `
      id,
      forderung (
        id, az_glaeubiger, hauptforderung, zinsen, kosten, gesamtbetrag,
        titulierung, datum_schreiben, datum_frist, art, status, quelle, created_at,
        glaeubiger:glaeubiger_id ( id, name, glaeubiger_typ )
      )
    `,
    )
    .eq("schuldner_id", id);

  if (error) {
    return NextResponse.json(
      { error: "Datenbankfehler", message: error.message },
      { status: 500 },
    );
  }

  const data = (faelle ?? [])
    .flatMap((f) => f.forderung ?? [])
    .sort((a, b) => {
      const da = a.datum_frist;
      const db = b.datum_frist;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });

  return NextResponse.json({ data, count: data.length });
}
