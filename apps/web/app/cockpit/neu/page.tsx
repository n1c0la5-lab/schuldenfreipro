import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/schuldner-server";
import { SchuldnerForm } from "../schuldner-form";

export default async function NeuerMandantPage() {
  const cookieStore = await cookies();
  const supabase = supabaseServer(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cockpit/neu");

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/cockpit" className="text-sm text-blue-600 hover:underline">
            &larr; Zurueck zur Mandanten-Liste
          </Link>
        </div>
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Neuer Mandant</h1>
        <SchuldnerForm />
      </div>
    </main>
  );
}
