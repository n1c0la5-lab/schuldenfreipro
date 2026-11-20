import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Service-Role Client (umgeht RLS — nur fuer Webhooks)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Die Lead-Agentur schickt Lead-Daten als HTML-Tabelle per Gmail-Forwarding
// Format: <tr><td>Vorname</td><td>Max</td></tr> etc.
function parseLeadAgencyHtml(html: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const rowRegex = /<tr[^>]*>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/gi;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const key = match[1].replace(/<[^>]*>/g, "").trim().toLowerCase();
    const value = match[2].replace(/<[^>]*>/g, "").trim();
    if (key && value) fields[key] = value;
  }
  return fields;
}

export async function POST(request: NextRequest) {
  // Einfacher API-Key Check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const html = body.html || body.body || "";
  const fields = parseLeadAgencyHtml(html);

  const supabase = getServiceClient();
  const { data, error } = await supabase.from("lead").insert({
    vorname: fields["vorname"] || fields["first name"] || null,
    nachname: fields["nachname"] || fields["last name"] || null,
    email: fields["e-mail"] || fields["email"] || null,
    telefon: fields["telefon"] || fields["phone"] || fields["telefonnummer"] || null,
    kanal: "lead-agency",
    notizen: JSON.stringify(fields),
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: Admin-Benachrichtigung per Mail (nodemailer)

  return NextResponse.json({ ok: true, lead_id: data.id });
}
