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

export class Position {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly row: number,
        public readonly column: number
    ) {}
}

export class Tile {
    public readonly type: TileType;
    public position: Position;

    constructor(type: TileType, position: Position) {
        this.type = type;
        this.position = position;
    }

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

