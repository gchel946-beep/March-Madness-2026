export type TeamProfile = "elite" | "dark" | "upset" | "normal";
export type BracketPage = "left" | "center" | "right";
export type Tab = "bracket" | "upsets" | "darkhorses" | "insights" | "analysis" | "simulate";
export type RiskLevel = "L" | "M" | "H" | "X";

export interface TeamData {
  s: number;
  r: string;
  kp: number;
  aO: number;
  aO_r: number;
  aD: number;
  aD_r: number;
  t3: number;
  t3_r: number;
  to: number;
  to_r: number;
  tp: number;
  oR: number;
  oR_r: number;
  p: TeamProfile;
  str: string;
  weak: string;
  key: string;
}

export interface MatchupData {
  t1: string;
  t2: string;
  uc: number;
  up: string;
  reg: string;
  ex: string;
}

export interface AdvItem {
  cat: string;
  edge: string;
  cls: "t1" | "t2" | "tied";
}

export interface AdvResult {
  items: AdvItem[];
  a1: string[];
  a2: string[];
  summary: string;
}

export interface UpsetRisk {
  level: RiskLevel;
  pct: number;
  label: string;
}

export interface SimResult {
  champs: Record<string, number>;
  f4: Record<string, number>;
  n: number;
}

export interface DarkHorse {
  nm: string;
  seed: string;
  kp: number;
  aO: string;
  aD: string;
  tags: string[];
  why: string;
}

export interface UpsetCard {
  m: string;
  conf: number;
  seed: string;
  reg: string;
  c: "red" | "gold" | "blue";
  why: string;
}
