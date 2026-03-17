import { TeamData, AdvResult, AdvItem, UpsetRisk, RiskLevel } from "@/types";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";

/* ================================================================
   CORE WIN PROBABILITY
   Adjusted efficiency margin, logistic curve, scale = 10.
================================================================ */
export function winProb(d1: TeamData, d2: TeamData): number {
  const netA = d1.aO - d2.aD;
  const netB = d2.aO - d1.aD;
  const margin = netA - netB;
  return 1 / (1 + Math.exp(-margin / 10));
}

/* ================================================================
   MATCHUP WIN PROBABILITY (with style interactions)
================================================================ */
export function matchupWinProb(t1: string, t2: string): number {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);
  let score = (d1.aO - d2.aD) - (d2.aO - d1.aD);
  if (d1.t3 >= 37 && d2.aD >= 93) score += 2.5;
  if (d2.t3 >= 37 && d1.aD >= 93) score -= 2.5;
  const rebGap = d1.oR - d2.oR;
  if (rebGap > 4)  score += 1.5;
  if (rebGap < -4) score -= 1.5;
  if (d1.aD <= 90 && d2.to >= 16) score += 2.0;
  if (d2.aD <= 90 && d1.to >= 16) score -= 2.0;
  score += (d1.tp - d2.tp) * 0.03;
  score += (d2.kp - d1.kp) * 0.04;
  return 1 / (1 + Math.exp(-score / 10));
}

/* ================================================================
   SEED MATCHUP — identifies favorite and underdog by SEED FIRST.
   Higher seed number = underdog. Lower seed number = favorite.
   Only falls back to model probability if seeds are equal or missing.
================================================================ */
export interface SeedMatchup {
  favorite:   string;
  underdog:   string;
  favSeed:    number;
  dogSeed:    number;
  favData:    TeamData;
  dogData:    TeamData;
  is89:       boolean;   // 8 vs 9 — nearly even by nature
  modelAgrees: boolean;  // Does the model agree with the seed-based favorite?
}

export function getSeedMatchup(t1: string, t2: string): SeedMatchup {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);

  // Identify favorite and underdog by seed
  // Lower seed number = better seed = favorite
  let favorite: string;
  let underdog: string;
  let favData: TeamData;
  let dogData: TeamData;

  if (d1.s === d2.s || (!d1.s && !d2.s)) {
    // Same seed or no seed info → use model probability
    const p = winProb(d1, d2);
    if (p >= 0.5) {
      favorite = t1; favData = d1;
      underdog = t2; dogData = d2;
    } else {
      favorite = t2; favData = d2;
      underdog = t1; dogData = d1;
    }
  } else if (d1.s < d2.s) {
    // t1 is better seed = favorite
    favorite = t1; favData = d1;
    underdog = t2; dogData = d2;
  } else {
    // t2 is better seed = favorite
    favorite = t2; favData = d2;
    underdog = t1; dogData = d1;
  }

  const is89 = (favData.s === 8 && dogData.s === 9) || (favData.s === 9 && dogData.s === 8);

  // Does the model probability agree with the seed-based favorite?
  const modelP = winProb(favData, dogData);
  const modelAgrees = modelP >= 0.5;

  return {
    favorite, underdog,
    favSeed: favData.s,
    dogSeed: dogData.s,
    favData, dogData,
    is89, modelAgrees,
  };
}

/* ================================================================
   SEED BASELINE UPSET PROBABILITY
   Historical NCAA tournament upset rates by seed matchup.
   These are the anchors — matchup factors adjust around them.
================================================================ */
export function getSeedBaselineUpsetPct(favSeed: number, dogSeed: number): number {
  const diff = dogSeed - favSeed;  // e.g. 16-1=15, 12-5=7, 9-8=1

  // Direct historical seed matchup baselines
  const directBaselines: Record<string, number> = {
    "1-16": 4,
    "2-15": 7,
    "3-14": 14,
    "4-13": 20,
    "5-12": 36,
    "6-11": 38,
    "7-10": 40,
    "8-9":  48,
    "9-8":  48,
  };

  const key = `${favSeed}-${dogSeed}`;
  if (directBaselines[key] !== undefined) return directBaselines[key];

  // Later round matchups (non-standard seed pairings)
  // Use seed difference as a proxy
  if (diff <= 0) return 48;     // Same or reversed seed: ~even
  if (diff === 1) return 45;
  if (diff === 2) return 38;
  if (diff === 3) return 30;
  if (diff === 4) return 24;
  if (diff === 5) return 20;
  if (diff === 6) return 16;
  if (diff === 7) return 13;
  if (diff >= 8 && diff <= 10) return 10;
  if (diff >= 11 && diff <= 13) return 6;
  return 4;  // 1 vs 16 level gap
}

