import { GameConfig } from "../config/GameConfig";
import { TileFactory } from "../factory/TileFactory";
import { Position, Tile } from "./Tile";

export interface TileDropMove {
    tile: Tile;
    fromRow: number;
    toRow: number;
    column: number;
}

export class Board {
    private tileFactory: TileFactory;

    public readonly config: GameConfig;

    public collapseTiles: Tile[];
    public dropMoves: TileDropMove[];
    public grid: Tile[][];
    public swapTile: [Tile, Tile];
    public createdMegaTile: Tile;
    public createdMegaTileStartPosition: Position;
    
    constructor(config: GameConfig, tileFactory: TileFactory) {
        this.config = config;
        this.tileFactory = tileFactory;
        this.initializeGrid();
    }
    
    private initializeGrid(): void {
        this.grid = [];
        for (let row = 0; row < this.config.verticalTileCount; row++) {
            this.grid[row] = [];
            for (let column = 0; column < this.config.horizontalTileCount; column++) {
                this.grid[row][column] = this.tileFactory.createNormalTile(this.getPositionBy(row,column));
            }
        }
        
        this.clearDropMoves();
    }
    
    public setCollapseTiles(matches: Tile[]) : void {
        this.collapseTiles = matches;
    }

    public addDropMoves(dropMoves: TileDropMove[]) : void {
        this.dropMoves = dropMoves;
    }

    public clearDropMoves() : void {
        this.collapseTiles = [];
        this.dropMoves = [];
        this.swapTile = [null, null];
        this.createdMegaTileStartPosition = null;
        this.createdMegaTile = null;
    }
    
    public createMegaTile(position: Position) : void {
        this.createdMegaTileStartPosition = position;
        this.grid[position.row][position.column] = this.tileFactory.createTileMegaTile(position);
        this.createdMegaTile = this.grid[position.row][position.column];
    }

    public getTileAt(position: Position): Tile | null {
        if (!this.isPositionValid(position)) return null;
        return this.grid[position.row][position.column];
    }

    public removeTiles(positions: Position[]): void {
        positions.forEach(pos => {
            if (this.isPositionValid(pos)) {
                this.grid[pos.row][pos.column] = null;
            }
        });

        this.collapseColumns();
        this.fillEmptySpaces();
    }

    public getPositionBy(row: number, collumn: number): Position {
        return new Position(0, 0, row, collumn);
    }

    public getTopNeighborsPosition(position: Position): Position | null {
        if (position.row == 0) return null;

        return this.getPositionBy(position.row - 1, position.column);
    }

    public getBottomNeighborsPosition(position: Position): Position | null {
        if (position.row == this.config.verticalTileCount - 1) return null;

        return this.getPositionBy(position.row + 1, position.column);
    }

    public getLeftNeighborsPosition(position: Position): Position | null {
        if (position.column == 0) return null;

        return this.getPositionBy(position.row, position.column - 1);
    }

    public getRightNeighborsPosition(position: Position): Position | null {
        if (position.column == this.config.horizontalTileCount - 1) return null;

        return this.getPositionBy(position.row, position.column + 1);
    }

    public isPositionValid(position: Position): boolean {
        if (!position) return false;

        return position.row >= 0 && position.row < this.config.verticalTileCount  &&
               position.column >= 0 && position.column < this.config.horizontalTileCount;
    }

    private collapseColumns(): void {
        for (let collumn = 0; collumn < this.config.horizontalTileCount; collumn++) {
        let emptyY = this.config.verticalTileCount;
            // Идем снизу вверх
            for (let row = this.config.verticalTileCount - 1; row >= 0; row--) {
                // Находим первую пустую ячейку
                if (this.grid[row][collumn] === null && emptyY === this.config.verticalTileCount) {
                    emptyY = row;
                }
                // Если нашли тайл над пустой ячейкой
                else if (this.grid[row][collumn] !== null && emptyY !== this.config.verticalTileCount) {
                    // Перемещаем тайл вниз
                    this.grid[emptyY][collumn] = this.grid[row][collumn];
                    this.grid[emptyY][collumn].position = new Position(0, 0, emptyY, collumn);
                    this.grid[row][collumn] = null;

                    this.dropMoves.push({
                        tile: this.grid[emptyY][collumn],
                        fromRow: row,
                        toRow: emptyY,
                        column: collumn,
                    });
                    // Ищем следующую пустую ячейку выше
                    while (emptyY >= 0 && this.grid[emptyY][collumn] !== null) {
                        emptyY--;
                    }
                }
            }
        }
    }

    private fillEmptySpaces(): void {
        for (let row = 0; row < this.config.verticalTileCount; row++) {
            for (let collumn = 0; collumn < this.config.horizontalTileCount; collumn++) {
                if (this.grid[row][collumn] === null) {
                    const newPosition = this.getPositionBy(row, collumn);
                    this.grid[row][collumn] = this.tileFactory.createNormalTile(newPosition);

                    this.dropMoves.push({
                        tile: this.grid[row][collumn],
                        fromRow: this.config.verticalTileCount,
                        toRow: row,
                        column: collumn,
                    });
                }
            }
        }
    }
}