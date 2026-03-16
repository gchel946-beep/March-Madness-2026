import { SimResult } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS, EAST_R1, WEST_R1, MIDWEST_R1, SOUTH_R1 } from "@/data/matchups";

function rnd(min: number, max: number) { return min + Math.random() * (max - min); }
function noise(v: number) { return (Math.random() - 0.5) * 2 * v; }

function randomWeights() {
  const raw: Record<string,number> = {
    efficiency: rnd(0.15, 0.50),
    offense:    rnd(0.05, 0.25),
    defense:    rnd(0.05, 0.30),
    shooting3:  rnd(0.05, 0.28),
    turnovers:  rnd(0.05, 0.25),
    rebounding: rnd(0.05, 0.22),
    pace:       rnd(0.02, 0.15),
    experience: rnd(0.02, 0.12),
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const w: Record<string,number> = {};
  for (const [k, v] of Object.entries(raw)) w[k] = v / total;
  return w;
}

function gameWinProb(t1: string, t2: string, w: Record<string,number>): number {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  const eff    = (d1.aO - d2.aD) - (d2.aO - d1.aD);
  const off    = d1.aO - d2.aO;
  const def    = d2.aD - d1.aD;
  const shoot3 = (d1.t3 - d2.t3) * 1.5;
  const to     = (d2.to - d1.to) * 1.8;
  const reb    = (d1.oR - d2.oR) * 0.8;
  const pace   = (d1.tp - d2.tp) * 0.04;
  const exp    = (d2.kp - d1.kp) * 0.06;
  const composite =
    eff    * w.efficiency  +
    off    * w.offense     +
    def    * w.defense     +
    shoot3 * w.shooting3   +
    to     * w.turnovers   +
    reb    * w.rebounding  +
    pace   * w.pace        +
    exp    * w.experience;
  return 1 / (1 + Math.exp(-composite / 14));
}

function simGame(t1: string, t2: string, w: Record<string,number>): string {
  if (!t1 || !t2) return t1 || t2;
  let p = gameWinProb(t1, t2, w);
  p += noise(0.25);
  p += noise(0.18);
  p += noise(0.12);
  const d1 = getTeam(t1), d2 = getTeam(t2);
  if (d2.s > d1.s && Math.random() < 0.08) p -= rnd(0.05, 0.20);
  if (d1.s > d2.s && Math.random() < 0.08) p += rnd(0.05, 0.20);
  p = Math.max(0.03, Math.min(0.97, p));
  return Math.random() < p ? t1 : t2;
}

function simRegion(r1ids: string[], w: Record<string,number>): string {
  const r1w = r1ids.map(id => { const m = MATCHUPS[id]; return simGame(m.t1, m.t2, w); });
  const r2: string[] = [];
  for (let i = 0; i < 8; i += 2) r2.push(simGame(r1w[i], r1w[i+1], w));
  const s16 = [simGame(r2[0], r2[1], w), simGame(r2[2], r2[3], w)];
  return simGame(s16[0], s16[1], w);
}

export function runSimulation(n: number): SimResult {
  const champs: Record<string,number> = {};
  const f4:     Record<string,number> = {};
  for (let i = 0; i < n; i++) {
    const w  = randomWeights();
    const e  = simRegion(EAST_R1,    w);
    const s  = simRegion(SOUTH_R1,   w);
    const ww = simRegion(WEST_R1,    w);
    const mw = simRegion(MIDWEST_R1, w);
    [e, s, ww, mw].forEach(t => { f4[t] = (f4[t] || 0) + 1; });
    const ff1   = simGame(e,  s,  w);
    const ff2   = simGame(ww, mw, w);
    const champ = simGame(ff1, ff2, w);
    champs[champ] = (champs[champ] || 0) + 1;
  }
  return { champs, f4, n };
}

export function sortedEntries(obj: Record<string,number>, top: number) {
  return Object.entries(obj).sort(([,a],[,b]) => b-a).slice(0, top);
}
