import { GameConfig, Position, TileType } from "./GameConfig";
import { Tile } from "./model/Tile";

// TileFactory.ts
export class TileFactory {
    constructor(private readonly config: GameConfig) {}

    public createRandomTile(position: Position): Tile {
        const rand = Math.random();
        let type: TileType;

        if (rand < 0.7) {
            type = this.getRandomNormalType();
        } else if (rand < 0.9) {
            type = this.getRandomBoosterType();
        } else {
            type = this.getRandomSuperType();
        }

        return new Tile(type, position);
    }

    public createNormalTile(position: Position): Tile {
        return new Tile(this.getRandomNormalType(), position);
    }

    public createTileMegaTile(position: Position): Tile {
        const rand = Math.random();
        let type: TileType;

        if (rand < 0.5) {
            type = this.getRandomBoosterType();
        } else {
            type = this.getRandomSuperType();
        }

        return new Tile(type, position);
    }

    private getRandomNormalType(): TileType {
        const types = [TileType.RED, TileType.BLUE, TileType.GREEN, 
                      TileType.YELLOW, TileType.PURPLE];
        return types[Math.floor(Math.random() * types.length)];
    }

    private getRandomBoosterType(): TileType {
        return Math.random() > 0.5 ? TileType.BOMB : TileType.SWAP;
    }

    private getRandomSuperType(): TileType {
        const types = [TileType.ROW_CLEAR, TileType.COL_CLEAR, TileType.RADIUS_CLEAR];
        return types[Math.floor(Math.random() * types.length)];
    }
}