"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Forderung {
  id: string;
  az_glaeubiger: string | null;
  hauptforderung: number | null;
  zinsen: number | null;
  kosten: number | null;
  gesamtbetrag: number | null;
  titulierung: boolean;
  datum_schreiben: string | null;
  datum_frist: string | null;
  art: string | null;
  status: string | null;
  quelle: string | null;
  created_at: string;
  glaeubiger: { id: string; name: string; glaeubiger_typ: string | null } | null;
}

const EURO = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function ForderungenListe({ schuldnerId }: { schuldnerId: string }) {
  const router = useRouter();
  const [forderungen, setForderungen] = useState<Forderung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/schuldner/${schuldnerId}/forderungen`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setForderungen(json.data ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Fehler"))
      .finally(() => setLoading(false));
  }, [schuldnerId]);

  if (loading) return <p className="text-gray-500">Lade Forderungen...</p>;
  if (error) return <p className="text-red-600">Fehler: {error}</p>;
  if (forderungen.length === 0) return <p className="text-gray-500">Keine Forderungen erfasst.</p>;

  const summe = forderungen.reduce((acc, f) => acc + (f.gesamtbetrag ?? 0), 0);

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Glaeubiger</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktenzeichen</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Betrag</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frist</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quelle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {forderungen.map((f) => {
            const frist = f.datum_frist ? new Date(f.datum_frist) : null;
            const past = frist && frist.getTime() < Date.now();
            const critical = frist && !past && frist.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
            return (
              <tr
                key={f.id}
                onClick={() => router.push(`/cockpit/forderungen/${f.id}`)}
                className="cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">{f.glaeubiger?.name ?? "-"}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{f.az_glaeubiger ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-900">
                  {f.gesamtbetrag !== null ? EURO.format(f.gesamtbetrag) : "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {frist ? (
                    <span className={past ? "text-red-600 font-semibold" : critical ? "text-orange-600 font-semibold" : "text-gray-600"}>
                      {frist.toLocaleDateString("de-DE")}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{f.status ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{f.quelle ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-700">
              {forderungen.length} Forderung{forderungen.length !== 1 ? "en" : ""}
            </td>
            <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold text-gray-900">
              {EURO.format(summe)}
            </td>
            <td colSpan={3}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
