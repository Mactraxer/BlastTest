import { GameConfig } from "../config/GameConfig";
import { TileFactory } from "../factory/TileFactory";
import { Position, Tile } from "./Tile";

export interface TileDropMove {
    tile: Tile;
    fromRow: number;
    toRow: number;
    col: number;
    newPosition: Position;
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
            for (let collumn = 0; collumn < this.config.horizontalTileCount; collumn++) {
                this.grid[row][collumn] = this.tileFactory.createNormalTile(this.getPositionBy(row,collumn));
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
        const indexes = this.getIndexes(position);
        this.createdMegaTileStartPosition = position;
        this.grid[indexes[0]][indexes[1]] = this.tileFactory.createTileMegaTile(position);
        this.createdMegaTile = this.grid[indexes[0]][indexes[1]];
    }

    public getTileAt(position: Position): Tile | null {
        if (!this.isPositionValid(position)) return null;
        const indexes = this.getIndexes(position);
        return this.grid[indexes[0]][indexes[1]];
    }

    public removeTiles(positions: Position[]): void {
        positions.forEach(pos => {
            if (this.isPositionValid(pos)) {
                const indexes = this.getIndexes(pos);
                this.grid[indexes[0]][indexes[1]] = null;
            }
        });

        this.collapseColumns();
        this.fillEmptySpaces();
    }

    public getIndexes(position: Position): [number, number] {
        const collumn = position.x / this.config.tileWidth;
        const row = ((this.config.verticalTileCount - 1) * this.config.tileHeight - position.y)  / this.config.tileHeight;
        return [row, collumn];
    }

    public getPositionBy(row: number, collumn: number): Position {
        let x = collumn * this.config.tileWidth;
        let y = ((this.config.verticalTileCount - 1) - row) * this.config.tileHeight;
        return new Position(x, y, row, collumn);
    }

    public getTopNeighborsPosition(position: Position): Position | null {
        const indexes = this.getIndexes(position);

        if (indexes[0] == 0) return null;

        return this.getPositionBy(indexes[0] - 1, indexes[1]);
    }

    public getBottomNeighborsPosition(position: Position): Position | null {
        const indexes = this.getIndexes(position);

        if (indexes[0] == this.config.verticalTileCount - 1) return null;

        return this.getPositionBy(indexes[0] + 1, indexes[1]);
    }

    public getLeftNeighborsPosition(position: Position): Position | null {
        const indexes = this.getIndexes(position);

        if (indexes[1] == 0) return null;

        return this.getPositionBy(indexes[0], indexes[1] - 1);
    }

    public getRightNeighborsPosition(position: Position): Position | null {
        const indexes = this.getIndexes(position);

        if (indexes[1] == this.config.horizontalTileCount - 1) return null;

        return this.getPositionBy(indexes[0], indexes[1] + 1);
    }

    public isPositionValid(position: Position): boolean {
        if (!position) return false;

        return position.x >= 0 && position.x <= (this.config.horizontalTileCount - 1) * this.config.tileWidth  &&
               position.y >= 0 && position.y <= (this.config.verticalTileCount - 1) * this.config.tileHeight;
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
                    this.grid[emptyY][collumn].position = this.getPositionBy(emptyY, collumn);
                    this.grid[row][collumn] = null;

                    this.dropMoves.push({
                        tile: this.grid[emptyY][collumn],
                        fromRow: row,
                        toRow: emptyY,
                        col: collumn,
                        newPosition: this.getPositionBy(emptyY, collumn),
                    });
                    // // Ищем следующую пустую ячейку выше
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
                        col: collumn,
                        newPosition: newPosition,
                    });
                }
            }
        }
    }
}