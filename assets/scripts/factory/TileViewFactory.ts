import { TileView } from "../view/TileView";

export class TileViewFactory {
    private tilePrefab: cc.Prefab = null;
    private tileViewPool: TileView[];
    
    constructor(tilePrefab: cc.Prefab) {
        this.tilePrefab = tilePrefab;
        this.tileViewPool = [];
    }
    
    public createTileView(parent: cc.Node) : TileView {
        if (this.tileViewPool.length > 0) {
            const tileView = this.tileViewPool.pop();
            tileView.node.active = true;
            tileView.node.scale = 1;
            return tileView;
        } else {
            const node = cc.instantiate(this.tilePrefab);
            node.parent = parent;
            const tileView = node.getComponent(TileView);
            return tileView;
        }
    }

    public dispose(tileView: TileView) : void {
        tileView.node.active = false;
        this.tileViewPool.push(tileView);
    }
}