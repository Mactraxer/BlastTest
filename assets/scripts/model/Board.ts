export enum TileColor {
    Red = "red",
    Green = "green",
    Blue = "blue",
    Yellow = "yellow",
}

export class Tile {
    constructor(public row: number, public col: number, public color: TileColor) {}
}

export class Board {
    grid: (Tile | null)[][];
    rows: number;
    cols: number;
    colors: TileColor[];

    constructor(rows: number, cols: number, colors: TileColor[]) {
        this.rows = rows;
        this.cols = cols;
        this.colors = colors;
        this.grid = [];

        this.generateBoard();
    }

    generateBoard() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            const row: (Tile | null)[] = [];
            for (let c = 0; c < this.cols; c++) {
                const color = this.getRandomColor();
                row.push(new Tile(r, c, color));
            }
            this.grid.push(row);
        }
    }

    getRandomColor(): TileColor {
        const index = Math.floor(Math.random() * this.colors.length);
        return this.colors[index];
    }

    getTile(row: number, col: number): Tile | null {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
        return this.grid[row][col];
    }

    getConnectedTiles(row: number, col: number): Tile[] {
        const startTile = this.getTile(row, col);
        if (!startTile) return [];

        const visited = new Set<string>();
        const toVisit = [[row, col]];
        const result: Tile[] = [];

        while (toVisit.length > 0) {
            const [r, c] = toVisit.pop()!;
            const key = `${r},${c}`;
            if (visited.has(key)) continue;

            const tile = this.getTile(r, c);
            if (!tile || tile.color !== startTile.color) continue;

            visited.add(key);
            result.push(tile);

            toVisit.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
        }

        return result;
    }

    burnTiles(tiles: Tile[]) {
        for (const tile of tiles) {
            this.grid[tile.row][tile.col] = null;
        }
    }

    dropAndFill(): Tile[] {
        const newTiles: Tile[] = [];

        for (let c = 0; c < this.cols; c++) {
            let emptyRow = this.rows - 1;
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.grid[r][c] !== null) {
                    if (emptyRow !== r) {
                        this.grid[emptyRow][c] = this.grid[r][c];
                        if (this.grid[emptyRow][c]) {
                            this.grid[emptyRow][c]!.row = emptyRow;
                            this.grid[emptyRow][c]!.col = c;
                        }
                        this.grid[r][c] = null;
                    }
                    emptyRow--;
                }
            }

            for (let r = emptyRow; r >= 0; r--) {
                const color = this.getRandomColor();
                const newTile = new Tile(r, c, color);
                this.grid[r][c] = newTile;
                newTiles.push(newTile);
            }
        }

        return newTiles;
    }

    hasAvailableMoves(): boolean {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const connected = this.getConnectedTiles(r, c);
                if (connected.length > 1) return true;
            }
        }
        return false;
    }
}
