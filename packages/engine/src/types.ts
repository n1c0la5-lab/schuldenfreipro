export interface PfandungsConfig {
  gueltigAb: string;
  grundfreibetrag: number;
  zuschlagErste: number;
  zuschlagWeitere: number;
  quoten: number[];
  obergrenze: number;
  zinssatz: number;
}

export interface UserInput {
  gesamtschulden: number;
  nettoeinkommen: number;
  unterhaltspflichten: number;
  lebenshaltungskosten: number;
  monatlicheZahlung: number;
}

export interface Weg1Result {
  gesamtkosten: number;
  laufzeitMonate: number;
  monatlicheZahlung: number;
  belastungsquote: number;
  variante?: {
    rate: number;
    laufzeitMonate: number;
    gesamtkosten: number;
    label: string;
  };
}

export interface Weg2QuoteResult {
  gesamtkosten: number;
  laufzeitMonate: number;
  monatlicheZahlung: number;
  belastungsquote: number;
}

export interface Weg2Result {
  quote40: Weg2QuoteResult;
  quote50: Weg2QuoteResult;
  quote60: Weg2QuoteResult;
}

export interface Weg3Result {
  gesamtkosten: number;
  laufzeitMonate: number;
  monatlicheZahlung: number;
  belastungsquote: number;
}

export type VerschuldungsgradLabel = "gering" | "mittel" | "hoch" | "sehr hoch";
export type PfandungsScoreLabel = "kritisch" | "schwach" | "mittel" | "stark";
export type EmpfehlungWeg = "weg1" | "weg2" | "weg3";

export interface Scoring {
  verschuldungsgrad: VerschuldungsgradLabel;
  verschuldungsRatio: number;
  pfandungsScore: number;
  pfandungsScoreLabel: PfandungsScoreLabel;
}

export interface Recommendation {
  empfohlenerWeg: EmpfehlungWeg;
  regelNummer: number;
  begruendung: string;
  unterhaltHinweis: boolean;
}

export interface CalculationResults {
  pfandbarerBetrag: number;
  freiVerfuegbar: number;
  mehrleistungMoeglich: number;
  tilgungsrate: number;
  tilgungsrateQuelle: "Fz" | "Fb" | "P" | "keine";
  weg1: Weg1Result;
  weg2: Weg2Result;
  weg3: Weg3Result;
  ersparnis: {
    weg3vsWeg1: number;
    weg3vsWeg2a: number;
    weg3vsWeg2b: number;
    weg3vsWeg2c: number;
    weg2avsWeg1: number;
  };
  scoring: Scoring;
  recommendation: Recommendation;
}
