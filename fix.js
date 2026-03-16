const fs = require("fs");
const path = require("path");

const files = {};

files["src/store/useBracket.ts"] = `"use client";

import { create } from "zustand";
import { BracketPage, Tab } from "@/types";

interface BracketStore {
  picks: Record<string, string>;
  selectedId: string | null;
  selectedTeams: [string, string] | null;
  bracketPage: BracketPage;
  activeTab: Tab;
  setPick: (matchupId: string, team: string) => void;
  clearPick: (matchupId: string) => void;
  setSelected: (id: string | null, teams?: [string, string]) => void;
  setBracketPage: (p: BracketPage) => void;
  setActiveTab: (t: Tab) => void;
  resetAll: () => void;
  winner: (id: string) => string | null;
}

function removeTeamFromAllOther(picks: Record<string, string>, teamName: string, exceptId: string): Record<string, string> {
  const next = { ...picks };
  for (const id of Object.keys(next)) {
    if (id !== exceptId && next[id] === teamName) {
      delete next[id];
    }
  }
  return next;
}

export const useBracket = create<BracketStore>((set, get) => ({
  picks: {},
  selectedId: null,
  selectedTeams: null,
  bracketPage: "left",
  activeTab: "bracket",

  setPick: (matchupId, team) =>
    set(s => {
      const oldWinner = s.picks[matchupId];
      let next = { ...s.picks, [matchupId]: team };
      if (oldWinner && oldWinner !== team) {
        next = removeTeamFromAllOther(next, oldWinner, matchupId);
      }
      return { picks: next };
    }),

  clearPick: (matchupId) =>
    set(s => {
      const oldWinner = s.picks[matchupId];
      let next = { ...s.picks };
      delete next[matchupId];
      if (oldWinner) {
        next = removeTeamFromAllOther(next, oldWinner, "__none__");
      }
      return { picks: next };
    }),

  setSelected: (id, teams) => set({ selectedId: id, selectedTeams: teams ?? null }),
  setBracketPage: (p) => set({ bracketPage: p }),
  setActiveTab: (t) => set({ activeTab: t }),
  resetAll: () => set({ picks: {}, selectedId: null, selectedTeams: null }),
  winner: (id) => get().picks[id] ?? null,
}));
`;

files["src/components/MatchupPair.tsx"] = `"use client";

import TeamSlot from "@/components/TeamSlot";
import { useBracket } from "@/store/useBracket";

interface Props {
  matchupId: string;
  team1: string;
  team2: string;
}

function isPlaceholder(name: string) {
  return !name || name === "?" || name.includes("Winner") || name.includes("Win") || name === "TBD";
}

export default function MatchupPair({ matchupId, team1, team2 }: Props) {
  const { picks, selectedId, setSelected, setPick, clearPick } = useBracket();
  const isSelected = selectedId === matchupId;

  function getTeamsTuple(): [string, string] | undefined {
    const t1 = isPlaceholder(team1) ? "" : team1;
    const t2 = isPlaceholder(team2) ? "" : team2;
    if (t1 || t2) return [t1, t2];
    return undefined;
  }

  function handlePairClick() {
    setSelected(matchupId, getTeamsTuple());
  }

  function handleSlotClick(teamName: string) {
    if (isPlaceholder(teamName)) {
      setSelected(matchupId, getTeamsTuple());
      return;
    }
    if (picks[matchupId] === teamName) {
      clearPick(matchupId);
    } else {
      setPick(matchupId, teamName);
    }
    setSelected(matchupId, getTeamsTuple());
  }

  return (
    <div
      id={\`pair-\${matchupId}\`}
      onClick={handlePairClick}
      className={[
        "flex flex-col cursor-pointer no-select",
        isSelected ? "ring-1 ring-blue/50 rounded" : "",
      ].join(" ")}
    >
      <TeamSlot
        matchupId={matchupId}
        name={team1 || "?"}
        position="top"
        picks={picks}
        onClick={() => handleSlotClick(team1)}
      />
      <TeamSlot
        matchupId={matchupId}
        name={team2 || "?"}
        position="bot"
        picks={picks}
        onClick={() => handleSlotClick(team2)}
      />
    </div>
  );
}
`;

