import { GameConfig, Position } from "../GameConfig";
import { Board, TileDropMove } from "../model/Board";
import { BoosterHandler } from "../model/BoosterHandler";
import { BoosterType } from "../model/BoosterType";
import { GameState } from "../model/GameState";
import { SuperTileHandler } from "../model/SuperTileHandler";
import { Tile } from "../model/Tile";
import { TileMatcher } from "../model/TileMatcher";
import { TileFactory } from "../TileFactory";
import { BoardView } from "../view/BoardView";
import { TileViewFactory } from "../view/TileViewFactory";

// GameController.ts
export class GameController {
    board: Board;
    gameModel: any;
    state: GameState;
    tileMatcher: TileMatcher;
    tileMoves: TileDropMove[];
    superTileHandler: SuperTileHandler;
    boosterHandler: BoosterHandler;

    constructor(
        private boardView: BoardView,
        private config: GameConfig,
        private tileViewFactory: TileViewFactory
    ) {
        const tileFactory = new TileFactory(config);
        this.board = new Board(config, tileFactory);
        this.state = GameState.initial(config);
        this.tileMatcher = new TileMatcher(config, this.board);
        this.superTileHandler = new SuperTileHandler(this.board, this.state);
        this.boosterHandler = new BoosterHandler(this.board, this.state);
        this.boardView.initialize(
            tileViewFactory,
            config.horizontalTileCount,
            config.verticalTileCount,
            config.tileWidth,
            config.tileHeight,
            this.board,
            this.handleTileClick.bind(this)
        );
    }

    private async handleTileClick(position: Position): Promise<void> {
        // Обрабатываем клик в модели
        await this.selectTile(position);
        
        // Обновляем отображение с анимациями
        
        
        // // Проверяем состояние игры
        // if (this.gameModel.isGameOver()) {
        //     if (this.gameModel.isGameWon()) {
        //         this.showGameWin();
        //     } else {
        //         this.showGameOver();
        //     }
        // }
    }

    public handleTeleportButton() : void {
        this.boosterHandler.selectBooster(BoosterType.Teleport);
    }

    public handleBoombButton() : void {
        this.boosterHandler.selectBooster(BoosterType.Bomb);
    }

    public async selectTile(position: Position): Promise<void> {
        if (this.state.isGameOver) return;

        
        const tile = this.board.getTileAt(position);
        if (!tile) return;
        
        if (this.boosterHandler.isSelectedBooster()) {
            this.boosterHandler.useActiveBoosterIn(tile);
            //await this.boardView.updateView(this.board);
            //this.board.clearDropMoves();
        } else if(tile.isSuperTile()) {
            this.handleSuperTile(tile);
        } else {
            this.handleNormalTile(tile);
        }

        await this.boardView.updateView(this.board);
        //this.updateGameState();

        if (!this.boosterHandler.isSelectedBooster()) {
            this.board.clearDropMoves();
        }
    }

    updateGameState() {
        throw new Error("Method not implemented.");
    }

    private handleSuperTile(tile: Tile) : void {
        this.superTileHandler.handleSuperTile(tile);
    }

    private handleNormalTile(tile: Tile): void {
        let matches = this.tileMatcher.findMatches(tile);
        if (matches.length < 2) return;

        // Создаем супер-тайл если нужно
        if (matches.length >= this.config.superTileThreshold) {
            this.board.createMegaTile(tile.position);
            matches = matches.filter(match => match !== tile)
        }

        this.board.setCollapseTiles(matches);
        this.board.removeTiles(matches.map(m => m.position));
        

        this.state.update(
            this.state.score + matches.length * matches.length * 10,
            this.state.movesLeft - 1
        );
    }

    public isGameOver(): boolean {
        return this.state.isGameOver;
    }

    public isGameWon(): boolean {
        return this.state.isGameWon;
    }

    private showGameWin(): void {
        // Показываем экран победы
    }

    private showGameOver(): void {
        // Показываем экран проигрыша
    }
}