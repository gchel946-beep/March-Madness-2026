"use client";

import MatchupPair from "@/components/MatchupPair";
import { useBracket } from "@/store/useBracket";
import { resolveR1Teams } from "@/data/matchups";

interface Props {
  prefix: string;
  r1ids: string[];
  rtl?: boolean;
}

function RoundHeader({ label }: { label: string }) {
  return (
    <div className="font-mono text-[9px] text-tx3 tracking-widest uppercase text-center pb-1">
      {label}
    </div>
  );
}

export default function RegionGrid({ prefix, r1ids, rtl = false }: Props) {
  const { winner, picks } = useBracket();

  // Resolve R1 teams — substitutes First Four winners where applicable
  const r1teams: [string, string][] = r1ids.map(id => resolveR1Teams(id, picks));

  const r2ids = r1ids.map((_, i) => `${prefix}-r2-${i}`);
  const r2t: [string, string][] = [];
  for (let i = 0; i < 8; i += 2) {
    r2t.push([winner(r1ids[i]) ?? "", winner(r1ids[i + 1]) ?? ""]);
  }

  const s16ids = [`${prefix}-s16-0`, `${prefix}-s16-1`];
  const s16t: [string, string][] = [
    [winner(r2ids[0]) ?? "", winner(r2ids[1]) ?? ""],
    [winner(r2ids[2]) ?? "", winner(r2ids[3]) ?? ""],
  ];

  const e8id = `${prefix}-e8`;
  const e8t: [string, string] = [winner(s16ids[0]) ?? "", winner(s16ids[1]) ?? ""];

  return (
    <div className={`flex items-start ${rtl ? "flex-row-reverse" : ""}`}>

      {/* Round 1 — uses resolved teams (FF4 winners flow in here) */}
      <div style={{ width: 172 }}>
        <RoundHeader label="ROUND 1" />
        {r1ids.map((id, i) => {
          const [t1, t2] = r1teams[i];
          return (
            <div key={id}>
              <MatchupPair matchupId={id} team1={t1} team2={t2} />
              {i < 7 && <div style={{ height: 4 }} />}
            </div>
          );
        })}
      </div>

      {/* Round 2 */}
      <div style={{ width: 172, paddingLeft: 3, paddingRight: 3 }}>
        <RoundHeader label="ROUND 2" />
        {r2t.map(([t1, t2], i) => (
          <div key={r2ids[i]}>
            <div style={{ height: i === 0 ? 27 : 4 }} />
            <MatchupPair matchupId={r2ids[i]} team1={t1} team2={t2} />
            <div style={{ height: 25 }} />
          </div>
        ))}
      </div>

      {/* Sweet 16 */}
      <div style={{ width: 172, paddingLeft: 3, paddingRight: 3 }}>
        <RoundHeader label="SWEET 16" />
        {s16t.map(([t1, t2], i) => (
          <div key={s16ids[i]}>
            <div style={{ height: i === 0 ? 83 : 8 }} />
            <MatchupPair matchupId={s16ids[i]} team1={t1} team2={t2} />
            <div style={{ height: 80 }} />
          </div>
        ))}
      </div>

      {/* Elite 8 */}
      <div style={{ width: 172, paddingLeft: 3, paddingRight: 3 }}>
        <RoundHeader label="ELITE 8" />
        <div style={{ height: 194 }} />
        <MatchupPair matchupId={e8id} team1={e8t[0]} team2={e8t[1]} />
      </div>

    </div>
  );
}
