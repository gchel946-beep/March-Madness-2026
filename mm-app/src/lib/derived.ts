/**
 * DERIVED STATS ENGINE
 * =====================
 * Takes base TeamData (8 known stats) and derives ~40 basketball factors
 * using real statistical relationships between basketball metrics.
 *
 * Derivation philosophy:
 * - aO (adj offense 100–130) correlates with eFG%, TS%, FG%
 * - aD (adj defense 84–106) correlates with opp FG%, opp 3PT allowed
 * - t3 (3PT%) directly known
 * - to (TO rate %) directly known
 * - oR (oReb %) directly known
 * - tp (tempo) directly known
 * - kp (KenPom rank 1–250) proxies SOS, experience, quality
 * - s  (seed 1–16) proxies tournament experience, elite program status
 *
 * All derived values are calibrated to realistic NCAA tournament ranges.
 */

import { TeamData } from "@/types";

export interface ExtendedStats {
  // === BASE (directly from TeamData) ===
  aO: number;           // Adjusted offensive efficiency
  aD: number;           // Adjusted defensive efficiency
  t3: number;           // 3PT %
  to: number;           // Offensive turnover rate
  oR: number;           // Offensive rebound %
  tp: number;           // Tempo (possessions/game)
  kp: number;           // KenPom rank
  s:  number;           // Seed

  // === EFFICIENCY ===
  effMargin: number;    // aO - aD (net efficiency)
  offRating: number;    // Points scored per 100 possessions (≈ aO)
  defRating: number;    // Points allowed per 100 possessions (≈ aD)
  netRating: number;    // offRating - defRating

  // === SHOOTING EFFICIENCY ===
  eFGpct: number;       // Effective FG % (weights 3s higher)
  tsPct: number;        // True shooting % (includes FTs)
  fgPct: number;        // Overall FG %
  twoPct: number;       // 2PT FG %
  threePct: number;     // 3PT % (= t3, repeated for clarity)

  // === SHOOTING VOLUME & VARIANCE ===
  threeAR: number;      // 3PT attempt rate (% of shots that are 3s)
  twoAR: number;        // 2PT attempt rate
  opp3Pct: number;      // Opponent 3PT % allowed
  opp2Pct: number;      // Opponent 2PT % allowed
  shotVariance: number; // Shooting variance proxy (high 3AR = high variance)

  // === SHOT QUALITY ===
  rimRate: number;      // % of shots at rim
  midRate: number;      // % of shots from midrange
  assistRate: number;   // % of baskets that are assisted
  avgShotDist: number;  // Average shot distance (feet)

  // === TURNOVERS ===
  toRate: number;       // Offensive TO rate (= to, repeated)
  defTOrate: number;    // Defensive TO rate forced (steal proxy)
  toMargin: number;     // TO margin (their TO rate - opp TO rate)
  stealRate: number;    // Steal rate proxy

  // === REBOUNDING ===
  oRebPct: number;      // Offensive rebound % (= oR)
  dRebPct: number;      // Defensive rebound % (derived)
  totRebPct: number;    // Total rebound %
  secondChancePts: number; // Second chance points per game proxy
  oppORebPct: number;   // Opponent offensive rebound rate allowed

  // === FREE THROWS ===
  ftRate: number;       // FTA/FGA (free throw rate)
  ftPct: number;        // Free throw %
  oppFoulRate: number;  // How often opponent fouls them
  ftaAllowed: number;   // Free throw attempts allowed (defensive discipline)

  // === INTERIOR & RIM PROTECTION ===
  rimFinish: number;    // Rim finishing % (layup/dunk %)
  blockRate: number;    // Block rate
  oppBlockRate: number; // Block rate allowed (can they finish at rim?)
  paintPts: number;     // Paint points per possession proxy
  oppRimFG: number;     // Opponent rim FG % allowed

  // === PACE & GAME FLOW ===
  tempo: number;        // Possessions per game (= tp)
  transitionFreq: number; // Transition scoring frequency
  halfcourtEff: number;   // Halfcourt scoring efficiency
  possPerGame: number;    // Total possessions per game

  // === DEFENSIVE STRUCTURE ===
  ptsAllowedPer100: number; // = aD
  oppEFGpct: number;     // Opponent eFG % allowed
  oppAssistRate: number; // Opponent assist rate (forces tough shots?)

  // === STRENGTH OF COMPETITION ===
  sos: number;           // Strength of schedule (derived from kp)
  recVsTop25: number;    // Win % vs top-25 proxy
  recVsTop50: number;    // Win % vs top-50 proxy

