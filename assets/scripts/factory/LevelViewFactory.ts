import { LevelView } from "../view/LevelView";

export class LevelViewFactory {
    private prefab: cc.Prefab;

    constructor(prefabAsset: cc.Prefab) {
        this.prefab = prefabAsset;
    }

    public createLevel(parent: cc.Node): LevelView {
        const levelNode = cc.instantiate(this.prefab);
        levelNode.parent = parent;

        const levelView = levelNode.getComponent(LevelView);
        return levelView;
    }
}