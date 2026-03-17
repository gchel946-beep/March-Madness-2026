"use client";

import { useBracket } from "@/store/useBracket";
import RegionGrid from "@/components/RegionGrid";
import FinalFour from "@/components/FinalFour";
import Sidebar from "@/components/Sidebar";
import FirstFourPanel from "@/components/FirstFourPanel";
import { EAST_R1, SOUTH_R1, WEST_R1, MIDWEST_R1 } from "@/data/matchups";
import { BracketPage as BracketPageType } from "@/types";

const PAGES: { id: BracketPageType; label: string }[] = [
  { id: "left",   label: "◀ East / South" },
  { id: "center", label: "Final Four" },
  { id: "right",  label: "West / Midwest ▶" },
];

export default function BracketPage() {
  const { bracketPage, setBracketPage } = useBracket();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* First Four panel — always visible at top */}
      <FirstFourPanel />

      {/* Sub-tabs */}
      <div className="h-9 flex-shrink-0 flex items-center gap-1 px-3 bg-s1 border-b border-br no-select">
        {PAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setBracketPage(p.id)}
            className={[
              "text-[12px] font-medium px-3 py-1.5 rounded border transition-all whitespace-nowrap",
              bracketPage === p.id
                ? "bg-s2 border-br2 text-tx"
                : "border-transparent text-tx3 hover:text-tx2",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-3">
          {bracketPage === "left" && (
            <div className="flex flex-col gap-3 min-w-max">
              <div>
                <div className="font-mono text-[10px] font-semibold tracking-widest text-blue uppercase text-center pb-1.5">
                  EAST REGION
                </div>
                <RegionGrid prefix="e" r1ids={EAST_R1} />
              </div>
              <div>
                <div className="font-mono text-[10px] font-semibold tracking-widest text-red uppercase text-center pb-1.5">
                  SOUTH REGION
                </div>
                <RegionGrid prefix="s" r1ids={SOUTH_R1} />
              </div>
            </div>
          )}

          {bracketPage === "right" && (
            <div className="flex flex-col gap-3 min-w-max">
              <div>
                <div className="font-mono text-[10px] font-semibold tracking-widest text-grn uppercase text-center pb-1.5">
                  WEST REGION
                </div>
                <RegionGrid prefix="w" r1ids={WEST_R1} rtl />
              </div>
              <div>
                <div className="font-mono text-[10px] font-semibold tracking-widest text-gld uppercase text-center pb-1.5">
                  MIDWEST REGION
                </div>
                <RegionGrid prefix="mw" r1ids={MIDWEST_R1} rtl />
              </div>
            </div>
          )}

          {bracketPage === "center" && <FinalFour />}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
