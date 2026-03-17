"use client";

import { useState } from "react";
import { useBracket } from "@/store/useBracket";
import { FIRST_FOUR } from "@/data/matchups";
import { getTeam } from "@/data/teams";

export default function FirstFourPanel() {
  const [open, setOpen] = useState(false);
  const { picks, setPick, clearPick } = useBracket();
  const picked = FIRST_FOUR.filter(g => picks[g.id]).length;

  return (
    <div className="flex-shrink-0 border-b border-br bg-s1">
      {/* Collapsed bar — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-s2 transition-colors no-select text-left"
      >
        <span className="font-mono text-[9px] tracking-widest text-tx3 uppercase">First Four</span>
        <div className="flex gap-1.5 ml-1">
          {FIRST_FOUR.map(g => {
            const w = picks[g.id];
            return (
              <span
                key={g.id}
                className={[
                  "font-mono text-[8px] px-1.5 py-0.5 rounded border",
                  w ? "text-blue border-blue/40 bg-blue/10" : "text-tx3 border-br",
                ].join(" ")}
              >
                {w ? w : `#${g.seed} ${g.region}`}
              </span>
            );
          })}
        </div>
        <span className="ml-auto font-mono text-[9px] text-tx3">{picked}/4 {open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="flex gap-2 px-3 pb-2">
          {FIRST_FOUR.map(g => {
            const winner = picks[g.id];
            return (
              <div key={g.id} className="flex-1 min-w-0">
                <div className="font-mono text-[8px] text-tx3 mb-1">#{g.seed} {g.region}</div>
                <div className="flex flex-col gap-0.5">
                  {[g.t1, g.t2].map(team => {
                    const isPicked = winner === team;
                    const isLost   = !!winner && !isPicked;
                    return (
                      <button
                        key={team}
                        onClick={() => isPicked ? clearPick(g.id) : setPick(g.id, team)}
                        className={[
                          "text-left text-[10px] font-medium px-2 py-1 rounded border transition-all no-select truncate",
                          isPicked ? "bg-blue/15 border-blue text-blue"
                            : isLost ? "opacity-25 border-br text-tx3 cursor-not-allowed"
                            : "border-br text-tx2 hover:border-br2 hover:text-tx bg-s2",
                        ].join(" ")}
                      >
                        {isPicked ? "✓ " : ""}{team}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
