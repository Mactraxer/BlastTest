import { GameController } from "./controller/GameController";
import { BoardView } from "./view/BoardView";
import { GameConfig } from "./GameConfig";
import { TileViewFactory } from "./view/TileViewFactory";

const {ccclass, property} = cc._decorator;
// GameScene.ts
@ccclass
export class GameScene extends cc.Component {
    @property(cc.Prefab)
    private tilePrefab: cc.Prefab = null;

    @property(BoardView)
    private boardView: BoardView = null;

    @property(cc.Label)
    private scoreLabel: cc.Label = null;

    @property(cc.Label)
    private movesLabel: cc.Label = null;

    private gameController: GameController;

    onLoad() {
        const config: GameConfig = {
            tileWidth: 64,
            tileHeight: 64,
            horizontalTileCount: 4,
            verticalTileCount: 4,
            maxMoves: 20,
            targetScore: 1000,
            superTileThreshold: 3,
            bombRadius: 1,
            superTileRadius: 2
        };

        this.gameController = new GameController(
            this.boardView,
            config,
            new TileViewFactory(this.tilePrefab)
        );
    }
}