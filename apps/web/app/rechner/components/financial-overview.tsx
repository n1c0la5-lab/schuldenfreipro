import { TrendingUp, Wallet, PiggyBank, Scale, ArrowRight } from "lucide-react";

interface FinancialOverviewProps {
  pfandbarerBetrag: number;
  freiVerfuegbar: number;
  mehrleistungMoeglich: number;
  tilgungsrate: number;
  tilgungsrateQuelle: "Fz" | "Fb" | "P" | "keine";
}

const quelleLabels: Record<string, string> = {
  Fz: "Freiwillige Zahlung",
  Fb: "Frei verfuegbar",
  P: "Pfaendbarer Betrag",
  keine: "Keine Rate",
};

export function FinancialOverview({
  pfandbarerBetrag,
  freiVerfuegbar,
  mehrleistungMoeglich,
  tilgungsrate,
  tilgungsrateQuelle,
}: FinancialOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-4">
        <Scale className="w-4 h-4 text-gray-500" />
        Ihre finanzielle Situation
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-600">Verfuegbar</span>
          </div>
          <span className={`text-lg font-semibold ${freiVerfuegbar >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(freiVerfuegbar)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm text-gray-600">Pfaendbarer Betrag</span>
          </div>
          <span className="text-lg font-semibold text-amber-600">
            {formatCurrency(pfandbarerBetrag)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Mehrleistung moeglich</span>
          </div>
          <span className="text-lg font-semibold text-blue-600">
            {formatCurrency(mehrleistungMoeglich)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-sm text-gray-600">Tilgungsrate</span>
              <span className="inline-block ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {quelleLabels[tilgungsrateQuelle]}
              </span>
            </div>
          </div>
          <span className="text-lg font-semibold text-purple-600">
            {formatCurrency(tilgungsrate)}
          </span>
        </div>
      </div>
    </div>
  );
}
