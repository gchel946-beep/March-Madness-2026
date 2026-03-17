/**
 * SIMULATION ENGINE — 40+ Factor Multi-Metric Tournament Model
 * =============================================================
 * Uses derived stats (see derived.ts) across 10 statistical categories.
 * Each simulation run gets a randomized environment + weight profile.
 * Game-level variance comes from 6 independent noise sources.
 */

import { SimResult } from "@/types";
import { getTeam } from "@/data/teams";
import { deriveStats, ExtendedStats } from "@/lib/derived";
import { MATCHUPS, EAST_R1, WEST_R1, MIDWEST_R1, SOUTH_R1, FIRST_FOUR } from "@/data/matchups";

function rnd(min: number, max: number) { return min + Math.random() * (max - min); }
function noise(scale: number) { return (Math.random() - 0.5) * 2 * scale; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/* ================================================================
   TOURNAMENT ENVIRONMENTS
   8 distinct environments, each changing how categories are weighted.
================================================================ */
export type Environment =
  | "balanced"
  | "chalk"
  | "chaos"
  | "defense"
  | "shooting"
  | "rebounding"
  | "turnover"
  | "experience"
  | "guard_play"
  | "interior";

export const ENV_META: Record<Environment, { label: string; desc: string; color: string }> = {
  balanced:   { label:"Balanced",    desc:"All factors weighted evenly — typical tournament",      color:"text-blue" },
  chalk:      { label:"Chalk",       desc:"Favorites dominate, low variance",                     color:"text-blue" },
  chaos:      { label:"Chaos",       desc:"Massive upsets, anything can happen",                  color:"text-red" },
  defense:    { label:"Defense",     desc:"Low-scoring grind — defense decides every game",       color:"text-grn" },
  shooting:   { label:"Shooting",    desc:"3PT variance rules — hot teams go deep",                color:"text-gld" },
  rebounding: { label:"Rebounding",  desc:"Second chance points and physicality dominate",        color:"text-purple" },
  turnover:   { label:"Turnover",    desc:"Ball security and pressure defense decide outcomes",   color:"text-red" },
  experience: { label:"Experience",  desc:"Veteran programs and coaches win in March",             color:"text-blue" },
  guard_play: { label:"Guard Play",  desc:"Perimeter play and tempo control everything",          color:"text-gld" },
  interior:   { label:"Interior",    desc:"Paint scoring, rim protection, and post play rule",    color:"text-grn" },
};

interface EnvWeights {
  // Each number is a multiplier on the base random weight draw
  efficiency:   number;
  shooting:     number;
  shootingVar:  number;
  turnovers:    number;
  rebounding:   number;
  freeThrow:    number;
  interior:     number;
  pace:         number;
  sos:          number;
  experience:   number;
  // Variance controls
  baseNoise:    number;  // Game-level randomness
  shotNoise:    number;  // Hot/cold shooting night
  toNoise:      number;  // Turnover swings
  foulNoise:    number;  // Foul trouble variance
  rebNoise:     number;  // Rebounding swings
  cinderella:   number;  // Upset boost for lower seeds
  scaleFactor:  number;  // Logistic curve scale (higher = flatter/more upsets)
}

const ENV_WEIGHTS: Record<Environment, EnvWeights> = {
  balanced: {
    efficiency:1.0, shooting:1.0, shootingVar:1.0, turnovers:1.0, rebounding:1.0,
    freeThrow:1.0, interior:1.0, pace:1.0, sos:1.0, experience:1.0,
    baseNoise:0.18, shotNoise:0.20, toNoise:0.14, foulNoise:0.10, rebNoise:0.12,
    cinderella:0.06, scaleFactor:12,
  },
  chalk: {
    efficiency:2.0, shooting:0.8, shootingVar:0.4, turnovers:0.7, rebounding:0.7,
    freeThrow:0.9, interior:1.0, pace:0.5, sos:1.8, experience:1.6,
    baseNoise:0.08, shotNoise:0.07, toNoise:0.06, foulNoise:0.04, rebNoise:0.05,
    cinderella:0.02, scaleFactor:8,
  },
  chaos: {
    efficiency:0.5, shooting:1.2, shootingVar:2.5, turnovers:1.8, rebounding:1.2,
    freeThrow:1.2, interior:0.8, pace:1.1, sos:0.3, experience:0.4,
    baseNoise:0.40, shotNoise:0.45, toNoise:0.32, foulNoise:0.24, rebNoise:0.22,
    cinderella:0.18, scaleFactor:18,
  },
  defense: {
    efficiency:1.2, shooting:0.6, shootingVar:0.7, turnovers:1.4, rebounding:1.3,
    freeThrow:1.1, interior:1.4, pace:0.6, sos:1.2, experience:1.3,
    baseNoise:0.14, shotNoise:0.12, toNoise:0.20, foulNoise:0.16, rebNoise:0.14,
    cinderella:0.04, scaleFactor:10,
  },
  shooting: {
    efficiency:0.8, shooting:2.4, shootingVar:2.8, turnovers:0.6, rebounding:0.7,
    freeThrow:0.9, interior:0.6, pace:1.2, sos:0.7, experience:0.7,
    baseNoise:0.26, shotNoise:0.50, toNoise:0.08, foulNoise:0.08, rebNoise:0.07,
    cinderella:0.12, scaleFactor:16,
  },
  rebounding: {
    efficiency:0.9, shooting:0.7, shootingVar:0.7, turnovers:0.8, rebounding:2.8,
    freeThrow:1.5, interior:2.0, pace:0.7, sos:0.9, experience:1.1,
    baseNoise:0.16, shotNoise:0.10, toNoise:0.10, foulNoise:0.22, rebNoise:0.36,
    cinderella:0.05, scaleFactor:11,
  },
  turnover: {
    efficiency:0.8, shooting:0.8, shootingVar:0.9, turnovers:3.0, rebounding:0.9,
    freeThrow:1.0, interior:0.8, pace:1.0, sos:0.7, experience:1.1,
    baseNoise:0.20, shotNoise:0.10, toNoise:0.42, foulNoise:0.12, rebNoise:0.10,
    cinderella:0.08, scaleFactor:13,
  },
  experience: {
    efficiency:1.2, shooting:0.9, shootingVar:0.6, turnovers:1.0, rebounding:1.0,
    freeThrow:1.2, interior:1.1, pace:0.8, sos:2.2, experience:3.2,
    baseNoise:0.12, shotNoise:0.08, toNoise:0.08, foulNoise:0.07, rebNoise:0.08,
    cinderella:0.03, scaleFactor:9,
  },
  guard_play: {
    efficiency:0.9, shooting:1.8, shootingVar:1.8, turnovers:2.0, rebounding:0.5,
    freeThrow:1.1, interior:0.5, pace:1.8, sos:0.9, experience:0.9,
    baseNoise:0.22, shotNoise:0.32, toNoise:0.28, foulNoise:0.14, rebNoise:0.06,
    cinderella:0.10, scaleFactor:14,
  },
  interior: {
    efficiency:1.0, shooting:0.6, shootingVar:0.7, turnovers:0.9, rebounding:2.0,
    freeThrow:1.8, interior:3.0, pace:0.7, sos:1.0, experience:1.2,
    baseNoise:0.15, shotNoise:0.08, toNoise:0.10, foulNoise:0.26, rebNoise:0.24,
    cinderella:0.04, scaleFactor:10,
  },
};

function pickEnvironment(): Environment {
  const envs = Object.keys(ENV_WEIGHTS) as Environment[];
  return envs[Math.floor(Math.random() * envs.length)];
}

/* ================================================================
   WEIGHT PROFILE
   10 category weights, drawn randomly within env-modified ranges,
   normalized to sum to 1.
================================================================ */
interface CategoryWeights {
  efficiency:   number;
  shooting:     number;
  shootingVar:  number;
  turnovers:    number;
  rebounding:   number;
  freeThrow:    number;
  interior:     number;
  pace:         number;
  sos:          number;
  experience:   number;
}

// Target weight ranges per category (before env multiplier)
const BASE_RANGES: Record<keyof CategoryWeights, [number, number]> = {
  efficiency:  [0.14, 0.28],
  shooting:    [0.08, 0.18],
  shootingVar: [0.05, 0.12],
  turnovers:   [0.06, 0.12],
  rebounding:  [0.06, 0.12],
  freeThrow:   [0.04, 0.10],
  interior:    [0.04, 0.10],
  pace:        [0.03, 0.08],
  sos:         [0.03, 0.07],
  experience:  [0.03, 0.07],
};

function buildWeights(env: EnvWeights): CategoryWeights {
  const raw: Record<string, number> = {};
  for (const [cat, [lo, hi]] of Object.entries(BASE_RANGES)) {
    const mult = (env as unknown as Record<string, number>)[cat] ?? 1;
    raw[cat] = rnd(lo, hi) * mult;
  }
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const w: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) w[k] = v / total;
  return w as unknown as CategoryWeights;
}

