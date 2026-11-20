import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum — Schulden.PRO",
  description: "Impressum und Anbieterkennzeichnung gemäß § 5 TMG.",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <Link
          href="/"
          className="text-sm text-emerald-700 hover:text-emerald-900 transition-colors"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mt-6 mb-8 text-slate-900">
          Impressum
        </h1>

        <section className="space-y-6 text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            {/* Oeffentliche Fassung: Anbieterangaben durch Platzhalter ersetzt. */}
            <p className="font-semibold text-slate-900">[Name des Anbieters]</p>
            <p>
              [Anschrift]
              <br />
              [Vertretungsberechtigte Person(en)]
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Kontakt
            </h2>
            <p>
              E-Mail: [E-Mail-Adresse]
              <br />
              Telefon: [Telefonnummer]
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p>[Name, Anschrift]</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Hinweis
            </h2>
            <p>
              Diese Website dient der Information über
              Schuldenbereinigungsmöglichkeiten. Die bereitgestellten
              Informationen stellen keine Rechtsberatung dar. Für individuelle
              Rechtsfragen wenden Sie sich bitte an einen Rechtsanwalt.
            </p>
          </div>

          <p className="text-sm text-slate-500 pt-4 border-t border-slate-200">
            Stand: April 2026
          </p>
        </section>
      </div>
    </main>
  );
}
