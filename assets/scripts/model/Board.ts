import { GameConfig, Position, TileType } from "../GameConfig";
import { TileFactory } from "../TileFactory";
import { Tile } from "./Tile";

export interface TileDropMove {
    tile: Tile;
    fromRow: number;
    toRow: number;
    col: number;
    newPosition: Position;
}

// Board.ts
export class Board {
    collapseTiles: Tile[];
    public DropMoves: TileDropMove[];
    public grid: Tile[][];
    
    constructor(
        public readonly config: GameConfig,
        private readonly tileFactory: TileFactory
    ) {
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
    
    setCollapseTiles(matches: Tile[]) {
        this.collapseTiles = matches;
    }

    public clearDropMoves() {
        this.collapseTiles = [];
        this.DropMoves = [];
    }

    public createMegaTile(position: Position) {
        const indexes = this.getIndexes(position);
        this.grid[indexes[0]][indexes[1]] = this.tileFactory.createTileMegaTile(position);
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

    private collapseColumns(): void {
        for (let collumn = 0; collumn < this.config.horizontalTileCount; collumn++) {
        let emptyY = this.config.verticalTileCount;
            // Идем снизу вверх
            for (let row = 0; row < this.config.verticalTileCount; row++) {
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

                    this.DropMoves.push({
                        tile: this.grid[emptyY][collumn],
                        fromRow: row,
                        toRow: emptyY,
                        col: collumn,
                        newPosition: this.getPositionBy(emptyY, collumn),
                    });
                    // // Ищем следующую пустую ячейку выше
                    while (emptyY < this.config.verticalTileCount && this.grid[emptyY][collumn] !== null) {
                        emptyY++;
                    }
                }
            }
        }
    }

    
    // Board.ts
    private fillEmptySpaces(): void {
        for (let row = 0; row < this.config.verticalTileCount; row++) {
            for (let collumn = 0; collumn < this.config.horizontalTileCount; collumn++) {
                if (this.grid[row][collumn] === null) {
                    const newPosition = this.getPositionBy(row, collumn);
                    this.grid[row][collumn] = this.tileFactory.createNormalTile(newPosition);

                    this.DropMoves.push({
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

    // Замена this.collapseColumns(); this.fillEmptySpaces(); с учетом будущей анимации
    public dropAndFill(): TileDropMove[] {
        const moves: TileDropMove[] = [];

        for (let col = 0; col < this.config.horizontalTileCount; col++) {
            let emptyRow = this.config.verticalTileCount - 1;

            for (let row = this.config.verticalTileCount - 1; row >= 0; row--) {
                const tile = this.grid[row][col];
                if (tile !== null) {
                    if (emptyRow !== row) {
                        this.grid[emptyRow][col] = tile;
                        this.grid[row][col] = null;

                        // Обновляем позицию тайла
                        tile.position = this.getPositionBy(emptyRow, col);
                        const newPosition = this.getPositionBy(emptyRow, col);
                        moves.push({
                            tile,
                            fromRow: row,
                            toRow: emptyRow,
                            col,
                            newPosition
                        });
                    }
                    emptyRow--;
                }
            }

            // Заполняем пустые ячейки сверху новыми тайлами
            for (let row = emptyRow; row >= 0; row--) {
                const newPosition = this.getPositionBy(row, col);
                const newTile = this.tileFactory.createNormalTile(newPosition);
                this.grid[row][col] = newTile;

                moves.push({
                    tile: newTile,
                    fromRow: -1, // появился вне доски
                    toRow: row,
                    col,
                    newPosition
                });
            }
        }

        return moves;
    }

    public getIndexes(position: Position): [number, number] {
        const collumn = position.x / this.config.tileWidth;
        const row = position.y / this.config.tileHeight;
        return [row, collumn];
    }

    public getPositionBy(row: number, collumn: number): Position {
        return new Position(collumn * this.config.tileHeight, row * this.config.tileWidth, row, collumn);
    }

    public getTopNeighborsPosition(position: Position): Position | null {
        const indexes = this.getIndexes(position);

        if (indexes[0] == 0) return null;

        return this.getPositionBy(indexes[0] - 1, indexes[1]);
    }

    public getBottomNeighborsPosition(position: Position): Position {
        const indexes = this.getIndexes(position);

        if (indexes[0] == this.config.verticalTileCount - 1) return null;

        return this.getPositionBy(indexes[0] + 1, indexes[1]);
    }

    public getLeftNeighborsPosition(position: Position): Position {
        const indexes = this.getIndexes(position);

        if (indexes[1] == 0) return null;

        return this.getPositionBy(indexes[0], indexes[1] - 1);
    }

    public getRightNeighborsPosition(position: Position): Position {
        const indexes = this.getIndexes(position);

        if (indexes[1] == this.config.horizontalTileCount - 1) return null;

        return this.getPositionBy(indexes[0], indexes[1] + 1);
    }

    public isPositionValid(position: Position): boolean {
        if (!position) return false;

        return position.x >= 0 && position.x <= (this.config.horizontalTileCount - 1) * this.config.tileWidth  &&
               position.y >= 0 && position.y <= (this.config.verticalTileCount - 1) * this.config.tileHeight;
    }
}