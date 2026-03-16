"use client";

import { getTeam } from "@/data/teams";

interface Props {
  matchupId: string;
  name: string;
  position: "top" | "bot";
  picks: Record<string, string>;
  onClick: () => void;
}

function flagClass(p: string): string {
  if (p === "elite") return "border-l-blue";
  if (p === "upset") return "border-l-red";
  if (p === "dark")  return "border-l-gld";
  return "";
}

function kpColor(kp: number): string {
  if (kp <= 10) return "text-blue";
  if (kp <= 25) return "text-grn";
  if (kp <= 50) return "text-gld";
  return "text-tx3";
}

const PLACEHOLDER = "?";

export default function TeamSlot({ matchupId, name, position, picks, onClick }: Props) {
  const winner = picks[matchupId];
  const isWon  = winner === name;
  const isLost = !!winner && winner !== name;
  const isEmpty = !name || name === PLACEHOLDER;

  if (isEmpty) {
    return (
      <div
        className={[
          "flex items-center gap-1.5 px-2 border border-br bg-s1 cursor-default no-select",
          position === "top" ? "rounded-t" : "rounded-b",
          position === "top" ? "border-b-0" : "",
        ].join(" ")}
        style={{ height: 28, width: 172 }}
      >
        <span className="font-mono text-[9px] text-tx3 min-w-[14px] text-right" />
        <span className="text-[11px] font-semibold text-tx3 italic">TBD</span>
      </div>
    );
  }

  const team = getTeam(name);
  const displayName = name.length > 15 ? name.slice(0, 14) + "…" : name;

  return (
    <div
      onClick={onClick}
      title={name}
      className={[
        "relative flex items-center gap-1.5 px-2 border cursor-pointer transition-all no-select overflow-hidden",
        position === "top" ? "rounded-t border-b-0" : "rounded-b",
        isWon  ? "bg-s2 border-blue/40" : "",
        isLost ? "bg-s1 border-br opacity-25 pointer-events-none" : "",
        !isWon && !isLost ? `bg-s1 border-br hover:bg-s2 hover:border-br2 ${flagClass(team.p)} border-l-[3px]` : "",
        isWon ? "border-l-[3px] border-l-blue" : "",
      ].join(" ")}
      style={{ height: 28, width: 172 }}
    >
      {isWon && (
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue" />
      )}
      <span className="font-mono text-[9px] text-tx3 min-w-[14px] text-right flex-shrink-0">
        {team.s || ""}
      </span>
      <span className="text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex-1">
        {displayName}
      </span>
      <span className={`font-mono text-[9px] flex-shrink-0 ${kpColor(team.kp)}`}>
        {team.kp}
      </span>
    </div>
  );
}
