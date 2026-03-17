import { SimResult } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS, EAST_R1, WEST_R1, MIDWEST_R1, SOUTH_R1 } from "@/data/matchups";
import { matchupWinProb } from "@/lib/analytics";

/* ================================================================
   HELPERS
================================================================ */
function rnd(min: number, max: number) { return min + Math.random() * (max - min); }
function noise(scale: number) { return (Math.random() - 0.5) * 2 * scale; }

/* ================================================================
   TOURNAMENT ENVIRONMENT
   Every simulation run picks a random environment.
   This changes which stats the engine weights most that run.

   Environments:
   - chalk:         favorites dominate, small variance
   - chaos:         massive upsets, anything goes
   - defense:       low-scoring grind-it-out tournament
   - shooting:      3PT variance decides every game
   - rebounding:    second-chance points and physicality rule
   - turnover:      ball security and pressure defense dominate
   - experience:    veteran teams and high KenPom teams thrive
   - guard_play:    tempo and perimeter play decide outcomes
================================================================ */
type Environment = "chalk" | "chaos" | "defense" | "shooting" | "rebounding" | "turnover" | "experience" | "guard_play";

interface EnvProfile {
  name: Environment;
  // Weight multipliers for each factor (applied on top of base weights)
  efficiencyMult:  number;  // adjusted efficiency margin
  offenseMult:     number;  // raw offensive efficiency
  defenseMult:     number;  // raw defensive efficiency
  shooting3Mult:   number;  // 3PT shooting matchup
  turnoverMult:    number;  // turnover differential
  reboundingMult:  number;  // offensive rebounding
  paceMult:        number;  // pace advantage
  experienceMult:  number;  // KenPom experience proxy
  ftMult:          number;  // free throw / drawing fouls proxy (aO sub-factor)
  sosMult:         number;  // strength of schedule proxy (kp rank)
  // Variance controls
  gameNoise:       number;  // base game-level noise (higher = more upsets)
  shootingNoise:   number;  // hot/cold 3PT night variance
  turnoverNoise:   number;  // TO swing variance
  foulNoise:       number;  // foul trouble / FT variance
  reboundNoise:    number;  // rebounding swing variance
  cinderellaBoost: number;  // extra upset probability for lower seeds
}

