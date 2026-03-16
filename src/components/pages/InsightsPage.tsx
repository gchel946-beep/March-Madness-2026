"use client";

export default function InsightsPage() {
  const regions = [
    { r:"East",    c:"text-blue  border-t-blue",  t:"Duke (1-seed)",     d:"Hardest",    n:"UConn (2) and Michigan State (3) are both Final Four caliber. Duke drew the most brutal bracket of any 1-seed. If Duke wins the East they truly earned it." },
    { r:"South",   c:"text-red   border-t-red",   t:"Florida (1-seed)",  d:"Very Hard",  n:"Illinois (3, #1 defense) + Houston (2, near-home E8). Defending champion faces near-impossible repeat path." },
    { r:"West",    c:"text-grn   border-t-grn",   t:"Arizona (1-seed)",  d:"Moderate",   n:"Purdue (2, #1 offense) is dangerous but middle seeds are weaker. Arizona's path is second most manageable." },
    { r:"Midwest", c:"text-gld   border-t-gld",   t:"Michigan (1-seed)", d:"Manageable", n:"Iowa State (2) is elite but Michigan only needs to beat them in E8. Most favorable 1-seed path to Indianapolis." },
  ];

  const tips = [
    { t:"VCU over UNC is not really an upset",             b:"Wilson out, UNC allows 34.5% from 3, VCU shoots 36.7%, VCU has 31.3% oReb rate, VCU won 16 of 17. As close to a statistical lock as any 11-seed gets in tournament history." },
    { t:"Illinois to the Final Four is the power move",    b:"KenPom #5 as a 3-seed with the nation's #1 adjusted defense. Most models rate them as a 1 or 2 seed quality. Bracketologists who advance Illinois to the Final Four have a significant field edge." },
    { t:"Florida is vulnerable — fade them in the Elite Eight", b:"Defending champion with a loss to Vanderbilt in SEC semis. Elite Eight is in Houston TX — essentially an away game. History shows defending champions rarely repeat. Fade Florida there." },
    { t:"Michigan is the safest champion pick",            b:"KenPom #2 with the most manageable 1-seed path. Lendeborg is dominant. 31 wins. Iowa State is the only true obstacle before the Final Four." },
    { t:"Pick 2–3 double-digit seeds in Round 1",          b:"35–38% of 12-seeds win, 38% of 11-seeds win historically. VCU, Akron, South Florida, and Hawai'i are all legitimate. Any bracket without 2–3 upsets plays against historical distribution." },
    { t:"Kansas: all-in or all-out on Peterson",           b:"Peterson is the highest-variance player in the tournament. Locked in = Kansas beats anyone including Duke. Ghosts = they lose Round 2. Do not hedge." },
    { t:"Houston's home court is the hidden advantage",    b:"Houston earned a 2-seed in the South. The Elite Eight is in Houston TX. Florida — defending 1-seed — faces what amounts to a road game. This one fact could determine the national champion." },
    { t:"Purdue: does offense alone win in March?",        b:"#1 offense in the country vs Arizona's #3 team. 41% 3PT. But defense at 50th nationally is a genuine gap. Only pick Purdue if you believe offense wins championships." },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-blue mb-1">Strategic Insights</h1>
      <p className="text-[12px] text-tx3 mb-5">
        Data-driven bracket building strategy using KenPom efficiency, historical trends, and matchup analytics.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { l:"12-seed historical win rate", v:"35%",  s:"Pick at least one 12-over-5",      vc:"text-red" },
          { l:"All four 1-seeds to F4 odds", v:"1.5%", s:"2025 was the outlier. Don't repeat.", vc:"text-blue" },
          { l:"11-seed Round 1 win rate",    v:"38%",  s:"2026 has the best 11-line in years",  vc:"text-gld" },
          { l:"1-seed champion rate",        v:"67%",  s:"1-seeds win most titles — not all",    vc:"text-grn" },
        ].map(c => (
          <div key={c.l} className="bg-s1 border border-br rounded-lg p-3">
            <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">{c.l}</div>
            <div className={`text-2xl font-bold leading-none mb-1 ${c.vc}`}>{c.v}</div>
            <div className="text-[10px] text-tx3">{c.s}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        Region Difficulty Ranking
      </h2>
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {regions.map(r => (
          <div key={r.r} className={`bg-s1 border border-br border-t-2 rounded-md p-3 ${r.c}`}>
            <div className={`text-base font-bold tracking-wide mb-0.5 ${r.c.split(" ")[0]}`}>{r.r}</div>
            <div className="text-[11px] font-semibold text-tx mb-1">{r.t}</div>
            <div className={`font-mono text-[9px] mb-2 ${r.c.split(" ")[0]}`}>{r.d}</div>
            <div className="text-[10px] text-tx3 leading-relaxed">{r.n}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        Bracket Building Strategy
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {tips.map(c => (
          <div key={c.t} className="bg-s1 border border-br rounded-md p-3">
            <div className="text-[13px] font-semibold text-blue mb-1.5">{c.t}</div>
            <div className="text-[11px] text-tx3 leading-relaxed">{c.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
