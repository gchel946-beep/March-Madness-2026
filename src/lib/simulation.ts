import { SimResult } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS, EAST_R1, WEST_R1, MIDWEST_R1, SOUTH_R1 } from "@/data/matchups";
import { winProb } from "@/lib/analytics";

function simGame(t1: string, t2: string): string {
  if (!t1 || !t2) return t1 || t2;
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  const p = winProb(d1, d2);
  const noise = (Math.random() - 0.5) * 0.15;
  const pFinal = Math.max(0.05, Math.min(0.95, p + noise));
  return Math.random() < pFinal ? t1 : t2;
}

function simRegion(r1ids: string[]): string {
  // Round 1
  const r1winners = r1ids.map(id => {
    const m = MATCHUPS[id];
    return simGame(m.t1, m.t2);
  });
  // Round 2
  const r2: string[] = [];
  for (let i = 0; i < 8; i += 2) r2.push(simGame(r1winners[i], r1winners[i + 1]));
  // Sweet 16
  const s16 = [simGame(r2[0], r2[1]), simGame(r2[2], r2[3])];
  // Elite 8
  return simGame(s16[0], s16[1]);
}

export function runSimulation(n: number): SimResult {
  const champs: Record<string, number> = {};
  const f4: Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    const e  = simRegion(EAST_R1);
    const s  = simRegion(SOUTH_R1);
    const w  = simRegion(WEST_R1);
    const mw = simRegion(MIDWEST_R1);

    [e, s, w, mw].forEach(t => { f4[t] = (f4[t] || 0) + 1; });

    const ff1 = simGame(e, s);
    const ff2 = simGame(w, mw);
    const champ = simGame(ff1, ff2);
    champs[champ] = (champs[champ] || 0) + 1;
  }

  return { champs, f4, n };
}

export function sortedEntries(obj: Record<string, number>, top: number) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, top);
}
