// Файл: GameEvents.ts
export interface GameEvents {
  "score-changed" : { score: number; };
  "moves-changed" : { moves: number; };
}

export const ScoreChangedEvent = "score-changed";
export const MovesChangedEvent = "moves-changed";
export const RestartEventName = "restart";