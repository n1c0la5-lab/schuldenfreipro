"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface SchuldnerFormData {
  vorname?: string | null;
  nachname?: string | null;
  geburtsdatum?: string | null;
  email?: string | null;
  telefon?: string | null;
  strasse?: string | null;
  plz?: string | null;
  ort?: string | null;
  nettoeinkommen?: number | null;
  unterhaltspflichten?: number | null;
  p_konto?: boolean | null;
  fruehere_insolvenz_jahr?: number | null;
}

interface Props {
  id?: string;
  initial?: SchuldnerFormData;
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function SchuldnerForm({ id, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    vorname: toStr(initial?.vorname),
    nachname: toStr(initial?.nachname),
    geburtsdatum: toStr(initial?.geburtsdatum),
    email: toStr(initial?.email),
    telefon: toStr(initial?.telefon),
    strasse: toStr(initial?.strasse),
    plz: toStr(initial?.plz),
    ort: toStr(initial?.ort),
    nettoeinkommen: toStr(initial?.nettoeinkommen),
    unterhaltspflichten: toStr(initial?.unterhaltspflichten ?? 0),
    p_konto: Boolean(initial?.p_konto),
    fruehere_insolvenz_jahr: toStr(initial?.fruehere_insolvenz_jahr),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      vorname: form.vorname,
      nachname: form.nachname,
      geburtsdatum: form.geburtsdatum || null,
      email: form.email || null,
      telefon: form.telefon || null,
      strasse: form.strasse || null,
      plz: form.plz || null,
      ort: form.ort || null,
      p_konto: form.p_konto,
    };
    if (form.nettoeinkommen) payload.nettoeinkommen = parseFloat(form.nettoeinkommen);
    if (form.unterhaltspflichten) payload.unterhaltspflichten = parseInt(form.unterhaltspflichten);
    if (form.fruehere_insolvenz_jahr) payload.fruehere_insolvenz_jahr = parseInt(form.fruehere_insolvenz_jahr);

    const url = isEdit ? `/api/schuldner/${id}` : "/api/schuldner";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
      const newId = isEdit ? id! : json.data.id;
      router.push(`/cockpit/${newId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
      setSaving(false);
    }
  }

  const input = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const label = "mb-1 block text-xs font-medium uppercase text-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Person</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={label}>Vorname *</label>
            <input required className={input} value={form.vorname} onChange={(e) => update("vorname", e.target.value)} />
          </div>
          <div>
            <label className={label}>Nachname *</label>
            <input required className={input} value={form.nachname} onChange={(e) => update("nachname", e.target.value)} />
          </div>
          <div>
            <label className={label}>Geburtsdatum</label>
            <input type="date" className={input} value={form.geburtsdatum} onChange={(e) => update("geburtsdatum", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Kontakt</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>E-Mail</label>
            <input type="email" className={input} value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className={label}>Telefon</label>
            <input className={input} value={form.telefon} onChange={(e) => update("telefon", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Adresse</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Strasse + Nr.</label>
            <input className={input} value={form.strasse} onChange={(e) => update("strasse", e.target.value)} />
          </div>
          <div>
            <label className={label}>PLZ</label>
            <input className={input} value={form.plz} onChange={(e) => update("plz", e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <label className={label}>Ort</label>
            <input className={input} value={form.ort} onChange={(e) => update("ort", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Finanzen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={label}>Nettoeinkommen (Euro)</label>
            <input type="number" step="0.01" min="0" className={input} value={form.nettoeinkommen} onChange={(e) => update("nettoeinkommen", e.target.value)} />
          </div>
          <div>
            <label className={label}>Unterhaltspflichten</label>
            <input type="number" min="0" className={input} value={form.unterhaltspflichten} onChange={(e) => update("unterhaltspflichten", e.target.value)} />
          </div>
          <div>
            <label className={label}>Frueh. Insolvenz (Jahr)</label>
            <input type="number" min="1900" max="2100" className={input} value={form.fruehere_insolvenz_jahr} onChange={(e) => update("fruehere_insolvenz_jahr", e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.p_konto} onChange={(e) => update("p_konto", e.target.checked)} />
              P-Konto eingerichtet
            </label>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Speichern..." : isEdit ? "Aenderungen speichern" : "Mandant anlegen"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
