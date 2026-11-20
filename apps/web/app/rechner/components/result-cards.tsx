import type { CalculationResults } from "@schuldenpro/engine";
import { Zap, Target, Shield, Clock, Euro, TrendingDown, Calendar, Check } from "lucide-react";

interface ResultCardsProps {
  results: CalculationResults;
}

interface WegCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  monatlicheRate: number;
  laufzeit: number;
  gesamtkosten: number;
  belastungsquote: number;
  isRecommended?: boolean;
  quoteLabel?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonths(months: number) {
  if (months < 12) return `${months} Monate`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} Jahr${years > 1 ? "e" : ""}`;
  return `${years} Jahr${years > 1 ? "e" : ""} ${remainingMonths} Mon.`;
}

function getBelastungStyle(quote: number): string {
  if (quote > 20) return "bg-rose-100 text-rose-700";
  if (quote > 10) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function WegCard({
  title,
  subtitle,
  icon,
  colorClass,
  bgClass,
  borderClass,
  monatlicheRate,
  laufzeit,
  gesamtkosten,
  belastungsquote,
  isRecommended,
  quoteLabel,
}: WegCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg border-2 ${borderClass} ${bgClass} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      {isRecommended && (
        <div className="absolute top-0 right-0">
          <span className="inline-flex items-center rounded-bl-lg rounded-tr-md bg-emerald-500 text-white text-xs font-medium px-3 py-1">
            <Check className="w-3 h-3 mr-1" />
            Empfohlen
          </span>
        </div>
      )}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
          {quoteLabel && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {quoteLabel}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <Euro className="w-3.5 h-3.5" />
            Monatliche Rate
          </span>
          <span className="text-lg font-bold text-gray-800">{formatCurrency(monatlicheRate)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Laufzeit
          </span>
          <span className="font-semibold text-gray-700">{formatMonths(laufzeit)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Gesamtkosten
          </span>
          <span className="font-semibold text-gray-700">{formatCurrency(gesamtkosten)}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Belastung
          </span>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getBelastungStyle(belastungsquote)}`}>
            {belastungsquote.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function ResultCards({ results }: ResultCardsProps) {
  const { weg1, weg2, weg3, recommendation } = results;
  const empfohlen = recommendation.empfohlenerWeg;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <WegCard
        title="Weg 1"
        subtitle="Vollstaendige Zahlung"
        icon={<Zap className="w-5 h-5 text-blue-600" />}
        colorClass="bg-blue-100"
        bgClass="bg-gradient-to-br from-blue-50/50 to-white"
        borderClass="border-blue-200 hover:border-blue-300"
        monatlicheRate={weg1.monatlicheZahlung}
        laufzeit={weg1.laufzeitMonate}
        gesamtkosten={weg1.gesamtkosten}
        belastungsquote={weg1.belastungsquote}
        isRecommended={empfohlen === "weg1"}
      />

      <WegCard
        title="Weg 2"
        subtitle="Schuldenbereinigungsplan"
        icon={<Target className="w-5 h-5 text-amber-600" />}
        colorClass="bg-amber-100"
        bgClass="bg-gradient-to-br from-amber-50/50 to-white"
        borderClass="border-amber-200 hover:border-amber-300"
        monatlicheRate={weg2.quote50.monatlicheZahlung}
        laufzeit={weg2.quote50.laufzeitMonate}
        gesamtkosten={weg2.quote50.gesamtkosten}
        belastungsquote={weg2.quote50.belastungsquote}
        isRecommended={empfohlen === "weg2"}
        quoteLabel="50% Quote"
      />

      <WegCard
        title="Weg 3"
        subtitle="Privatinsolvenz"
        icon={<Shield className="w-5 h-5 text-emerald-600" />}
        colorClass="bg-emerald-100"
        bgClass="bg-gradient-to-br from-emerald-50/50 to-white"
        borderClass="border-emerald-200 hover:border-emerald-300"
        monatlicheRate={weg3.monatlicheZahlung}
        laufzeit={weg3.laufzeitMonate}
        gesamtkosten={weg3.gesamtkosten}
        belastungsquote={weg3.belastungsquote}
        isRecommended={empfohlen === "weg3"}
      />
    </div>
  );
}
