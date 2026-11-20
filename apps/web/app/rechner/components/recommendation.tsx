import { Sparkles, AlertTriangle, BarChart3, TrendingDown, Clock, PiggyBank, MessageCircle } from "lucide-react";
import type { CalculationResults, EmpfehlungWeg } from "@schuldenpro/engine";

interface RecommendationProps {
  results: CalculationResults;
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

const wegLabels: Record<EmpfehlungWeg, string> = {
  weg1: "Weg 1 -- Vollstaendige Zahlung",
  weg2: "Weg 2 -- Schuldenbereinigungsplan",
  weg3: "Weg 3 -- Privatinsolvenz",
};

function getVerschuldungsgradColor(label: string): string {
  switch (label) {
    case "gering": return "bg-emerald-100 text-emerald-700";
    case "mittel": return "bg-amber-100 text-amber-700";
    case "hoch": return "bg-orange-100 text-orange-700";
    case "sehr hoch": return "bg-rose-100 text-rose-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function getPfandungsScoreColor(label: string): string {
  switch (label) {
    case "stark": return "bg-emerald-100 text-emerald-700";
    case "mittel": return "bg-amber-100 text-amber-700";
    case "schwach": return "bg-orange-100 text-orange-700";
    case "kritisch": return "bg-rose-100 text-rose-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function Recommendation({ results }: RecommendationProps) {
  const { recommendation, scoring, weg1, weg2, weg3, ersparnis } = results;

  const empfohlenData = recommendation.empfohlenerWeg === "weg1"
    ? { kosten: weg1.gesamtkosten, laufzeit: weg1.laufzeitMonate, rate: weg1.monatlicheZahlung }
    : recommendation.empfohlenerWeg === "weg2"
      ? { kosten: weg2.quote50.gesamtkosten, laufzeit: weg2.quote50.laufzeitMonate, rate: weg2.quote50.monatlicheZahlung }
      : { kosten: weg3.gesamtkosten, laufzeit: weg3.laufzeitMonate, rate: weg3.monatlicheZahlung };

  const bestSaving = recommendation.empfohlenerWeg === "weg3"
    ? ersparnis.weg3vsWeg1
    : recommendation.empfohlenerWeg === "weg2"
      ? ersparnis.weg2avsWeg1
      : 0;

  return (
    <div className="space-y-4">
      {/* Hauptempfehlung */}
      <div className="bg-white rounded-lg border border-emerald-200 p-6 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500 text-white">
                Empfehlung (Regel {recommendation.regelNummer})
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {wegLabels[recommendation.empfohlenerWeg]}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {recommendation.begruendung}
            </p>
            {bestSaving > 0 && (
              <p className="text-sm text-gray-600">
                Ersparnis gegenueber Weg 1: <span className="font-semibold text-emerald-600">{formatCurrency(bestSaving)}</span>
              </p>
            )}
            {recommendation.unterhaltHinweis && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Unterhaltspflichten erhoehen Ihren Pfaendungsfreibetrag. Schulden aus Unterhalt koennen jedoch nicht durch Insolvenz erlassen werden (302 InsO).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scoring */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          Finanzielle Bewertung
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Verschuldungsgrad</p>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getVerschuldungsgradColor(scoring.verschuldungsgrad)}`}>
                {scoring.verschuldungsgrad}
              </span>
              <span className="text-sm text-gray-600">({scoring.verschuldungsRatio.toFixed(1)}x Netto)</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pfaendungs-Score</p>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPfandungsScoreColor(scoring.pfandungsScoreLabel)}`}>
                {scoring.pfandungsScoreLabel}
              </span>
              <span className="text-sm text-gray-600">({scoring.pfandungsScore.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats for recommended path */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Gesamtkosten</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(empfohlenData.kosten)}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Laufzeit</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{formatMonths(empfohlenData.laufzeit)}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Monatliche Rate</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(empfohlenData.rate)}/Mon.</p>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="bg-white rounded-lg border border-green-200 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7 text-white" aria-label="WhatsApp" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">
                Direkt zum Erstgespraech
              </h3>
              <p className="text-gray-600 text-sm">
                Ob Erstgespraech oder Sofortberatung wir freuen uns ueber Ihre Initiative -- wir antworten schnellstmoeglich.
              </p>
              <p className="text-green-600 font-medium text-sm hidden sm:block">
                Jetzt WhatsApp Chat oeffnen &rarr;
              </p>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
