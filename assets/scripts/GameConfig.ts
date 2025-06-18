// TileType.ts
export enum TileType {
    RED,
    BLUE,
    GREEN,
    YELLOW,
    PURPLE,
    ROW_CLEAR,
    COL_CLEAR,
    RADIUS_CLEAR,
    BOMB,
}

// Position.ts
export class Position {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly row: number,
        public readonly column: number
    ) {}
}

// GameConfig.ts
export interface GameConfig {
    tileWidth: number;
    tileHeight: number;
    horizontalTileCount: number;
    verticalTileCount: number;
    maxMoves: number;
    targetScore: number;
    superTileThreshold: number;
    bombRadius: number;
    superTileRadius: number;
}