import { GameConfig } from "../GameConfig";

// GameState.ts
export class GameState {
    public get movesLeft(): number {
        return this._movesLeft;
    }
    private set movesLeft(value: number) {
        this._movesLeft = value;
    }
    public get score(): number {
        return this._score;
    }
    private set score(value: number) {
        this._score = value;
    }

    constructor(
        private _score: number,
        private _movesLeft: number,
        public isGameOver: boolean,
        public isGameWon: boolean,
        public shuffleCount: number
    ) {}
    
    public static initial(config: GameConfig): GameState {
        return new GameState(0, config.maxMoves, false, false, 0);
    }

    public update(score: number, moves: number): void {
        this.score = score;
        this.movesLeft = moves;
    }
}