/* ================================================================
   CATEGORY SCORES
   Each category returns a signed score: positive = t1 advantage.
   All inputs are ExtendedStats.
================================================================ */

function scoreEfficiency(a: ExtendedStats, b: ExtendedStats): number {
  // Adjusted efficiency margin (both directions)
  const netMargin = (a.aO - b.aD) - (b.aO - a.aD);
  // Net rating gap
  const netGap = a.netRating - b.netRating;
  // Combine
  return netMargin * 0.7 + netGap * 0.3;
}

function scoreShooting(a: ExtendedStats, b: ExtendedStats): number {
  // eFG% gap × 50 (so 2% gap = 1 point)
  const eFGgap  = (a.eFGpct - b.eFGpct) * 50;
  // TS% gap
  const tsgap   = (a.tsPct  - b.tsPct)  * 40;
  // 3PT% vs opponent 3PT defense (style interaction)
  const shoot3  = (a.threePct - b.opp3Pct) - (b.threePct - a.opp3Pct);
  return eFGgap * 0.4 + tsgap * 0.3 + shoot3 * 0.3;
}

function scoreShootingVariance(a: ExtendedStats, b: ExtendedStats): number {
  // Teams with higher 3PT attempt rates have more variance
  // In shooting environments this is a bigger factor
  const arGap    = (a.threeAR - b.threeAR) * 10;
  // Opponent 3PT defense quality
  const oppDef3  = (b.opp3Pct - a.opp3Pct) * 2;  // higher = worse defense
  return arGap * 0.5 + oppDef3 * 0.5;
}

