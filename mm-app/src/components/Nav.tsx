"use client";

import { useBracket } from "@/store/useBracket";
import { Tab } from "@/types";

const TABS: { id: Tab; label: string }[] = [
  { id: "bracket",    label: "Bracket" },
  { id: "upsets",     label: "Upset Watch" },
  { id: "darkhorses", label: "Dark Horses" },
  { id: "insights",   label: "Insights" },
  { id: "analysis",   label: "My Bracket" },
  { id: "simulate",   label: "Simulate" },
];

export default function Nav() {
  const { activeTab, setActiveTab, picks, resetAll } = useBracket();
  const pickCount = Object.keys(picks).length;

  return (
    <nav className="h-11 flex-shrink-0 flex items-center gap-2 px-4 bg-s1 border-b border-br no-select z-50">
      <div className="text-sm font-bold text-tx mr-3 whitespace-nowrap tracking-tight">
        2026 <span className="text-blue">NCAA</span> Tournament
      </div>

      <div className="flex items-center gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={[
              "text-xs font-medium px-3 py-1.5 rounded-md border transition-all whitespace-nowrap",
              activeTab === t.id
                ? "bg-blue border-blue text-white"
                : "border-transparent text-tx3 hover:text-tx2 hover:border-br",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="font-mono text-xs text-tx3">{pickCount} picks</span>
        <button
          onClick={resetAll}
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-br text-tx3 hover:border-red hover:text-red transition-all"
        >
          ↺ Reset
        </button>
      </div>
    </nav>
  );
}
