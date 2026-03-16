"use client";

import { useBracket } from "@/store/useBracket";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";
import { getUpsetRisk, getMatchupAdvantages, offColor, defColor, toColor, t3Color, kpColor } from "@/lib/analytics";

function StatCell({ label, value, rank, colorClass }: { label: string; value: string | number; rank: number; colorClass: string }) {
  return (
    <div className="bg-s2 border border-br rounded p-2">
      <div className="text-[9px] text-tx3 mb-1">{label}</div>
      <div className={`text-base font-bold leading-none ${colorClass}`}>
        {value}
        <span className="text-[10px] font-medium text-tx3 ml-0.5">({rank})</span>
      </div>
    </div>
  );
}

function InfoBlock({ type, title, text }: { type: "N" | "B" | "R" | "Y" | "G"; title: string; text: string }) {
  const styles: Record<string, string> = {
    N: "bg-s2 border-br",
    B: "bg-blue/10 border-blue/20",
    R: "bg-red/[0.06] border-red/25",
    Y: "bg-gld/[0.06] border-gld/25",
    G: "bg-grn/[0.06] border-grn/20",
  };
  const titleStyles: Record<string, string> = {
    N: "text-tx3", B: "text-blue", R: "text-red", Y: "text-gld", G: "text-grn",
  };
  return (
    <div className={`rounded border p-2 mb-1 ${styles[type]}`}>
      <div className={`font-mono text-[8px] tracking-widest uppercase mb-1 ${titleStyles[type]}`}>{title}</div>
      <div className="text-[11px] text-tx2 leading-relaxed">{text}</div>
    </div>
  );
}

