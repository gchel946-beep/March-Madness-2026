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

/**
 * Remove a team name from ALL picks in the bracket.
 * This is the cascade — if Team A won R1 then R2 then S16 then E8,
 * and we change R1, Team A gets wiped from every later round in one pass.
 */
function cascadeClear(picks: Record<string, string>, teamToRemove: string): Record<string, string> {
  const next = { ...picks };
  let changed = true;
  // Loop until stable — handles deep chains where clearing one team
  // might not affect anything further, but be safe.
  while (changed) {
    changed = false;
    for (const id of Object.keys(next)) {
      if (next[id] === teamToRemove) {
        delete next[id];
        changed = true;
      }
    }
  }
  return next;
}

export const useBracket = create<BracketStore>((set, get) => ({
  picks: {},
  selectedId: null,
  bracketPage: "left",
  activeTab: "bracket",

  setPick: (matchupId, team) =>
    set(s => {
      const oldWinner = s.picks[matchupId];
      // Start with the new pick in place
      let next = { ...s.picks, [matchupId]: team };
      // If there was a different team winning this slot before,
      // scrub them from every downstream matchup.
      if (oldWinner && oldWinner !== team) {
        // Remove old winner from all OTHER matchups (not the one we just set)
        for (const id of Object.keys(next)) {
          if (id !== matchupId && next[id] === oldWinner) {
            delete next[id];
          }
        }
      }
      return { picks: next };
    }),

  clearPick: (matchupId) =>
    set(s => {
      const oldWinner = s.picks[matchupId];
      const next = { ...s.picks };
      delete next[matchupId];
      // Cascade: remove old winner from any downstream matchups
      if (oldWinner) {
        for (const id of Object.keys(next)) {
          if (next[id] === oldWinner) {
            delete next[id];
          }
        }
      }
      return { picks: next };
    }),

  setSelected: (id) => set({ selectedId: id }),
  setBracketPage: (p) => set({ bracketPage: p }),
  setActiveTab: (t) => set({ activeTab: t }),

  resetAll: () => set({ picks: {}, selectedId: null }),

  winner: (id) => get().picks[id] ?? null,
}));