function scoreTurnovers(a: ExtendedStats, b: ExtendedStats): number {
  // Direct TO rate (lower is better — flip sign)
  const toRateEdge = (b.toRate - a.toRate) * 1.5;
  // Defensive TO forcing
  const defTOedge  = (a.defTOrate - b.defTOrate) * 1.2;
  // TO margin
  const marginEdge = (a.toMargin - b.toMargin) * 0.8;
  // Steal rate edge
  const stealEdge  = (a.stealRate - b.stealRate) * 0.5;
  return toRateEdge + defTOedge + marginEdge + stealEdge;
}

function scoreRebounding(a: ExtendedStats, b: ExtendedStats): number {
  // Offensive rebounding vs opponent defensive rebounding
  const oRebEdge = (a.oRebPct - b.oppORebPct) - (b.oRebPct - a.oppORebPct);
  // Total rebound % gap
  const totEdge  = (a.totRebPct - b.totRebPct) * 0.5;
  // Second chance points
  const scEdge   = (a.secondChancePts - b.secondChancePts) * 0.8;
  return oRebEdge * 0.5 + totEdge * 0.3 + scEdge * 0.2;
}

function scoreFreeThrow(a: ExtendedStats, b: ExtendedStats): number {
  // FT rate advantage (getting to the line)
  const ftRateEdge = (a.ftRate - b.ftRate) * 15;
  // FT% gap
  const ftPctEdge  = (a.ftPct  - b.ftPct)  * 10;
  // Drawing fouls vs opponent foul discipline
  const foulEdge   = (b.oppFoulRate - a.oppFoulRate) * 10;
  return ftRateEdge * 0.4 + ftPctEdge * 0.3 + foulEdge * 0.3;
}

function scoreInterior(a: ExtendedStats, b: ExtendedStats): number {
  // Rim finishing vs opponent rim defense
  const rimEdge    = (a.rimFinish - b.oppRimFG) - (b.rimFinish - a.oppRimFG);
  // Block rate (rejection vs getting blocked)
  const blockEdge  = (a.blockRate - b.oppBlockRate) * 0.3;
  // Paint points per possession
  const paintEdge  = (a.paintPts - b.paintPts) * 2;
  return rimEdge * 10 + blockEdge + paintEdge;
}

