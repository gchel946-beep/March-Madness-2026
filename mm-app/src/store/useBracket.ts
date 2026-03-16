"use client";

import { create } from "zustand";
import { BracketPage, Tab } from "@/types";

interface BracketStore {
  picks: Record<string, string>;
  selectedId: string | null;
  bracketPage: BracketPage;
  activeTab: Tab;

  setPick: (matchupId: string, team: string) => void;
  clearPick: (matchupId: string) => void;
  setSelected: (id: string | null) => void;
  setBracketPage: (p: BracketPage) => void;
  setActiveTab: (t: Tab) => void;
  resetAll: () => void;
  winner: (id: string) => string | null;
}

export const useBracket = create<BracketStore>((set, get) => ({
  picks: {},
  selectedId: null,
  bracketPage: "left",
  activeTab: "bracket",

  setPick: (matchupId, team) =>
    set(s => ({ picks: { ...s.picks, [matchupId]: team } })),

  clearPick: (matchupId) =>
    set(s => {
      const next = { ...s.picks };
      delete next[matchupId];
      return { picks: next };
    }),

  setSelected: (id) => set({ selectedId: id }),
  setBracketPage: (p) => set({ bracketPage: p }),
  setActiveTab: (t) => set({ activeTab: t }),

  resetAll: () => set({ picks: {}, selectedId: null }),

  winner: (id) => get().picks[id] ?? null,
}));
