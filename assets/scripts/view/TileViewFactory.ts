import { TileView } from "./TileView";

export class TileViewFactory {
    private tilePrefab: cc.Prefab = null;
    private tileViewPool: TileView[];
    
    constructor(tilePrefab: cc.Prefab) {
        this.tilePrefab = tilePrefab;
        this.tileViewPool = [];
    }
    
    public createTileView() : TileView {
        if (this.tileViewPool.length > 0) {
            const tileView = this.tileViewPool.pop();
            tileView.node.active = true;
            tileView.node.scale = 1;
            return tileView;
        } else {
            const node = cc.instantiate(this.tilePrefab);
            const tileView = node.getComponent(TileView);
            return tileView;
        }
    }

    public dispose(tileView: TileView) {
        tileView.node.active = false;
        this.tileViewPool.push(tileView);
    }
}