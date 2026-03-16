"use client";

import { useBracket } from "@/store/useBracket";
import Nav from "@/components/Nav";
import BracketPage from "@/components/BracketPage";
import UpsetsPage from "@/components/pages/UpsetsPage";
import DarkHorsesPage from "@/components/pages/DarkHorsesPage";
import InsightsPage from "@/components/pages/InsightsPage";
import AnalysisPage from "@/components/pages/AnalysisPage";
import SimulatePage from "@/components/pages/SimulatePage";

export default function MainApp() {
  const activeTab = useBracket(s => s.activeTab);

  return (
    <div className="flex flex-col h-screen bg-base overflow-hidden">
      <Nav />
      <div className={activeTab === "bracket" ? "flex flex-col flex-1 overflow-hidden" : "hidden"}>
        <BracketPage />
      </div>
      <div className={activeTab === "upsets" ? "flex flex-1 overflow-hidden" : "hidden"}>
        <UpsetsPage />
      </div>
      <div className={activeTab === "darkhorses" ? "flex flex-1 overflow-hidden" : "hidden"}>
        <DarkHorsesPage />
      </div>
      <div className={activeTab === "insights" ? "flex flex-1 overflow-hidden" : "hidden"}>
        <InsightsPage />
      </div>
      <div className={activeTab === "analysis" ? "flex flex-1 overflow-hidden" : "hidden"}>
        <AnalysisPage />
      </div>
      <div className={activeTab === "simulate" ? "flex flex-1 overflow-hidden" : "hidden"}>
        <SimulatePage />
      </div>
    </div>
  );
}