files["src/lib/simulation.ts"] = `import { SimResult } from "@/types";
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
`;

files["src/components/Sidebar.tsx"] = `"use client";

import { useBracket } from "@/store/useBracket";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";
import { getUpsetRisk, getMatchupAdvantages, offColor, defColor, toColor, t3Color, kpColor, winProb } from "@/lib/analytics";

function StatCell({ label, value, rank, colorClass }: { label: string; value: string|number; rank: number; colorClass: string }) {
  return (
    <div className="bg-s2 border border-br rounded p-2">
      <div className="text-[9px] text-tx3 mb-1">{label}</div>
      <div className={\`text-base font-bold leading-none \${colorClass}\`}>
        {value}<span className="text-[10px] font-medium text-tx3 ml-0.5">({rank})</span>
      </div>
    </div>
  );
}

function InfoBlock({ type, title, text }: { type: "N"|"B"|"R"|"Y"|"G"; title: string; text: string }) {
  const wrap:   Record<string,string> = { N:"bg-s2 border-br", B:"bg-blue/10 border-blue/20", R:"bg-red/[0.06] border-red/25", Y:"bg-gld/[0.06] border-gld/25", G:"bg-grn/[0.06] border-grn/20" };
  const tcls:   Record<string,string> = { N:"text-tx3", B:"text-blue", R:"text-red", Y:"text-gld", G:"text-grn" };
  return (
    <div className={\`rounded border p-2 mb-1 \${wrap[type]}\`}>
      <div className={\`font-mono text-[8px] tracking-widest uppercase mb-1 \${tcls[type]}\`}>{title}</div>
      <div className="text-[11px] text-tx2 leading-relaxed">{text}</div>
    </div>
  );
}

function generateAnalysis(t1: string, t2: string): string {
  const d1 = getTeam(t1), d2 = getTeam(t2);
  const p = winProb(d1, d2);
  const favored = p >= 0.5 ? t1 : t2;
  const dFav = p >= 0.5 ? d1 : d2;
  const dDog = p >= 0.5 ? d2 : d1;
  const pct = Math.round(Math.max(p, 1-p) * 100);
  const parts: string[] = [];
  parts.push(\`\${favored} is favored at \${pct}% win probability based on adjusted efficiency margins.\`);
  if (Math.abs(d1.t3 - d2.t3) > 2) {
    const better = d1.t3 > d2.t3 ? t1 : t2;
    const worse  = d1.t3 > d2.t3 ? t2 : t1;
    parts.push(\`\${better} has a 3PT shooting advantage (\${Math.max(d1.t3,d2.t3)}% vs \${Math.min(d1.t3,d2.t3)}%) against \${worse}'s perimeter defense.\`);
  }
  if (Math.abs(d1.aD - d2.aD) > 3) {
    const betterD = d1.aD < d2.aD ? t1 : t2;
    parts.push(\`\${betterD} holds a significant defensive edge — their adjusted defense is the best in this matchup.\`);
  }
  if (Math.abs(d1.to - d2.to) > 2) {
    const lowTO  = d1.to < d2.to ? t1 : t2;
    const highTO = d1.to < d2.to ? t2 : t1;
    parts.push(\`Turnover margin could be decisive: \${lowTO} takes care of the ball better while \${highTO}'s higher turnover rate could be exploited under pressure.\`);
  }
  if (Math.abs(d1.tp - d2.tp) > 5) {
    const faster = d1.tp > d2.tp ? t1 : t2;
    const slower = d1.tp > d2.tp ? t2 : t1;
    parts.push(\`Pace mismatch: \${faster} wants to push the tempo while \${slower} prefers a halfcourt game. Whoever imposes their pace controls this matchup.\`);
  }
  if (pct < 60) parts.push("This is a competitive matchup — the efficiency gap is narrow and either team can win.");
  return parts.join(" ");
}

export default function Sidebar() {
  const { selectedId, selectedTeams, picks, setPick, clearPick } = useBracket();

  if (!selectedId) {
    return (
      <div className="w-[380px] min-w-[380px] border-l border-br bg-s1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-br">
          <div className="text-[13px] font-semibold text-white">Select a Game</div>
          <div className="text-[10px] text-tx3 mt-0.5">Click any matchup to see analytics</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-tx3">
          <div className="text-3xl mb-3 opacity-30">◎</div>
          <div className="text-[14px] font-semibold text-tx2 mb-2">Matchup Analytics</div>
          <p className="text-[11px] leading-relaxed">Click any game to see KenPom stats, matchup advantages, upset probability, and pick your winner.</p>
          <div className="mt-5 flex flex-col gap-2 text-left w-full">
            {[{label:"Blue bar",desc:"title contender",cls:"text-blue border-blue/30 bg-blue/10"},{label:"Gold bar",desc:"dark horse",cls:"text-gld border-gld/30 bg-gld/10"},{label:"Red bar",desc:"upset candidate",cls:"text-red border-red/30 bg-red/10"}].map(i=>(
              <div key={i.label} className="flex items-center gap-2">
                <span className={\`font-mono text-[9px] px-1.5 py-0.5 rounded border \${i.cls}\`}>{i.label}</span>
                <span className="text-[10px] text-tx3">{i.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const md = MATCHUPS[selectedId];
  let t1: string = selectedTeams?.[0] ?? md?.t1 ?? "";
  let t2: string = selectedTeams?.[1] ?? md?.t2 ?? "";
  if (t1.includes("Winner") || t1.includes("Win")) t1 = "";
  if (t2.includes("Winner") || t2.includes("Win")) t2 = "";
  if (!t1 && !t2) {
    return (
      <div className="w-[380px] min-w-[380px] border-l border-br bg-s1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-br">
          <div className="text-[13px] font-semibold text-white">Make Earlier Picks</div>
          <div className="text-[10px] text-tx3 mt-0.5">Complete earlier rounds first</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-tx3">
          <div className="text-3xl mb-3 opacity-30">⏳</div>
          <div className="text-[14px] font-semibold text-tx2 mb-2">Earlier Picks Needed</div>
          <p className="text-[11px] leading-relaxed">Pick winners in earlier rounds to unlock this matchup analysis.</p>
        </div>
      </div>
    );
  }
  if (!t1) { t1 = t2; t2 = ""; }

  const d1 = getTeam(t1);
  const d2 = t2 ? getTeam(t2) : null;
  const w  = picks[selectedId];
  const risk = d2 ? getUpsetRisk(t1, t2, md?.uc) : null;
  const adv  = d2 ? getMatchupAdvantages(t1, t2) : null;
  const analysisText = md?.ex ?? (d2 ? generateAnalysis(t1, t2) : "");
  const roundLabel = (() => {
    if (md) return \`Round 1 · \${md.reg}\`;
    if (selectedId.includes("r2"))  return "Round 2";
    if (selectedId.includes("s16")) return "Sweet 16";
    if (selectedId.includes("e8"))  return "Elite Eight";
    if (selectedId === "ff-1" || selectedId === "ff-2") return "Final Four";
    if (selectedId === "champ") return "National Championship";
    return "Later Round";
  })();
  const riskStyles: Record<string,{wrap:string;badge:string;bar:string}> = {
    L:{wrap:"bg-grn/[0.06] border-grn/20",badge:"text-grn",bar:"bg-grn"},
    M:{wrap:"bg-gld/[0.06] border-gld/25",badge:"text-gld",bar:"bg-gld"},
    H:{wrap:"bg-red/[0.06] border-red/25",badge:"text-red",bar:"bg-red"},
    X:{wrap:"bg-purple/[0.06] border-purple/25",badge:"text-purple",bar:"bg-purple"},
  };
  const riskS = risk ? riskStyles[risk.level] : riskStyles.L;
  const upsetLabel = md?.up ?? (d2 && risk && risk.pct >= 20 ? (d1.kp > (d2?.kp??99) ? t1 : t2) : "");

  return (
    <div className="w-[380px] min-w-[380px] border-l border-br bg-s1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-br flex-shrink-0">
        <div className="text-[13px] font-semibold text-white truncate">{t2 ? \`\${t1} vs \${t2}\` : t1}</div>
        <div className="text-[10px] text-tx3 mt-0.5">{roundLabel}{d1.r ? \` · \${d1.r}\` : ""}{d2?.r ? \` · \${d2.r}\` : ""}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-1 bg-s2 border border-br rounded p-2 text-center">
            <div className="font-mono text-[9px] text-tx3 mb-1">#{d1.s} SEED</div>
            <div className="text-base font-bold leading-tight">{t1}</div>
            <div className="font-mono text-[9px] text-tx3 mt-1">{d1.r}</div>
          </div>
          {d2 && (<><div className="text-[11px] font-semibold text-tx3 pt-4 flex-shrink-0">vs</div>
          <div className="flex-1 bg-s2 border border-br rounded p-2 text-center">
            <div className="font-mono text-[9px] text-tx3 mb-1">#{d2.s} SEED</div>
            <div className="text-base font-bold leading-tight">{t2}</div>
            <div className="font-mono text-[9px] text-tx3 mt-1">{d2.r}</div>
          </div></>)}
        </div>
        {(() => {
          const tagCfg: Record<string,string> = {elite:"text-blue border-blue/30 bg-blue/10",dark:"text-gld border-gld/30 bg-gld/10",upset:"text-red border-red/30 bg-red/10"};
          const tags = [{nm:t1,d:d1},...(d2?[{nm:t2,d:d2}]:[])].filter(x=>x.d.p!=="normal").map(({nm,d})=>{
            const label = d.p==="elite"?"Title Contender":d.p==="dark"?"Dark Horse":"Upset Candidate";
            return <span key={nm} className={\`font-mono text-[9px] px-1.5 py-0.5 rounded border \${tagCfg[d.p]}\`}>{nm}: {label}</span>;
          });
          return tags.length>0?<div className="flex flex-wrap gap-1.5 mb-3">{tags}</div>:null;
        })()}
        {risk && d2 && (<>
          <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">{upsetLabel?\`Upset Risk — \${upsetLabel}\`:"Win Probability"}</div>
          <div className={\`border rounded p-2.5 mb-3 \${riskS.wrap}\`}>
            <div className={\`font-mono text-[9px] tracking-widest uppercase mb-1.5 \${riskS.badge}\`}>{risk.label} UPSET RISK</div>
            <div className="flex items-baseline gap-3">
              <div className={\`text-2xl font-bold leading-none \${riskS.badge}\`}>{risk.pct}%</div>
              <div className="flex-1 h-1 bg-s3 rounded overflow-hidden"><div className={\`h-full rounded transition-all \${riskS.bar}\`} style={{width:\`\${risk.pct}%\`}}/></div>
            </div>
            {analysisText&&<div className="text-[11px] text-tx2 leading-relaxed mt-2">{analysisText}</div>}
          </div>
        </>)}
        {d2&&(<>
          <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">Pick Winner</div>
          <div className="flex gap-1.5 mb-3">
            {[t1,t2].map(team=>(
              <button key={team} onClick={()=>{if(picks[selectedId]===team)clearPick(selectedId);else setPick(selectedId,team);}}
                className={["flex-1 text-[12px] font-semibold py-2 px-2 rounded border transition-all truncate",w===team?"bg-blue/15 border-blue text-blue":"bg-s2 border-br text-tx2 hover:border-blue hover:text-blue"].join(" ")}>
                {w===team?"✓ ":""}{team}
              </button>
            ))}
          </div>
        </>)}
        {adv&&d2&&(<>
          <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">Matchup Edge</div>
          <div className="bg-s2 border border-br rounded p-2.5 mb-3">
            <div className="mb-2 text-[10px] font-semibold text-tx">{t1} <span className="text-blue">{adv.a1.length} adv</span>{" · "}{t2} <span className="text-gld">{adv.a2.length} adv</span></div>
            <div className="flex flex-col gap-1">
              {adv.items.map(item=>(
                <div key={item.cat} className="flex items-center gap-2 text-[10px]">
                  <span className="text-tx3 flex-1">{item.cat}</span>
                  <span className={item.cls==="t1"?"font-semibold text-blue":item.cls==="t2"?"font-semibold text-gld":"text-tx3"}>{item.edge}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 text-[11px] text-tx3 leading-relaxed border-t border-br pt-2">{adv.summary}</div>
          </div>
        </>)}
        {d2&&(<>
          <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">Key Statistics</div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            <StatCell label={\`Adj. Offense — \${t1}\`} value={d1.aO}       rank={d1.aO_r} colorClass={offColor(d1.aO)}/>
            <StatCell label={\`Adj. Offense — \${t2}\`} value={d2.aO}       rank={d2.aO_r} colorClass={offColor(d2.aO)}/>
            <StatCell label={\`Adj. Defense — \${t1}\`} value={d1.aD}       rank={d1.aD_r} colorClass={defColor(d1.aD)}/>
            <StatCell label={\`Adj. Defense — \${t2}\`} value={d2.aD}       rank={d2.aD_r} colorClass={defColor(d2.aD)}/>
            <StatCell label={\`3PT % — \${t1}\`}        value={\`\${d1.t3}%\`} rank={d1.t3_r} colorClass={t3Color(d1.t3)}/>
            <StatCell label={\`3PT % — \${t2}\`}        value={\`\${d2.t3}%\`} rank={d2.t3_r} colorClass={t3Color(d2.t3)}/>
            <StatCell label={\`TO Rate — \${t1}\`}      value={\`\${d1.to}%\`} rank={d1.to_r} colorClass={toColor(d1.to)}/>
            <StatCell label={\`TO Rate — \${t2}\`}      value={\`\${d2.to}%\`} rank={d2.to_r} colorClass={toColor(d2.to)}/>
            <StatCell label={\`oReb % — \${t1}\`}       value={\`\${d1.oR}%\`} rank={d1.oR_r} colorClass={d1.oR>=30?"text-grn":"text-gld"}/>
            <StatCell label={\`oReb % — \${t2}\`}       value={\`\${d2.oR}%\`} rank={d2.oR_r} colorClass={d2.oR>=30?"text-grn":"text-gld"}/>
            <StatCell label="KenPom Rank" value={\`#\${d1.kp}\`} rank={d1.kp} colorClass={kpColor(d1.kp)}/>
            <StatCell label="KenPom Rank" value={\`#\${d2.kp}\`} rank={d2.kp} colorClass={kpColor(d2.kp)}/>
          </div>
        </>)}
        {[{nm:t1,d:d1},...(d2?[{nm:t2,d:d2}]:[])].map(({nm,d})=>(
          <div key={nm}>
            <div className="font-mono text-[9px] tracking-widest text-tx3 uppercase pb-1 border-b border-br mt-2 mb-2">{nm.toUpperCase()} Profile</div>
            <InfoBlock type="N" title="Strength"   text={d.str}/>
            <InfoBlock type="N" title="Weakness"   text={d.weak}/>
            <InfoBlock type="B" title="Key Factor" text={d.key}/>
          </div>
        ))}
        <div className="h-4"/>
      </div>
    </div>
  );
}
`;

// Write all files
let count = 0;
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
  console.log("✓ Written: " + relPath);
  count++;
}
console.log("\nAll " + count + " files written successfully.");
console.log("Now run: git add . && git commit -m \"fix all bugs\" && git push");
