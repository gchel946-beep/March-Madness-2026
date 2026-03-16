"use client";
import { useBracket } from "@/store/useBracket";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";
import { getUpsetRisk, getMatchupAdvantages, offColor, defColor, toColor, t3Color, kpColor, winProb } from "@/lib/analytics";

function StatCell({ label, value, rank, colorClass }: { label: string; value: string|number; rank: number; colorClass: string }) {
  return (
    <div className="bg-s2 border border-br rounded p-2">
      <div className="text-[9px] text-tx3 mb-1">{label}</div>
      <div className={`text-base font-bold leading-none ${colorClass}`}>
        {value}<span className="text-[10px] font-medium text-tx3 ml-0.5">({rank})</span>
      </div>
    </div>
  );
}

function InfoBlock({ type, title, text }: { type: "N"|"B"|"R"|"Y"|"G"; title: string; text: string }) {
  const wrap: Record<string,string> = { N:"bg-s2 border-br", B:"bg-blue/10 border-blue/20", R:"bg-red/[0.06] border-red/25", Y:"bg-gld/[0.06] border-gld/25", G:"bg-grn/[0.06] border-grn/20" };
  const tcls: Record<string,string> = { N:"text-tx3", B:"text-blue", R:"text-red", Y:"text-gld", G:"text-grn" };
  return (
    <div className={`rounded border p-2 mb-1 ${wrap[type]}`}>
      <div className={`font-mono text-[8px] tracking-widest uppercase mb-1 ${tcls[type]}`}>{title}</div>
      <div className="text-[11px] text-tx2 leading-relaxed">{text}</div>
    </div>
  );
}

function generateAnalysis(t1: string, t2: string): string {
  const d1 = getTeam(t1), d2 = getTeam(t2);
  const p = winProb(d1, d2);
  const favored = p >= 0.5 ? t1 : t2;
  const pct = Math.round(Math.max(p, 1-p) * 100);
  const parts: string[] = [];
  parts.push(`${favored} is favored at ${pct}% win probability based on adjusted efficiency margins.`);
  if (Math.abs(d1.t3 - d2.t3) > 2) {
    const better = d1.t3 > d2.t3 ? t1 : t2;
    const worse  = d1.t3 > d2.t3 ? t2 : t1;
    parts.push(`${better} has a 3PT shooting advantage (${Math.max(d1.t3,d2.t3)}% vs ${Math.min(d1.t3,d2.t3)}%) against ${worse}'s perimeter defense.`);
  }
  if (Math.abs(d1.aD - d2.aD) > 3) {
    const betterD = d1.aD < d2.aD ? t1 : t2;
    parts.push(`${betterD} holds a significant defensive edge in this matchup.`);
  }
  if (Math.abs(d1.to - d2.to) > 2) {
    const lowTO  = d1.to < d2.to ? t1 : t2;
    const highTO = d1.to < d2.to ? t2 : t1;
    parts.push(`Turnover margin is key: ${lowTO} takes care of the ball better while ${highTO}'s higher rate could be exploited.`);
  }
  if (Math.abs(d1.tp - d2.tp) > 5) {
    const faster = d1.tp > d2.tp ? t1 : t2;
    const slower = d1.tp > d2.tp ? t2 : t1;
    parts.push(`Pace mismatch: ${faster} wants to push tempo while ${slower} prefers halfcourt. Whoever imposes their pace wins.`);
  }
  if (pct < 60) parts.push("This is a competitive matchup — either team can win on any given night.");