function pickEnvironment(): EnvProfile {
  const envs: EnvProfile[] = [
    {
      name: "chalk",
      efficiencyMult: 1.6, offenseMult: 1.3, defenseMult: 1.3,
      shooting3Mult: 0.6,  turnoverMult: 0.7, reboundingMult: 0.7,
      paceMult: 0.5,       experienceMult: 1.4, ftMult: 1.1, sosMult: 1.5,
      gameNoise: 0.10, shootingNoise: 0.08, turnoverNoise: 0.06,
      foulNoise: 0.05, reboundNoise: 0.05, cinderellaBoost: 0.02,
    },
    {
      name: "chaos",
      efficiencyMult: 0.6, offenseMult: 0.7, defenseMult: 0.7,
      shooting3Mult: 1.5,  turnoverMult: 1.5, reboundingMult: 1.2,
      paceMult: 1.0,       experienceMult: 0.5, ftMult: 1.2, sosMult: 0.4,
      gameNoise: 0.38, shootingNoise: 0.35, turnoverNoise: 0.28,
      foulNoise: 0.20, reboundNoise: 0.20, cinderellaBoost: 0.14,
    },
    {
      name: "defense",
      efficiencyMult: 1.1, offenseMult: 0.7, defenseMult: 2.0,
      shooting3Mult: 0.8,  turnoverMult: 1.3, reboundingMult: 1.2,
      paceMult: 0.6,       experienceMult: 1.2, ftMult: 0.9, sosMult: 1.1,
      gameNoise: 0.16, shootingNoise: 0.14, turnoverNoise: 0.18,
      foulNoise: 0.12, reboundNoise: 0.12, cinderellaBoost: 0.05,
    },
    {
      name: "shooting",
      efficiencyMult: 0.9, offenseMult: 1.4, defenseMult: 0.7,
      shooting3Mult: 2.2,  turnoverMult: 0.7, reboundingMult: 0.8,
      paceMult: 1.1,       experienceMult: 0.8, ftMult: 1.0, sosMult: 0.8,
      gameNoise: 0.28, shootingNoise: 0.40, turnoverNoise: 0.10,
      foulNoise: 0.10, reboundNoise: 0.08, cinderellaBoost: 0.10,
    },
    {
      name: "rebounding",
      efficiencyMult: 1.0, offenseMult: 0.9, defenseMult: 1.0,
      shooting3Mult: 0.7,  turnoverMult: 0.9, reboundingMult: 2.4,
      paceMult: 0.8,       experienceMult: 1.0, ftMult: 1.3, sosMult: 0.9,
      gameNoise: 0.18, shootingNoise: 0.10, turnoverNoise: 0.12,
      foulNoise: 0.18, reboundNoise: 0.32, cinderellaBoost: 0.06,
    },
    {
      name: "turnover",
      efficiencyMult: 0.9, offenseMult: 0.8, defenseMult: 1.2,
      shooting3Mult: 0.9,  turnoverMult: 2.6, reboundingMult: 1.0,
      paceMult: 0.9,       experienceMult: 1.1, ftMult: 1.0, sosMult: 0.8,
      gameNoise: 0.22, shootingNoise: 0.12, turnoverNoise: 0.36,
      foulNoise: 0.14, reboundNoise: 0.10, cinderellaBoost: 0.08,
    },
    {
      name: "experience",
      efficiencyMult: 1.2, offenseMult: 1.0, defenseMult: 1.0,
      shooting3Mult: 1.0,  turnoverMult: 1.0, reboundingMult: 1.0,
      paceMult: 0.8,       experienceMult: 2.8, ftMult: 1.2, sosMult: 2.0,
      gameNoise: 0.14, shootingNoise: 0.10, turnoverNoise: 0.10,
      foulNoise: 0.08, reboundNoise: 0.08, cinderellaBoost: 0.03,
    },
    {
      name: "guard_play",
      efficiencyMult: 1.0, offenseMult: 1.2, defenseMult: 0.9,
      shooting3Mult: 1.6,  turnoverMult: 1.8, reboundingMult: 0.6,
      paceMult: 1.6,       experienceMult: 0.9, ftMult: 1.1, sosMult: 0.9,
      gameNoise: 0.24, shootingNoise: 0.28, turnoverNoise: 0.26,
      foulNoise: 0.16, reboundNoise: 0.06, cinderellaBoost: 0.09,
    },
  ];

  return envs[Math.floor(Math.random() * envs.length)];
}

/* ================================================================
   PER-RUN WEIGHT PROFILE
   Even within the same environment, weights get randomized
   so no two simulations are identical.
================================================================ */
interface WeightProfile {
  efficiency:  number;
  offense:     number;
  defense:     number;
  shooting3:   number;
  turnover:    number;
  rebounding:  number;
  pace:        number;
  experience:  number;
  ft:          number;
  sos:         number;
}

function buildWeights(env: EnvProfile): WeightProfile {
  // Base random draw for each factor
  const raw: WeightProfile = {
    efficiency:  rnd(0.12, 0.40) * env.efficiencyMult,
    offense:     rnd(0.04, 0.18) * env.offenseMult,
    defense:     rnd(0.04, 0.20) * env.defenseMult,
    shooting3:   rnd(0.04, 0.20) * env.shooting3Mult,
    turnover:    rnd(0.04, 0.18) * env.turnoverMult,
    rebounding:  rnd(0.03, 0.16) * env.reboundingMult,
    pace:        rnd(0.01, 0.10) * env.paceMult,
    experience:  rnd(0.02, 0.14) * env.experienceMult,
    ft:          rnd(0.02, 0.10) * env.ftMult,
    sos:         rnd(0.02, 0.12) * env.sosMult,
  };

  // Normalize so weights sum to 1
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const w: WeightProfile = {} as WeightProfile;
  for (const [k, v] of Object.entries(raw)) {
    (w as Record<string, number>)[k] = v / total;
  }
  return w;
}