function scorePace(a: ExtendedStats, b: ExtendedStats): number {
  // Tempo mismatch: faster team imposes pace
  const paceEdge = (a.tempo - b.tempo) * 0.04;
  // Transition frequency advantage
  const transEdge = (a.transitionFreq - b.transitionFreq) * 5;
  // Halfcourt efficiency when game slows
  const hcEdge   = (a.halfcourtEff - b.halfcourtEff) * 3;
  return paceEdge + transEdge * 0.4 + hcEdge * 0.4;
}

function scoreSOS(a: ExtendedStats, b: ExtendedStats): number {
  // Strength of schedule gap
  const sosEdge = (a.sos - b.sos) * 0.06;
  // Win % vs quality opponents
  const top25Edge = (a.recVsTop25 - b.recVsTop25) * 4;
  const top50Edge = (a.recVsTop50 - b.recVsTop50) * 2;
  return sosEdge + top25Edge * 0.5 + top50Edge * 0.3;
}

function scoreExperience(a: ExtendedStats, b: ExtendedStats): number {
  // Overall experience edge
  const expEdge       = (a.experience - b.experience) * 0.06;
  // Roster continuity
  const contEdge      = (a.rosterContinuity - b.rosterContinuity) * 0.04;
  // Coaching quality
  const coachEdge     = (a.coachingEdge - b.coachingEdge) * 0.05;
  // Close game record
  const clutchEdge    = (a.closeGameRecord - b.closeGameRecord) * 6;
  // Neutral site performance
  const neutralEdge   = (a.neutralSitePerf - b.neutralSitePerf) * 4;
  return expEdge + contEdge + coachEdge + clutchEdge * 0.3 + neutralEdge * 0.2;
}

/* ================================================================
   MATCHUP INTERACTION BONUSES
   Style vs style effects that override pure category scores.
   These fire on top of the weighted composite.
================================================================ */
function matchupInteractionBonus(a: ExtendedStats, b: ExtendedStats): number {
  let bonus = 0;

  // 1. Elite 3PT shooting vs weak perimeter defense
  if (a.threePct >= 37 && b.opp3Pct >= 35)   bonus += 2.0;
  if (b.threePct >= 37 && a.opp3Pct >= 35)   bonus -= 2.0;

  // 2. High 3PT attempt rate vs poor perimeter D (amplifies variance)
  if (a.threeAR >= 0.38 && b.opp3Pct >= 34)  bonus += 1.2;
  if (b.threeAR >= 0.38 && a.opp3Pct >= 34)  bonus -= 1.2;

  // 3. Dominant offensive rebounding vs poor defensive rebounding
  if (a.oRebPct >= 32 && b.dRebPct <= 68)    bonus += 1.8;
  if (b.oRebPct >= 32 && a.dRebPct <= 68)    bonus -= 1.8;

  // 4. Pressure defense vs turnover-prone offense
  if (a.defTOrate >= 20 && b.toRate >= 16)    bonus += 2.2;
  if (b.defTOrate >= 20 && a.toRate >= 16)    bonus -= 2.2;

  // 5. Interior scoring vs rim protection
  if (a.rimFinish >= 0.65 && b.blockRate >= 10) bonus -= 1.0; // blocked
  if (b.rimFinish >= 0.65 && a.blockRate >= 10) bonus += 1.0;

  // 6. Fast tempo vs slow tempo (pace imposition)
  if (a.tempo >= 75 && b.tempo <= 64)         bonus += 1.5;
  if (b.tempo >= 75 && a.tempo <= 64)         bonus -= 1.5;

  // 7. Free throw reliant vs foul-prone defense
  if (a.ftRate >= 0.35 && b.oppFoulRate >= 0.28) bonus += 1.3;
  if (b.ftRate >= 0.35 && a.oppFoulRate >= 0.28) bonus -= 1.3;

  // 8. Elite defense vs high-variance shooting team
  if (a.aD <= 89 && b.shotVariance >= 0.7)    bonus += 1.5;
  if (b.aD <= 89 && a.shotVariance >= 0.7)    bonus -= 1.5;

  // 9. Experience advantage in close games
  if (a.experience >= 70 && b.experience <= 40) bonus += 1.0;
  if (b.experience >= 70 && a.experience <= 40) bonus -= 1.0;

  // 10. High assist rate vs disruptive defense (well-run offense vs chaos)
  if (a.assistRate >= 0.60 && b.stealRate >= 11) bonus -= 0.8;
  if (b.assistRate >= 0.60 && a.stealRate >= 11) bonus += 0.8;

  return bonus;
}

