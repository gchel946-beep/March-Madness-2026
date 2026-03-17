import { MatchupData } from "@/types";

/* ================================================================
   FIRST FOUR (Play-In Games)
   Each game feeds its winner into a specific R1 slot.
   Both teams share the same NCAA seed.
================================================================ */
export interface FirstFourGame {
  id:          string;   // "ff4-mw16" etc.
  t1:          string;   // Team 1
  t2:          string;   // Team 2
  seed:        number;   // Shared seed (11 or 16)
  region:      string;   // Region label
  desc:        string;   // Short description for UI
  targetsR1:   string;   // Which R1 matchup id this feeds into
  targetsPos:  "t1"|"t2"; // Which slot in that R1 matchup
  uc:          number;   // Upset confidence for the game itself
  ex:          string;   // Analysis text
}

export const FIRST_FOUR: FirstFourGame[] = [
  {
    id:         "ff4-mw16",
    t1:         "UMBC",
    t2:         "Howard",
    seed:       16,
    region:     "Midwest",
    desc:       "16-Seed · Midwest",
    targetsR1:  "mw-1",
    targetsPos: "t2",
    uc:         55,
    ex:         "UMBC is the statistical favorite: KenPom #130 vs #210. DJ Armstrong scored 33 in the conf final and shoots 42% from 3. Howard's 19% TO rate is exploitable. 12-game win streak makes UMBC the dangerous team here.",
  },
  {
    id:         "ff4-mw11",
    t1:         "Miami OH",
    t2:         "SMU",
    seed:       11,
    region:     "Midwest",
    desc:       "11-Seed · Midwest",
    targetsR1:  "mw-5",
    targetsPos: "t2",
    uc:         45,
    ex:         "Miami OH is 31-4 and shoots 38% from 3. SMU went 20-13 and has the weaker resume. Miami OH's depth and recent form make them the clear pick in this First Four matchup.",
  },
  {
    id:         "ff4-w11",
    t1:         "NC State",
    t2:         "Texas",
    seed:       11,
    region:     "West",
    desc:       "11-Seed · West",
    targetsR1:  "w-5",
    targetsPos: "t2",
    uc:         40,
    ex:         "NC State has 2024 Final Four pedigree and more tournament-caliber wins. Texas went 18-14 and barely made the field. NC State's experience and name brand makes them the analytical pick here.",
  },
  {
    id:         "ff4-s16",
    t1:         "Lehigh",
    t2:         "Prairie View",
    seed:       16,
    region:     "South",
    desc:       "16-Seed · South",
    targetsR1:  "s-1",
    targetsPos: "t2",
    uc:         50,
    ex:         "Lehigh (KP #220) has the slight edge over Prairie View (KP #225). Both lose to Florida by 30+. This game determines who gets embarrassed by the defending national champions.",
  },
];

