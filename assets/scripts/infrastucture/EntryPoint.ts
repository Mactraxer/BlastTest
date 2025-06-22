import { AssetsPath } from "../AssetsPath";
import { GameConfig } from "../config/GameConfig";
import { GameConfigPrefab } from "../config/GameConfigPrefab";
import { GameController } from "../controller/GameContoller";
import { LevelViewFactory } from "../factory/LevelViewFactory";
import { TileViewFactory } from "../factory/TileViewFactory";
import { AssetLoader } from "../service/AssetLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export class EntryPoint extends cc.Component {
    @property(cc.Node)
    private gameNode: cc.Node = null;

    private gameController: GameController;
    private levelViewFactory: LevelViewFactory;
    private tileViewFactory: TileViewFactory;
    private gameConfigNode: GameConfigPrefab;

    async onLoad() : Promise<void> {
        await this.loadAssets();
        this.inits();
    }

    private async loadAssets() : Promise<void> {
        const levelViewPrefab = await AssetLoader.loadAsset(AssetsPath.LevelView);
        const tileViewPrefab = await AssetLoader.loadAsset(AssetsPath.TileView);

        this.tileViewFactory = new TileViewFactory(tileViewPrefab);
        this.levelViewFactory = new LevelViewFactory(levelViewPrefab);

        const gameConfigPrefab = await AssetLoader.loadAsset(AssetsPath.GameConfig);
        this.gameConfigNode = cc.instantiate(gameConfigPrefab).getComponent(GameConfigPrefab);
    }

    private inits() : void {
        const config: GameConfig = {
            tileScore: this.gameConfigNode.tileScore,
            tileWidth: this.gameConfigNode.tileWidth,
            tileHeight: this.gameConfigNode.tileHeight,
            horizontalTileCount: this.gameConfigNode.horizontalTileCount,
            verticalTileCount: this.gameConfigNode.verticalTileCount,
            maxMoves: this.gameConfigNode.maxMoves,
            targetScore: this.gameConfigNode.targetScore,
            superTileThreshold: this.gameConfigNode.superTileThreshold,
            bombRadius: this.gameConfigNode.bombRadius,
            superTileRadius: this.gameConfigNode.superTileRadius,
        };

        this.gameController = new GameController(config, this.levelViewFactory, this.tileViewFactory, this.gameNode);
        this.gameController.nextLevel();
    }
}