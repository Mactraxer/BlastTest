import { GameConfig } from "../config/GameConfig";
import LocalEventEmitter from "../EventEmitter";
import { TileFactory } from "../factory/TileFactory";
import { TileViewFactory } from "../factory/TileViewFactory";
import { GameEvents, LevelLoseEvent, LevelWinEvent, MovesChangedEvent, ScoreChangedEvent } from "../GameEvents";
import { Board } from "../model/Board";
import { BoosterHandler } from "../model/BoosterHandler";
import { BoosterType } from "../model/BoosterType";
import { GameState } from "../model/GameState";
import { MoveCounter } from "../model/MoveCounter";
import { ScoreCounter } from "../model/ScoreCounter";
import { SimpleTileHandler } from "../model/SimpleTileHandler";
import { SuperTileHandler } from "../model/SuperTileHandler";
import { Position } from "../model/Tile";
import { TileMatcher } from "../model/TileMatcher";
import { BoosterView } from "../view/BoosterView";
import { LevelView } from "../view/LevelView";

export class LevelController {
    public gameEventEmitter = new LocalEventEmitter<GameEvents>();
    
    private readonly board: Board;
    private readonly tileMatcher: TileMatcher;
    private readonly superTileHandler: SuperTileHandler;
    private readonly boosterHandler: BoosterHandler;
    private readonly simpleTileHandler: SimpleTileHandler;
    private readonly state: GameState;
    private readonly levelView: LevelView;

    private updateInProgress: boolean;

    constructor(
        levelView: LevelView,
        config: GameConfig,
        tileViewFactory: TileViewFactory,
        state: GameState
    ) {
        this.state = state;

        const scoreCounter = new ScoreCounter(config.tileScore, this.state);
        const moveCounter = new MoveCounter(config.maxMoves, this.state);
        const tileFactory = new TileFactory();

        this.board = new Board(config, tileFactory);
        this.tileMatcher = new TileMatcher(config, this.board);
        this.simpleTileHandler = new SimpleTileHandler(this.board, scoreCounter, moveCounter, this.tileMatcher, config.superTileThreshold);
        this.superTileHandler = new SuperTileHandler(this.board, scoreCounter, moveCounter);
        this.boosterHandler = new BoosterHandler(this.board, scoreCounter, levelView.boosterView, config.boosterTeleportCount, config.boosterBombCount);

        this.levelView = levelView;

        this.levelView.boardView.initialize(
            tileViewFactory,
            config.horizontalTileCount,
            config.verticalTileCount,
            config.tileWidth,
            config.tileHeight,
            this.board,
            this.handleTileClick.bind(this)
        );

        this.levelView.node.on(BoosterView.BombTapEventName, this.handleBoombButton, this);
        this.levelView.node.on(BoosterView.TeleportTapEventName, this.handleTeleportButton, this);

        this.state.gameEventEmitter.on(ScoreChangedEvent, this.handleScoreChanged);
        this.state.gameEventEmitter.on(MovesChangedEvent, this.handleMovesChanged);
    }

    public destroy() : void {
        this.state.gameEventEmitter.off(ScoreChangedEvent, this.handleScoreChanged);
        this.state.gameEventEmitter.off(MovesChangedEvent, this.handleMovesChanged);

        this.levelView.node.off(BoosterView.BombTapEventName, this.handleBoombButton, this);
        this.levelView.node.off(BoosterView.TeleportTapEventName, this.handleTeleportButton, this);
        this.levelView.destroy();
    }

    public hide() : void {
        this.levelView.hide();
    }

    private async selectTile(position: Position): Promise<void> {
        if (this.state.isLevelLose || this.state.isLevelWin) return;

        const tile = this.board.getTileAt(position);
        if (!tile) return;
        if(this.updateInProgress) return;

        if (this.boosterHandler.isSelectedBooster()) {
            this.boosterHandler.useActiveBoosterIn(tile);
        } else if(tile.isSuperTile()) {
            this.superTileHandler.handleSuperTile(tile);
        } else {
            this.simpleTileHandler.handleSimpleTile(tile);
        }

        this.updateInProgress = true;
        this.boosterHandler.blockBoosters();
        await this.levelView.boardView.updateView(this.board, tile);
        this.updateInProgress = false;
        this.boosterHandler.unblockBoosters();

        if (!this.boosterHandler.isSelectedBooster()) {
            this.board.clearDropMoves();
        }

        if (this.state.isLevelLose) {
            this.gameEventEmitter.emit(LevelLoseEvent, null);
        } else if (this.state.isLevelWin) {
            this.gameEventEmitter.emit(LevelWinEvent, null);
        }
    }
    
    private handleTeleportButton() : void {
        this.boosterHandler.selectBooster(BoosterType.Teleport);
    }

    private handleBoombButton() : void {
        this.boosterHandler.selectBooster(BoosterType.Bomb);
    }

    private handleMovesChanged = (event: {moves: number}) : void => {
        this.levelView.updateMoves(event.moves);
    }

    private handleScoreChanged = (event: {score: number}) : void => {
        this.levelView.updateScore(event.score);
    }

    private async handleTileClick(position: Position): Promise<void> {
        await this.selectTile(position);
    }
}