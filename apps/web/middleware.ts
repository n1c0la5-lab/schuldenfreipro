import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Complete-Lock: Solange true, ist ALLES ausser /login und Webhooks/Assets
// gegatet. Beim "Vorhang-Luften" auf false stellen — dann greifen wieder
// die regulaeren PUBLIC_ROUTES.
const COMPLETE_LOCK = false;

const PUBLIC_ROUTES = ["/", "/rechner", "/rechner/ergebnis", "/impressum", "/datenschutz"];

function isStaticOrWebhook(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhook") ||
    pathname.includes(".")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Statische Assets + externe Webhooks immer durchlassen
  if (isStaticOrWebhook(pathname)) {
    return NextResponse.next();
  }

  // Login + Legal-Pflichtseiten sind auch waehrend Lock offen
  if (pathname === "/login" || pathname === "/impressum" || pathname === "/datenschutz") {
    return NextResponse.next();
  }

  // Wenn Lock aus: klassische Public-Routes durchlassen
  if (!COMPLETE_LOCK && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Supabase Auth Session pruefen
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Nicht eingeloggt:
  //  - API-Routen → 401
  //  - Seiten → Redirect /login
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
