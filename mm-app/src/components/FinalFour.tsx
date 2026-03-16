"use client";

import MatchupPair from "@/components/MatchupPair";
import { useBracket } from "@/store/useBracket";
import { MATCHUPS } from "@/data/matchups";

export default function FinalFour() {
  const { winner } = useBracket();

  const ef  = winner("e-e8");
  const sf  = winner("s-e8");
  const wf  = winner("w-e8");
  const mf  = winner("mw-e8");
  const ff1 = winner("ff-1");
  const ff2 = winner("ff-2");
  const ch  = winner("champ");

  return (
    <div className="max-w-lg mx-auto pt-4 pb-8 px-4">
      <h2 className="text-center text-xl font-bold tracking-tight text-tx mb-6">
        Final Four · National Championship
      </h2>

      <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase text-center mb-1">
        Semifinal 1 — East vs South
      </div>
      <MatchupPair matchupId="ff-1" team1={ef ?? ""} team2={sf ?? ""} />

      <div className="h-4" />

      <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase text-center mb-1">
        Semifinal 2 — West vs Midwest
      </div>
      <MatchupPair matchupId="ff-2" team1={wf ?? ""} team2={mf ?? ""} />

      <div className="h-6" />

      <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase text-center mb-1">
        National Championship — April 6
      </div>
      <MatchupPair matchupId="champ" team1={ff1 ?? ""} team2={ff2 ?? ""} />

      {/* Champion display */}
      <div className="mt-6 border border-br border-t-blue border-t-2 rounded-lg p-4 text-center bg-s1">
        <div className="font-mono text-[9px] tracking-widest text-blue uppercase mb-2">
          2026 National Champion
        </div>
        <div className="text-2xl font-bold text-tx">{ch ?? "—"}</div>
      </div>

      <PicksSummary />
    </div>
  );
}

function PicksSummary() {
  const { picks } = useBracket();

  const regions = [
    { label: "East",    ids: ["e-1","e-2","e-3","e-4","e-5","e-6","e-7","e-8"] },
    { label: "South",   ids: ["s-1","s-2","s-3","s-4","s-5","s-6","s-7","s-8"] },
    { label: "West",    ids: ["w-1","w-2","w-3","w-4","w-5","w-6","w-7","w-8"] },
    { label: "Midwest", ids: ["mw-1","mw-2","mw-3","mw-4","mw-5","mw-6","mw-7","mw-8"] },
  ];

  const anyPick = regions.some(r => r.ids.some(id => picks[id]));

  return (
    <div className="mt-5 border-t border-br pt-4">
      <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase mb-3">
        Your First Round Picks
      </div>
      {!anyPick && (
        <p className="text-[11px] text-tx3 italic">
          No picks yet. Use the East/South and West/Midwest pages to pick winners.
        </p>
      )}
      {regions.map(r => {
        const picked = r.ids.filter(id => picks[id]);
        if (!picked.length) return null;
        return (
          <div key={r.label} className="mb-3">
            <div className="text-[10px] font-semibold text-tx3 mb-1.5">{r.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {picked.map(id => {
                const w = picks[id];
                const md = MATCHUPS[id];
                const isUpset = md && w === md.t2 && md.uc >= 44;
                return (
                  <span
                    key={id}
                    className={[
                      "font-mono text-[9px] px-2 py-0.5 rounded border",
                      isUpset
                        ? "bg-red/10 text-red border-red/25"
                        : "bg-blue/10 text-blue border-blue/25",
                    ].join(" ")}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
