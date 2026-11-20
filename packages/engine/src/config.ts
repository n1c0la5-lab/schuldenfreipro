import type { PfandungsConfig } from "./types";

// §850c ZPO Pfaendungsfreigrenzen, gueltig ab 01.07.2025
// (Pfaendungsfreigrenzenbekanntmachung 2025).
// Jaehrliches Update zum 01.07.: Werte hier anpassen, Tests in
// __tests__/rechner.test.ts mit aktualisierten Stichproben fahren.
// Die offizielle Pfaendungstabelle (164 Brackets x 0-5 Unterhaltspflichten)
// ist mit dieser Formel deckungsgleich — kein Lookup-File noetig.
export const defaultConfig: PfandungsConfig = {
  gueltigAb: "2025-07-01",
  grundfreibetrag: 1555.0,
  zuschlagErste: 585.23,
  zuschlagWeitere: 326.04,
  quoten: [0.7, 0.5, 0.4, 0.3, 0.2, 0.1],
  obergrenze: 4766.99,
  zinssatz: 0.06,
};
