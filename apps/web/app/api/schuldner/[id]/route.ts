import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pickWritableSchuldner, supabaseServer } from "@/lib/schuldner-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);

  const { data, error } = await supabase
    .from("schuldner")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Nicht gefunden", message: `Mandant ${id} existiert nicht` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Datenbankfehler", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  if (Object.keys(fields).length === 0) {
    return NextResponse.json(
      { error: "Keine Felder", message: "Mindestens ein Feld erforderlich" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("schuldner")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Nicht gefunden", message: `Mandant ${id} existiert nicht` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Datenbankfehler", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
