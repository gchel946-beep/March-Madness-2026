import { TeamData, AdvResult, AdvItem, UpsetRisk, RiskLevel } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";

/* ================================================================
   CORE WIN PROBABILITY
   Uses adjusted efficiency margin with logistic curve.
   Scale = 10 → realistic spread: 15-pt gap ≈ 73%, not 85%.
================================================================ */
export function winProb(d1: TeamData, d2: TeamData): number {
  const netA = d1.aO - d2.aD;
  const netB = d2.aO - d1.aD;
  const margin = netA - netB;
  return 1 / (1 + Math.exp(-margin / 10));
}

/* ================================================================
   MATCHUP-SPECIFIC WIN PROBABILITY
   Accounts for style interactions beyond raw efficiency.
   Called by the simulation engine — not the sidebar display.
================================================================ */
export function matchupWinProb(t1: string, t2: string): number {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);

  // Base efficiency margin
  let score = (d1.aO - d2.aD) - (d2.aO - d1.aD);

  // Style interaction 1: elite 3PT shooting vs weak 3PT defense
  // d2.aD >= 93 = below-average 3PT defense (high adjD = bad defense)
  if (d1.t3 >= 37 && d2.aD >= 93) score += 2.5;
  if (d2.t3 >= 37 && d1.aD >= 93) score -= 2.5;

  // Style interaction 2: rebounding dominance
  const rebGap = d1.oR - d2.oR;
  if (rebGap > 4) score += 1.5;
  if (rebGap < -4) score -= 1.5;

  // Style interaction 3: pressure D vs turnover-prone offense
  if (d1.aD <= 90 && d2.to >= 16) score += 2.0;
  if (d2.aD <= 90 && d1.to >= 16) score -= 2.0;

  // Style interaction 4: pace mismatch — faster team has slight advantage
  const paceGap = d1.tp - d2.tp;
  score += paceGap * 0.03;

  // Style interaction 5: experience (proxy: KenPom rank consistency)
  // Lower kp = more experienced caliber team
  const expEdge = (d2.kp - d1.kp) * 0.04;
  score += expEdge;

  return 1 / (1 + Math.exp(-score / 10));
}

/* ================================================================
   UPSET RISK — shown in sidebar
================================================================ */
export function getUpsetRisk(t1: string, t2: string, overrideUc?: number): UpsetRisk {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  let pUpset = 1 - winProb(d1, d2);

  const matchup = Object.values(MATCHUPS).find(m => m.t1 === t1 && m.t2 === t2);
  if (matchup) pUpset = Math.max(pUpset, matchup.uc / 100);
  if (overrideUc !== undefined) pUpset = Math.max(pUpset, overrideUc / 100);

  let pct = Math.round(pUpset * 100);
  pct = Math.max(2, Math.min(90, pct));

  let level: RiskLevel;
  let label: string;
  if (pct >= 60)      { level = "X"; label = "EXTREME"; }
  else if (pct >= 40) { level = "H"; label = "HIGH"; }
  else if (pct >= 20) { level = "M"; label = "MODERATE"; }
  else                { level = "L"; label = "LOW"; }

  return { level, pct, label };
}

/* ================================================================
   MATCHUP ADVANTAGES — shown in sidebar edge breakdown
================================================================ */
interface AdvCategory {
  k: string;
  v1: number;
  v2: number;
  higher: boolean | null;
  thresh: number;
}

export function getMatchupAdvantages(t1: string, t2: string): AdvResult {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);

  const cats: AdvCategory[] = [
    { k: "Offense",         v1: d1.aO, v2: d2.aO, higher: true,  thresh: 2 },
    { k: "Defense",         v1: d1.aD, v2: d2.aD, higher: false, thresh: 1.5 },
    { k: "3PT Shooting",    v1: d1.t3, v2: d2.t3, higher: true,  thresh: 1.5 },
    { k: "Ball Security",   v1: d1.to, v2: d2.to, higher: false, thresh: 1 },
    { k: "Off. Rebounding", v1: d1.oR, v2: d2.oR, higher: true,  thresh: 1.5 },
    { k: "Tempo Control",   v1: d1.tp, v2: d2.tp, higher: null,  thresh: 4 },
  ];

  const items: AdvItem[] = [];
  const a1: string[] = [];
  const a2: string[] = [];

  cats.forEach(c => {
    if (c.higher === null) { items.push({ cat: c.k, edge: "Neutral", cls: "tied" }); return; }
    const diff = c.v1 - c.v2;
    const win1 = c.higher ? diff > c.thresh  : diff < -c.thresh;
    const win2 = c.higher ? diff < -c.thresh : diff > c.thresh;
    if (win1) {
      a1.push(c.k);
      items.push({ cat: c.k, edge: `${t1} +${(c.higher ? diff : -diff).toFixed(1)}`, cls: "t1" });
    } else if (win2) {
      a2.push(c.k);
      items.push({ cat: c.k, edge: `${t2} +${(c.higher ? -diff : diff).toFixed(1)}`, cls: "t2" });
    } else {
      items.push({ cat: c.k, edge: "Even", cls: "tied" });
    }
  });

  // Style interaction summaries
  let summary = "";
  if      (d1.t3 >= 38 && d2.aD >= 93) summary = `${t1} has a significant 3PT shooting advantage against a defense that allows high 3PT volume.`;
  else if (d2.t3 >= 38 && d1.aD >= 93) summary = `${t2} has a significant 3PT shooting advantage against a defense that allows high 3PT volume.`;
  else if (d1.oR >= 30 && d2.oR < 26)  summary = `${t1} dominates the offensive glass and can extend possessions with second chances.`;
  else if (d2.oR >= 30 && d1.oR < 26)  summary = `${t2} dominates the offensive glass and can extend possessions with second chances.`;
  else if (d1.aD <= 90 && d2.to >= 16) summary = `${t1}'s elite defense creates turnovers that exploit ${t2}'s ball-handling struggles.`;
  else if (d2.aD <= 90 && d1.to >= 16) summary = `${t2}'s elite defense creates turnovers that exploit ${t1}'s ball-handling struggles.`;
  else if (a1.length > a2.length + 1)  summary = `${t1} holds multiple statistical advantages entering this matchup.`;
  else if (a2.length > a1.length + 1)  summary = `${t2} holds multiple statistical advantages entering this matchup.`;
  else                                  summary = "This matchup is statistically competitive with no clear overall edge.";

  return { items, a1, a2, summary };
}

/* ================================================================
   COLOR HELPERS — for sidebar stat display
================================================================ */
export function kpColor(kp: number): string {
  if (kp <= 10) return "text-blue";
  if (kp <= 25) return "text-grn";
  if (kp <= 50) return "text-gld";
  return "text-tx3";
}
export function offColor(v: number): string {
  if (v >= 120) return "text-blue";
  if (v >= 115) return "text-grn";
  return "text-gld";
}
export function defColor(v: number): string {
  if (v <= 88) return "text-blue";
  if (v <= 92) return "text-grn";
  return "text-gld";
}
export function toColor(v: number): string {
  if (v <= 12) return "text-grn";
  if (v >= 16) return "text-red";
  return "text-gld";
}
export function t3Color(v: number): string {
  if (v >= 38) return "text-grn";
  if (v >= 35) return "text-gld";
  return "text-tx2";
}
