import { SimResult } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS, EAST_R1, WEST_R1, MIDWEST_R1, SOUTH_R1 } from "@/data/matchups";

/**
 * Composite win probability using multiple weighted metrics.
 *
 * Weights:
 *  - Adjusted efficiency margin  40% — core KenPom predictor
 *  - 3PT shooting advantage      20% — huge in tournament
 *  - Turnover differential       15% — pressure defense matters in March
 *  - Offensive rebounding edge   15% — second chances
 *  - Pace mismatch penalty       10% — tempo control advantage
 *
 * Scale factor of 12 on the logistic gives a softer curve than 8,
 * meaning even a 10-point efficiency gap only yields ~70% win prob
 * instead of ~85%, leaving room for upsets.
 */
function compositeWinProb(t1: string, t2: string): number {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);

  // Efficiency margin (offense vs opponent defense, both directions)
  const effEdge = (d1.aO - d2.aD) - (d2.aO - d1.aD);

  // 3PT shooting edge (shooter's % minus opponent's allowed %)
  // Positive = t1 shoots better against this defense style
  const shootEdge = (d1.t3 - d2.t3) * 0.8;

  // Turnover edge — lower TO rate is better, so flip sign
  const toEdge = (d2.to - d1.to) * 1.2;

  // Offensive rebounding edge
  const rebEdge = (d1.oR - d2.oR) * 0.6;

  // Pace mismatch — faster team vs slower team gets slight edge on neutral court
  const paceEdge = (d1.tp - d2.tp) * 0.05;

  // Weighted composite
  const composite =
    effEdge   * 0.40 +
    shootEdge * 0.20 +
    toEdge    * 0.15 +
    rebEdge   * 0.15 +
    paceEdge  * 0.10;

  // Softer logistic curve — scale=12 means more competitive games
  return 1 / (1 + Math.exp(-composite / 12));
}

/**
 * Simulate a single game with realistic March Madness variance.
 *
 * Three noise sources:
 *  1. Shooting variance  — hot/cold 3PT nights (±20%)
 *  2. Turnover variance  — pressure/chaos factor (±12%)
 *  3. Pure randomness    — anything can happen (±8%)
 *
 * Total possible swing: ~±40%, which means a 65% favorite
 * can realistically lose to a 35% underdog in any given game.
 */
function simGame(t1: string, t2: string): string {
  if (!t1 || !t2) return t1 || t2;

  let p = compositeWinProb(t1, t2);

  // Shooting variance — mimics hot/cold shooting nights
  const shootNoise = (Math.random() - 0.5) * 0.40;
  // Turnover/chaos variance
  const chaosNoise = (Math.random() - 0.5) * 0.24;
  // Pure luck
  const luckNoise  = (Math.random() - 0.5) * 0.16;

  p = p + shootNoise + chaosNoise + luckNoise;

  // Hard floor/ceiling: even the worst team has 5% chance,
  // even the best team can lose 5% of the time
  p = Math.max(0.05, Math.min(0.95, p));

  return Math.random() < p ? t1 : t2;
}

function simRegion(r1ids: string[]): string {
  // Round 1
  const r1w = r1ids.map(id => {
    const m = MATCHUPS[id];
    return simGame(m.t1, m.t2);
  });
  // Round 2
  const r2: string[] = [];
  for (let i = 0; i < 8; i += 2) r2.push(simGame(r1w[i], r1w[i + 1]));
  // Sweet 16
  const s16 = [simGame(r2[0], r2[1]), simGame(r2[2], r2[3])];
  // Elite 8
  return simGame(s16[0], s16[1]);
}

export function runSimulation(n: number): SimResult {
  const champs: Record<string, number> = {};
  const f4:     Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    const e  = simRegion(EAST_R1);
    const s  = simRegion(SOUTH_R1);
    const w  = simRegion(WEST_R1);
    const mw = simRegion(MIDWEST_R1);

    [e, s, w, mw].forEach(t => { f4[t] = (f4[t] || 0) + 1; });

    const ff1   = simGame(e, s);
    const ff2   = simGame(w, mw);
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