export default function Sidebar() {
  const { selectedId, picks, setPick, clearPick } = useBracket();

  if (!selectedId) {
    return (
      <div className="w-[380px] min-w-[380px] border-l border-br bg-s1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-br">
          <div className="text-[13px] font-semibold text-blue">Select a Game</div>
          <div className="text-[10px] text-tx3 mt-0.5">Click any matchup to see analytics</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-tx3">
          <div className="text-3xl mb-3 opacity-30">◎</div>
          <div className="text-[14px] font-semibold text-tx2 mb-2">Matchup Analytics</div>
          <p className="text-[11px] leading-relaxed">
            Click any game to see KenPom stats, matchup advantages, upset probability, and pick your winner.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-left w-full">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-blue border-blue/30 bg-blue/10">Blue bar</span>
              <span className="text-[10px] text-tx3">title contender</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-gld border-gld/30 bg-gld/10">Gold bar</span>
              <span className="text-[10px] text-tx3">dark horse</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-red border-red/30 bg-red/10">Red bar</span>
              <span className="text-[10px] text-tx3">upset candidate</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const md = MATCHUPS[selectedId];
  let t1 = md?.t1 ?? null;
  let t2 = md?.t2 ?? null;

  // For later-round pairs with no MATCHUPS entry, derive from picks
  if (!t1) {
    const parts = selectedId.split("-");
    // Try to find team names from adjacent picks context — just show placeholder
  }

  const isPlaceholder = !t1 || t1.includes("Winner") || t1 === "";

  if (isPlaceholder) {
    return (
      <div className="w-[380px] min-w-[380px] border-l border-br bg-s1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-br">
          <div className="text-[13px] font-semibold text-tx2">Make Earlier Picks</div>
          <div className="text-[10px] text-tx3 mt-0.5">Complete earlier rounds first</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-tx3">
          <div className="text-3xl mb-3 opacity-30">⏳</div>
          <div className="text-[14px] font-semibold text-tx2 mb-2">Earlier Picks Needed</div>
          <p className="text-[11px] leading-relaxed">Complete earlier rounds to unlock this matchup analysis.</p>
        </div>
      </div>
    );
  }

  const d1 = getTeam(t1);
  const d2 = t2 ? getTeam(t2) : null;
  const w  = picks[selectedId];

  const risk = d2 ? getUpsetRisk(t1, t2!, md?.uc) : null;
  const adv  = d2 ? getMatchupAdvantages(t1, t2!) : null;

  const riskStyle: Record<string, { wrap: string; badge: string; bar: string }> = {
    L: { wrap: "bg-grn/[0.06] border-grn/20", badge: "text-grn", bar: "bg-grn" },
    M: { wrap: "bg-gld/[0.06] border-gld/25", badge: "text-gld", bar: "bg-gld" },
    H: { wrap: "bg-red/[0.06] border-red/25",  badge: "text-red",  bar: "bg-red" },
    X: { wrap: "bg-purple/[0.06] border-purple/25", badge: "text-purple", bar: "bg-purple" },
  };
  const riskS = risk ? riskStyle[risk.level] : riskStyle.L;

  return (
    <div className="w-[380px] min-w-[380px] border-l border-br bg-s1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-br flex-shrink-0">
        <div className="text-[13px] font-semibold text-blue truncate">
          {t2 ? `${t1} vs ${t2}` : t1}
        </div>
        <div className="text-[10px] text-tx3 mt-0.5">
          {d1.r}{d2 ? ` · ${d2.r}` : ""}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0">
        {/* VS row */}
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-1 bg-s2 border border-br rounded p-2 text-center">
            <div className="font-mono text-[9px] text-tx3 mb-1">#{d1.s} SEED</div>
            <div className="text-base font-bold leading-tight">{t1}</div>
            <div className="font-mono text-[9px] text-tx3 mt-1">{d1.r}</div>
          </div>
          {d2 && (
            <>
              <div className="text-[11px] font-semibold text-tx3 pt-4 flex-shrink-0">vs</div>
              <div className="flex-1 bg-s2 border border-br rounded p-2 text-center">
                <div className="font-mono text-[9px] text-tx3 mb-1">#{d2.s} SEED</div>
                <div className="text-base font-bold leading-tight">{t2}</div>
                <div className="font-mono text-[9px] text-tx3 mt-1">{d2.r}</div>
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {(() => {
          const tags: React.ReactNode[] = [];
          const tagCfg: Record<string, string> = {
            elite: "text-blue border-blue/30 bg-blue/10",
            dark:  "text-gld border-gld/30 bg-gld/10",
            upset: "text-red border-red/30 bg-red/10",
          };
          [{ nm: t1, d: d1 }, ...(d2 ? [{ nm: t2!, d: d2 }] : [])].forEach(({ nm, d }) => {
            if (d.p !== "normal") {
              const label = d.p === "elite" ? "Title Contender" : d.p === "dark" ? "Dark Horse" : "Upset Candidate";
              tags.push(
                <span key={nm} className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${tagCfg[d.p]}`}>
                  {nm}: {label}
                </span>
              );
            }
          });
          return tags.length > 0 ? <div className="flex flex-wrap gap-1.5 mb-3">{tags}</div> : null;
        })()}

        {/* Upset Risk */}
        {risk && d2 && (
          <>
            <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">
              Upset Risk — {md?.up ?? t2}
            </div>
            <div className={`border rounded p-2.5 mb-3 ${riskS.wrap}`}>
              <div className={`font-mono text-[9px] tracking-widest uppercase mb-1.5 ${riskS.badge}`}>
                {risk.label} UPSET RISK
              </div>
              <div className="flex items-baseline gap-3">
                <div className={`text-2xl font-bold leading-none ${riskS.badge}`}>{risk.pct}%</div>
                <div className="flex-1 h-1 bg-s3 rounded overflow-hidden">
                  <div className={`h-full rounded transition-all ${riskS.bar}`} style={{ width: `${risk.pct}%` }} />
                </div>
              </div>
              {md?.ex && <div className="text-[11px] text-tx2 leading-relaxed mt-2">{md.ex}</div>}
            </div>
          </>
        )}

        {/* Pick buttons */}
        {d2 && (
          <>
            <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">
              Pick Winner
            </div>
            <div className="flex gap-1.5 mb-3">
              {[t1, t2!].map(team => (
                <button
                  key={team}
                  onClick={() => {
                    if (picks[selectedId!] === team) clearPick(selectedId!);
                    else setPick(selectedId!, team);
                  }}
                  className={[
                    "flex-1 text-[12px] font-semibold py-2 px-2 rounded border transition-all truncate",
                    w === team
                      ? "bg-blue/15 border-blue text-blue"
                      : "bg-s2 border-br text-tx2 hover:border-blue hover:text-blue",
                  ].join(" ")}
                >
                  {w === team ? "✓ " : ""}{team}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Matchup advantages */}
        {adv && d2 && (
          <>
            <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">
              Matchup Edge
            </div>
            <div className="bg-s2 border border-br rounded p-2.5 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-semibold text-tx">
                  {t1} <span className="text-blue">{adv.a1.length} adv</span>
                  {" · "}
                  {t2} <span className="text-gld">{adv.a2.length} adv</span>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {adv.items.map(item => (
                  <div key={item.cat} className="flex items-center gap-2 text-[10px]">
                    <span className="text-tx3 flex-1">{item.cat}</span>
                    <span className={
                      item.cls === "t1" ? "font-semibold text-blue" :
                      item.cls === "t2" ? "font-semibold text-gld" : "text-tx3"
                    }>
                      {item.edge}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 text-[11px] text-tx3 leading-relaxed border-t border-br pt-2">
                {adv.summary}
              </div>
            </div>
          </>
        )}

        {/* Stats grid — format: 94.2(18) */}
        {d2 && (
          <>
            <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">
              Key Statistics
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <StatCell label={`Adj. Offense — ${t1}`} value={d1.aO}  rank={d1.aO_r} colorClass={offColor(d1.aO)} />
              <StatCell label={`Adj. Offense — ${t2}`} value={d2.aO}  rank={d2.aO_r} colorClass={offColor(d2.aO)} />
              <StatCell label={`Adj. Defense — ${t1}`} value={d1.aD}  rank={d1.aD_r} colorClass={defColor(d1.aD)} />
              <StatCell label={`Adj. Defense — ${t2}`} value={d2.aD}  rank={d2.aD_r} colorClass={defColor(d2.aD)} />
              <StatCell label={`3PT % — ${t1}`}        value={`${d1.t3}%`} rank={d1.t3_r} colorClass={t3Color(d1.t3)} />
              <StatCell label={`3PT % — ${t2}`}        value={`${d2.t3}%`} rank={d2.t3_r} colorClass={t3Color(d2.t3)} />
              <StatCell label={`TO Rate — ${t1}`}      value={`${d1.to}%`} rank={d1.to_r} colorClass={toColor(d1.to)} />
              <StatCell label={`TO Rate — ${t2}`}      value={`${d2.to}%`} rank={d2.to_r} colorClass={toColor(d2.to)} />
              <StatCell label={`oReb % — ${t1}`}       value={`${d1.oR}%`} rank={d1.oR_r} colorClass={d1.oR >= 30 ? "text-grn" : "text-gld"} />
              <StatCell label={`oReb % — ${t2}`}       value={`${d2.oR}%`} rank={d2.oR_r} colorClass={d2.oR >= 30 ? "text-grn" : "text-gld"} />
              <StatCell label="KenPom Rank"             value={`#${d1.kp}`} rank={d1.kp}  colorClass={kpColor(d1.kp)} />
              <StatCell label="KenPom Rank"             value={`#${d2.kp}`} rank={d2.kp}  colorClass={kpColor(d2.kp)} />
            </div>
          </>
        )}

        {/* Team profiles */}
        {[{ nm: t1, d: d1 }, ...(d2 ? [{ nm: t2!, d: d2 }] : [])].map(({ nm, d }) => (
          <div key={nm}>
            <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">
              {nm.toUpperCase()} Profile
            </div>
            <InfoBlock type="N" title="Strength" text={d.str} />
            <InfoBlock type="N" title="Weakness" text={d.weak} />
            <InfoBlock type="B" title="Key Factor" text={d.key} />
          </div>
        ))}

        <div className="h-4" />
      </div>
    </div>
  );
}
