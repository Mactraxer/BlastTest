import { GameConfig } from "../config/GameConfig";
import LocalEventEmitter from "../EventEmitter";
import { GameEvents, MovesChangedEvent, ScoreChangedEvent } from "../GameEvents";

export class GameState {
    private score: number;
    private movesLeft: number;
    private shuffleCount: number;
    
    public isGameOver: boolean;
    public isGameWon: boolean;
    public gameEventEmitter = new LocalEventEmitter<GameEvents>();

    constructor(
        score: number,
        movesLeft: number,
        isGameOver: boolean,
        isGameWon: boolean,
        shuffleCount: number
    ) {
        this.score = score;
        this.movesLeft = movesLeft;
        this.isGameOver = isGameOver;
        this.isGameWon = isGameWon;
        this.shuffleCount = shuffleCount;
    }
    
    public static initial(config: GameConfig): GameState {
        return new GameState(0, config.maxMoves, false, false, 0);
    }

    public updateScore(score: number): void {
        this.score = score;
        this.gameEventEmitter.emit(ScoreChangedEvent, { score: this.score });
    }

    public updateMovesLeft(movesLeft: number): void {
        this.movesLeft = movesLeft;
        this.gameEventEmitter.emit(MovesChangedEvent, { moves: this.movesLeft });
    }

    public reset(config: GameConfig) {
        this.score = 0;
        this.movesLeft = config.maxMoves;
        this.isGameOver = false;
        this.isGameWon = false;
        this.shuffleCount = 0;
    }
}