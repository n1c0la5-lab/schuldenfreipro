import { describe, it, expect } from "vitest";
import {
  berechnePfandbarerBetrag,
  berechneTilgungsrate,
  berechneWeg1,
  berechneAlles,
} from "../rechner";
import { defaultConfig } from "../config";

describe("Pfaendungsformel (§ 850c ZPO)", () => {
  it("Einkommen 2124, 1 Unterhalt -> P = 0 (unter Freibetrag)", () => {
    const P = berechnePfandbarerBetrag(2124, 1);
    expect(P).toBe(0);
  });

  it("Einkommen 3000, 0 Unterhalt -> P ~ 1011.50", () => {
    const P = berechnePfandbarerBetrag(3000, 0);
    expect(P).toBeCloseTo(1011.5, 0);
  });

  it("Einkommen 3000, 1 Unterhalt -> weniger pfaendbar als 0 Unterhalt", () => {
    const P0 = berechnePfandbarerBetrag(3000, 0);
    const P1 = berechnePfandbarerBetrag(3000, 1);
    expect(P1).toBeLessThan(P0);
  });

  it("Einkommen unter Grundfreibetrag -> P = 0", () => {
    const P = berechnePfandbarerBetrag(1500, 0);
    expect(P).toBe(0);
  });

  it("Einkommen ueber Obergrenze -> voller Ueberschuss pfaendbar", () => {
    const P = berechnePfandbarerBetrag(5000, 0);
    const PMax = berechnePfandbarerBetrag(4766.99, 0);
    expect(P).toBeGreaterThan(PMax);
  });

  it("5 Unterhaltspflichten -> minimale Pfaendung", () => {
    const P5 = berechnePfandbarerBetrag(3000, 5);
    const P0 = berechnePfandbarerBetrag(3000, 0);
    expect(P5).toBeLessThan(P0);
  });
});

describe("Tilgungsrate Prioritaetskette", () => {
  it("Fz > 0 -> Fz wird genommen", () => {
    const { rate, quelle } = berechneTilgungsrate(250, 400, 100);
    expect(rate).toBe(250);
    expect(quelle).toBe("Fz");
  });

  it("Fz = 0, Fb > 0 -> Fb wird genommen", () => {
    const { rate, quelle } = berechneTilgungsrate(0, 400, 100);
    expect(rate).toBe(400);
    expect(quelle).toBe("Fb");
  });

  it("Fz = 0, Fb < 0, P > 0 -> P wird genommen", () => {
    const { rate, quelle } = berechneTilgungsrate(0, -200, 100);
    expect(rate).toBe(100);
    expect(quelle).toBe("P");
  });

  it("Alles 0 -> keine Rate", () => {
    const { rate, quelle } = berechneTilgungsrate(0, -200, 0);
    expect(rate).toBe(0);
    expect(quelle).toBe("keine");
  });
});

describe("Weg 1 — Zinsiteration", () => {
  it("10.000 bei 500/Monat -> ~21 Monate (6% Zinsen)", () => {
    const { laufzeit } = berechneWeg1(10000, 500, defaultConfig.zinssatz);
    expect(laufzeit).toBeGreaterThanOrEqual(20);
    expect(laufzeit).toBeLessThanOrEqual(23);
  });

  it("Rate < Zinsen -> Infinity", () => {
    const { laufzeit } = berechneWeg1(100000, 10, defaultConfig.zinssatz);
    expect(laufzeit).toBe(Infinity);
  });

  it("Rate = 0 -> Laufzeit 0", () => {
    const { laufzeit } = berechneWeg1(10000, 0, defaultConfig.zinssatz);
    expect(laufzeit).toBe(0);
  });

  it("Gesamtkosten > Schulden (wegen Zinsen)", () => {
    const { gesamtkosten } = berechneWeg1(10000, 500, defaultConfig.zinssatz);
    expect(gesamtkosten).toBeGreaterThan(10000);
  });
});

describe("Entscheidungsbaum", () => {
  it("Regel 1: Kleinstschulden (2000) -> Weg 1", () => {
    const r = berechneAlles({
      gesamtschulden: 2000,
      nettoeinkommen: 2500,
      unterhaltspflichten: 0,
      lebenshaltungskosten: 1800,
      monatlicheZahlung: 0,
    });
    expect(r.recommendation.empfohlenerWeg).toBe("weg1");
    expect(r.recommendation.regelNummer).toBe(1);
  });

  it("Regel 3: Ausgaben > Einkommen, kein Fz, kein P -> Weg 3", () => {
    const r = berechneAlles({
      gesamtschulden: 15000,
      nettoeinkommen: 1400,
      unterhaltspflichten: 0,
      lebenshaltungskosten: 1500,
      monatlicheZahlung: 0,
    });
    expect(r.recommendation.empfohlenerWeg).toBe("weg3");
  });

  it("Regel 5: Schnelle Abzahlung (5000, hohe Rate) -> Weg 1", () => {
    const r = berechneAlles({
      gesamtschulden: 5000,
      nettoeinkommen: 3000,
      unterhaltspflichten: 0,
      lebenshaltungskosten: 2500,
      monatlicheZahlung: 500,
    });
    expect(r.recommendation.empfohlenerWeg).toBe("weg1");
    expect(r.recommendation.regelNummer).toBe(5);
  });

  it("Hohe Schulden, nur P, P*36 < S*0.5 -> Weg 3", () => {
    const r = berechneAlles({
      gesamtschulden: 80000,
      nettoeinkommen: 2500,
      unterhaltspflichten: 0,
      lebenshaltungskosten: 2500,
      monatlicheZahlung: 0,
    });
    expect(r.recommendation.empfohlenerWeg).toBe("weg3");
  });

  it("Default-Werte -> gueltige Empfehlung", () => {
    const r = berechneAlles({
      gesamtschulden: 28000,
      nettoeinkommen: 2124,
      unterhaltspflichten: 1,
      lebenshaltungskosten: 1750,
      monatlicheZahlung: 250,
    });
    expect(["weg1", "weg2", "weg3"]).toContain(r.recommendation.empfohlenerWeg);
    expect(r.recommendation.regelNummer).toBeGreaterThanOrEqual(1);
    expect(r.recommendation.regelNummer).toBeLessThanOrEqual(17);
  });
});
