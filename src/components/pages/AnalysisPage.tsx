"use client";

import { useBracket } from "@/store/useBracket";
import { getTeam } from "@/data/teams";
import { MATCHUPS } from "@/data/matchups";

const R1_IDS = [
  "e-1","e-2","e-3","e-4","e-5","e-6","e-7","e-8",
  "s-1","s-2","s-3","s-4","s-5","s-6","s-7","s-8",
  "w-1","w-2","w-3","w-4","w-5","w-6","w-7","w-8",
  "mw-1","mw-2","mw-3","mw-4","mw-5","mw-6","mw-7","mw-8",
];

export default function AnalysisPage() {
  const { picks } = useBracket();

  const pickedR1    = R1_IDS.filter(id => picks[id]);
  const totalPicks  = Object.keys(picks).length;
  const upsets      = pickedR1.filter(id => { const m = MATCHUPS[id]; return m && picks[id] === m.t2 && m.uc >= 44; });
  const highUpsets  = pickedR1.filter(id => { const m = MATCHUPS[id]; return m && picks[id] === m.t2 && m.uc >= 65; });
  const champ       = picks["champ"];
  const champSeed   = champ ? getTeam(champ).s : null;
  const upsetRate   = pickedR1.length > 0 ? Math.round((upsets.length / pickedR1.length) * 100) : 0;

  if (pickedR1.length < 4) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto px-7 py-6">
        <h1 className="text-2xl font-bold text-tx mb-1">My Bracket Analysis</h1>
        <p className="text-[12px] text-tx3 mb-5">Personalized analytics based on your bracket picks.</p>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-tx3 pb-12">
          <div className="text-4xl mb-4 opacity-30">📋</div>
          <div className="text-[15px] font-semibold text-tx2 mb-2">Not Enough Picks Yet</div>
          <p className="text-[12px] max-w-sm leading-relaxed">
            Make at least 4 first-round picks to see your bracket analysis. Head to the <strong className="text-blue">Bracket</strong> tab to get started.
          </p>
        </div>
      </div>
    );
  }

  // Personality
  let personality: string, persColor: string, persReason: string;
  if (upsets.length >= 6) {
    personality = "Contrarian"; persColor = "text-purple";
    persReason = "You've picked a high number of upsets — more than most winning brackets. Your bracket requires multiple high-probability upsets to materialize simultaneously. High risk, high reward strategy.";
  } else if (upsets.length >= 4) {
    personality = "Upset-Heavy"; persColor = "text-red";
    persReason = "You've picked several statistical upsets beyond chalk expectations. This is historically aggressive but not extreme. Expect around 35–38% of your upset picks to hit.";
  } else if (upsets.length >= 2 && (champSeed ?? 99) <= 2) {
    personality = "Balanced"; persColor = "text-blue";
    persReason = "You've mixed in a few well-reasoned upsets while protecting your chalk path to a strong champion. This is the most statistically successful bracket profile historically.";
  } else if (champSeed && champSeed >= 4) {
    personality = "High Variance"; persColor = "text-gld";
    persReason = "Picking a lower-seeded champion is a high-variance strategy. These brackets rarely win pools but stand out when they hit. Your differentiation is your advantage.";
  } else {
    personality = "Chalk"; persColor = "text-grn";
    persReason = "You've followed the chalk heavily. Low-risk bracket that protects against busted picks. Historically safe but rarely wins large pools due to low differentiation from other entrants.";
  }

  // Champion risk
  let champRisk = "", champRiskDetail = "";
  if (champ) {
    if ((champSeed ?? 99) === 1 && getTeam(champ).kp <= 5) {
      champRisk = "Low";
      champRiskDetail = "Picking a top-ranked 1-seed as champion is historically the most common winning strategy. Approximately 67% of champions are 1-seeds.";
    } else if ((champSeed ?? 99) <= 2) {
      champRisk = "Low–Moderate";
      champRiskDetail = "A 2-seed champion happens in roughly 18% of tournaments. Slightly contrarian but well within normal range.";
    } else if ((champSeed ?? 99) <= 4) {
      champRisk = "Moderate";
      champRiskDetail = "A 3–4 seed winning is uncommon (about 12% of tournaments) but not rare. This pick provides differentiation in most pools.";
    } else {
      champRisk = "High";
      champRiskDetail = "Champions seeded 5+ happen in only ~3% of tournaments. This is a bold differentiation pick that rarely pays off but stands out when it does.";
    }
  }

  // Historical comparison
  let histMatch = "", histDetail = "";
  if (upsets.length >= 5) {
    histMatch = "Similar to 2022 — the year of March Madness chaos";
    histDetail = "Your upset-heavy bracket resembles tournaments where multiple double-digit seeds reached the Sweet 16 (2022: Saint Peter's; 2011: VCU). These brackets reward conviction but require multiple upsets to materialize simultaneously.";
  } else if (upsets.length >= 3 && (champSeed ?? 99) <= 2) {
    histMatch = "Similar to balanced championship years (2019, 2021)";
    histDetail = "Your bracket pattern — mixing strategic upsets with chalk champion picks — mirrors the most commonly successful pool entries. Good upside without overexposure to upset risk.";
  } else if (personality === "Chalk") {
    histMatch = "Similar to chalk-heavy years (2023, 2025)";
    histDetail = "Your chalk-heavy approach mirrors tournaments where top seeds dominated, like 2023 (all 1-seeds to Final Four). These brackets are safe but rarely differentiated enough to win large pools.";
  } else {
    histMatch = "Similar to moderate upset years (2018, 2024)";
    histDetail = "Your bracket mix aligns with typical tournament patterns where 2–3 double-digit seeds advance. Historically the most common tournament outcome profile.";
  }

  // Recommendations
  const recs: { icon: string; text: string }[] = [];
  if (upsets.length === 0)
    recs.push({ icon:"⚠️", text:"<strong>Consider adding 1–2 statistical upsets.</strong> Historical base rates suggest 35–38% of 12-seeds win Round 1. VCU and Akron have the strongest analytical backing this year." });
  if (upsets.length >= 5)
    recs.push({ icon:"🎲", text:"<strong>You've picked a lot of upsets.</strong> Historically, only 1–3 of your upset picks will hit. Consider which 2–3 have the strongest analytical support and trim the rest." });
  if (champSeed && champSeed >= 5)
    recs.push({ icon:"⚡", text:`<strong>Your champion pick is very bold.</strong> A ${champSeed}-seed champion happens in ~3% of tournaments. This is highly differentiated but a significant variance risk.` });
  if (personality === "Chalk" && totalPicks > 8)
    recs.push({ icon:"📊", text:"<strong>Your bracket lacks differentiation.</strong> Chalk-heavy brackets rarely win large pools. Consider 1–2 well-supported upset picks to stand out without sacrificing overall quality." });
  if (!champ && totalPicks >= 8)
    recs.push({ icon:"🏆", text:"<strong>No champion selected yet.</strong> Head to the Final Four page to complete your bracket and see full analysis." });
  recs.push({ icon:"💡", text:"<strong>Best differentiation pick this year:</strong> Illinois to the Final Four. KenPom #5 as a 3-seed is the most undervalued team in the field and will appear in very few brackets." });

  const champRiskColor =
    champRisk === "Low" ? "text-grn" :
    champRisk === "Low–Moderate" ? "text-grn" :
    champRisk === "Moderate" ? "text-gld" : "text-red";

  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-tx mb-1">My Bracket Analysis</h1>
      <p className="text-[12px] text-tx3 mb-5">
        Personalized analytics based on your {totalPicks} picks across the bracket.
      </p>

      {/* Personality card */}
      <div className="bg-s1 border border-br border-t-2 border-t-blue rounded-lg p-5 mb-5">
        <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-2">Bracket Personality</div>
        <div className={`text-3xl font-bold mb-1 ${persColor}`}>{personality}</div>
        <div className="text-[11px] text-tx3 mb-3">
          {pickedR1.length} Round 1 picks · {upsets.length} statistical upsets · {champ ?? "No champion yet"}
        </div>
        <div className="text-[12px] text-tx2 leading-relaxed">{persReason}</div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-s1 border border-br rounded-lg p-3">
          <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-2">Upset Picks (R1)</div>
          <div className={`text-2xl font-bold mb-1 ${upsets.length >= 4 ? "text-red" : "text-blue"}`}>
            {upsets.length}/{pickedR1.length}
          </div>
          <div className="text-[10px] text-tx3">{upsetRate}% upset rate (avg. ~28%)</div>
        </div>
        <div className="bg-s1 border border-br rounded-lg p-3">
          <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-2">Champion Risk</div>
          <div className={`text-2xl font-bold mb-1 ${champRiskColor}`}>{champRisk || "—"}</div>
          <div className="text-[10px] text-tx3">{champ ? `${champ} (#${champSeed} seed)` : "No champion picked yet"}</div>
        </div>
        <div className="bg-s1 border border-br rounded-lg p-3">
          <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-2">High-Conf Upsets Picked</div>
          <div className="text-2xl font-bold text-gld mb-1">{highUpsets.length}</div>
          <div className="text-[10px] text-tx3">Upsets with 65%+ confidence</div>
        </div>
        <div className="bg-s1 border border-br rounded-lg p-3">
          <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-2">Total Picks Made</div>
          <div className="text-2xl font-bold mb-1">{totalPicks}</div>
          <div className="text-[10px] text-tx3">Of ~63 possible tournament games</div>
        </div>
      </div>

      {/* Champion detail */}
      {champRiskDetail && (
        <>
          <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            Champion Analysis
          </h2>
          <div className="bg-blue/10 border border-blue/20 rounded-md p-3 mb-5">
            <div className="font-mono text-[9px] tracking-widest text-blue uppercase mb-1.5">
              {champ ?? "TBD"}{champRisk ? ` — ${champRisk} Risk` : ""}
            </div>
            <div className="text-[11px] text-tx2 leading-relaxed">{champRiskDetail}</div>
          </div>
        </>
      )}

      {/* Upset picks */}
      {upsets.length > 0 && (
        <>
          <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
            Your Upset Picks
          </h2>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {upsets.map(id => {
              const md = MATCHUPS[id];
              const w  = picks[id];
              const opp = md.t1 === w ? md.t2 : md.t1;
              const d   = getTeam(w);
              return (
                <div key={id} className="bg-s1 border border-br border-l-4 border-l-red rounded-md p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-[13px] font-semibold leading-tight">{w} over {opp}</div>
                    <div className="text-lg font-bold text-red flex-shrink-0">{md.uc}%</div>
                  </div>
                  <div className="font-mono text-[9px] text-tx3 mb-1.5">#{d.s} seed · {md.reg}</div>
                  <div className="text-[11px] text-tx3 leading-relaxed line-clamp-3">{md.ex}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Historical comparison */}
      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        Historical Comparison
      </h2>
      <div className="bg-s1 border border-br rounded-lg p-4 mb-5">
        <div className="text-[13px] font-semibold text-tx mb-2">{histMatch}</div>
        <div className="text-[11px] text-tx3 leading-relaxed">{histDetail}</div>
      </div>

      {/* Recommendations */}
      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        Recommendations
      </h2>
      <div className="flex flex-col gap-2">
        {recs.map((r, i) => (
          <div key={i} className="flex items-start gap-3 bg-s2 border border-br rounded-md px-3 py-2.5">
            <span className="text-base flex-shrink-0 mt-0.5">{r.icon}</span>
            <div
              className="text-[11px] text-tx2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: r.text }}
            />
          </div>
        ))}
      </div>

      <div className="h-6" />
    </div>
  );
}
