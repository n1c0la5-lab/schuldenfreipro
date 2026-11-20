import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SchuldnerList } from "./schuldner-list";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export default async function CockpitPage() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/cockpit");

  const { data: profile } = await supabase
    .from("user_profile")
    .select("rolle, anzeigename")
    .eq("id", user.id)
    .single();

  const hatBeraterRolle = profile?.rolle === "berater" || profile?.rolle === "admin";

  return (
    <main className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/landing" title="Zur Landingpage">
            <Image
              src="/schulden_pro.png"
              alt="SchuldenPRO Logo"
              width={48}
              height={48}
              className="rounded-md hover:opacity-80"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Cockpit</h1>
            <p className="text-gray-600">
              {profile?.anzeigename} ({profile?.rolle})
            </p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Abmelden
          </button>
        </form>
      </header>

      {hatBeraterRolle ? (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Alle Mandanten</h2>
            <Link
              href="/cockpit/neu"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Neuer Mandant
            </Link>
          </div>
          <SchuldnerList />
        </section>
      ) : (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Meine Daten</h2>
          <p className="text-gray-600">
            Mandanten-Portal — wird in Phase 3 mit Selbsterfassung und Forderungsuebersicht befuellt.
          </p>
        </section>
      )}
    </main>
  );
}
