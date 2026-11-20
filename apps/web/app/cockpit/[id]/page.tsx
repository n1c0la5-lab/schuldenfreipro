import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ForderungenListe } from "./forderungen-liste";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

function Feld({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? "-"}</dd>
    </div>
  );
}

function Karte({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{titel}</h3>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
    </section>
  );
}

export default async function SchuldnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cockpit/${id}`);

  const { data: schuldner, error } = await supabase
    .from("schuldner")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !schuldner) notFound();

  const name = `${schuldner.nachname}${schuldner.vorname ? ", " + schuldner.vorname : ""}`;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/cockpit" className="text-sm text-blue-600 hover:underline">
            &larr; Zurueck zur Mandanten-Liste
          </Link>
        </div>

        <header className="mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-sm font-mono text-gray-500 mt-1">{schuldner.aktenzeichen}</p>
          </div>
          <Link
            href={`/cockpit/${id}/bearbeiten`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bearbeiten
          </Link>
        </header>

        <div className="space-y-6">
          <Karte titel="Person">
            <Feld label="Vorname" value={schuldner.vorname} />
            <Feld label="Nachname" value={schuldner.nachname} />
            <Feld
              label="Geburtsdatum"
              value={schuldner.geburtsdatum ? new Date(schuldner.geburtsdatum).toLocaleDateString("de-DE") : null}
            />
          </Karte>

          <Karte titel="Kontakt">
            <Feld label="E-Mail" value={schuldner.email} />
            <Feld label="Telefon" value={schuldner.telefon} />
          </Karte>

          <Karte titel="Adresse">
            <Feld label="Strasse" value={schuldner.strasse} />
            <Feld label="PLZ" value={schuldner.plz} />
            <Feld label="Ort" value={schuldner.ort} />
          </Karte>

          <Karte titel="Finanzen">
            <Feld
              label="Nettoeinkommen"
              value={schuldner.nettoeinkommen !== null ? EURO.format(schuldner.nettoeinkommen) : null}
            />
            <Feld label="Unterhaltspflichten" value={schuldner.unterhaltspflichten} />
            <Feld label="P-Konto" value={schuldner.p_konto ? "ja" : "nein"} />
            <Feld label="Frueh. Insolvenz (Jahr)" value={schuldner.fruehere_insolvenz_jahr} />
          </Karte>

          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Forderungen</h3>
            <ForderungenListe schuldnerId={id} />
          </section>

          <Karte titel="Meta">
            <Feld
              label="Erstellt"
              value={new Date(schuldner.created_at).toLocaleString("de-DE")}
            />
            <Feld
              label="Aktualisiert"
              value={new Date(schuldner.updated_at).toLocaleString("de-DE")}
            />
          </Karte>
        </div>
      </div>
    </main>
  );
}