/* ================================================================
   MATCHUP ADJUSTMENT
   How much does the team quality/style push the upset % up or down?
   Returns a signed adjustment (positive = more upset likely).
   Capped at ±20 points so it can't override seed reality.
================================================================ */
export function getMatchupAdjustment(
  favorite: string,
  underdog: string,
): number {
  const fav = getTeam(favorite);
  const dog = getTeam(underdog);

  let adj = 0;

  // Efficiency gap — if underdog is actually stronger by KenPom, boost upset chance
  const kpGap = fav.kp - dog.kp; // positive = fav has worse kp rank = actually worse team
  adj += kpGap * 0.15;

  // 3PT shooting: underdog shoots well vs weak fav defense
  if (dog.t3 >= 37 && fav.aD >= 93)  adj += 5;
  if (dog.t3 >= 39 && fav.aD >= 91)  adj += 3;

  // Favorite's 3PT shooting vs weak underdog defense (reduces upset chance)
  if (fav.t3 >= 37 && dog.aD >= 93)  adj -= 4;

  // Rebounding edge for underdog
  if (dog.oR >= 31 && fav.oR <= 25)  adj += 4;
  if (fav.oR >= 31 && dog.oR <= 25)  adj -= 3;

  // Turnover edge: underdog's defense vs fav's ball-handling
  if (dog.aD <= 91 && fav.to >= 16)  adj += 5;
  if (fav.aD <= 89 && dog.to >= 16)  adj -= 4;

  // Favorite has injury / weakness flags
  if (fav.p === "upset") adj += 8;  // fav is flagged as upset candidate
  if (dog.p === "upset") adj += 4;  // underdog is an upset candidate

  // Underdog is dark horse / elite
  if (dog.p === "dark")  adj += 6;
  if (dog.p === "elite") adj += 10; // e.g. 1-seed playing a 2-seed

  // Tempo mismatch: faster underdog vs slower favorite
  if (dog.tp >= 74 && fav.tp <= 67)  adj += 3;

  // Cap adjustment to prevent unrealistic swings
  return Math.max(-20, Math.min(20, adj));
}

/* ================================================================
   FULL UPSET ANALYSIS — the main function called by Sidebar.
   Returns everything needed to render the upset panel correctly.
================================================================ */
export interface UpsetAnalysis {
  favorite:     string;
  underdog:     string;
  favSeed:      number;
  dogSeed:      number;
  upsetPct:     number;       // The underdog's % chance to win
  level:        RiskLevel;
  label:        string;
  modelAgrees:  boolean;      // Does model agree with seed-based favorite?
  favWinPct:    number;       // Favorite's win % (for display)
  is89:         boolean;
  contextNote:  string;       // Explains model vs seed disagreement if relevant
}

export function getUpsetAnalysis(
  t1: string,
  t2: string,
  overrideUc?: number
): UpsetAnalysis {
  const sm = getSeedMatchup(t1, t2);
  const { favorite, underdog, favSeed, dogSeed, is89, modelAgrees } = sm;

  // Start with historical seed baseline
  let upsetPct = getSeedBaselineUpsetPct(favSeed, dogSeed);

  // Apply matchup adjustment
  const adj = getMatchupAdjustment(favorite, underdog);
  upsetPct += adj;

  // Apply pre-researched override for R1 matchups (from our matchup data)
  if (overrideUc !== undefined) {
    // Blend: 60% our research, 40% model — but only if override is meaningful
    if (overrideUc > 0) {
      upsetPct = overrideUc * 0.6 + upsetPct * 0.4;
    }
  }

  // Check MATCHUPS data for the specific game
  const md = Object.values(MATCHUPS).find(
    m => (m.t1 === t1 && m.t2 === t2) || (m.t1 === t2 && m.t2 === t1)
  );
  if (md && md.uc > 0) {
    upsetPct = Math.max(upsetPct, md.uc * 0.7 + upsetPct * 0.3);
  }

  // Hard clamps by seed matchup — prevent unrealistic values
  const maxByDiff: Record<number, number> = {
    15: 12,   // 1 vs 16: max 12%
    14: 18,   // 2 vs 15: max 18%
    13: 28,   // 3 vs 14: max 28%
    12: 38,   // 4 vs 13: max 38%
    7:  58,   // 5 vs 12: max 58%
    5:  65,   // 6 vs 11: max 65%
    3:  70,   // 7 vs 10: max 70%
    1:  58,   // 8 vs 9: max 58%
  };
  const seedDiff = dogSeed - favSeed;
  const cap = maxByDiff[Math.abs(seedDiff)] ?? 75;
  upsetPct = Math.max(2, Math.min(cap, upsetPct));

  // Risk tier — based on upset pct (underdog's chance)
  let level: RiskLevel;
  let label: string;
  if (upsetPct >= 55)       { level = "X"; label = "EXTREME"; }
  else if (upsetPct >= 38)  { level = "H"; label = "HIGH"; }
  else if (upsetPct >= 20)  { level = "M"; label = "MODERATE"; }
  else                      { level = "L"; label = "LOW"; }

  // 8-9 games: always at least MODERATE
  if (is89 && level === "L") { level = "M"; label = "MODERATE"; }

  const favWinPct = 100 - Math.round(upsetPct);

  // Context note for model vs seed disagreement
  let contextNote = "";
  if (!modelAgrees && adj > 8) {
    contextNote = `The #${dogSeed} seed is the underdog on the bracket, but the matchup data gives them a strong upset chance — their stats project better than their seed suggests.`;
  } else if (!modelAgrees && adj > 3) {
    contextNote = `The #${dogSeed} seed is the bracket underdog, but projects as highly competitive based on efficiency and matchup factors.`;
  } else if (is89) {
    contextNote = `8 vs 9 games are historically near coin flips. Both teams are evenly matched by tournament selection.`;
  }

  return {
    favorite, underdog, favSeed, dogSeed,
    upsetPct: Math.round(upsetPct),
    level, label, modelAgrees, favWinPct, is89, contextNote,
  };
}

