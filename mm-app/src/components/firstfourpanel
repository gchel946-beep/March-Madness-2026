"use client";

import { useBracket } from "@/store/useBracket";
import { FIRST_FOUR } from "@/data/matchups";
import { getTeam } from "@/data/teams";

export default function FirstFourPanel() {
  const { picks, setPick, clearPick, setSelected } = useBracket();

  return (
    <div className="flex-shrink-0 bg-s1 border-b border-br px-3 py-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[9px] tracking-widest text-tx3 uppercase">
          First Four — Play-In Games
        </span>
        <div className="flex-1 h-px bg-br" />
        <span className="font-mono text-[9px] text-tx3">
          {FIRST_FOUR.filter(g => picks[g.id]).length}/{FIRST_FOUR.length} picked
        </span>
      </div>

      {/* 4 games in a row */}
      <div className="flex gap-2">
        {FIRST_FOUR.map(game => {
          const winner = picks[game.id];
          const d1 = getTeam(game.t1);
          const d2 = getTeam(game.t2);

          return (
            <div
              key={game.id}
              className="flex-1 bg-s2 border border-br rounded-md p-2 min-w-0"
            >
              {/* Game label */}
              <div className="font-mono text-[8px] text-tx3 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>#{game.seed} Seed</span>
                <span className="text-tx3">{game.region}</span>
              </div>

              {/* Team buttons */}
              <div className="flex flex-col gap-1">
                {[game.t1, game.t2].map(team => {
                  const d     = getTeam(team);
                  const isPicked = winner === team;
                  const isLost   = !!winner && winner !== team;
                  return (
                    <button
                      key={team}
                      onClick={() => {
                        if (winner === team) clearPick(game.id);
                        else {
                          setPick(game.id, team);
                          // Select this game in sidebar
                          setSelected(game.id, [game.t1, game.t2]);
                        }
                      }}
                      className={[
                        "w-full text-left text-[11px] font-semibold px-2 py-1.5 rounded border transition-all no-select",
                        isPicked
                          ? "bg-blue/15 border-blue text-blue"
                          : isLost
                          ? "opacity-25 border-br bg-s1 text-tx3 cursor-not-allowed"
                          : "border-br bg-s1 text-tx2 hover:border-br2 hover:text-tx",
                      ].join(" ")}
                    >
                      <span className="font-mono text-[9px] text-tx3 mr-1.5">#{d.s || game.seed}</span>
                      <span className="truncate">{team}</span>
                      {isPicked && <span className="ml-1 text-[9px]">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Winner arrow → feeds into */}
              {winner && (
                <div className="mt-1.5 font-mono text-[8px] text-blue flex items-center gap-1">
                  <span>→</span>
                  <span className="truncate">{winner} advances</span>
                </div>
              )}
              {!winner && (
                <div className="mt-1.5 font-mono text-[8px] text-tx3">
                  Pick winner ↑
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
