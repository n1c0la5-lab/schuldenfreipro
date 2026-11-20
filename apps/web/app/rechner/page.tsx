import type { Metadata } from "next";
import { SchuldenrechnerClient } from "./schuldenrechner-client";

export const metadata: Metadata = {
  title: "Schuldenrechner | SchuldenPRO",
  description:
    "Kostenloser Schuldenrechner: Berechnen Sie Ihren optimalen Weg in die Schuldenfreiheit. Vergleichen Sie Abzahlung, Vergleich und Privatinsolvenz.",
};

export default function RechnerPage() {
  return <SchuldenrechnerClient />;
}
