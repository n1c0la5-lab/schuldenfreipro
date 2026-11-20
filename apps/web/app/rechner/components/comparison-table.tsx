import type { CalculationResults, EmpfehlungWeg } from "@schuldenpro/engine";
import { ArrowRightLeft, TrendingDown, Calendar, Euro, Percent } from "lucide-react";

interface ComparisonTableProps {
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
  if (months < 12) return `${months} Mon.`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} J.`;
  return `${years} J. ${remainingMonths} M.`;
}

function isColumnRecommended(colKey: string, empfohlen: EmpfehlungWeg): boolean {
  if (empfohlen === "weg1" && colKey === "weg1") return true;
  if (empfohlen === "weg2" && (colKey === "weg2a" || colKey === "weg2b" || colKey === "weg2c")) return true;
  if (empfohlen === "weg3" && colKey === "weg3") return true;
  return false;
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  const { weg1, weg2, weg3, recommendation } = results;
  const empfohlen = recommendation.empfohlenerWeg;

  const columns = [
    { key: "weg1", label: "Weg 1", sub: "(Abzahlung)", color: "text-blue-600" },
    { key: "weg2a", label: "Weg 2a", sub: "(40%)", color: "text-amber-600" },
    { key: "weg2b", label: "Weg 2b", sub: "(50%)", color: "text-amber-600" },
    { key: "weg2c", label: "Weg 2c", sub: "(60%)", color: "text-amber-600" },
    { key: "weg3", label: "Weg 3", sub: "(Insolvenz)", color: "text-emerald-600" },
  ];

  const data = [
    {
      label: "Monatliche Rate",
      icon: <Euro className="w-4 h-4" />,
      values: {
        weg1: formatCurrency(weg1.monatlicheZahlung),
        weg2a: formatCurrency(weg2.quote40.monatlicheZahlung),
        weg2b: formatCurrency(weg2.quote50.monatlicheZahlung),
        weg2c: formatCurrency(weg2.quote60.monatlicheZahlung),
        weg3: formatCurrency(weg3.monatlicheZahlung),
      },
    },
    {
      label: "Laufzeit",
      icon: <Calendar className="w-4 h-4" />,
      values: {
        weg1: formatMonths(weg1.laufzeitMonate),
        weg2a: formatMonths(weg2.quote40.laufzeitMonate),
        weg2b: formatMonths(weg2.quote50.laufzeitMonate),
        weg2c: formatMonths(weg2.quote60.laufzeitMonate),
        weg3: formatMonths(weg3.laufzeitMonate),
      },
    },
    {
      label: "Gesamtkosten",
      icon: <TrendingDown className="w-4 h-4" />,
      highlight: true,
      values: {
        weg1: formatCurrency(weg1.gesamtkosten),
        weg2a: formatCurrency(weg2.quote40.gesamtkosten),
        weg2b: formatCurrency(weg2.quote50.gesamtkosten),
        weg2c: formatCurrency(weg2.quote60.gesamtkosten),
        weg3: formatCurrency(weg3.gesamtkosten),
      },
    },
    {
      label: "Belastungsquote",
      icon: <Percent className="w-4 h-4" />,
      values: {
        weg1: `${weg1.belastungsquote.toFixed(1)}%`,
        weg2a: `${weg2.quote40.belastungsquote.toFixed(1)}%`,
        weg2b: `${weg2.quote50.belastungsquote.toFixed(1)}%`,
        weg2c: `${weg2.quote60.belastungsquote.toFixed(1)}%`,
        weg3: `${weg3.belastungsquote.toFixed(1)}%`,
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-4">
        <ArrowRightLeft className="w-5 h-5 text-gray-600" />
        Direkter Vergleich
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Kriterium</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-center px-4 py-3 font-semibold ${col.color} ${isColumnRecommended(col.key, empfohlen) ? "bg-emerald-50" : ""}`}
                >
                  {col.label}
                  <span className="block text-xs font-normal text-gray-500">{col.sub}</span>
                  {isColumnRecommended(col.key, empfohlen) && col.key === (empfohlen === "weg2" ? "weg2b" : empfohlen) && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                      Empfohlen
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={`border-t border-gray-100 ${row.highlight ? "bg-gray-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <span className="text-gray-400">{row.icon}</span>
                    {row.label}
                  </span>
                </td>
                {columns.map((col) => {
                  const val = row.values[col.key as keyof typeof row.values];
                  const recommended = isColumnRecommended(col.key, empfohlen);
                  return (
                    <td
                      key={col.key}
                      className={`text-center px-4 py-3 font-medium text-gray-700 ${recommended ? "bg-emerald-50" : ""}`}
                    >
                      {row.highlight && recommended ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                          {val}
                        </span>
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