  // === EXPERIENCE & ROSTER ===
  experience: number;    // Overall experience score (0–100)
  rosterContinuity: number; // Returning minutes % proxy
  upperclassPct: number; // % of minutes from upperclassmen proxy
  coachingEdge: number;  // Coaching quality proxy

  // === CLUTCH / PERFORMANCE ===
  closeGameRecord: number; // Win % in close games proxy
  neutralSitePerf: number; // Neutral site performance proxy
}

/**
 * Derive all 40+ extended stats from base TeamData.
 * Uses basketball statistical relationships calibrated to NCAA tournament data.
 */
export function deriveStats(d: TeamData): ExtendedStats {
  const { aO, aD, t3, to, oR, tp, kp, s } = d;

  // ── EFFICIENCY ──────────────────────────────────────────────
  const effMargin = aO - aD;
  const offRating = aO;
  const defRating = aD;
  const netRating = effMargin;

  // ── SHOOTING EFFICIENCY ────────────────────────────────────
  // eFG% correlates strongly with aO. Tournament teams: 48–58%
  // aO 125 → eFG ~57%, aO 105 → eFG ~48%
  const eFGpct = 0.48 + (aO - 105) * 0.0045;

  // True shooting adds FT contribution (~3-4% above eFG for most teams)
  const tsPct = eFGpct + 0.033 + (aO - 115) * 0.001;

  // Overall FG% slightly below eFG% due to 3PT weighting
  const fgPct = eFGpct - (t3 - 35) * 0.002;

  // 2PT% derives from aO + adjusted for 3PT tendency
  // High-3PT teams attempt easier 3s, medium 2PT%
  const twoPct = 0.50 + (aO - 115) * 0.003 - (t3 - 35) * 0.002;

  const threePct = t3;

  // ── SHOOTING VOLUME & VARIANCE ─────────────────────────────
  // 3PT attempt rate: high t3 teams shoot more 3s (30–45% of shots)
  const threeAR = 0.30 + (t3 - 33) * 0.015;

  // 2PT attempt rate = complement
  const twoAR = 1 - threeAR;

  // Opponent 3PT % allowed: lower aD = better perimeter defense
  // Best defenses hold opponents to 30%, worst allow 37%
  const opp3Pct = 37 - (115 - aD) * 0.35;

  // Opponent 2PT % allowed
  const opp2Pct = 48 - (115 - aD) * 0.18;

  // Shooting variance: high 3AR teams have more game-to-game variance
  const shotVariance = 0.4 + threeAR * 0.6;

  // ── SHOT QUALITY ────────────────────────────────────────────
  // Rim rate: paint-heavy offenses (high aO, lower t3) attack rim more
  const rimRate = 0.35 - (t3 - 35) * 0.01 + (aO - 115) * 0.003;

  // Midrange: less common in modern basketball, varies 8–18%
  const midRate = 0.18 - (t3 - 35) * 0.008;

  // Assist rate: efficient offenses (high aO) tend to share the ball
  const assistRate = 0.52 + (aO - 115) * 0.006 - to * 0.005;

  // Average shot distance: high 3AR teams shoot from further out
  const avgShotDist = 12 + threeAR * 8;

  // ── TURNOVERS ────────────────────────────────────────────────
  const toRate = to;

  // Defensive TO rate forced: elite defenses force more TOs
  // Lower aD = better defense = more steals
  const defTOrate = 18 - (aD - 90) * 0.3;

  // TO margin: how many more TOs they force vs commit
  const toMargin = defTOrate - toRate;

  // Steal rate proxy
  const stealRate = 8 + (115 - aD) * 0.12;

  // ── REBOUNDING ───────────────────────────────────────────────
  const oRebPct = oR;

  // Defensive rebound %: elite teams grab ~75% of available boards
  // Correlates with aD (good defense = good box-out discipline)
  const dRebPct = 70 + (115 - aD) * 0.3 + (30 - oR) * 0.1;

  // Total rebound %
  const totRebPct = (oRebPct + dRebPct) / 2;

  // Second chance points: oReb% directly drives this
  const secondChancePts = oR * 0.3;

  // Opponent offensive rebound rate allowed (lower aD = better)
  const oppORebPct = 30 - (115 - aD) * 0.25;

  // ── FREE THROWS ─────────────────────────────────────────────
  // FT rate: attacking teams (high aO, paint focus) draw more fouls
  const ftRate = 0.28 + (aO - 115) * 0.006 + (1 - threeAR) * 0.05;

  // FT%: independent of most stats, varies 68–80% in tournament
  // Use kp as proxy: better teams tend to shoot better FTs
  const ftPct = 0.72 + Math.max(0, (100 - kp) * 0.0004);

  // Opponent foul rate: how often they put opponent at the line
  const oppFoulRate = 0.25 - (115 - aD) * 0.004;

  // FTA allowed
  const ftaAllowed = oppFoulRate * 100;

  // ── INTERIOR & RIM PROTECTION ────────────────────────────────
  // Rim finishing: how well they convert at the rim
  const rimFinish = 0.60 + (aO - 115) * 0.005 - (aD > 95 ? 0 : 0);

  // Block rate: elite defenses (low aD) block more shots
  const blockRate = 8 + Math.max(0, (100 - aD)) * 0.08;

  // Opponent block rate (does defense reject their attempts?)
  // Teams that attack the rim more face more blocks
  const oppBlockRate = 8 - (rimRate - 0.35) * 10;

  // Paint points per possession
  const paintPts = rimRate * 2 * rimFinish;

  // Opponent rim FG% allowed (elite defenses hold opponents to lower %)
  const oppRimFG = 0.62 - (115 - aD) * 0.003;

  // ── PACE & GAME FLOW ─────────────────────────────────────────
  const tempo = tp;

  // Transition frequency: faster teams run more
  const transitionFreq = 0.15 + (tp - 68) * 0.01;

  // Halfcourt efficiency: slower teams are more efficient in halfcourt
  const halfcourtEff = aO / 100 - transitionFreq * 0.05;

  const possPerGame = tp;

  // ── DEFENSIVE STRUCTURE ──────────────────────────────────────
  const ptsAllowedPer100 = aD;

  // Opponent eFG% allowed (elite defenses hold opponents below 48%)
  const oppEFGpct = 0.52 - (115 - aD) * 0.004;

  // Opponent assist rate allowed (disruptive defenses reduce assists)
  const oppAssistRate = 0.55 - (115 - aD) * 0.003;

  // ── STRENGTH OF COMPETITION ───────────────────────────────────
  // SOS: KenPom already incorporates SOS. Top-10 teams have high SOS.
  // Scale: kp 1–250, SOS score 0–100
  const sos = Math.max(0, 100 - kp * 0.4);

  // Win % vs top-25: top kp teams beat other top teams more
  const recVsTop25 = Math.max(0.1, 0.8 - kp * 0.003);

  // Win % vs top-50
  const recVsTop50 = Math.max(0.2, 0.85 - kp * 0.002);

  // ── EXPERIENCE & ROSTER ───────────────────────────────────────
  // Experience: combination of seed (1-seeds = proven programs),
  // kp (consistent programs have experienced rosters),
  // and profile type
  const progExp = Math.max(0, (17 - s) * 3);       // seed component (1-seed = 48, 16-seed = 3)
  const kpExp   = Math.max(0, (60 - kp) * 0.5);   // kp component
  const experience = Math.min(100, progExp + kpExp);

  // Roster continuity proxy: better programs retain players
  const rosterContinuity = 55 + Math.max(0, (50 - kp) * 0.3);

  // Upperclassman minutes % proxy
  const upperclassPct = 50 + Math.max(0, (50 - kp) * 0.2);

  // Coaching edge: seed + kp + profile
  const coachingEdge = Math.min(100, (17 - s) * 2.5 + Math.max(0, (60 - kp) * 0.4));

  // ── CLUTCH / PERFORMANCE ─────────────────────────────────────
  // Close game record: elite teams win close games more
  const closeGameRecord = 0.50 + Math.max(0, (50 - kp)) * 0.004;

  // Neutral site performance: experienced programs perform well
  const neutralSitePerf = 0.50 + Math.max(0, (50 - kp)) * 0.003;

  return {
    aO, aD, t3, to, oR, tp, kp, s,
    effMargin, offRating, defRating, netRating,
    eFGpct, tsPct, fgPct, twoPct, threePct,
    threeAR, twoAR, opp3Pct, opp2Pct, shotVariance,
    rimRate, midRate, assistRate, avgShotDist,
    toRate, defTOrate, toMargin, stealRate,
    oRebPct, dRebPct, totRebPct, secondChancePts, oppORebPct,
    ftRate, ftPct, oppFoulRate, ftaAllowed,
    rimFinish, blockRate, oppBlockRate, paintPts, oppRimFG,
    tempo, transitionFreq, halfcourtEff, possPerGame,
    ptsAllowedPer100, oppEFGpct, oppAssistRate,
    sos, recVsTop25, recVsTop50,
    experience, rosterContinuity, upperclassPct, coachingEdge,
    closeGameRecord, neutralSitePerf,
  };
}
