import type { UserInput } from "@schuldenpro/engine";
import { Euro, Users, Wallet, PiggyBank, TrendingDown } from "lucide-react";

interface InputFormProps {
  input: UserInput;
  onUpdate: (field: keyof UserInput, value: number) => void;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  suffix?: string;
  min?: number;
}

function InputField({ id, label, value, onChange, icon, suffix = "\u20AC", min = 0 }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === "") {
              onChange(0);
            } else {
              const numValue = Number(inputValue);
              if (!isNaN(numValue) && inputValue.match(/^\d*\.?\d*$/)) {
                onChange(Math.max(min, numValue));
              }
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function InputForm({ input, onUpdate }: InputFormProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-5">
        <Wallet className="w-5 h-5 text-blue-600" />
        Ihre Angaben
      </h2>
      <div className="space-y-5">
        <InputField
          id="gesamtschulden"
          label="Gesamtschulden"
          value={input.gesamtschulden}
          onChange={(v) => onUpdate("gesamtschulden", v)}
          icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
        />

        <InputField
          id="nettoeinkommen"
          label="Monatliches Nettoeinkommen"
          value={input.nettoeinkommen}
          onChange={(v) => onUpdate("nettoeinkommen", v)}
          icon={<Euro className="w-4 h-4 text-emerald-500" />}
        />

        <div className="space-y-1">
          <label htmlFor="unterhaltspflichten" className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Unterhaltspflichtige Personen
          </label>
          <div className="relative">
            <input
              id="unterhaltspflichten"
              type="number"
              value={input.unterhaltspflichten}
              onChange={(e) => onUpdate("unterhaltspflichten", Math.max(0, Math.min(5, Number(e.target.value))))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              min={0}
              max={5}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              Pers.
            </span>
          </div>
          <p className="text-xs text-gray-500">Anzahl der Personen, fuer die Sie Unterhalt zahlen muessen</p>
        </div>

        <InputField
          id="lebenshaltungskosten"
          label="Lebenshaltungskosten (monatlich)"
          value={input.lebenshaltungskosten}
          onChange={(v) => onUpdate("lebenshaltungskosten", v)}
          icon={<PiggyBank className="w-4 h-4 text-amber-500" />}
        />

        <InputField
          id="monatlicheZahlung"
          label="Gewuenschte monatliche Zahlung"
          value={input.monatlicheZahlung}
          onChange={(v) => onUpdate("monatlicheZahlung", v)}
          icon={<Wallet className="w-4 h-4 text-purple-500" />}
        />
      </div>
    </div>
  );
}
