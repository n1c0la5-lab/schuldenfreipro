"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRightLeft, Scale } from "lucide-react";
import { useSchuldenrechner } from "./use-schuldenrechner";
import { InputForm } from "./components/input-form";
import { FinancialOverview } from "./components/financial-overview";
import { ResultCards } from "./components/result-cards";
import { ComparisonTable } from "./components/comparison-table";
import { ProsConsSection } from "./components/pros-cons";
import { Recommendation } from "./components/recommendation";

type TabValue = "rechner" | "vergleich" | "vorteile";

const tabs: { value: TabValue; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { value: "rechner", label: "Rechner", shortLabel: "Rechner", icon: <Calculator className="w-4 h-4" /> },
  { value: "vergleich", label: "Vergleich", shortLabel: "Vergleich", icon: <ArrowRightLeft className="w-4 h-4" /> },
  { value: "vorteile", label: "Vor-/Nachteile", shortLabel: "Pro/Contra", icon: <Scale className="w-4 h-4" /> },
];

export function SchuldenrechnerClient() {
  const { input, updateInput, results } = useSchuldenrechner();
  const [activeTab, setActiveTab] = useState<TabValue>("rechner");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-12">
              <img
                src="/schulden_pro.png"
                alt="Schulden.pro Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Der schulden.PRO Schuldenrechner</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Finden Sie den optimalen Weg in die Schuldenfreiheit</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                Kostenlos &amp; unverbindlich
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-1.5">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content: Rechner */}
        {activeTab === "rechner" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Input */}
            <div className="lg:col-span-4 space-y-4">
              <InputForm input={input} onUpdate={updateInput} />
              <FinancialOverview
                pfandbarerBetrag={results.pfandbarerBetrag}
                freiVerfuegbar={results.freiVerfuegbar}
                mehrleistungMoeglich={results.mehrleistungMoeglich}
                tilgungsrate={results.tilgungsrate}
                tilgungsrateQuelle={results.tilgungsrateQuelle}
              />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-8 space-y-6">
              <ResultCards results={results} />
              <Recommendation results={results} />
            </div>
          </div>
        )}

        {/* Tab Content: Vergleich */}
        {activeTab === "vergleich" && (
          <div className="space-y-6">
            <ComparisonTable results={results} />

            {/* Ersparnis-Uebersicht */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Weg 3 vs. Weg 1", value: results.ersparnis.weg3vsWeg1, colorClass: "text-emerald-600" },
                { label: "Weg 3 vs. Weg 2a (40%)", value: results.ersparnis.weg3vsWeg2a, colorClass: "text-blue-600" },
                { label: "Weg 3 vs. Weg 2b (50%)", value: results.ersparnis.weg3vsWeg2b, colorClass: "text-amber-600" },
                { label: "Weg 3 vs. Weg 2c (60%)", value: results.ersparnis.weg3vsWeg2c, colorClass: "text-purple-600" },
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.colorClass}`}>
                    {new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(item.value)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Ersparnis</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Vor-/Nachteile */}
        {activeTab === "vorteile" && (
          <ProsConsSection />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">Dieser Rechner dient zur Orientierung. Fuer verbindliche Informationen konsultieren Sie einen Fachanwalt.</p>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/impressum" className="text-gray-400 hover:text-gray-600 transition-colors">Impressum</Link>
              <span className="text-gray-300">|</span>
              <Link href="/datenschutz" className="text-gray-400 hover:text-gray-600 transition-colors">Datenschutz</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} schulden.PRO - Schuldenrechner</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
