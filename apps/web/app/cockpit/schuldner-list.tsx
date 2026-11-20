"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Schuldner {
  id: string;
  aktenzeichen: string | null;
  vorname: string | null;
  nachname: string | null;
  geburtsdatum: string | null;
  telefon: string | null;
  email: string | null;
  updated_at: string | null;
}

interface ApiResponse {
  data: Schuldner[];
  count: number;
  fristen: Record<string, string>;
}

type SortField = "name" | "frist" | "aktualisiert";

export function SchuldnerList() {
  const [schuldner, setSchuldner] = useState<Schuldner[]>([]);
  const [fristen, setFristen] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");

  const toggleSort = (field: "frist" | "aktualisiert") => {
    setSortField((prev) => (prev === field ? "name" : field));
  };

  const fetchSchuldner = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/schuldner${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      setSchuldner(json.data);
      setFristen(json.fristen ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setSchuldner([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSchuldner(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchSchuldner]);

  const sorted =
    sortField === "frist"
      ? [...schuldner].sort((a, b) => {
          const fa = fristen[a.id];
          const fb = fristen[b.id];
          if (!fa && !fb) return 0;
          if (!fa) return 1;
          if (!fb) return -1;
          return new Date(fa).getTime() - new Date(fb).getTime();
        })
      : sortField === "aktualisiert"
        ? [...schuldner].sort((a, b) => {
            const aa = a.updated_at;
            const ab = b.updated_at;
            if (!aa && !ab) return 0;
            if (!aa) return 1;
            if (!ab) return -1;
            return new Date(ab).getTime() - new Date(aa).getTime();
          })
        : schuldner;

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Suche nach Name oder Aktenzeichen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Fehler: {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Lade Mandanten...</p>
      ) : schuldner.length === 0 ? (
        <p className="text-gray-500">Keine Mandanten gefunden.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktenzeichen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Geburtsdatum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => toggleSort("frist")}
                >
                  Frist {sortField === "frist" ? "\u25B2" : ""}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-blue-600 select-none"
                  onClick={() => toggleSort("aktualisiert")}
                >
                  Aktualisiert {sortField === "aktualisiert" ? "\u25BC" : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    <Link href={`/cockpit/${s.id}`} className="block">
                      {s.aktenzeichen ?? "-"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link href={`/cockpit/${s.id}`} className="block">
                      {s.nachname ?? ""}
                      {s.vorname ? `, ${s.vorname}` : ""}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.geburtsdatum ? new Date(s.geburtsdatum).toLocaleDateString("de-DE") : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.telefon ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.email ?? "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {fristen[s.id] ? (
                      (() => {
                        const frist = new Date(fristen[s.id]);
                        const diff = frist.getTime() - Date.now();
                        const past = diff < 0;
                        const critical = !past && diff < 7 * 24 * 60 * 60 * 1000;
                        return (
                          <span
                            className={
                              past
                                ? "text-red-600 font-semibold"
                                : critical
                                  ? "text-orange-600 font-semibold"
                                  : "text-gray-600"
                            }
                          >
                            {frist.toLocaleDateString("de-DE")}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {s.updated_at ? new Date(s.updated_at).toLocaleDateString("de-DE") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 border-t">
            {schuldner.length} Mandant{schuldner.length !== 1 ? "en" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
