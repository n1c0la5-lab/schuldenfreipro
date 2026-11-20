import type {
  PfandungsConfig,
  UserInput,
  CalculationResults,
  Weg1Result,
  Weg2QuoteResult,
  Weg2Result,
  Weg3Result,
  Scoring,
  Recommendation,
  VerschuldungsgradLabel,
  PfandungsScoreLabel,
  EmpfehlungWeg,
} from "./types";
import { defaultConfig } from "./config";

const MAX_MONATE = 120;

// ---------------------------------------------------------------------------
// Pfaendbarer Betrag — Gesetzliche Formel (§ 850c ZPO)
// ---------------------------------------------------------------------------

export function berechnePfandbarerBetrag(
  E: number,
  U: number,
  config: PfandungsConfig = defaultConfig
): number {
  const EStar = Math.floor(E / 10) * 10;
  const uClamped = Math.min(Math.max(U, 0), 5);
  const freibetrag =
    config.grundfreibetrag +
    Math.min(uClamped, 1) * config.zuschlagErste +
    Math.max(0, uClamped - 1) * config.zuschlagWeitere;
  const quote = config.quoten[uClamped] ?? 0;
  const basis = Math.max(0, Math.min(EStar, config.obergrenze) - freibetrag);
  const ueberObergrenze = Math.max(0, E - config.obergrenze);
  return basis * quote + ueberObergrenze;
}

// ---------------------------------------------------------------------------
// Tilgungsrate — Prioritaetskette
// ---------------------------------------------------------------------------

export function berechneTilgungsrate(
  Fz: number,
  Fb: number,
  P: number
): { rate: number; quelle: "Fz" | "Fb" | "P" | "keine" } {
  if (Fz > 0) return { rate: Fz, quelle: "Fz" };
  if (Fb > 0) return { rate: Fb, quelle: "Fb" };
  if (P > 0) return { rate: P, quelle: "P" };
  return { rate: 0, quelle: "keine" };
}

// ---------------------------------------------------------------------------
// Weg 1 — Abzahlung mit Zinsiteration
// ---------------------------------------------------------------------------

export function berechneWeg1(
  S: number,
  R: number,
  zinssatz: number
): { laufzeit: number; gesamtkosten: number } {
  if (R <= 0 || S <= 0) return { laufzeit: 0, gesamtkosten: 0 };

  const monatszins = zinssatz / 12;
  let restschuld = S;
  let gesamtGezahlt = 0;
  let monate = 0;

  if (R <= restschuld * monatszins) {
    return { laufzeit: Infinity, gesamtkosten: Infinity };
  }

  while (restschuld > 0 && monate < MAX_MONATE * 2) {
    const zinsen = restschuld * monatszins;
    const zahlung = Math.min(R, restschuld + zinsen);
    const tilgung = zahlung - zinsen;
    restschuld = Math.max(0, restschuld - tilgung);
    gesamtGezahlt += zahlung;
    monate++;
    if (restschuld <= 0.01) break;
  }

  return { laufzeit: monate, gesamtkosten: gesamtGezahlt };
}

// ---------------------------------------------------------------------------
// Weg 2 — Vergleich (zinsfrei)
// ---------------------------------------------------------------------------

