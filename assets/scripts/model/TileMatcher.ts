import { GameConfig, Position, TileType } from "../GameConfig";
import { Board } from "./Board";
import { Tile } from "./Tile";

export class TileMatcher {
    constructor(
        private readonly config: GameConfig,
        private readonly board: Board
    ) {
    }

    public findMatches(tile: Tile): Tile[] {
        if (!tile.isNormalTile()) return [];
        
        const visited: boolean[][] = Array(this.config.verticalTileCount)
            .fill(false)
            .map(() => Array(this.config.horizontalTileCount).fill(false));
        
        const matches: Tile[] = [];
        this.floodFill(tile.position, tile.type, visited, matches);
        return matches;
    }

    private floodFill(
        position: Position,
        type: TileType,
        visited: boolean[][],
        matches: Tile[]
    ): void {
        if (!this.board.isPositionValid(position)) return;
        const tileIndexes = this.board.getIndexes(position);
        if (visited[tileIndexes[0]][tileIndexes[1]]) return;
        
        const tile = this.board.getTileAt(position);
        if (!tile || tile.type !== type) return;
        
        visited[tileIndexes[0]][tileIndexes[1]] = true;
        matches.push(tile);
        
        // Проверяем соседей
        this.floodFill(this.board.getRightNeighborsPosition(position), type, visited, matches);
        this.floodFill(this.board.getLeftNeighborsPosition(position), type, visited, matches);
        this.floodFill(this.board.getBottomNeighborsPosition(position), type, visited, matches);
        this.floodFill(this.board.getTopNeighborsPosition(position), type, visited, matches);
    }
}