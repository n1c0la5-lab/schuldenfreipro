import type { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingClient } from "./landing/landing-client";

export const metadata: Metadata = {
  title: "SchuldenPRO — Endlich Schuldenfrei, sicher & digital",
  description:
    "Unsere KI prüft Ihre Unterlagen in Minuten – ein echter Rechtsanwalt erstellt Ihren persönlichen, verbindlichen Plan zur Schuldenfreiheit.",
};

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/cockpit");

  return <LandingClient />;
}
