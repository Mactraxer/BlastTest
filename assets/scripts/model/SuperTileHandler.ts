import { Board } from "./Board";
import { MoveCounter } from "./MoveCounter";
import { ScoreCounter } from "./ScoreCounter";
import { Tile, TileType } from "./Tile";

export class SuperTileHandler {
    private readonly board: Board;
    private readonly scoreCounter: ScoreCounter;
    private readonly moveCounter: MoveCounter;

    constructor(board: Board, scoreCounter: ScoreCounter, moveCounter: MoveCounter) {
        this.board = board;
        this.scoreCounter = scoreCounter;
        this.moveCounter = moveCounter;
    }

    public handleSuperTile(tile: Tile) : void {
        let removeTiles: Tile[] = [];

        switch (tile.type) {
            case TileType.BOMB:
                removeTiles = this.handleBomb(tile);
                break;
            case TileType.ROW_CLEAR:
                removeTiles = this.handleRowClear(tile);
                break;
            case TileType.COL_CLEAR:
                removeTiles = this.handleColumnClear(tile);
                break;
            case TileType.RADIUS_CLEAR:
                removeTiles = this.handleRadiusClear(tile);
                break;
        }

        this.board.setCollapseTiles(removeTiles);
        this.board.removeTiles(removeTiles.map(m => m.position));

        this.scoreCounter.updateScore(removeTiles);
        this.moveCounter.updateMovesLeft();
    }

    private handleColumnClear(tile: Tile) : Tile[] {
        let removeTiles: Tile[] = [];
        for (let row = 0; row < this.board.config.verticalTileCount; row++) {
            removeTiles.push(this.board.grid[row][tile.position.column]);
        }

        return removeTiles;
    }

    private handleRowClear(tile: Tile) : Tile[] {
        let removeTiles: Tile[] = [];
        for (let column = 0; column < this.board.config.horizontalTileCount; column++) {
            removeTiles.push(this.board.grid[tile.position.row][column]);
        }

        return removeTiles;
    }

    private handleRadiusClear(tile: Tile) : Tile[] {
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

        return removeTiles;
    }

    private handleBomb(tile: Tile) : Tile[] {
        return [].concat(...this.board.grid);
    }
}