/* ================================================================
   MAIN BRACKET MATCHUPS
   Note: R1 slots that depend on First Four winners show a
   placeholder string — RegionGrid resolves the actual team
   from the store's First Four picks at render time.
================================================================ */
export const MATCHUPS: Record<string, MatchupData> = {
  "e-1":  { t1:"Duke",          t2:"Siena",          uc:2,  up:"Siena",         reg:"East",    ex:"Duke's Cameron Boozer (22.4 PPG) is unguardable for MAAC-level defenders. KenPom #1 vs #185. Duke wins by 25+ in a non-competitive opener." },
  "e-2":  { t1:"Ohio State",    t2:"TCU",             uc:48, up:"TCU",           reg:"East",    ex:"TCU's #17 adjusted defense neutralizes Ohio State's inconsistent offense. The line is nearly even. TCU's defensive discipline is the deciding factor in this coin flip." },
  "e-3":  { t1:"St. John's",    t2:"Northern Iowa",   uc:32, up:"Northern Iowa", reg:"East",    ex:"Northern Iowa's 64 tempo clashes with SJU's already-shaky 44th-ranked offense. If this game slows to 60 possessions, Northern Iowa's 37% 3PT shooting becomes lethal." },
  "e-4":  { t1:"Kansas",        t2:"Cal Baptist",     uc:8,  up:"Cal Baptist",   reg:"East",    ex:"Kansas's top-10 defense (89.8 adjD) smothers Cal Baptist's fast-break. Peterson doesn't need to do much here — the defense wins it comfortably by double digits." },
  "e-5":  { t1:"Louisville",    t2:"South Florida",   uc:67, up:"South Florida", reg:"East",    ex:"UPSET PICK 67%: Mikel Brown (16.2 PPG) injured and missed final 4 games. South Florida is American Conference champion at 25-8. They shoot 38% from 3 and Louisville allows 37%. Classic injury trap game." },
  "e-6":  { t1:"Michigan State",t2:"NDSU",            uc:6,  up:"NDSU",          reg:"East",    ex:"Izzo's preparation vs NDSU's Summit League schedule is not a fair fight. Michigan State wins by 18 regardless of momentum. Izzo always gets his team ready for Game 1." },
  "e-7":  { t1:"UCLA",          t2:"UCF",             uc:42, up:"UCF",           reg:"East",    ex:"Genuine coin flip. UCLA has fresh legs from Big Ten tourney. UCF has more consistent 3PT shooting. Whoever controls the first 8 minutes wins this game." },
  "e-8":  { t1:"UConn",         t2:"Furman",          uc:8,  up:"Furman",        reg:"East",    ex:"Even wildly inconsistent UConn is too talented for Furman. Top-15 defense limits Furman's 39% 3PT shooting. UConn wins but may struggle to cover." },
  "w-1":  { t1:"Arizona",       t2:"Long Island",     uc:1,  up:"Long Island",   reg:"West",    ex:"Arizona's Big Three (Peat/Bradley/Burries) are all projected NBA picks. Long Island is a NEC champion. Arizona wins by 30+ in a comfortable opener." },
  "w-2":  { t1:"Villanova",     t2:"Utah State",      uc:56, up:"Utah State",    reg:"West",    ex:"UPSET PICK 56%: Utah State (28-6, KP#29) is statistically BETTER than Villanova (KP#36). Some lines favor Utah State. Their 38% 3PT attacks Villanova's soft perimeter defense." },
  "w-3":  { t1:"Wisconsin",     t2:"High Point",      uc:44, up:"High Point",    reg:"West",    ex:"UPSET WATCH 44%: High Point 30-4 scores 90+ PPG. Wisconsin scores 83. Neither team defends well. Both shoot 36-38% from 3. Pure 3PT coin flip — whoever runs hotter wins." },
  "w-4":  { t1:"Arkansas",      t2:"Hawai'i",         uc:52, up:"Hawai'i",       reg:"West",    ex:"13-SEED UPSET 52%: Hawai'i has 7-foot Isaac Johnson (14.1 PPG) + 5 seniors + #25 rebounding. Arkansas has no true shot-blocker. Classic 13-over-4 formula executed perfectly." },
  "w-5":  { t1:"BYU",           t2:"FF4-Winner",      uc:38, up:"NC State",      reg:"West",    ex:"Without Saunders' spacing, opponents double Dybantsa every possession. NC State has the athletes to execute that scheme. BYU needs Dybantsa to create his own shot from impossible positions." },
  "w-6":  { t1:"Gonzaga",       t2:"Kennesaw State",  uc:4,  up:"Kennesaw St.",  reg:"West",    ex:"Graham Ike averages 19.7 PPG at career-high efficiency. Kennesaw State has no answer for him. Gonzaga wins by 22+. Only question is Huff's injury status for later rounds." },
  "w-7":  { t1:"Miami FL",      t2:"Missouri",        uc:44, up:"Missouri",      reg:"West",    ex:"Missouri's 73 tempo pushes against Miami FL's preferred halfcourt game. Both shoot 35-38% from 3. Coin flip with slight Miami FL defensive edge." },
  "w-8":  { t1:"Purdue",        t2:"Queens",          uc:3,  up:"Queens",        reg:"West",    ex:"Purdue's #1 offense nationally has zero problems with Queens. Braden Smith orchestrates a 30-point win. This game exists to get Purdue's legs under them." },
  "mw-1": { t1:"Michigan",      t2:"FF4-Winner",      uc:22, up:"UMBC",          reg:"Midwest", ex:"2018 VIBES: UMBC's DJ Armstrong shoots 42% from 3 and scored 33 in conf final. 12-game win streak. Must beat Howard first. Michigan is massive favorite but UMBC is the most dangerous 16-seed in the field." },
  "mw-2": { t1:"Georgia",       t2:"Saint Louis",     uc:50, up:"Saint Louis",   reg:"Midwest", ex:"TEMPO WAR: Georgia runs at 78 possessions per game. Saint Louis wants 65. Whoever imposes their pace wins. Saint Louis's 26-5 record and 91.5 adjD says they can slow anyone. Best 8-9 game in the bracket." },
  "mw-3": { t1:"Texas Tech",    t2:"Akron",           uc:74, up:"Akron",         reg:"Midwest", ex:"#1 UPSET PICK IN BRACKET 74%: Toppin (21.8 PPG, 10.8 RPG) tore his ACL in February. Texas Tech lost 3 straight entering tournament. Akron is 29-6 on their 3rd consecutive NCAA Tournament. Matchup has completely flipped." },
  "mw-4": { t1:"Alabama",       t2:"Hofstra",         uc:12, up:"Hofstra",       reg:"Midwest", ex:"Alabama's 16% TO rate (highest of any top-25 team) is their biggest flaw. Hofstra cannot win straight-up, but if Alabama has 22+ turnovers (happened twice this year) it gets interesting late." },
  "mw-5": { t1:"Tennessee",     t2:"FF4-Winner",      uc:35, up:"Miami OH",      reg:"Midwest", ex:"Miami OH is 31-4 and shoots 38% from 3. Tennessee allows 34% from 3 (below average nationally). Must win First Four vs SMU first. If Miami OH advances, Tennessee's 3PT defense is exposed." },
  "mw-6": { t1:"Virginia",      t2:"Wright State",    uc:8,  up:"Wright State",  reg:"Midwest", ex:"Virginia's Pack-Line holds Wright State under 52 points. Tony Bennett's system is the most reliable in the tournament. Virginia wins 54-40. Never pretty but always effective." },
  "mw-7": { t1:"Kentucky",      t2:"Santa Clara",     uc:22, up:"Santa Clara",   reg:"Midwest", ex:"Kentucky is rebuilding under Pope. Santa Clara is 26-8 with 37% 3PT and disciplined system. If Kentucky starts cold in the first 8 minutes, Santa Clara can steal the lead and never give it back." },
  "mw-8": { t1:"Iowa State",    t2:"Tennessee State", uc:3,  up:"Tennessee St.", reg:"Midwest", ex:"Iowa State's pressure defense forces 20+ turnovers. Lipsey, Momcilovic, and Jefferson all score in double figures. Iowa State wins by 25. Complete warm-up game." },
  "s-1":  { t1:"Florida",       t2:"FF4-Winner",      uc:2,  up:"Lehigh",        reg:"South",   ex:"Florida wins easily regardless of First Four winner. Defending champions get their tournament legs going. Florida by 30+." },
  "s-2":  { t1:"Clemson",       t2:"Iowa",            uc:55, up:"Iowa",          reg:"South",   ex:"TAKE IOWA 55%: Iowa went 19-4 vs unranked teams and shoots 38% from 3. Clemson lost to 5 unranked opponents. Iowa's Big Ten experience and better metrics make this a clear analytical pick." },
  "s-3":  { t1:"Vanderbilt",    t2:"McNeese",         uc:48, up:"McNeese",       reg:"South",   ex:"UPSET PICK 48%: McNeese leads the NATION in turnover margin (+7.3). Vanderbilt has 14% TO rate and just ran through a grueling SEC tournament. Fatigue + elite pressure defense = perfect upset formula." },
  "s-4":  { t1:"Nebraska",      t2:"Troy",            uc:10, up:"Troy",          reg:"South",   ex:"Nebraska is KenPom Top-25 with clear talent advantage. Troy is a solid Sun Belt champion but the gap is too large. Nebraska advances comfortably." },
  "s-5":  { t1:"North Carolina",t2:"VCU",             uc:78, up:"VCU",           reg:"South",   ex:"TOP UPSET PICK 78%: VCU shoots 36.7% from 3 and UNC allows 34.5%. VCU has 31.3% oReb rate. Wilson (19.8/9.4) is OUT with torn thumb. VCU won 16 of last 17 games. Every stat points to VCU." },
  "s-6":  { t1:"Illinois",      t2:"Penn",            uc:15, up:"Penn",          reg:"South",   ex:"TJ Power scored 44 in Ivy championship and has 5 games with 5+ 3-pointers. Illinois's #1 national defense contains him. Power is the must-watch individual performance of Round 1." },
  "s-7":  { t1:"Saint Mary's",  t2:"Texas A&M",       uc:54, up:"Texas A&M",     reg:"South",   ex:"TAKE TEXAS A&M 54%: #4 scoring offense (87.7 PPG), 6 players averaging 10+ PPG. Saint Mary's Bucky Ball slowdown has never faced this level of sustained offensive firepower." },
  "s-8":  { t1:"Houston",       t2:"Idaho",           uc:2,  up:"Idaho",         reg:"South",   ex:"Houston's elite defense (86.2 adjD, #1 nationally) holds Idaho to 50 points. Flemings and Sharp put on a show in their home-region opener. Houston wins 80-50." },
};