/* ================================================================
   SEED QUALITY BONUS
   Gives better seeds a small systematic edge — calibrated to
   match Kalshi/prediction market odds where 1-2 seeds hold
   ~60-70% of total championship probability.

   Scale: seed 1 = +3.0 bonus, seed 4 = +1.2, seed 8 = 0,
          seed 12 = -1.0, seed 16 = -2.5
   Net effect per game: ~3-5% extra win probability for 1-seeds
   vs 16-seeds on top of the efficiency model. Compounding over
   6 games is what drives the realistic Final Four distribution.
================================================================ */
function seedQualityBonus(kp1: number, seed1: number, kp2: number, seed2: number): number {
  // Seed-based component (lower seed number = better = positive)
  const seedEdge = (seed2 - seed1) * 0.18;

  // KenPom rank component (lower rank = better = positive)
  // Scale so a #1 vs #100 gap adds ~2.0 points
  const kpEdge = (kp2 - kp1) * 0.022;

  // Combined — cap at ±3.5 so it can't fully override a bad matchup
  return Math.max(-3.5, Math.min(3.5, seedEdge + kpEdge));
}

/* ================================================================
   COMPOSITE WIN PROBABILITY
   Combines all 10 category scores using current weight profile,
   plus seed quality bonus for market-calibrated title odds.
================================================================ */
function computeWinProb(
  t1: string,
  t2: string,
  w: CategoryWeights,
  env: EnvWeights
): number {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  const s1 = deriveStats(d1);
  const s2 = deriveStats(d2);

  const composite =
    scoreEfficiency(s1, s2)      * w.efficiency   +
    scoreShooting(s1, s2)        * w.shooting      +
    scoreShootingVariance(s1, s2)* w.shootingVar   +
    scoreTurnovers(s1, s2)       * w.turnovers     +
    scoreRebounding(s1, s2)      * w.rebounding    +
    scoreFreeThrow(s1, s2)       * w.freeThrow     +
    scoreInterior(s1, s2)        * w.interior      +
    scorePace(s1, s2)            * w.pace          +
    scoreSOS(s1, s2)             * w.sos           +
    scoreExperience(s1, s2)      * w.experience    +
    matchupInteractionBonus(s1, s2) +
    seedQualityBonus(d1.kp, d1.s, d2.kp, d2.s);

  return 1 / (1 + Math.exp(-composite / env.scaleFactor));
}

/* ================================================================
   SINGLE GAME SIMULATION
   6 independent noise sources calibrated to environment.
================================================================ */
function simGame(
  t1: string,
  t2: string,
  w: CategoryWeights,
  env: EnvWeights
): string {
  if (!t1 || !t2) return t1 || t2;

  let p = computeWinProb(t1, t2, w, env);

  // Noise source 1: Shooting night (hot/cold 3PT)
  p += noise(env.shotNoise);

  // Noise source 2: Turnover swings
  p += noise(env.toNoise);

  // Noise source 3: Foul trouble / free throw variance
  p += noise(env.foulNoise);

  // Noise source 4: Rebounding swings
  p += noise(env.rebNoise);

  // Noise source 5: General game chaos / momentum
  p += noise(env.baseNoise);

  // Noise source 6: Neutral-site crowd / officiating variance
  p += noise(0.05);

  // Cinderella factor: lower seeds get random upset boost
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  if (d2.s > d1.s + 3 && Math.random() < env.cinderella) {
    p -= rnd(0.04, 0.20); // underdog boost
  }
  if (d1.s > d2.s + 3 && Math.random() < env.cinderella) {
    p += rnd(0.04, 0.20);
  }

  // Hard floor: every team has at least 3% chance
  p = clamp(p, 0.03, 0.97);

  return Math.random() < p ? t1 : t2;
}

