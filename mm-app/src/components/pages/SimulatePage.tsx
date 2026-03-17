"use client";

import { useState } from "react";
import { runSimulation, sortedEntries, FullSimResult } from "@/lib/simulation";
import { getTeam } from "@/data/teams";

const ENV_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  chalk:      { label: "Chalk",       desc: "Favorites dominate, low variance",         color: "text-blue" },
  chaos:      { label: "Chaos",       desc: "Massive upsets, anything goes",             color: "text-red" },
  defense:    { label: "Defense",     desc: "Grind-it-out, low-scoring tournament",     color: "text-grn" },
  shooting:   { label: "Shooting",    desc: "3PT variance decides every game",           color: "text-gld" },
  rebounding: { label: "Rebounding",  desc: "Physicality and second chances rule",       color: "text-purple" },
  turnover:   { label: "Turnovers",   desc: "Ball security and pressure defense",        color: "text-red" },
  experience: { label: "Experience",  desc: "Veteran teams and proven programs thrive",  color: "text-blue" },
  guard_play: { label: "Guard Play",  desc: "Tempo and perimeter play decide outcomes",  color: "text-gld" },
};

export default function SimulatePage() {
  const [result, setResult] = useState<FullSimResult | null>(null);
  const [running, setRunning] = useState(false);

  function handleRun() {
    setRunning(true);
    setTimeout(() => {
      const r = runSimulation(5000);
      setResult(r);
      setRunning(false);
    }, 80);
  }

  const n = result?.n ?? 5000;
  const champEntries = result ? sortedEntries(result.champs, 14) : [];
  const f4Entries    = result ? sortedEntries(result.f4, 14) : [];
  const envEntries   = result ? sortedEntries(result.environments, 8) : [];

  // Cinderella candidates: teams KP > 20 appearing in Final Four > 8% of sims
  const cinderellas = result
    ? f4Entries.filter(([nm]) => getTeam(nm).kp > 20 && (result.f4[nm] / n) > 0.08)
    : [];

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-tx mb-1">Tournament Simulation</h1>
      <p className="text-[12px] text-tx3 mb-5">
        Monte Carlo simulation using 10 statistical factors, 8 tournament environments, and realistic game-level variance.
        Every run generates a different weighting profile — sometimes defense wins, sometimes shooting decides everything.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleRun}
          disabled={running}
          className="text-[13px] font-semibold px-5 py-2.5 rounded-md bg-blue text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? "Simulating…" : result ? "Run Again" : "Run 5,000 Simulations"}
        </button>
        <span className="text-[11px] text-tx3">
          {running
            ? "Running 5,000 tournaments with randomized environments and weights…"
            : result
            ? `Completed ${n.toLocaleString()} simulations across 8 tournament environments.`
            : "Each run uses randomized weights across 10 statistical factors."}
        </span>
      </div>

      {result && (
        <>
          {/* Main tables */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Champion odds */}
            <div className="bg-s1 border border-br rounded-lg p-4">
              <div className="text-[13px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Champion Probabilities
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#", "Team", "Seed", "Title %"].map(h => (
                      <th key={h} className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-2 border-b border-br text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {champEntries.map(([nm, cnt], i) => {
                    const pct  = ((cnt / n) * 100).toFixed(1);
                    const t    = getTeam(nm);
                    const wide = Math.min(100, parseFloat(pct) * 3);
                    return (
                      <tr key={nm} className="border-b border-br/40">
                        <td className="py-1.5 font-mono text-[9px] text-tx3 pr-2">{i + 1}</td>
                        <td className="py-1.5 text-[12px] font-medium">{nm}</td>
                        <td className="py-1.5 font-mono text-[9px] text-tx3">#{t.s}</td>
                        <td className="py-1.5">
                          <div className="font-mono text-[11px] text-blue text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-1 overflow-hidden">
                            <div className="h-full bg-blue rounded" style={{ width: `${wide}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Final Four odds */}
            <div className="bg-s1 border border-br rounded-lg p-4">
              <div className="text-[13px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Final Four Frequency
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#", "Team", "Seed", "F4 %"].map(h => (
                      <th key={h} className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-2 border-b border-br text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {f4Entries.map(([nm, cnt], i) => {
                    const pct  = ((cnt / n) * 100).toFixed(1);
                    const t    = getTeam(nm);
                    const wide = Math.min(100, parseFloat(pct) * 1.5);
                    return (
                      <tr key={nm} className="border-b border-br/40">
                        <td className="py-1.5 font-mono text-[9px] text-tx3 pr-2">{i + 1}</td>
                        <td className="py-1.5 text-[12px] font-medium">{nm}</td>
                        <td className="py-1.5 font-mono text-[9px] text-tx3">#{t.s}</td>
                        <td className="py-1.5">
                          <div className="font-mono text-[11px] text-grn text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-1 overflow-hidden">
                            <div className="h-full bg-grn rounded" style={{ width: `${wide}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Environment distribution */}
          <div className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            Tournament Environments Used
          </div>
          <div className="grid grid-cols-4 gap-2.5 mb-6">
            {envEntries.map(([env, cnt]) => {
              const cfg = ENV_LABELS[env] ?? { label: env, desc: "", color: "text-tx2" };
              const pct = ((cnt / n) * 100).toFixed(1);
              return (
                <div key={env} className="bg-s1 border border-br rounded-lg p-3">
                  <div className={`text-[13px] font-bold mb-0.5 ${cfg.color}`}>{cfg.label}</div>
                  <div className="font-mono text-[10px] text-blue mb-1">{pct}% of runs</div>
                  <div className="text-[10px] text-tx3 leading-relaxed">{cfg.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Cinderella candidates */}
          {cinderellas.length > 0 && (
            <>
              <div className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Cinderella Candidates
              </div>
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {cinderellas.map(([nm, cnt]) => {
                  const t   = getTeam(nm);
                  const pct = ((cnt / n) * 100).toFixed(1);
                  return (
                    <div key={nm} className="bg-s1 border border-br border-l-4 border-l-gld rounded-md p-3">
                      <div className="text-[14px] font-bold mb-0.5">{nm}</div>
                      <div className="font-mono text-[9px] text-tx3 mb-2">#{t.s} seed · KenPom #{t.kp}</div>
                      <div className="text-[11px] text-tx3">
                        Reaches Final Four in <span className="text-gld font-semibold">{pct}%</span> of simulations — significantly above seed expectation.
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Model explanation */}
          <div className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            How This Simulation Works
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { t:"10 Statistical Factors", b:"Every game evaluates: adjusted efficiency margin, offensive efficiency, defensive efficiency, 3PT shooting matchup, turnover differential, offensive rebounding, pace advantage, experience proxy, free throw rate proxy, and strength of schedule proxy." },
              { t:"8 Tournament Environments", b:"Each simulation run is randomly assigned an environment: Chalk, Chaos, Defense, Shooting, Rebounding, Turnovers, Experience, or Guard Play. Each environment changes which factors are weighted most heavily that run." },
              { t:"Randomized Weight Profiles", b:"Even within the same environment, all 10 factor weights are randomized within their allowed range, then normalized to sum to 1. No two simulations use identical weights — this is what makes the results vary." },
              { t:"6 Game-Level Noise Sources", b:"Every individual game applies: shooting variance (hot/cold nights), turnover swings, foul trouble, rebounding swings, general March chaos, and momentum/crowd variance. Total possible swing ≈ ±55%." },
              { t:"Style Interaction Bonuses", b:"The engine detects specific matchup exploits: elite 3PT shooting vs weak perimeter defense, dominant rebounding vs poor rebounders, pressure defense vs turnover-prone offense, and pace mismatch advantages." },
              { t:"Cinderella Factor", b:"Lower-seeded teams receive a randomized upset boost in chaos and shooting environments. The size of the boost scales with the seed gap and environment chaos level, allowing realistic double-digit seed runs." },
            ].map(c => (
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
