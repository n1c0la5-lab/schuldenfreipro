"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveForderung, deleteForderung } from "./_actions";
import type { ForderungInput } from "@schuldenpro/db";

type Option = { value: string; label: string };

type Props = {
  faelle: Option[];
  glaeubigerListe: Option[];
  vertreterListe: Option[];
  initial?: Partial<ForderungInput>;
  forderungId?: string;
  defaultFallId?: string;
  isBerater?: boolean;
};

const STATUS_OPTIONS = ["neu", "aktiv", "verglichen", "erledigt"] as const;

const FORDERUNGSARTEN = [
  "kredit",
  "kreditkarte",
  "dispo",
  "mietrueckstand",
  "telekommunikation",
  "energie",
  "steuerforderung",
  "sozialversicherung",
  "unterhalt",
  "gerichtskosten",
  "bussgeld",
  "inkasso",
  "sonstiges",
] as const;

function formatEuro(v: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);
}

function parseMoney(s: string): number {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ForderungForm({
  faelle,
  glaeubigerListe,
  vertreterListe,
  initial,
  forderungId,
  defaultFallId,
  isBerater = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Stammdaten
  const [fallId, setFallId] = useState<string>(initial?.fall_id ?? defaultFallId ?? "");
  const [glaeubigerId, setGlaeubigerId] = useState<string>(initial?.glaeubiger_id ?? "");
  const [vertreterId, setVertreterId] = useState<string>(initial?.vertreter_id ?? "");
  const [art, setArt] = useState<string>(initial?.art ?? "");
  const [azGlaeubiger, setAzGlaeubiger] = useState<string>(initial?.az_glaeubiger ?? "");
  const [charakter, setCharakter] = useState<string>(initial?.charakter ?? "");
  const [quelle, setQuelle] = useState<string>(initial?.quelle ?? "");

  // Beträge
  const [hauptforderung, setHauptforderung] = useState<string>(
    initial?.hauptforderung?.toString() ?? "0",
  );
  const [zinsen, setZinsen] = useState<string>(initial?.zinsen?.toString() ?? "0");
  const [kosten, setKosten] = useState<string>(initial?.kosten?.toString() ?? "0");

  // Flags
  const [bestritten, setBestritten] = useState<boolean>(initial?.bestritten ?? false);
  const [titulierung, setTitulierung] = useState<boolean>(initial?.titulierung ?? false);
  const [titulierungsdatum, setTitulierungsdatum] = useState<string>(
    initial?.titulierungsdatum ?? "",
  );
  const [absonderungsrecht, setAbsonderungsrecht] = useState<boolean>(
    initial?.absonderungsrecht ?? false,
  );
  const [absonderungDetail, setAbsonderungDetail] = useState<string>(
    initial?.absonderung_detail ?? "",
  );

  // Fristen
  const [datumSchreiben, setDatumSchreiben] = useState<string>(initial?.datum_schreiben ?? "");
  const [datumFrist, setDatumFrist] = useState<string>(initial?.datum_frist ?? "");

  // Intern (Berater)
  const [nullplanAbgelehnt, setNullplanAbgelehnt] = useState<boolean>(
    initial?.nullplan_abgelehnt ?? false,
  );
  const [nichtKontaktieren, setNichtKontaktieren] = useState<boolean>(
    initial?.nicht_kontaktieren ?? false,
  );
  const [status, setStatus] = useState<string>(initial?.status ?? "neu");

  const gesamt = useMemo(
    () => parseMoney(hauptforderung) + parseMoney(zinsen) + parseMoney(kosten),
    [hauptforderung, zinsen, kosten],
  );

  const fristAbgelaufen = useMemo(
    () => Boolean(datumFrist && datumFrist < today()),
    [datumFrist],
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setFieldErrors({});

    const payload = {
      fall_id: fallId,
      glaeubiger_id: glaeubigerId || null,
      vertreter_id: vertreterId || null,
      art: art || null,
      az_glaeubiger: azGlaeubiger || null,
      charakter: charakter || null,
      quelle: quelle || null,
      hauptforderung: parseMoney(hauptforderung),
      zinsen: parseMoney(zinsen),
      kosten: parseMoney(kosten),
      bestritten,
      titulierung,
      titulierungsdatum: titulierung ? titulierungsdatum || null : null,
      absonderungsrecht,
      absonderung_detail: absonderungsrecht ? absonderungDetail || null : null,
      datum_schreiben: datumSchreiben || null,
      datum_frist: datumFrist || null,
      nullplan_abgelehnt: isBerater ? nullplanAbgelehnt : (initial?.nullplan_abgelehnt ?? false),
      nicht_kontaktieren: isBerater ? nichtKontaktieren : (initial?.nicht_kontaktieren ?? false),
      status: isBerater ? status : (initial?.status ?? "neu"),
    };

    startTransition(async () => {
      const result = await saveForderung(payload, forderungId);
      if (result.ok) {
        setMessage("Gespeichert.");
        if (!forderungId) {
          router.push(`/cockpit/forderungen/${result.id}`);
        } else {
          router.refresh();
        }
      } else {
        setMessage(`Fehler: ${result.error}`);
        setFieldErrors(result.fieldErrors);
      }
    });
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      {/* --- Stammdaten --- */}
      <fieldset className="rounded-lg border border-gray-200 bg-white p-6">
        <legend className="px-2 text-lg font-semibold text-gray-800">Stammdaten</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Label text="Fall / Mandant *" error={fieldErrors["fall_id"]}>
            <select
              required
              value={fallId}
              onChange={(e) => setFallId(e.target.value)}
              className="input"
            >
              <option value="">— waehlen —</option>
              {faelle.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Glaeubiger" error={fieldErrors["glaeubiger_id"]}>
            <select
              value={glaeubigerId}
              onChange={(e) => setGlaeubigerId(e.target.value)}
              className="input"
            >
              <option value="">— keiner —</option>
              {glaeubigerListe.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Vertreter (Inkasso / Anwalt)" error={fieldErrors["vertreter_id"]}>
            <select
              value={vertreterId}
              onChange={(e) => setVertreterId(e.target.value)}
              className="input"
            >
              <option value="">— keiner —</option>
              {vertreterListe.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Forderungsart" error={fieldErrors["art"]}>
            <select value={art} onChange={(e) => setArt(e.target.value)} className="input">
              <option value="">— unbestimmt —</option>
              {FORDERUNGSARTEN.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Aktenzeichen Glaeubiger" error={fieldErrors["az_glaeubiger"]}>
            <input
              type="text"
              maxLength={100}
              value={azGlaeubiger}
              onChange={(e) => setAzGlaeubiger(e.target.value)}
              className="input"
            />
          </Label>

          <Label text="Charakter (A / B / C)" error={fieldErrors["charakter"]}>
            <input
              type="text"
              maxLength={1}
              pattern="[A-Za-z]?"
              value={charakter}
              onChange={(e) => setCharakter(e.target.value.toUpperCase())}
              className="input w-20"
            />
          </Label>

          <Label text="Quelle" wide error={fieldErrors["quelle"]}>
            <input
              type="text"
              value={quelle}
              onChange={(e) => setQuelle(e.target.value)}
              placeholder='z.B. "Brief 12.04", "OCR Scan #42"'
              className="input"
            />
          </Label>
        </div>
      </fieldset>

      {/* --- Betraege --- */}
      <fieldset className="rounded-lg border border-gray-200 bg-white p-6">
        <legend className="px-2 text-lg font-semibold text-gray-800">Betraege</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Label text="Hauptforderung (EUR)" error={fieldErrors["hauptforderung"]}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={hauptforderung}
              onChange={(e) => setHauptforderung(e.target.value)}
              className="input"
            />
          </Label>
          <Label text="Zinsen (EUR)" error={fieldErrors["zinsen"]}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={zinsen}
              onChange={(e) => setZinsen(e.target.value)}
              className="input"
            />
          </Label>
          <Label text="Kosten (EUR)" error={fieldErrors["kosten"]}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={kosten}
              onChange={(e) => setKosten(e.target.value)}
              className="input"
            />
          </Label>
        </div>
        <div className="mt-4 rounded bg-gray-50 p-3 text-right">
          <span className="mr-2 text-sm text-gray-600">Gesamtbetrag:</span>
          <span className="text-lg font-semibold text-gray-900">{formatEuro(gesamt)}</span>
        </div>
      </fieldset>

      {/* --- Rechtliche Flags --- */}
      <fieldset className="rounded-lg border border-gray-200 bg-white p-6">
        <legend className="px-2 text-lg font-semibold text-gray-800">Rechtliche Flags</legend>
        <div className="space-y-4">
          <CheckboxRow
            label="Forderung bestritten"
            checked={bestritten}
            onChange={setBestritten}
          />

          <div>
            <CheckboxRow
              label="Tituliert"
              checked={titulierung}
              onChange={(v) => {
                setTitulierung(v);
                if (!v) setTitulierungsdatum("");
              }}
            />
            {titulierung && (
              <div className="ml-7 mt-2 max-w-xs">
                <Label text="Titulierungsdatum" error={fieldErrors["titulierungsdatum"]}>
                  <input
                    type="date"
                    value={titulierungsdatum}
                    onChange={(e) => setTitulierungsdatum(e.target.value)}
                    className="input"
                  />
                </Label>
              </div>
            )}
          </div>

          <div>
            <CheckboxRow
              label="Absonderungsrecht"
              checked={absonderungsrecht}
              onChange={(v) => {
                setAbsonderungsrecht(v);
                if (!v) setAbsonderungDetail("");
              }}
            />
            {absonderungsrecht && (
              <div className="ml-7 mt-2">
                <Label
                  text="Detail zum Absonderungsrecht"
                  error={fieldErrors["absonderung_detail"]}
                >
                  <textarea
                    value={absonderungDetail}
                    onChange={(e) => setAbsonderungDetail(e.target.value)}
                    rows={2}
                    className="input"
                    placeholder="z.B. Sicherungsuebereignung KFZ, Grundschuld..."
                  />
                </Label>
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* --- Fristen --- */}
      <fieldset className="rounded-lg border border-gray-200 bg-white p-6">
        <legend className="px-2 text-lg font-semibold text-gray-800">Fristen</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Label text="Datum Schreiben" error={fieldErrors["datum_schreiben"]}>
            <input
              type="date"
              value={datumSchreiben}
              onChange={(e) => setDatumSchreiben(e.target.value)}
              className="input"
            />
          </Label>
          <Label text="Fristdatum" error={fieldErrors["datum_frist"]}>
            <input
              type="date"
              value={datumFrist}
              onChange={(e) => setDatumFrist(e.target.value)}
              className={`input ${fristAbgelaufen ? "border-red-400" : ""}`}
            />
            {fristAbgelaufen && (
              <span className="mt-1 block text-xs font-medium text-red-600">
                ⚠ Frist bereits abgelaufen
              </span>
            )}
          </Label>
        </div>
      </fieldset>

      {/* --- Intern (nur Berater/Admin) --- */}
      {isBerater && (
        <fieldset className="rounded-lg border border-amber-200 bg-amber-50/50 p-6">
          <legend className="px-2 text-lg font-semibold text-amber-900">Intern (Berater)</legend>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Label text="Status" error={fieldErrors["status"]}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Label>
            </div>
            <CheckboxRow
              label="Nullplan bereits abgelehnt (Beraterkreuz)"
              checked={nullplanAbgelehnt}
              onChange={setNullplanAbgelehnt}
            />
            <CheckboxRow
              label="Nicht kontaktieren (Glaeubiger gesperrt)"
              checked={nichtKontaktieren}
              onChange={setNichtKontaktieren}
            />
          </div>
        </fieldset>
      )}

      {/* --- Sticky Footer --- */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending || isDeleting}
              className="rounded bg-blue-600 px-6 py-2 font-medium text-white disabled:opacity-50"
            >
              {isPending
                ? "Speichere..."
                : forderungId
                  ? "Aenderung speichern"
                  : "Forderung anlegen"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/cockpit")}
              disabled={isPending || isDeleting}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            {forderungId && (
              <button
                type="button"
                onClick={() => {
                  if (
                    !window.confirm(
                      "Forderung wirklich loeschen? Verknuepfte Dokumente behalten keine Referenz mehr.",
                    )
                  )
                    return;
                  startDelete(async () => {
                    const r = await deleteForderung(forderungId);
                    if (r.ok) {
                      router.push("/cockpit");
                    } else {
                      setMessage(`Fehler: ${r.error}`);
                    }
                  });
                }}
                disabled={isPending || isDeleting}
                className="rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? "Loesche..." : "Loeschen"}
              </button>
            )}
          </div>
          {message && (
            <span
              className={
                message.startsWith("Fehler")
                  ? "text-sm text-red-600"
                  : "text-sm text-green-700"
              }
            >
              {message}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          display: block;
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        :global(.input:focus) {
          outline: 2px solid #2563eb;
          outline-offset: -1px;
        }
      `}</style>
    </form>
  );
}

function Label({
  text,
  wide,
  error,
  children,
}: {
  text: string;
  wide?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{text}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
