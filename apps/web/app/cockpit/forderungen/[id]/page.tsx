import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/schuldner-server";
import { ForderungForm } from "../form";
import { loadFormOptions } from "../_loaders";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ForderungBearbeitenPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cockpit/forderungen/${id}`);

  const { data: forderung, error } = await supabase
    .from("forderung")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !forderung) notFound();

  const options = await loadFormOptions(supabase);

  const { data: profile } = await supabase
    .from("user_profile")
    .select("rolle")
    .eq("id", user.id)
    .single();
  const isBerater = profile?.rolle === "berater" || profile?.rolle === "admin";

  return (
    <main className="min-h-screen bg-gray-50 p-8 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/cockpit" className="text-sm text-blue-600 hover:underline">
            &larr; Zurueck zum Cockpit
          </Link>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Forderung bearbeiten</h1>
        <p className="mb-8 text-sm text-gray-500">ID: {forderung.id}</p>

        <ForderungForm
          faelle={options.faelle}
          glaeubigerListe={options.glaeubigerListe}
          vertreterListe={options.vertreterListe}
          forderungId={forderung.id}
          isBerater={isBerater}
          initial={{
            fall_id: forderung.fall_id,
            glaeubiger_id: forderung.glaeubiger_id,
            vertreter_id: forderung.vertreter_id,
            art: forderung.art,
            az_glaeubiger: forderung.az_glaeubiger,
            charakter: forderung.charakter,
            quelle: forderung.quelle,
            hauptforderung: Number(forderung.hauptforderung ?? 0),
            zinsen: Number(forderung.zinsen ?? 0),
            kosten: Number(forderung.kosten ?? 0),
            bestritten: forderung.bestritten,
            titulierung: forderung.titulierung,
            titulierungsdatum: forderung.titulierungsdatum,
            absonderungsrecht: forderung.absonderungsrecht,
            absonderung_detail: forderung.absonderung_detail,
            datum_schreiben: forderung.datum_schreiben,
            datum_frist: forderung.datum_frist,
            nullplan_abgelehnt: forderung.nullplan_abgelehnt,
            nicht_kontaktieren: forderung.nicht_kontaktieren,
            status: forderung.status ?? "neu",
          }}
        />
      </div>
    </main>
  );
}
