import { Position, TileType } from "../GameConfig";

export enum TileColor {
    Red = "red",
    Green = "green",
    Blue = "blue",
    Yellow = "yellow"
}

// Tile.ts
export class Tile {
    constructor(
        public readonly type: TileType,
        public position: Position
    ) {}

    public isBooster(): boolean {
        return this.type === TileType.BOMB;
    }

    public isSuperTile(): boolean {
        return [
            TileType.ROW_CLEAR,
            TileType.COL_CLEAR,
            TileType.RADIUS_CLEAR,
            TileType.BOMB
        ].includes(this.type);
    }

    public isNormalTile(): boolean {
        return !this.isBooster() && !this.isSuperTile();
    }
}

