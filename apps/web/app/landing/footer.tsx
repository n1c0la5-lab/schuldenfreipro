import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-wide">
            Ganzheitliche Beratung <br /> mit{" "}
            <span className="bg-gradient-to-r from-[#8CC63F] to-[#003265] bg-clip-text text-transparent">
              Schulden.PRO
            </span>
          </h2>
          <p className="text-emerald-400 text-lg md:text-xl font-medium tracking-wide">
            Lösungen denken, Schulden überwinden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
          <div>
            <h3 className="font-bold text-base mb-4 text-white">
              Was uns verbindet
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Wir glauben, dass jeder Mensch eine zweite Chance verdient.
              Überschuldung ist kein Versagen – es ist eine Lebenssituation, aus
              der man mit der richtigen Unterstützung wieder herauskommt. Genau
              diese Unterstützung bauen wir.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4 text-white">
              schulden.pro
            </h3>
            <ul className="space-y-2 text-gray-400">
              {[
                { label: "About", href: "#" },
                { label: "Beratung", href: "#" },
                { label: "Selbstständig", href: "#" },
                { label: "Gut zu wissen", href: "#" },
                { label: "Impressum", href: "/impressum" },
                { label: "Datenschutz", href: "/datenschutz" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <img
              src="/landing/footer-logo.png"
              alt="Schulden.PRO Logo"
              className="h-12 mb-6"
            />
            <div className="text-gray-400 space-y-1">
              <p>[Betreiber]</p>
              <p>[Anschrift]</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-gray-500 space-y-2">
          <p>
            Rechtlicher Hinweis: Schulden.PRO erbringt selbst keine
            Rechtsberatung. Alle rechtliche Beratung erfolgt ausschließlich
            durch zugelassene, unabhängige Rechtsanwälte.
          </p>
          <p>Copyright &copy; 2026 Schulden.PRO. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
