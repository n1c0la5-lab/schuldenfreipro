import { CheckCircle2, XCircle, Zap, Target, Shield } from "lucide-react";

interface ProConItem {
  text: string;
}

interface WegData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  vorteile: ProConItem[];
  nachteile: ProConItem[];
}

const wegData: Record<"weg1" | "weg2" | "weg3", WegData> = {
  weg1: {
    title: "Weg 1",
    subtitle: "Schnelle Tilgung",
    icon: <Zap className="w-5 h-5 text-blue-600" />,
    colorClass: "bg-blue-100",
    bgClass: "bg-gradient-to-br from-blue-50/50 to-white",
    borderClass: "border-blue-200",
    vorteile: [
      { text: "Niedrigste Gesamtkosten" },
      { text: "Kuerzeste Laufzeit" },
      { text: "Schnellste Schuldenfreiheit" },
      { text: "Geringste Zinsbelastung" },
    ],
    nachteile: [
      { text: "Hoechste monatliche Belastung" },
      { text: "Weniger finanzielle Flexibilitaet" },
      { text: "Risiko bei Einkommensausfall" },
    ],
  },
  weg2: {
    title: "Weg 2",
    subtitle: "Ausgewogene Tilgung",
    icon: <Target className="w-5 h-5 text-amber-600" />,
    colorClass: "bg-amber-100",
    bgClass: "bg-gradient-to-br from-amber-50/50 to-white",
    borderClass: "border-amber-200",
    vorteile: [
      { text: "Ausgewogene monatliche Rate" },
      { text: "Guter Kompromiss" },
      { text: "Moderate Laufzeit" },
      { text: "Planbare Finanzen" },
    ],
    nachteile: [
      { text: "Hoehere Zinsen als Weg 1" },
      { text: "Laengere Schuldendauer" },
      { text: "Mittlere Gesamtkosten" },
    ],
  },
  weg3: {
    title: "Weg 3",
    subtitle: "Flexible Tilgung",
    icon: <Shield className="w-5 h-5 text-emerald-600" />,
    colorClass: "bg-emerald-100",
    bgClass: "bg-gradient-to-br from-emerald-50/50 to-white",
    borderClass: "border-emerald-200",
    vorteile: [
      { text: "Niedrigste monatliche Rate" },
      { text: "Maximale Flexibilitaet" },
      { text: "Mehr finanzieller Spielraum" },
      { text: "Sicherheit im Alltag" },
    ],
    nachteile: [
      { text: "Hoechste Gesamtkosten" },
      { text: "Laengste Laufzeit" },
      { text: "Hoechste Zinsbelastung" },
    ],
  },
};

function ProsConsCard({ data }: { data: WegData }) {
  return (
    <div className={`rounded-lg border-2 ${data.borderClass} ${data.bgClass} p-5 h-full`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${data.colorClass} flex items-center justify-center flex-shrink-0`}>
          {data.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{data.title}</h3>
          <p className="text-xs text-gray-500">{data.subtitle}</p>
        </div>
      </div>
      <div className="space-y-5">
        {/* Vorteile */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Vorteile
            </span>
          </div>
          <ul className="space-y-2">
            {data.vorteile.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Nachteile */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500 text-white">
              <XCircle className="w-3 h-3 mr-1" />
              Nachteile
            </span>
          </div>
          <ul className="space-y-2">
            {data.nachteile.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProsConsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ProsConsCard data={wegData.weg1} />
      <ProsConsCard data={wegData.weg2} />
      <ProsConsCard data={wegData.weg3} />
    </div>
  );
}
