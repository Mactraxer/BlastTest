import { GameConfig } from "../config/GameConfig";
import { LevelView } from "../view/LevelView";

export class LevelViewFactory {
    private readonly prefab: cc.Prefab;
    private readonly parent: cc.Node;
    private readonly config: GameConfig;

    constructor(prefabAsset: cc.Prefab, parent: cc.Node, config: GameConfig) {
        this.prefab = prefabAsset;
        this.parent = parent;
        this.config = config;
    }

    public createLevel(): LevelView {
        const levelNode = cc.instantiate(this.prefab);
        levelNode.setParent(this.parent);

        const levelView = levelNode.getComponent(LevelView);
        levelView.init(this.config.targetScore, this.config.maxMoves);

        return levelView;
    }
}