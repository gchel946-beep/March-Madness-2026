"use client";

const UPSETS = [
  { m:"VCU over North Carolina",    conf:78, seed:"11 over 6", reg:"South",   c:"red",  why:"VCU shoots 36.7% from 3 — UNC allows 34.5%. VCU has 31.3% offensive rebound rate. Wilson (19.8/9.4) is OUT with torn thumb. VCU won 16 of last 17. Every statistical indicator points to VCU. The cleanest matchup-based upset in the bracket." },
  { m:"Akron over Texas Tech",      conf:74, seed:"12 over 5", reg:"Midwest", c:"red",  why:"JT Toppin (21.8 PPG, 10.8 RPG) tore ACL in February. Texas Tech lost 3 straight entering tournament. Akron is 29-6 on their 3rd consecutive NCAA Tournament. The matchup has completely flipped." },
  { m:"South Florida over Louisville", conf:67, seed:"11 over 6", reg:"East", c:"red",  why:"Mikel Brown (16.2 PPG) missed the final 4 games with injury. South Florida is American Conference champion at 25-8. They shoot 38% from 3 and Louisville allows 37%. Classic injury trap game." },
  { m:"Utah State over Villanova",  conf:56, seed:"9 over 8",  reg:"West",   c:"gold", why:"Utah State (28-6, KP#29) is statistically better than Villanova (KP#36). Some lines actually favor Utah State. Their 38% 3PT attacks Villanova's soft perimeter defense." },
  { m:"Iowa over Clemson",          conf:55, seed:"9 over 8",  reg:"South",  c:"gold", why:"Iowa went 19-4 vs unranked teams and shoots 38% from 3. Clemson lost to 5 unranked opponents. Iowa's Big Ten experience and better metrics make this a clear analytical pick." },
  { m:"Texas A&M over Saint Mary's",conf:54, seed:"10 over 7", reg:"South",  c:"gold", why:"#4 scoring offense (87.7 PPG), 6 players averaging 10+ PPG. Saint Mary's Bucky Ball slowdown has never faced this level of sustained offensive firepower." },
  { m:"Hawai'i over Arkansas",      conf:52, seed:"13 over 4", reg:"West",   c:"gold", why:"Isaac Johnson (7-foot, 14.1 PPG) + 5 seniors + #25 rebounding. Arkansas has no true shot-blocker. Classic 13-over-4 formula executed perfectly." },
  { m:"McNeese over Vanderbilt",    conf:48, seed:"12 over 5", reg:"South",  c:"blue", why:"McNeese leads the NATION in turnover margin (+7.3). Vanderbilt has 14% TO rate and just ran through a grueling SEC tournament. Fatigue + elite pressure defense = perfect upset formula." },
  { m:"TCU over Ohio State",        conf:48, seed:"9 over 8",  reg:"East",   c:"blue", why:"TCU's #17 adjusted defense neutralizes Ohio State's inconsistent offense. Line is nearly even. TCU's defensive discipline is the deciding factor in this coin flip." },
  { m:"High Point over Wisconsin",  conf:44, seed:"12 over 5", reg:"West",   c:"blue", why:"High Point 30-4 scores 90+ PPG. Wisconsin scores 83. Neither defends well. Both shoot 36-38% from 3. Whoever runs hotter from deep wins this pure 3PT coin flip." },
  { m:"Missouri over Miami FL",     conf:44, seed:"10 over 7", reg:"West",   c:"blue", why:"Missouri's fast tempo (73) and SEC toughness can push the pace against Miami FL's preferred halfcourt game. Both teams are evenly matched." },
  { m:"UMBC over Michigan",         conf:22, seed:"16 over 1", reg:"Midwest",c:"blue", why:"2018 legacy program. DJ Armstrong shoots 42% from 3, scored 33 in conf final. 12-game win streak. Must beat Howard first. Most dangerous 16-seed in the field." },
];

const BORDER: Record<string,string> = { red:"border-l-red", gold:"border-l-gld", blue:"border-l-blue" };
const PCT_COLOR: Record<string,string> = { red:"text-red", gold:"text-gld", blue:"text-blue" };

export default function UpsetsPage() {
  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-red mb-1">Upset Watch</h1>
      <p className="text-[12px] text-tx3 mb-5">
        Matchup-based upset analysis using KenPom efficiency metrics, injury intelligence, and statistical exploits.
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { l:"High confidence (65%+)", v:"3",     s:"VCU, Akron, South Florida", vc:"text-red" },
          { l:"Best 12-seed",           v:"Akron", s:"74% — Texas Tech Toppin out with ACL", vc:"" },
          { l:"Best 11-seed",           v:"VCU",   s:"78% — Wilson out + perfect matchup", vc:"" },
          { l:"Sneaky 13-seed",         v:"Hawai\u02BBi", s:"52% — 7-footer + 5 seniors", vc:"text-gld" },
        ].map(c => (
          <div key={c.l} className="bg-s1 border border-br rounded-lg p-3">
            <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">{c.l}</div>
            <div className={`text-2xl font-bold leading-none mb-1 ${c.vc}`}>{c.v}</div>
            <div className="text-[10px] text-tx3">{c.s}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        All Upset Picks — Ranked by Confidence
      </h2>
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {UPSETS.map(u => (
          <div key={u.m} className={`bg-s1 border border-br border-l-4 rounded-md p-3 ${BORDER[u.c]}`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="text-[13px] font-semibold leading-tight flex-1">{u.m}</div>
              <div className={`text-xl font-bold flex-shrink-0 ${PCT_COLOR[u.c]}`}>{u.conf}%</div>
            </div>
            <div className="font-mono text-[9px] text-tx3 mb-2">{u.seed} · {u.reg}</div>
            <div className="text-[11px] text-tx3 leading-relaxed">{u.why}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        Historical Context
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { t:"12-seed win rate: 35–38% historically", b:"Every year one or two 5-seeds fall. This year's best: Akron (vs wounded Texas Tech) and McNeese (vs tired Vanderbilt). Expect at least one 12-over-5 — it's historically consistent every single year." },
          { t:"The 11-seed line is loaded in 2026",    b:"VCU (perfect matchup), South Florida (injury gift), NC State (2024 Final Four pedigree), Miami OH (31-4). 11-seeds produce the deepest underdog runs. Expect 2 of these 4 to advance." },
          { t:"Classic 13-over-4 formula",             b:"13-seeds win when they have a specific physical advantage the opponent can't solve in 40 minutes. Hawai'i's 7-foot center vs Arkansas's lack of shot-blockers is exactly that profile." },
          { t:"Injury factor is the great equalizer",  b:"March history is full of injury-triggered upsets. Louisville (Brown out) and Texas Tech (Toppin out) are 2026's most vulnerable teams. The committee never re-seeds for injuries." },
        ].map(c => (
          <div key={c.t} className="bg-s1 border border-br rounded-md p-3">
            <div className="text-[13px] font-semibold text-blue mb-2">{c.t}</div>
            <div className="text-[11px] text-tx3 leading-relaxed">{c.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
