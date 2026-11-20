"use client";

import { useState, useCallback, useMemo } from "react";
import { berechneAlles } from "@schuldenpro/engine";
import type { UserInput, CalculationResults } from "@schuldenpro/engine";

const defaultInput: UserInput = {
  gesamtschulden: 28000,
  nettoeinkommen: 2124,
  unterhaltspflichten: 1,
  lebenshaltungskosten: 1750,
  monatlicheZahlung: 250,
};

export function useSchuldenrechner() {
  const [input, setInput] = useState<UserInput>(defaultInput);

  const updateInput = useCallback((field: keyof UserInput, value: number) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  }, []);

  const results: CalculationResults = useMemo(() => berechneAlles(input), [input]);

  return { input, updateInput, results };
}
