import { GameConfig } from "../config/GameConfig";
import LocalEventEmitter from "../EventEmitter";
import { GameEvents, MovesChangedEvent, ScoreChangedEvent } from "../GameEvents";

export class GameState {
    private readonly winScore: number;

    private score: number;
    private movesLeft: number;
    private shuffleCount: number;
    
    public isLevelLose: boolean;
    public isLevelWin: boolean;
    public gameEventEmitter = new LocalEventEmitter<GameEvents>();

    constructor(
        winScore: number,
        score: number,
        movesLeft: number,
        isGameOver: boolean,
        isGameWon: boolean,
        shuffleCount: number
    ) {
        this.winScore = winScore;
        this.score = score;
        this.movesLeft = movesLeft;
        this.isLevelLose = isGameOver;
        this.isLevelWin = isGameWon;
        this.shuffleCount = shuffleCount;
    }
    
    public static initial(config: GameConfig): GameState {
        return new GameState(config.targetScore, 0, config.maxMoves, false, false, 0);
    }

    public updateScore(score: number): void {
        this.score = score;
        this.gameEventEmitter.emit(ScoreChangedEvent, { score: this.score });
        if (this.score >= this.winScore) {
            this.isLevelWin = true;
        }
    }

    public updateMovesLeft(movesLeft: number): void {
        this.movesLeft = movesLeft;
        this.gameEventEmitter.emit(MovesChangedEvent, { moves: this.movesLeft });
        if (this.movesLeft <= 0) {
            this.isLevelLose = true;
        }
    }

    public reset(config: GameConfig) : void {
        this.score = 0;
        this.movesLeft = config.maxMoves;
        this.isLevelLose = false;
        this.isLevelWin = false;
        this.shuffleCount = 0;
    }
}