/* ================================================================
   LEGACY WRAPPER — kept so existing code doesn't break
================================================================ */
export function getUpsetRisk(t1: string, t2: string, overrideUc?: number): UpsetRisk {
  const a = getUpsetAnalysis(t1, t2, overrideUc);
  return { level: a.level, pct: a.upsetPct, label: a.label };
}

/* ================================================================
   MATCHUP ADVANTAGES
================================================================ */
interface AdvCategory {
  k: string; v1: number; v2: number; higher: boolean | null; thresh: number;
}

export function getMatchupAdvantages(t1: string, t2: string): AdvResult {
  const d1 = getTeam(t1);
  const d2 = getTeam(t2);

  const cats: AdvCategory[] = [
    { k:"Offense",         v1:d1.aO, v2:d2.aO, higher:true,  thresh:2 },
    { k:"Defense",         v1:d1.aD, v2:d2.aD, higher:false, thresh:1.5 },
    { k:"3PT Shooting",    v1:d1.t3, v2:d2.t3, higher:true,  thresh:1.5 },
    { k:"Ball Security",   v1:d1.to, v2:d2.to, higher:false, thresh:1 },
    { k:"Off. Rebounding", v1:d1.oR, v2:d2.oR, higher:true,  thresh:1.5 },
    { k:"Tempo Control",   v1:d1.tp, v2:d2.tp, higher:null,  thresh:4 },
  ];

  const items: AdvItem[] = [];
  const a1: string[] = [];
  const a2: string[] = [];

  cats.forEach(c => {
    if (c.higher === null) { items.push({ cat:c.k, edge:"Neutral", cls:"tied" }); return; }
    const diff = c.v1 - c.v2;
    const win1 = c.higher ? diff > c.thresh  : diff < -c.thresh;
    const win2 = c.higher ? diff < -c.thresh : diff > c.thresh;
    if (win1) {
      a1.push(c.k);
      items.push({ cat:c.k, edge:`${t1} +${(c.higher?diff:-diff).toFixed(1)}`, cls:"t1" });
    } else if (win2) {
      a2.push(c.k);
      items.push({ cat:c.k, edge:`${t2} +${(c.higher?-diff:diff).toFixed(1)}`, cls:"t2" });
    } else {
      items.push({ cat:c.k, edge:"Even", cls:"tied" });
    }
  });

  let summary = "";
  if      (d1.t3>=38 && d2.aD>=93) summary=`${t1} has a significant 3PT shooting advantage against a defense that allows high 3PT volume.`;
  else if (d2.t3>=38 && d1.aD>=93) summary=`${t2} has a significant 3PT shooting advantage against a defense that allows high 3PT volume.`;
  else if (d1.oR>=30 && d2.oR<26)  summary=`${t1} dominates the offensive glass and can extend possessions with second chances.`;
  else if (d2.oR>=30 && d1.oR<26)  summary=`${t2} dominates the offensive glass and can extend possessions with second chances.`;
  else if (d1.aD<=90 && d2.to>=16) summary=`${t1}'s elite defense creates turnovers that exploit ${t2}'s ball-handling struggles.`;
  else if (d2.aD<=90 && d1.to>=16) summary=`${t2}'s elite defense creates turnovers that exploit ${t1}'s ball-handling struggles.`;
  else if (a1.length>a2.length+1)  summary=`${t1} holds multiple statistical advantages entering this matchup.`;
  else if (a2.length>a1.length+1)  summary=`${t2} holds multiple statistical advantages entering this matchup.`;
  else                              summary="This matchup is statistically competitive with no clear overall edge.";

  return { items, a1, a2, summary };
}

/* ================================================================
   COLOR HELPERS
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