/* ================================================================
   REGION SIMULATION (4 rounds)
   resolvedR1 maps r1id → [t1,t2] overrides (for First Four winners)
================================================================ */
function simRegion(
  r1ids: string[],
  w: CategoryWeights,
  env: EnvWeights,
  resolvedR1?: Record<string, [string, string]>
): { winner: string; r2: string[]; s16: string[] } {
  // Round 1 — use resolved teams if provided (handles FF4 placeholders)
  const r1w = r1ids.map(id => {
    if (resolvedR1 && resolvedR1[id]) {
      const [t1, t2] = resolvedR1[id];
      if (t1 && t2 && !t1.includes("/") && !t2.includes("/")) {
        return simGame(t1, t2, w, env);
      }
    }
    const m = MATCHUPS[id];
    // Skip games with placeholder teams (unresolved FF4)
    if (!m.t1 || !m.t2 || m.t2 === "FF4-Winner") return m.t1 || "";
    return simGame(m.t1, m.t2, w, env);
  });

  // Round 2
  const r2: string[] = [];
  for (let i = 0; i < 8; i += 2) r2.push(simGame(r1w[i], r1w[i + 1], w, env));

  // Sweet 16
  const s16 = [
    simGame(r2[0], r2[1], w, env),
    simGame(r2[2], r2[3], w, env),
  ];

  // Elite 8
  const winner = simGame(s16[0], s16[1], w, env);

  return { winner, r2, s16 };
}

/* ================================================================
   BUILD FIRST FOUR RESOLVED MAP
   Simulates all 4 First Four games and returns a map of
   r1id → [t1, t2] with winners substituted in.
================================================================ */
function resolveFF4ForSim(
  w: CategoryWeights,
  env: EnvWeights,
  userPicks?: Record<string, string>
): Record<string, [string, string]> {
  const resolved: Record<string, [string, string]> = {};
  FIRST_FOUR.forEach(g => {
    // Use user's pick if available, otherwise simulate the game
    const winner = userPicks?.[g.id] ?? simGame(g.t1, g.t2, w, env);
    const m = MATCHUPS[g.targetsR1];
    if (!m) return;
    const t1 = g.targetsPos === "t1" ? winner : m.t1;
    const t2 = g.targetsPos === "t2" ? winner : m.t1;
    // Reconstruct the full matchup with winner in the right slot
    resolved[g.targetsR1] = [
      g.targetsPos === "t1" ? winner : m.t1,
      g.targetsPos === "t2" ? winner : m.t2,
    ];
  });
  return resolved;
}

/* ================================================================
   FULL TOURNAMENT SIMULATION
================================================================ */
export interface FullSimResult extends SimResult {
  s16:          Record<string, number>;
  environments: Record<string, number>;
  upsetFreq:    number;
}

export function runSimulation(n: number, userPicks?: Record<string, string>): FullSimResult {
  const champs: Record<string, number> = {};
  const f4:     Record<string, number> = {};
  const s16c:   Record<string, number> = {};
  const envCnt: Record<string, number> = {};
  let totalUpsets = 0;
  let totalR1Games = 0;

  for (let i = 0; i < n; i++) {
    const envName = pickEnvironment();
    const envW    = ENV_WEIGHTS[envName];
    const w       = buildWeights(envW);

    envCnt[envName] = (envCnt[envName] || 0) + 1;

    // Simulate First Four games first, respect user picks where made
    const resolvedR1 = resolveFF4ForSim(w, envW, userPicks);

    const eR  = simRegion(EAST_R1,    w, envW, resolvedR1);
    const sR  = simRegion(SOUTH_R1,   w, envW, resolvedR1);
    const wR  = simRegion(WEST_R1,    w, envW, resolvedR1);
    const mwR = simRegion(MIDWEST_R1, w, envW, resolvedR1);

    // Track Final Four
    [eR.winner, sR.winner, wR.winner, mwR.winner].forEach(t => {
      if (t) f4[t] = (f4[t] || 0) + 1;
    });

    // Track Sweet 16
    [...eR.s16, ...sR.s16, ...wR.s16, ...mwR.s16].forEach(t => {
      if (t) s16c[t] = (s16c[t] || 0) + 1;
    });

    // Count R1 upsets
    const allR1 = [...EAST_R1, ...SOUTH_R1, ...WEST_R1, ...MIDWEST_R1];
    for (const id of allR1) {
      const teams = resolvedR1[id] ?? [MATCHUPS[id]?.t1 ?? "", MATCHUPS[id]?.t2 ?? ""];
      const [t1, t2] = teams;
      if (!t1 || !t2 || t1.includes("/") || t2.includes("/")) continue;
      const winner2 = simGame(t1, t2, w, envW);
      totalR1Games++;
      const d1 = getTeam(t1), d2 = getTeam(t2);
      if ((winner2 === t1 && d1.s > d2.s) || (winner2 === t2 && d2.s > d1.s)) {
        totalUpsets++;
      }
    }

    const ff1   = simGame(eR.winner,  sR.winner,  w, envW);
    const ff2   = simGame(wR.winner,  mwR.winner, w, envW);
    const champ = simGame(ff1, ff2, w, envW);

    if (champ) champs[champ] = (champs[champ] || 0) + 1;
  }

  const upsetFreq = totalR1Games > 0 ? totalUpsets / totalR1Games : 0;
  return { champs, f4, s16: s16c, environments: envCnt, upsetFreq, n };
}

