import { TeamData, AdvResult, AdvItem, UpsetRisk, RiskLevel } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";

export function winProb(d1: TeamData, d2: TeamData): number {
  const netA = d1.aO - d2.aD;
  const netB = d2.aO - d1.aD;
  const margin = netA - netB;
  return 1 / (1 + Math.exp(-margin / 8));
}

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
    { k: "Offense",        v1: d1.aO, v2: d2.aO, higher: true,  thresh: 2 },
    { k: "Defense",        v1: d1.aD, v2: d2.aD, higher: false, thresh: 1.5 },
    { k: "3PT Shooting",   v1: d1.t3, v2: d2.t3, higher: true,  thresh: 1.5 },
    { k: "Ball Security",  v1: d1.to, v2: d2.to, higher: false, thresh: 1 },
    { k: "Off. Rebounding",v1: d1.oR, v2: d2.oR, higher: true,  thresh: 1.5 },
    { k: "Tempo Control",  v1: d1.tp, v2: d2.tp, higher: null,  thresh: 4 },
  ];

  const items: AdvItem[] = [];
  const a1: string[] = [];
  const a2: string[] = [];

  cats.forEach(c => {
    if (c.higher === null) {
      items.push({ cat: c.k, edge: "Neutral", cls: "tied" });
      return;
    }
    const diff = c.v1 - c.v2;
    const win1 = c.higher ? diff > c.thresh : diff < -c.thresh;
    const win2 = c.higher ? diff < -c.thresh : diff > c.thresh;
    if (win1) {
      const m = c.higher ? diff : -diff;
      a1.push(c.k);
      items.push({ cat: c.k, edge: `${t1} +${m.toFixed(1)}`, cls: "t1" });
    } else if (win2) {
      const m = c.higher ? -diff : diff;
      a2.push(c.k);
      items.push({ cat: c.k, edge: `${t2} +${m.toFixed(1)}`, cls: "t2" });
    } else {
      items.push({ cat: c.k, edge: "Even", cls: "tied" });
    }
  });

  let summary = "";
  if (d1.t3 >= 38 && d2.aD >= 93)
    summary = `${t1} has a significant 3PT shooting advantage against a defense that allows high 3PT volume.`;
  else if (d2.t3 >= 38 && d1.aD >= 93)
    summary = `${t2} has a significant 3PT shooting advantage against a defense that allows high 3PT volume.`;
  else if (d1.oR >= 30 && d2.oR < 26)
    summary = `${t1} dominates the offensive glass and can extend possessions.`;
  else if (d2.oR >= 30 && d1.oR < 26)
    summary = `${t2} dominates the offensive glass and can extend possessions.`;
  else if (a1.length > a2.length + 1)
    summary = `${t1} holds multiple statistical advantages entering this matchup.`;
  else if (a2.length > a1.length + 1)
    summary = `${t2} holds multiple statistical advantages entering this matchup.`;
  else
    summary = "This matchup is statistically competitive with no clear overall edge.";

  return { items, a1, a2, summary };
}

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