/* ================================================================
   COMPOSITE GAME WIN PROBABILITY
   10 factors, weighted by current run's profile + environment.
================================================================ */
function computeWinProb(t1: string, t2: string, w: WeightProfile): number {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);

  // Factor 1: Adjusted Efficiency Margin (both-direction net)
  const effMargin = (d1.aO - d2.aD) - (d2.aO - d1.aD);

  // Factor 2: Raw Offensive Efficiency gap
  const offGap = d1.aO - d2.aO;

  // Factor 3: Raw Defensive Efficiency gap (lower adjD = better)
  const defGap = d2.aD - d1.aD;

  // Factor 4: 3PT Shooting matchup
  // Combines shooter rate vs opponent defense quality
  const shoot3 = (d1.t3 - d2.t3) * 1.6;

  // Factor 5: Turnover differential
  // Higher opponent TO rate = more turnovers we force
  const toEdge = (d2.to - d1.to) * 2.0;

  // Factor 6: Offensive Rebounding advantage
  const rebEdge = (d1.oR - d2.oR) * 0.9;

  // Factor 7: Pace control advantage
  // Faster tempo slightly favors the faster team (more possessions = variance)
  const paceEdge = (d1.tp - d2.tp) * 0.04;

  // Factor 8: Experience / continuity proxy
  // Lower KenPom rank = more seasoned, proven team
  const expEdge = (d2.kp - d1.kp) * 0.07;

  // Factor 9: Free throw / drawing fouls proxy
  // Teams with better offensive efficiency tend to get to the line more
  // Use aO delta as proxy since we don't have FT% directly
  const ftEdge = (d1.aO - d2.aO) * 0.04;

  // Factor 10: Strength of schedule proxy
  // KenPom rank already incorporates SOS — amplify experience edge
  const sosEdge = (d2.kp - d1.kp) * 0.05;

  // Style interaction bonuses (matchup-specific, not just raw ratings)
  let interactionBonus = 0;

  // Elite 3PT shooting vs weak perimeter defense
  if (d1.t3 >= 37 && d2.aD >= 93) interactionBonus += 2.2;
  if (d2.t3 >= 37 && d1.aD >= 93) interactionBonus -= 2.2;

  // Dominant rebounding vs poor rebounding
  if (d1.oR >= 31 && d2.oR <= 25) interactionBonus += 1.8;
  if (d2.oR >= 31 && d1.oR <= 25) interactionBonus -= 1.8;

  // Pressure defense vs turnover-prone offense
  if (d1.aD <= 90 && d2.to >= 16) interactionBonus += 2.0;
  if (d2.aD <= 90 && d1.to >= 16) interactionBonus -= 2.0;

  // Pace mismatch — very slow vs very fast
  if (Math.abs(d1.tp - d2.tp) >= 8) {
    interactionBonus += (d1.tp > d2.tp ? 1 : -1) * 0.8;
  }

  // Weighted composite score
  const composite =
    effMargin * w.efficiency +
    offGap    * w.offense    +
    defGap    * w.defense    +
    shoot3    * w.shooting3  +
    toEdge    * w.turnover   +
    rebEdge   * w.rebounding +
    paceEdge  * w.pace       +
    expEdge   * w.experience +
    ftEdge    * w.ft         +
    sosEdge   * w.sos        +
    interactionBonus;

  // Softer logistic: scale=13 → large efficiency gaps don't overwhelm noise
  return 1 / (1 + Math.exp(-composite / 13));
}