/* Map: R1 matchup id → First Four game that feeds it */
export const FF4_FOR_R1: Record<string, FirstFourGame> = {};
FIRST_FOUR.forEach(g => { FF4_FOR_R1[g.targetsR1] = g; });

export const EAST_R1    = ["e-1","e-2","e-3","e-4","e-5","e-6","e-7","e-8"];
export const WEST_R1    = ["w-1","w-2","w-3","w-4","w-5","w-6","w-7","w-8"];
export const MIDWEST_R1 = ["mw-1","mw-2","mw-3","mw-4","mw-5","mw-6","mw-7","mw-8"];
export const SOUTH_R1   = ["s-1","s-2","s-3","s-4","s-5","s-6","s-7","s-8"];

export function getMatchup(id: string): MatchupData | undefined {
  return MATCHUPS[id];
}

/** Resolve the actual teams for a R1 matchup, substituting FF4 winners where needed */
export function resolveR1Teams(r1id: string, picks: Record<string,string>): [string, string] {
  const m = MATCHUPS[r1id];
  if (!m) return ["", ""];
  const ff4 = FF4_FOR_R1[r1id];
  let t1 = m.t1;
  let t2 = m.t2;
  if (ff4) {
    const ffWinner = picks[ff4.id] ?? "";
    if (ff4.targetsPos === "t1") t1 = ffWinner || ff4.t1 + "/" + ff4.t2;
    if (ff4.targetsPos === "t2") t2 = ffWinner || ff4.t1 + "/" + ff4.t2;
  }
  // Clean up placeholder
  if (t1 === "FF4-Winner") t1 = ff4 ? (picks[ff4.id] ?? (ff4.t1+"/"+ff4.t2)) : "";
  if (t2 === "FF4-Winner") t2 = ff4 ? (picks[ff4.id] ?? (ff4.t1+"/"+ff4.t2)) : "";
  return [t1, t2];
}
