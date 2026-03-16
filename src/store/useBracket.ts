"use client";
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
function removeTeam(picks: Record<string, string>, team: string, except: string): Record<string, string> {
  const next = { ...picks };
  for (const id of Object.keys(next)) {
    if (id !== except && next[id] === team) delete next[id];
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
      const old = s.picks[matchupId];
      let next = { ...s.picks, [matchupId]: team };
      if (old && old !== team) next = removeTeam(next, old, matchupId);
      return { picks: next };
    }),
  clearPick: (matchupId) =>
    set(s => {
      const old = s.picks[matchupId];
      let next = { ...s.picks };
      delete next[matchupId];
      if (old) next = removeTeam(next, old, "__none__");
      return { picks: next };
    }),
  setSelected: (id, teams) => set({ selectedId: id, selectedTeams: teams ?? null }),
  setBracketPage: (p) => set({ bracketPage: p }),
  setActiveTab: (t) => set({ activeTab: t }),
  resetAll: () => set({ picks: {}, selectedId: null, selectedTeams: null }),
  winner: (id) => get().picks[id] ?? null,
}));
