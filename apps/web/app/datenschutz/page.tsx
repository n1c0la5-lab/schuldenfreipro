import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz — Schulden.PRO",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.",
};

export default function DatenschutzPage() {
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
          Datenschutzerklärung
        </h1>

        <section className="space-y-8 text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlicher im Sinne des Art. 4 Nr. 7 DSGVO ist die
            </p>
            {/* Oeffentliche Fassung: Verantwortlicher durch Platzhalter ersetzt. */}
            <p className="mt-3 font-semibold text-slate-900">[Name des Verantwortlichen]</p>
            <p className="mt-3">
              Anschrift siehe{" "}
              <Link
                href="/impressum"
                className="text-emerald-700 hover:text-emerald-900 underline"
              >
                Impressum
              </Link>
              . E-Mail: [E-Mail-Adresse]
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Umfang der Datenverarbeitung
            </h2>
            <p>
              Diese Website ist aktuell eine reine Informations- und
              Vorstellungsseite. Es bestehen keine Kontaktformulare, keine
              Newsletter-Anmeldung und keine Nutzerregistrierung. Die
              Verarbeitung personenbezogener Daten beschränkt sich auf das
              technisch Notwendige zum Betrieb der Website und auf Anfragen,
              die Sie uns freiwillig per E-Mail zusenden.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. Hosting und Server-Logfiles
            </h2>
            <p>
              Die Website wird von Vercel Inc. (440 N Barranca Ave #4133,
              Covina, CA 91723, USA) bereitgestellt. Beim Seitenaufruf werden
              technisch notwendige Verbindungsdaten verarbeitet:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>IP-Adresse (gekürzt bzw. anonymisiert)</li>
              <li>Datum und Uhrzeit der Anfrage</li>
              <li>Abgerufene URL</li>
              <li>Browsertyp und -version</li>
            </ul>
            <p className="mt-4">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse am sicheren Betrieb der Website).
              <br />
              <strong>Speicherdauer:</strong> maximal 30 Tage.
            </p>
            <p className="mt-4">
              Da Vercel auch Server in den USA betreibt, kann es zu einer
              Übermittlung in ein Drittland kommen. Die Übermittlung ist durch
              Standardvertragsklauseln nach Art. 46 DSGVO abgesichert.
            </p>
            <p className="mt-4">
              Die Domain ist bei [Domain-Registrar] registriert. Der Registrar
              hat keinen Zugriff auf die Inhalte dieser Website.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Schuldenrechner
            </h2>
            <p>
              Die Berechnungen im Schuldenrechner finden ausschließlich lokal
              in Ihrem Browser statt. Ihre Eingaben werden nicht an uns oder
              Dritte übertragen und nicht gespeichert.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. Kontaktaufnahme per E-Mail
            </h2>
            <p>
              Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre
              Angaben (Name, E-Mail-Adresse, Inhalt Ihrer Anfrage) zur
              Beantwortung Ihres Anliegens.
              <br />
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b oder lit.
              f DSGVO.
              <br />
              <strong>Speicherdauer:</strong> bis zur Erledigung Ihrer
              Anfrage, danach Löschung, soweit keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Cookies und Tracking
            </h2>
            <p>
              Diese Website setzt keine Cookies für Analyse- oder
              Marketingzwecke. Es werden keine Tracker, Werbe-Pixel oder
              Analyse-Tools wie Google Analytics oder Google Ads eingesetzt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. Ihre Rechte
            </h2>
            <p>Sie haben nach DSGVO das Recht auf:</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Auskunft (Art. 15)</li>
              <li>Berichtigung (Art. 16)</li>
              <li>Löschung (Art. 17)</li>
              <li>Einschränkung der Verarbeitung (Art. 18)</li>
              <li>Datenübertragbarkeit (Art. 20)</li>
              <li>Widerspruch (Art. 21)</li>
            </ul>
            <p className="mt-4">
              Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an:{" "}
              [E-Mail-Adresse]
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. Beschwerderecht
            </h2>
            <p>
              Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde
              zu beschweren. Zuständig ist [zuständige Datenschutz-Aufsichtsbehörde].
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. Änderungen dieser Datenschutzerklärung
            </h2>
            <p>
              Mit dem Ausbau zu einer vollständigen Mandantenplattform werden
              weitere Angaben (insb. zu Authentifizierung und
              Mandantendatenbank) ergänzt.
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
