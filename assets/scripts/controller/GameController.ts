import { GameConfig, Position } from "../GameConfig";
import { Board } from "../model/Board";
import { GameState } from "../model/GameState";
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
    tileMoves: import("c:/Users/Antonij/Projects/BlastTest/assets/scripts/model/Board").TileDropMove[];

    constructor(
        private boardView: BoardView,
        private config: GameConfig,
        private tileViewFactory: TileViewFactory
    ) {
        const tileFactory = new TileFactory(config);
        this.board = new Board(config, tileFactory);
        this.state = GameState.initial(config);
        this.tileMatcher = new TileMatcher(config, this.board);
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
        this.selectTile(position);
        
        // Обновляем отображение с анимациями
        await this.boardView.updateView(this.board);
        
        // // Проверяем состояние игры
        // if (this.gameModel.isGameOver()) {
        //     if (this.gameModel.isGameWon()) {
        //         this.showGameWin();
        //     } else {
        //         this.showGameOver();
        //     }
        // }
    }

    public selectTile(position: Position): void {
        if (this.state.isGameOver) return;

        const tile = this.board.getTileAt(position);
        if (!tile) return;

        this.board.clearDropMoves();
        if (tile.isBooster()) {
            this.handleBooster(tile);
        } else if (tile.isSuperTile()) {
            this.handleSuperTile(tile);
        } else {
            this.handleNormalTile(tile);
        }

        //this.updateGameState();
    }
    handleBooster(tile: Tile) {
        console.log("handleBooster");
    }
    handleSuperTile(tile: Tile) {
        console.log("handleSuperTile");
    }
    updateGameState() {
        throw new Error("Method not implemented.");
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