"use client";

const HORSES = [
  { nm:"Illinois",   seed:"3-seed · South",   kp:5,  aO:"118.5(15)", aD:"89.5(7)",  tags:["#1 Defense Nationally","KenPom 5 as 3-seed","Most Underseeded"],            why:"KenPom #5 overall with the #1 adjusted defensive efficiency in the entire country — yet seeded as a 3. Analytics models consistently rate them as a 1 or 2. Navigate a potential Sweet 16 vs Houston and they can beat Florida in the Elite Eight. Most undervalued team in the field." },
  { nm:"Kansas",     seed:"4-seed · East",     kp:9,  aO:"119.5(12)", aD:"89.8(9)",  tags:["Peterson Wildcard","Top-10 Defense","Bill Self"],                           why:"Darryn Peterson is a projected Top-3 NBA Draft pick who can take over any game singlehandedly. Bill Self has won a national championship. Top-10 defense is consistent. If Peterson is locked in for 6 games, Kansas cuts down nets." },
  { nm:"Houston",    seed:"2-seed · South",    kp:6,  aO:"116.8(25)", aD:"86.2(1)",  tags:["Home Advantage E8","#1 Defense South","Near-Home Crowd"],                   why:"Best adjusted defense in the South (86.2 adjD, #1 nationally) and playing in Houston TX for the Elite Eight — essentially a home game. Beat Illinois (S16) then face Florida (E8) in a hostile atmosphere for the Gators." },
  { nm:"BYU",        seed:"6-seed · West",     kp:15, aO:"117.5(20)", aD:"94.0(37)", tags:["AJ Dybantsa","Potential #1 Overall Pick","March Legend Upside"],            why:"AJ Dybantsa is a mock #1 overall NBA Draft pick. One transcendent player can carry a team through 6 games in March. Without Saunders' spacing, opponents double him — but Dybantsa creates from anywhere on the floor." },
  { nm:"Gonzaga",    seed:"3-seed · West",     kp:8,  aO:"120.0(10)", aD:"91.5(16)", tags:["Graham Ike 19.7 PPG","30 Wins on Season","Huff Return = Title?"],           why:"Graham Ike at career-high 19.7 PPG is one of the best players in the country. 30-3 record. Top-8 KenPom. The entire ceiling hinges on one question: does Braden Huff return from his January injury? If yes, Gonzaga can beat Arizona." },
  { nm:"Iowa State", seed:"2-seed · Midwest",  kp:10, aO:"120.4(9)",  aD:"90.8(13)", tags:["Elite Backcourt Trio","Pressure Defense","Best F4 Value"],                  why:"Lipsey/Momcilovic/Jefferson might be the best trio outside the top-4 seeds. Pressure defense forces turnovers into fast-break points. Path to the Final Four doesn't require beating Michigan until the Elite Eight — avoid that matchup and they go to Indianapolis." },
];

export default function DarkHorsesPage() {
  return (
    <div className="flex-1 overflow-y-auto px-7 py-6">
      <h1 className="text-2xl font-bold text-gld mb-1">Dark Horses</h1>
      <p className="text-[12px] text-tx3 mb-5">
        Teams with Final Four or deeper potential that the bracket significantly undervalues by seed.
      </p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { l:"Best analytics sleeper", v:"Illinois",  s:"#1 defense · KenPom 5 as 3-seed",      vc:"text-blue" },
          { l:"Biggest star power",     v:"BYU",       s:"Dybantsa — potential #1 overall pick",  vc:"text-gld" },
          { l:"Home court advantage",   v:"Houston",   s:"Elite Eight near home turf in Houston", vc:"text-red" },
          { l:"Historic ghost",         v:"UMBC",      s:"2018 legacy. 42% 3PT. 12-game streak.",  vc:"text-purple" },
        ].map(c => (
          <div key={c.l} className="bg-s1 border border-br rounded-lg p-3">
            <div className="text-[9px] font-medium text-tx3 tracking-widest uppercase mb-1">{c.l}</div>
            <div className={`text-xl font-bold leading-none mb-1 ${c.vc}`}>{c.v}</div>
            <div className="text-[10px] text-tx3">{c.s}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[14px] font-semibold text-tx mb-3 flex items-center gap-2 after:flex-1 after:h-px after:bg-br">
        Dark Horse Profiles
      </h2>
      <div className="grid grid-cols-3 gap-2.5">
        {HORSES.map(h => (
          <div key={h.nm} className="bg-s1 border border-br border-t-2 border-t-gld rounded-md p-3">
            <div className="text-xl font-bold mb-0.5">{h.nm}</div>
            <div className="font-mono text-[9px] text-tx3 mb-2">{h.seed} · KenPom #{h.kp}</div>
            <div className="flex gap-3 mb-2">
              <div><div className="text-base font-bold text-gld">{h.aO}</div><div className="font-mono text-[8px] text-tx3">ADJ OFF</div></div>
              <div><div className="text-base font-bold text-gld">{h.aD}</div><div className="font-mono text-[8px] text-tx3">ADJ DEF</div></div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {h.tags.map(t => (
                <span key={t} className="font-mono text-[8px] px-1.5 py-0.5 rounded border text-gld border-gld/30 bg-gld/10">{t}</span>
              ))}
            </div>
            <div className="text-[11px] text-tx3 leading-relaxed">{h.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