export function berechneWeg2Quote(
  S: number,
  R: number,
  E: number,
  quote: number
): Weg2QuoteResult {
  const vergleichsbetrag = S * quote;
  const laufzeit = R > 0 ? Math.ceil(vergleichsbetrag / R) : 0;

  return {
    gesamtkosten: vergleichsbetrag,
    laufzeitMonate: laufzeit,
    monatlicheZahlung: R,
    belastungsquote: E > 0 ? (R / E) * 100 : 0,
  };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export function berechneScoring(S: number, E: number, P: number): Scoring {
  const ratio = E > 0 ? S / E : Infinity;
  let verschuldungsgrad: VerschuldungsgradLabel;
  if (ratio <= 12) verschuldungsgrad = "gering";
  else if (ratio <= 36) verschuldungsgrad = "mittel";
  else if (ratio <= 72) verschuldungsgrad = "hoch";
  else verschuldungsgrad = "sehr hoch";

  const score = S > 0 ? (P / S) * 100 : 0;
  let scoreLabel: PfandungsScoreLabel;
  if (score < 1) scoreLabel = "kritisch";
  else if (score <= 3) scoreLabel = "schwach";
  else if (score <= 5) scoreLabel = "mittel";
  else scoreLabel = "stark";

  return {
    verschuldungsgrad,
    verschuldungsRatio: ratio,
    pfandungsScore: score,
    pfandungsScoreLabel: scoreLabel,
  };
}

// ---------------------------------------------------------------------------
// Entscheidungsbaum — 17 Regeln
// ---------------------------------------------------------------------------

export function berechneEmpfehlung(
  S: number,
  E: number,
  Fz: number,
  Fb: number,
  P: number,
  R: number,
  U: number,
  weg1Laufzeit: number,
  weg2_50_Laufzeit: number,
  zinssatz: number
): Recommendation {
  const monatszins = zinssatz / 12;
  const ersteZinsen = S * monatszins;
  const maxLaufzeitVergleich = P === R && Fz === 0 && Fb <= 0 ? 36 : 48;

  const weg1MitP =
    P > 0
      ? berechneWeg1(S, P, zinssatz)
      : { laufzeit: Infinity, gesamtkosten: Infinity };
  const tP = weg1MitP.laufzeit;

  const tVergleichP = P > 0 ? Math.ceil((S * 0.5) / P) : Infinity;
  const tVergleichFz = Fz > 0 ? Math.ceil((S * 0.5) / Fz) : Infinity;

  const unterhaltHinweis = U > 0;

  function result(
    weg: EmpfehlungWeg,
    regel: number,
    text: string
  ): Recommendation {
    return {
      empfohlenerWeg: weg,
      regelNummer: regel,
      begruendung: text,
      unterhaltHinweis,
    };
  }

  if (S <= 2500) {
    return result("weg1", 1, "Bei Schulden unter 2.500 \u20AC ist eine vollst\u00E4ndige Abzahlung der sinnvollste Weg.");
  }

  if (R > 0 && R <= ersteZinsen) {
    return result("weg3", 2, "Ihre monatliche Rate deckt nicht einmal die anfallenden Zinsen. Eine Tilgung ist mathematisch unm\u00F6glich.");
  }

  if (Fb < 0 && Fz === 0 && P === 0) {
    return result("weg3", 3, "Ihre Ausgaben \u00FCbersteigen Ihr Einkommen und es steht keine Tilgungsrate zur Verf\u00FCgung.");
  }

  if (Fz === 0 && Fb <= 0 && P === 0 && S > 5000) {
    return result("weg3", 4, "Kein Einkommen \u00FCber dem Freibetrag und Schulden \u00FCber 5.000 \u20AC \u2014 die Privatinsolvenz bietet den sichersten Weg zur Entschuldung.");
  }

  if (weg1Laufzeit <= 18 && weg1Laufzeit > 0 && S <= 8000) {
    if (!(P === 0 && S > 4000)) {
      return result("weg1", 5, "Ihre Schulden k\u00F6nnen in weniger als 18 Monaten vollst\u00E4ndig abgezahlt werden.");
    }
  }

  if (P > 0 && Fz === 0 && Fb <= 0 && P * 36 < S * 0.5) {
    return result("weg3", 6, "Die Gesamtzahlung bei Privatinsolvenz (36 Monate) ist geringer als ein Vergleich mit 50% Quote.");
  }

  if (Fb < 0 && Fz > 0 && P === 0 && S > 10000 && tVergleichFz > 36) {
    return result("weg3", 7, "Trotz freiwilliger Zahlung w\u00FCrde ein Vergleich \u00FCber 36 Monate dauern \u2014 bei Schulden \u00FCber 10.000 \u20AC ist die Insolvenz der bessere Weg.");
  }

  if (S > 20000 && Fz > P && weg2_50_Laufzeit <= 36 && weg2_50_Laufzeit > 0) {
    return result("weg2", 8, "Ihre freiwillige Zahlung erm\u00F6glicht einen Vergleich innerhalb von 36 Monaten \u2014 auch bei hohen Schulden.");
  }

  if (S > 20000 && Fz > P && weg2_50_Laufzeit > 36) {
    return result("weg3", 9, "Selbst mit Ihrer freiwilligen Zahlung dauert ein Vergleich bei dieser Schuldenh\u00F6he zu lange.");
  }

  if (tP > 96 && Fz === 0) {
    return result("weg3", 10, "Ohne freiwillige Zahlung w\u00FCrde die Abzahlung \u00FCber 8 Jahre dauern.");
  }

  if (weg1Laufzeit > MAX_MONATE) {
    return result("weg3", 11, "Die vollst\u00E4ndige Abzahlung w\u00FCrde \u00FCber 10 Jahre dauern \u2014 die Privatinsolvenz ist mit 36 Monaten deutlich k\u00FCrzer.");
  }

  if (tP > 60 && tVergleichP > 60) {
    return result("weg3", 12, "Weder die vollst\u00E4ndige Abzahlung noch ein Vergleich sind innerhalb von 5 Jahren machbar.");
  }

  if (
    P * 36 >= S * 0.5 &&
    weg2_50_Laufzeit <= maxLaufzeitVergleich &&
    weg2_50_Laufzeit > 0
  ) {
    return result("weg2", 13, "Ein Vergleich mit Ihren Gl\u00E4ubigern ist g\u00FCnstiger als die Insolvenz und innerhalb der maximalen Laufzeit machbar.");
  }

  if (R === 0 && S <= 5000) {
    return result("weg2", 14, "Bei geringen Schulden und ohne laufende Rate ist ein Vergleich (Einmalzahlung oder Stundung) der pragmatischste Weg.");
  }

  if (Fb < 0 && Fz > 0 && P === 0 && S <= 10000 && tVergleichFz <= 36) {
    return result("weg2", 15, "Ihre freiwillige Zahlung reicht f\u00FCr einen Vergleich innerhalb von 36 Monaten.");
  }

  if (weg1Laufzeit > 0 && weg1Laufzeit <= MAX_MONATE) {
    return result("weg1", 16, "Eine vollst\u00E4ndige Abzahlung ist innerhalb von 10 Jahren m\u00F6glich.");
  }

  return result("weg3", 17, "Im Gesamtbild ist die Privatinsolvenz der sicherste Weg zur Schuldenfreiheit.");
}

// ---------------------------------------------------------------------------
// Hauptfunktion: Alles berechnen
// ---------------------------------------------------------------------------

export function berechneAlles(
  input: UserInput,
  config: PfandungsConfig = defaultConfig
): CalculationResults {
  const S = input.gesamtschulden;
  const E = input.nettoeinkommen;
  const U = input.unterhaltspflichten;
  const L = input.lebenshaltungskosten;
  const Fz = input.monatlicheZahlung;

  const P = berechnePfandbarerBetrag(E, U, config);
  const Fb = E - L;
  const FbPositiv = Math.max(0, Fb);
  const mehrleistung = Math.max(0, FbPositiv - Fz);

  const { rate: R, quelle } = berechneTilgungsrate(Fz, Fb, P);

  // Weg 1
  const weg1Calc = berechneWeg1(S, R, config.zinssatz);
  const weg1: Weg1Result = {
    gesamtkosten: weg1Calc.gesamtkosten,
    laufzeitMonate: weg1Calc.laufzeit === Infinity ? 0 : weg1Calc.laufzeit,
    monatlicheZahlung: R,
    belastungsquote: E > 0 ? (R / E) * 100 : 0,
  };

  if (Fz > 0 && Fb > 0) {
    const varCalc = berechneWeg1(S, FbPositiv, config.zinssatz);
    if (varCalc.laufzeit !== Infinity) {
      weg1.variante = {
        rate: FbPositiv,
        laufzeitMonate: varCalc.laufzeit,
        gesamtkosten: varCalc.gesamtkosten,
        label: "Variante mit frei verf\u00FCgbarem Einkommen",
      };
    }
  }

  // Weg 2
  const weg2: Weg2Result = {
    quote40: berechneWeg2Quote(S, R, E, 0.4),
    quote50: berechneWeg2Quote(S, R, E, 0.5),
    quote60: berechneWeg2Quote(S, R, E, 0.6),
  };

  // Weg 3
  const weg3: Weg3Result = {
    gesamtkosten: P * 36,
    laufzeitMonate: 36,
    monatlicheZahlung: P,
    belastungsquote: E > 0 ? (P / E) * 100 : 0,
  };

  // Ersparnis
  const ersparnis = {
    weg3vsWeg1:
      weg1.gesamtkosten > 0
        ? weg1.gesamtkosten - weg3.gesamtkosten
        : S - weg3.gesamtkosten,
    weg3vsWeg2a: weg2.quote40.gesamtkosten - weg3.gesamtkosten,
    weg3vsWeg2b: weg2.quote50.gesamtkosten - weg3.gesamtkosten,
    weg3vsWeg2c: weg2.quote60.gesamtkosten - weg3.gesamtkosten,
    weg2avsWeg1:
      weg1.gesamtkosten > 0
        ? weg1.gesamtkosten - weg2.quote40.gesamtkosten
        : S - weg2.quote40.gesamtkosten,
  };

  // Scoring
  const scoring = berechneScoring(S, E, P);

  // Empfehlung
  const recommendation = berechneEmpfehlung(
    S, E, Fz, Fb, P, R, U,
    weg1.laufzeitMonate,
    weg2.quote50.laufzeitMonate,
    config.zinssatz
  );

  return {
    pfandbarerBetrag: P,
    freiVerfuegbar: Fb,
    mehrleistungMoeglich: mehrleistung,
    tilgungsrate: R,
    tilgungsrateQuelle: quelle,
    weg1,
    weg2,
    weg3,
    ersparnis,
    scoring,
    recommendation,
  };
}