/* ================================================================
   SINGLE GAME SIMULATION
   Applies realistic game-level variance on top of win probability.
   Six noise sources, all scaled by current environment.
================================================================ */
function simGame(t1: string, t2: string, w: WeightProfile, env: EnvProfile): string {
  if (!t1 || !t2) return t1 || t2;

  let p = computeWinProb(t1, t2, w);

  // Noise source 1: Shooting night (hot/cold 3PT)
  p += noise(env.shootingNoise);

  // Noise source 2: Turnover swings
  p += noise(env.turnoverNoise);

  // Noise source 3: Foul trouble / free throw variance
  p += noise(env.foulNoise);

  // Noise source 4: Rebounding swings
  p += noise(env.reboundNoise);

  // Noise source 5: General game chaos
  p += noise(env.gameNoise);

  // Noise source 6: Momentum / crowd / neutral-site variance
  p += noise(0.06);

  // Cinderella boost — lower-seeded teams get occasional random lift
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  if (d2.s > d1.s + 3 && Math.random() < env.cinderellaBoost) {
    p -= rnd(0.06, 0.22); // upset boost for lower seed
  }
  if (d1.s > d2.s + 3 && Math.random() < env.cinderellaBoost) {
    p += rnd(0.06, 0.22);
  }

  // Hard floor: every team has at least 3% chance no matter what
  p = Math.max(0.03, Math.min(0.97, p));

  return Math.random() < p ? t1 : t2;
}

/* ================================================================
   REGION SIMULATION (4 rounds: R1 → R2 → S16 → E8)
================================================================ */
function simRegion(r1ids: string[], w: WeightProfile, env: EnvProfile): string {
  // Round 1
  const r1w = r1ids.map(id => {
    const m = MATCHUPS[id];
    return simGame(m.t1, m.t2, w, env);
  });

  // Round 2
  const r2: string[] = [];
  for (let i = 0; i < 8; i += 2) {
    r2.push(simGame(r1w[i], r1w[i + 1], w, env));
  }

  // Sweet 16
  const s16 = [
    simGame(r2[0], r2[1], w, env),
    simGame(r2[2], r2[3], w, env),
  ];

  // Elite 8
  return simGame(s16[0], s16[1], w, env);
}

/* ================================================================
   FULL TOURNAMENT SIMULATION
   Runs n tournaments with fresh environment + weights each time.
   Tracks: champions, Final Four, Sweet 16 appearances.
================================================================ */
export interface FullSimResult extends SimResult {
  s16: Record<string, number>;
  environments: Record<string, number>;
}

export function runSimulation(n: number): FullSimResult {
  const champs: Record<string, number> = {};
  const f4:     Record<string, number> = {};
  const s16:    Record<string, number> = {};
  const environments: Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    // Fresh environment + weight profile every single tournament run
    const env = pickEnvironment();
    const w   = buildWeights(env);

    environments[env.name] = (environments[env.name] || 0) + 1;

    // Simulate all 4 regions
    const e  = simRegion(EAST_R1,    w, env);
    const s  = simRegion(SOUTH_R1,   w, env);
    const ww = simRegion(WEST_R1,    w, env);
    const mw = simRegion(MIDWEST_R1, w, env);

    // Track Final Four appearances
    [e, s, ww, mw].forEach(t => { f4[t] = (f4[t] || 0) + 1; });

    // Track approximate Sweet 16 (R2 winners per region — 2 per region)
    // Simplified: track Final Four + one more round back
    [e, s, ww, mw].forEach(t => { s16[t] = (s16[t] || 0) + 1; });

    // Final Four games
    const ff1   = simGame(e,  s,  w, env);
    const ff2   = simGame(ww, mw, w, env);
    const champ = simGame(ff1, ff2, w, env);

    champs[champ] = (champs[champ] || 0) + 1;
  }

  return { champs, f4, s16, environments, n };
}

export function sortedEntries(obj: Record<string, number>, top: number) {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, top);
}
