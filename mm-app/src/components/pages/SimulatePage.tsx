"use client";

import { useState } from "react";
import { runSimulation, sortedEntries, FullSimResult, ENV_META } from "@/lib/simulation";
import { getTeam } from "@/data/teams";
import { useBracket } from "@/store/useBracket";

export default function SimulatePage() {
  const [result, setResult] = useState<FullSimResult | null>(null);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(5000);
  const { picks } = useBracket();

  function handleRun() {
    setRunning(true);
    const pickSnapshot = { ...picks };
    setTimeout(() => {
      setResult(runSimulation(count, pickSnapshot));
      setRunning(false);
    }, 80);
  }

  const n             = result?.n ?? count;
  const champEntries  = result ? sortedEntries(result.champs, 14) : [];
  const f4Entries     = result ? sortedEntries(result.f4, 14) : [];
  const s16Entries    = result ? sortedEntries(result.s16, 12) : [];
  const envEntries    = result ? sortedEntries(result.environments, 10) : [];
  const upsetPct      = result ? (result.upsetFreq * 100).toFixed(1) : "—";

  // Cinderella: KP > 25, seed >= 5, Final Four > 8% of sims
  const cinderellas = result
    ? f4Entries.filter(([nm]) => {
        const t = getTeam(nm);
        return t.kp > 25 && t.s >= 5 && (result.f4[nm] / n) > 0.08;
      })
    : [];

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-tx mb-1">Tournament Simulation</h1>
      <p className="text-[12px] text-tx3 mb-5">
        40+ factor Monte Carlo model across 10 statistical categories and 10 tournament environments.
        Every run uses fresh randomized weights — sometimes defense dominates, sometimes shooting variance decides everything.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button
          onClick={handleRun}
          disabled={running}
          className="text-[13px] font-semibold px-5 py-2.5 rounded-md bg-blue text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? "Simulating…" : result ? "Run Again" : `Run ${count.toLocaleString()} Simulations`}
        </button>
        <div className="flex items-center gap-2">
          {[1000, 5000, 10000].map(c => (
            <button
              key={c}
              onClick={() => setCount(c)}
              className={[
                "font-mono text-[10px] px-3 py-1.5 rounded border transition-all",
                count === c
                  ? "bg-s2 border-br2 text-tx"
                  : "border-br text-tx3 hover:border-br2 hover:text-tx2",
              ].join(" ")}
            >
              {c.toLocaleString()}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-tx3">
          {running
            ? "Running simulations with randomized environments…"
            : result
            ? `${n.toLocaleString()} simulations complete · ${upsetPct}% R1 upset rate`
            : "Each run uses randomized weights across 40+ statistical factors."}
        </span>
      </div>

      {result && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-s1 border border-br rounded-lg p-3">
              <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">Most Likely Champion</div>
              <div className="text-xl font-bold text-blue mb-1">{champEntries[0]?.[0] ?? "—"}</div>
              <div className="text-[10px] text-tx3">
                {champEntries[0] ? ((champEntries[0][1] / n) * 100).toFixed(1) + "% of simulations" : ""}
              </div>
            </div>
            <div className="bg-s1 border border-br rounded-lg p-3">
              <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">R1 Upset Rate</div>
              <div className="text-xl font-bold text-red mb-1">{upsetPct}%</div>
              <div className="text-[10px] text-tx3">Historical avg: 35–38%</div>
            </div>
            <div className="bg-s1 border border-br rounded-lg p-3">
              <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">Most Common Environment</div>
              <div className="text-xl font-bold text-gld mb-1 capitalize">{envEntries[0]?.[0] ?? "—"}</div>
              <div className="text-[10px] text-tx3">
                {envEntries[0] ? ((envEntries[0][1] / n) * 100).toFixed(1) + "% of runs" : ""}
              </div>
            </div>
            <div className="bg-s1 border border-br rounded-lg p-3">
              <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">Simulations Run</div>
              <div className="text-xl font-bold mb-1">{n.toLocaleString()}</div>
              <div className="text-[10px] text-tx3">10 environments · 40+ factors</div>
            </div>
          </div>

          {/* Main probability tables */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Champion odds */}
            <div className="bg-s1 border border-br rounded-lg p-4">
              <div className="text-[12px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Champion Odds
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#","Team","Seed","Title %"].map(h => (
                      <th key={h} className="font-mono text-[8px] tracking-widest text-tx3 uppercase pb-1.5 border-b border-br text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {champEntries.map(([nm, cnt], i) => {
                    const pct  = ((cnt / n) * 100).toFixed(1);
                    const t    = getTeam(nm);
                    const wide = Math.min(100, parseFloat(pct) * 3.5);
                    return (
                      <tr key={nm} className="border-b border-br/30">
                        <td className="py-1 font-mono text-[9px] text-tx3 pr-1.5">{i+1}</td>
                        <td className="py-1 text-[11px] font-medium">{nm}</td>
                        <td className="py-1 font-mono text-[9px] text-tx3 px-1">#{t.s}</td>
                        <td className="py-1 min-w-[60px]">
                          <div className="font-mono text-[10px] text-blue text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-0.5 overflow-hidden">
                            <div className="h-full bg-blue rounded" style={{width:`${wide}%`}}/>
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
              <div className="text-[12px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Final Four Odds
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#","Team","Seed","F4 %"].map(h => (
                      <th key={h} className="font-mono text-[8px] tracking-widest text-tx3 uppercase pb-1.5 border-b border-br text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {f4Entries.map(([nm, cnt], i) => {
                    const pct  = ((cnt / n) * 100).toFixed(1);
                    const t    = getTeam(nm);
                    const wide = Math.min(100, parseFloat(pct) * 1.5);
                    return (
                      <tr key={nm} className="border-b border-br/30">
                        <td className="py-1 font-mono text-[9px] text-tx3 pr-1.5">{i+1}</td>
                        <td className="py-1 text-[11px] font-medium">{nm}</td>
                        <td className="py-1 font-mono text-[9px] text-tx3 px-1">#{t.s}</td>
                        <td className="py-1 min-w-[60px]">
                          <div className="font-mono text-[10px] text-grn text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-0.5 overflow-hidden">
                            <div className="h-full bg-grn rounded" style={{width:`${wide}%`}}/>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sweet 16 odds */}
            <div className="bg-s1 border border-br rounded-lg p-4">
              <div className="text-[12px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Sweet 16 Odds
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {["#","Team","Seed","S16 %"].map(h => (
                      <th key={h} className="font-mono text-[8px] tracking-widest text-tx3 uppercase pb-1.5 border-b border-br text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s16Entries.map(([nm, cnt], i) => {
                    const pct  = ((cnt / n) * 100).toFixed(1);
                    const t    = getTeam(nm);
                    const wide = Math.min(100, parseFloat(pct) * 0.8);
                    return (
                      <tr key={nm} className="border-b border-br/30">
                        <td className="py-1 font-mono text-[9px] text-tx3 pr-1.5">{i+1}</td>
                        <td className="py-1 text-[11px] font-medium">{nm}</td>
                        <td className="py-1 font-mono text-[9px] text-tx3 px-1">#{t.s}</td>
                        <td className="py-1 min-w-[60px]">
                          <div className="font-mono text-[10px] text-gld text-right">{pct}%</div>
                          <div className="h-0.5 bg-s3 rounded mt-0.5 overflow-hidden">
                            <div className="h-full bg-gld rounded" style={{width:`${wide}%`}}/>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Environments */}
          <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            Tournament Environments Used
          </h2>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {envEntries.map(([env, cnt]) => {
              const cfg = ENV_META[env as keyof typeof ENV_META];
              if (!cfg) return null;
              const pct = ((cnt / n) * 100).toFixed(1);
              return (
                <div key={env} className="bg-s1 border border-br rounded-md p-2.5">
                  <div className={`text-[12px] font-bold mb-0.5 ${cfg.color}`}>{cfg.label}</div>
                  <div className="font-mono text-[10px] text-blue mb-1">{pct}%</div>
                  <div className="text-[9px] text-tx3 leading-relaxed">{cfg.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Cinderellas */}
          {cinderellas.length > 0 && (
            <>
              <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
                Cinderella Candidates
              </h2>
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {cinderellas.map(([nm, cnt]) => {
                  const t   = getTeam(nm);
                  const pct = ((cnt / n) * 100).toFixed(1);
                  return (
                    <div key={nm} className="bg-s1 border border-br border-l-4 border-l-gld rounded-md p-3">
                      <div className="text-[15px] font-bold mb-0.5">{nm}</div>
                      <div className="font-mono text-[9px] text-tx3 mb-2">#{t.s} seed · KenPom #{t.kp}</div>
                      <div className="text-[11px] text-tx3 leading-relaxed">
                        Reaches Final Four in <span className="text-gld font-semibold">{pct}%</span> of simulations — well above seed expectation.
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Model explanation */}
          <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            How the Model Works
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { t:"40+ Statistical Factors Across 10 Categories", b:"Efficiency margins, shooting efficiency (eFG%, TS%), shooting variance (3PT attempt rate), turnovers (TO rate, steal rate, margin), rebounding (oReb%, dReb%, second-chance pts), free throws (rate, %), interior scoring (rim finish, block rate), pace (tempo, transition freq), strength of schedule, and experience (roster continuity, coaching, clutch record)." },
              { t:"10 Tournament Environments", b:"Each simulation run picks one of: Balanced, Chalk, Chaos, Defense, Shooting, Rebounding, Turnover, Experience, Guard Play, or Interior. Each environment has its own multipliers on all 10 category weights plus separate variance controls. Chaos runs produce ~18–40% noise; Chalk runs only 7–10%." },
              { t:"Randomized Weight Profiles Every Run", b:"Even within the same environment, all 10 category weights are drawn from randomized ranges, then normalized to sum to 1. A Defense run might emphasize defense 60% or 30% — it varies every time. No two of the 5,000 simulations use identical weights." },
              { t:"10 Style Matchup Interactions", b:"Beyond category scores, the engine checks: elite 3PT vs weak perimeter D, high 3PT attempt rate vs soft defense, dominant rebounding vs poor boxing out, pressure D vs turnover-prone offense, interior scoring vs rim protection, fast tempo vs slow tempo, FT-reliant teams vs foul-prone defenses, elite D vs high-variance shooters, experience gaps, and assist rate vs disruptive defenses." },
              { t:"6 Independent Game-Level Noise Sources", b:"Shooting night variance, turnover swings, foul trouble, rebounding swings, general game chaos, and neutral-site variance. Total possible swing ≈ ±60% in Chaos environments, ±25% in Chalk environments. A Chaos 70% favorite loses ~40% of the time — realistic March Madness." },
              { t:"Cinderella Factor", b:"Lower-seeded teams get a randomized upset boost (4–20%) that fires probabilistically based on the seed gap and environment chaos level. In Chaos runs it fires 18% of the time. In Chalk runs only 2%. This is what generates realistic double-digit seed Final Four runs." },
            ].map(c => (
              <div key={c.t} className="bg-s1 border border-br rounded-md p-3">
                <div className="text-[12px] font-semibold text-blue mb-1.5">{c.t}</div>
                <div className="text-[11px] text-tx3 leading-relaxed">{c.b}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
