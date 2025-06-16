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
        return this.type === TileType.BOMB || this.type === TileType.SWAP;
    }

    public isSuperTile(): boolean {
        return [
            TileType.ROW_CLEAR,
            TileType.COL_CLEAR,
            TileType.RADIUS_CLEAR
        ].includes(this.type);
    }

    public isNormalTile(): boolean {
        return !this.isBooster() && !this.isSuperTile();
    }
}