/* ================================================================
   SINGLE GAME ANALYSIS — used by sidebar for live matchup data
================================================================ */
export function analyzeMatchup(t1: string, t2: string): {
  winProb: number;
  upsetProb: number;
  keyEdges: { cat: string; team: string; edge: string }[];
  summary: string;
} {
  const s1 = deriveStats(getTeam(t1));
  const s2 = deriveStats(getTeam(t2));

  // Use balanced environment for display
  const w = buildWeights(ENV_WEIGHTS.balanced);
  const env = ENV_WEIGHTS.balanced;

  const winP = computeWinProb(t1, t2, w, env);
  const upsetP = winP < 0.5 ? winP : 1 - winP;

  // Calculate individual category scores for edge display
  const catScores: { cat: string; score: number }[] = [
    { cat: "Efficiency",     score: scoreEfficiency(s1, s2) },
    { cat: "Shooting",       score: scoreShooting(s1, s2) },
    { cat: "Shot Variance",  score: scoreShootingVariance(s1, s2) },
    { cat: "Turnovers",      score: scoreTurnovers(s1, s2) },
    { cat: "Rebounding",     score: scoreRebounding(s1, s2) },
    { cat: "Free Throws",    score: scoreFreeThrow(s1, s2) },
    { cat: "Interior",       score: scoreInterior(s1, s2) },
    { cat: "Pace",           score: scorePace(s1, s2) },
    { cat: "Schedule",       score: scoreSOS(s1, s2) },
    { cat: "Experience",     score: scoreExperience(s1, s2) },
  ];

  const keyEdges = catScores
    .filter(c => Math.abs(c.score) > 0.5)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 5)
    .map(c => ({
      cat:  c.cat,
      team: c.score > 0 ? t1 : t2,
      edge: `+${Math.abs(c.score).toFixed(1)}`,
    }));

  // Generate summary text
  const favored   = winP >= 0.5 ? t1 : t2;
  const underdog  = winP >= 0.5 ? t2 : t1;
  const pct       = Math.round(Math.max(winP, 1 - winP) * 100);
  const topEdge   = keyEdges[0];

  let summary = `${favored} is favored at ${pct}% based on a 10-factor composite model.`;
  if (topEdge) summary += ` The biggest advantage is ${topEdge.cat.toLowerCase()} (${topEdge.team} leads).`;

  // Add style interaction note if relevant
  if (s1.threePct >= 37 && s2.opp3Pct >= 35)
    summary += ` ${t1}'s elite 3PT shooting exploits ${t2}'s soft perimeter defense.`;
  else if (s2.threePct >= 37 && s1.opp3Pct >= 35)
    summary += ` ${t2}'s elite 3PT shooting exploits ${t1}'s soft perimeter defense.`;
  else if (s1.oRebPct >= 32 && s2.dRebPct <= 68)
    summary += ` ${t1} dominates the glass against a team that struggles to box out.`;
  else if (s2.oRebPct >= 32 && s1.dRebPct <= 68)
    summary += ` ${t2} dominates the glass against a team that struggles to box out.`;

  return { winProb: winP, upsetProb: upsetP, keyEdges, summary };
}

export function sortedEntries(obj: Record<string, number>, top: number) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, top);
}
