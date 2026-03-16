"use client";

import TeamSlot from "@/components/TeamSlot";
import { useBracket } from "@/store/useBracket";

interface Props {
  matchupId: string;
  team1: string;
  team2: string;
}

export default function MatchupPair({ matchupId, team1, team2 }: Props) {
  const { picks, selectedId, setSelected, setPick, clearPick } = useBracket();
  const isSelected = selectedId === matchupId;

  function handlePairClick() {
    setSelected(matchupId);
  }

  function handleSlotClick(teamName: string) {
    if (!teamName || teamName === "?" || teamName.includes("Winner") || teamName.includes("TBD")) {
      setSelected(matchupId);
      return;
    }
    if (picks[matchupId] === teamName) {
      clearPick(matchupId);
    } else {
      setPick(matchupId, teamName);
    }
    setSelected(matchupId);
  }

  return (
    <div
      id={`pair-${matchupId}`}
      onClick={handlePairClick}
      className={[
        "flex flex-col cursor-pointer no-select",
        isSelected ? "ring-1 ring-blue/50 rounded" : "",
      ].join(" ")}
    >
      <TeamSlot
        matchupId={matchupId}
        name={team1 || "?"}
        position="top"
        picks={picks}
        onClick={() => handleSlotClick(team1)}
      />
      <TeamSlot
        matchupId={matchupId}
        name={team2 || "?"}
        position="bot"
        picks={picks}
        onClick={() => handleSlotClick(team2)}
      />
    </div>
  );
}
