export const globals = {
  playerName: "",
  dictionary: {} as Record<string, string>,
  progress: {
    numItems: 0,
    minigameScore: 0,
    assessmentScore: 0,
  },
};

export function getPlayerName(): string {
  if (globals.playerName && globals.playerName.length > 0)
    return globals.playerName;
  try {
    const stored = localStorage.getItem("playerName");
    return stored ?? "";
  } catch (e) {
    return "";
  }
}

export const IMAGE_DIMENSIONS = {
  width: 200,
  height: 200,
};

// Stage dimensions
export const STAGE_WIDTH = 1500;
export const STAGE_HEIGHT = 800;
