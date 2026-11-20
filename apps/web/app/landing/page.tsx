import type { Metadata } from "next";
import { LandingClient } from "./landing-client";

export const metadata: Metadata = {
  title: "SchuldenPRO — Landingpage (Preview)",
  description: "Landingpage-Preview. In der Lock-Phase nur fuer eingeloggte Benutzer erreichbar.",
};

export default function LandingPage() {
  return <LandingClient />;
}
