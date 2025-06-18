import { Board } from "./Board";
import { GameState } from "./GameState";
import { Tile } from "./Tile";
import { BoosterType } from "./BoosterType";

export class BoosterHandler {

    private board: Board;
    private state: GameState;
    private activeBooster: BoosterType;
    private firstSelectionTile: Tile | null;
    private secondSelectionTile: Tile | null;
    
    constructor(board: Board, state: GameState) {
        this.board = board;
        this.activeBooster = BoosterType.None;
        this.state = state;
    }
    
    isSelectedBooster(): boolean {
        return this.activeBooster !== BoosterType.None;
    }

    selectBooster(boosterType: BoosterType) {
        this.activeBooster = boosterType;
    }
    
    useActiveBoosterIn(tile: Tile) {
        this.handleBooster(tile);
    }
    
    private handleBooster(tile: Tile) : void {
        switch (this.activeBooster) {
            case BoosterType.Teleport:
                if (this.firstSelectionTile == null) {
                    this.firstSelectionTile = tile;
                } else {
                    this.secondSelectionTile = tile;
                    this.teleportTiles();
                    this.firstSelectionTile = null;
                    this.secondSelectionTile = null;
                    this.activeBooster = BoosterType.None;
                }
                break;
            case BoosterType.Bomb:
                this.bombTile(tile);
                this.activeBooster = BoosterType.None;
                break;
            default:
                break;
        }
    }

    private bombTile(tile: Tile) {
        const removeTiles: Tile[] = [];
        const [centerRow, centerColumn] = [tile.position.row, tile.position.column];
        const radius = this.board.config.superTileRadius;

        for (let row = centerRow - radius; row <= centerRow + radius; row++) {
            for (let column = centerColumn - radius; column <= centerColumn + radius; column++) {
                if (
                    row >= 0 && row < this.board.config.verticalTileCount &&
                    column >= 0 && column < this.board.config.horizontalTileCount
                ) {
                    removeTiles.push(this.board.grid[row][column]);
                }
            }
        }

        this.board.setCollapseTiles(removeTiles);
        this.board.removeTiles(removeTiles.map(m => m.position));

        this.state.update(
            this.state.score + removeTiles.length * removeTiles.length * 10,
            this.state.movesLeft - 1
        );
    }

    private teleportTiles() {
        const [rowFirstTitle, columnFirstTitle] = this.board.getIndexes(this.firstSelectionTile.position);
        const [rowSecondTitle, columnSecondTitle] = this.board.getIndexes(this.secondSelectionTile.position);

        // swap in board
        const temp = this.board.grid[rowFirstTitle][columnFirstTitle];
        this.board.grid[rowFirstTitle][columnFirstTitle] = this.board.grid[rowSecondTitle][columnSecondTitle];
        this.board.grid[rowSecondTitle][columnSecondTitle] = temp;
        // Проверить копирование ссылки
        const positionTemp = this.board.grid[rowFirstTitle][columnFirstTitle].position;
        this.board.grid[rowFirstTitle][columnFirstTitle].position = this.board.grid[rowSecondTitle][columnSecondTitle].position;
        this.board.grid[rowSecondTitle][columnSecondTitle].position = positionTemp;

        this.board.swapTile = [this.firstSelectionTile, this.secondSelectionTile];
    }
}