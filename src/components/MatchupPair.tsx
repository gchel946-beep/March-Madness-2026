"use client";
import TeamSlot from "@/components/TeamSlot";
import { useBracket } from "@/store/useBracket";
interface Props {
  matchupId: string;
  team1: string;
  team2: string;
}
function isPlaceholder(name: string) {
  return !name || name === "?" || name.includes("Winner") || name.includes("Win") || name === "TBD";
}
export default function MatchupPair({ matchupId, team1, team2 }: Props) {
  const { picks, selectedId, setSelected, setPick, clearPick } = useBracket();
  const isSelected = selectedId === matchupId;
  function getTeams(): [string, string] | undefined {
    const t1 = isPlaceholder(team1) ? "" : team1;
    const t2 = isPlaceholder(team2) ? "" : team2;
    if (t1 || t2) return [t1, t2];
    return undefined;
  }
  function handlePairClick() {
    setSelected(matchupId, getTeams());
  }
  function handleSlotClick(teamName: string) {
    if (isPlaceholder(teamName)) {
      setSelected(matchupId, getTeams());
      return;
    }
    if (picks[matchupId] === teamName) clearPick(matchupId);
    else setPick(matchupId, teamName);
    setSelected(matchupId, getTeams());
  }
  return (
    <div
      id={`pair-${matchupId}`}
      onClick={handlePairClick}
      className={["flex flex-col cursor-pointer no-select", isSelected ? "ring-1 ring-blue/50 rounded" : ""].join(" ")}
    >
      <TeamSlot matchupId={matchupId} name={team1 || "?"} position="top" picks={picks} onClick={() => handleSlotClick(team1)} />
      <TeamSlot matchupId={matchupId} name={team2 || "?"} position="bot" picks={picks} onClick={() => handleSlotClick(team2)} />
    </div>
  );
}
