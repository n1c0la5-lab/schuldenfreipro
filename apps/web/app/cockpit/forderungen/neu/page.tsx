import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/schuldner-server";
import { ForderungForm } from "../form";
import { loadFormOptions } from "../_loaders";

type Props = {
  searchParams: Promise<{ fall_id?: string }>;
};

export default async function NeueForderungPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cockpit/forderungen/neu");

  const { fall_id } = await searchParams;
  const options = await loadFormOptions(supabase);

  const { data: profile } = await supabase
    .from("user_profile")
    .select("rolle")
    .eq("id", user.id)
    .single();
  const isBerater = profile?.rolle === "berater" || profile?.rolle === "admin";

  return (
    <main className="min-h-screen bg-gray-50 p-8 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/cockpit" className="text-sm text-blue-600 hover:underline">
            &larr; Zurueck zum Cockpit
          </Link>
        </div>
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Neue Forderung</h1>

        <ForderungForm
          faelle={options.faelle}
          glaeubigerListe={options.glaeubigerListe}
          vertreterListe={options.vertreterListe}
          defaultFallId={fall_id}
          isBerater={isBerater}
        />
      </div>
    </main>
  );
}
