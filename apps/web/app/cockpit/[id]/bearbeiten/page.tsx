import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/schuldner-server";
import { SchuldnerForm } from "../../schuldner-form";

export default async function SchuldnerBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cockpit/${id}/bearbeiten`);

  const { data: schuldner, error } = await supabase
    .from("schuldner")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !schuldner) notFound();

  const name = `${schuldner.nachname}${schuldner.vorname ? ", " + schuldner.vorname : ""}`;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href={`/cockpit/${id}`} className="text-sm text-blue-600 hover:underline">
            &larr; Zurueck zum Mandanten
          </Link>
        </div>
        <h1 className="mb-1 text-3xl font-bold text-gray-900">Mandant bearbeiten</h1>
        <p className="mb-8 text-sm text-gray-500 font-mono">
          {name} &middot; {schuldner.aktenzeichen}
        </p>
        <SchuldnerForm id={id} initial={schuldner} />
      </div>
    </main>
  );
}
