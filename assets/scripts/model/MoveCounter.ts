import { GameState } from "./GameState";

export class MoveCounter {
    private movesLeft: number;
    private state: GameState;

    constructor(maxMoves: number, state: GameState) {
        this.state = state;
        this.movesLeft = maxMoves;
    }

    updateMovesLeft() {
        this.movesLeft--;
        this.state.updateMovesLeft(this.movesLeft);

        if (this.movesLeft == 0) {
            this.state.isGameOver = true;
        }
    }
}