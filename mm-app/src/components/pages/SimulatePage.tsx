"use client";

import { useState } from "react";
import { runSimulation, sortedEntries } from "@/lib/simulation";
import { SimResult } from "@/types";
import { getTeam } from "@/data/teams";

export default function SimulatePage() {
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  function handleRun() {
    setRunning(true);
    setTimeout(() => {
      const r = runSimulation(5000);
      setResult(r);
      setRunning(false);
    }, 80);
  }

  const champEntries   = result ? sortedEntries(result.champs, 12) : [];
  const f4Entries      = result ? sortedEntries(result.f4, 12) : [];
  const n              = result?.n ?? 5000;

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-tx mb-1">Tournament Simulation</h1>
      <p className="text-[12px] text-tx3 mb-5">
        Monte Carlo simulation using KenPom adjusted efficiency margins with March Madness variance modeling.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleRun}
          disabled={running}
          className="text-[13px] font-semibold px-5 py-2.5 rounded-md bg-blue text-white hover:bg-blue2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? "Simulating…" : result ? "Run Again" : "Run 5,000 Simulations"}
        </button>
        <span className="text-[11px] text-tx3">
          {running ? "Running 5,000 simulations…"
            : result ? `Completed ${n.toLocaleString()} simulations.`
            : "Click to simulate using KenPom efficiency data."}
        </span>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Champion probabilities */}
            <div className="bg-s1 border border-br rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Champion Probabilities
              </h3>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#", "Team", "Win %"].map(h => (
                      <th key={h} className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-2 text-left border-b border-br">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {champEntries.map(([nm, cnt], i) => {
                    const pct = ((cnt / n) * 100).toFixed(1);
                    const t = getTeam(nm);
                    return (
                      <tr key={nm} className="border-b border-br/50">
                        <td className="py-1.5 font-mono text-[9px] text-tx3 pr-3">{i + 1}</td>
                        <td className="py-1.5 text-[12px] font-medium">{nm}</td>
                        <td className="py-1.5">
                          <div className="font-mono text-[11px] text-blue text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-1 overflow-hidden">
                            <div
                              className="h-full bg-blue rounded"
                              style={{ width: `${Math.min(100, parseFloat(pct) * 3)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Final Four frequency */}
            <div className="bg-s1 border border-br rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Final Four Frequency
              </h3>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#", "Team", "F4 %"].map(h => (
                      <th key={h} className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-2 text-left border-b border-br">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {f4Entries.map(([nm, cnt], i) => {
                    const pct = ((cnt / n) * 100).toFixed(1);
                    return (
                      <tr key={nm} className="border-b border-br/50">
                        <td className="py-1.5 font-mono text-[9px] text-tx3 pr-3">{i + 1}</td>
                        <td className="py-1.5 text-[12px] font-medium">{nm}</td>
                        <td className="py-1.5">
                          <div className="font-mono text-[11px] text-grn text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-1 overflow-hidden">
                            <div
                              className="h-full bg-grn rounded"
                              style={{ width: `${Math.min(100, parseFloat(pct) * 1.5)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            Simulation Insights
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {(() => {
              const topChamp = champEntries[0];
              const topChampPct = topChamp ? ((topChamp[1] / n) * 100).toFixed(1) : "0";
              const surprise = champEntries.find(([nm]) => getTeam(nm).s >= 4);
              const surprisePct = surprise ? ((surprise[1] / n) * 100).toFixed(1) : "0";
              return [
                {
                  t: `Most likely champion: ${topChamp?.[0] ?? "—"}`,
                  b: `Wins the national championship in ${topChampPct}% of simulations. Their adjusted efficiency advantage over the field is the primary driver of this result.`,
                },
                ...(surprise ? [{
                  t: `Simulation surprise: ${surprise[0]}`,
                  b: `Appears in the championship game in ${surprisePct}% of simulations — higher than expected based on seeding. Matchup advantages and favorable path drive this result.`,
                }] : []),
                {
                  t: "Simulation methodology",
                  b: "Win probability is calculated from adjusted efficiency differential using a logistic model (scale factor = 8). ±15% random variance added to model real-world March chaos and upset frequency.",
                },
                {
                  t: "Simulation vs your picks",
                  b: "Compare your bracket picks on the 'My Bracket' tab to see how your champion and Final Four picks align with simulation probabilities.",
                },
              ];
            })().map(c => (
              <div key={c.t} className="bg-s1 border border-br rounded-md p-3">
                <div className="text-[13px] font-semibold text-blue mb-1.5">{c.t}</div>
                <div className="text-[11px] text-tx3 leading-relaxed">{c.b}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
