import { Position, TileType } from "../GameConfig";
import { Tile } from "../model/Tile";

const { ccclass, property } = cc._decorator;

// TileView.ts
@ccclass
export class TileView extends cc.Component {
    @property(cc.Sprite)
    private sprite: cc.Sprite = null;

    @property(cc.Label)
    private label: cc.Label = null;

    public position: Position = null;
    private _onTileClick: (pos: Position) => void = null;

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    public init(tile: Tile, position: Position, scale: cc.Vec2, onClick: (pos: Position) => void): void {
        this.position = position;
        this.node.position = cc.v3(position.x, position.y);
        this.node.width = scale.x;
        this.node.height = scale.y;
        this._onTileClick = onClick;
        this.updateView(tile);
        console.log("TilePosition: ", this.position);
        console.log("TileType: ", tile.type);
    }

    public updateView(tile: Tile | null): void {
        this.label.string = "";
        if (!tile) {
            this.node.active = false;
            return;
        }

        console.log("TilePosition: ", this.position);
        console.log("TileType: ", tile.type);
        this.node.active = true;
        this.position = tile.position;
        
        switch (tile.type) {
            case TileType.RED:
                this.sprite.node.color = cc.Color.RED;
                //this.label.string = "";
                break;
            // ... другие типы тайлов
            case TileType.BLUE:
                this.sprite.node.color = cc.Color.BLUE;
                break;
            case TileType.GREEN:
                this.sprite.node.color = cc.Color.GREEN;
                break;
            case TileType.YELLOW:
                this.sprite.node.color = cc.Color.YELLOW;
                break;
            case  TileType.PURPLE:
                this.sprite.node.color = cc.Color.CYAN;
                break;
            case TileType.BOMB:
                this.sprite.node.color = cc.Color.ORANGE;
                this.label.string = "B";
                break;
            case TileType.COL_CLEAR:
                this.label.string = "CC";
                this.sprite.node.color = cc.Color.ORANGE;
                break;
            case  TileType.ROW_CLEAR:
                this.label.string = "RowC";
                this.sprite.node.color = cc.Color.ORANGE;
                break;
            case TileType.RADIUS_CLEAR:
                this.label.string = "RadC";
                this.sprite.node.color = cc.Color.ORANGE;
                break;
            case TileType.SWAP:
                this.label.string = "SW";
                this.sprite.node.color = cc.Color.ORANGE;
                break;
            // ... остальные случаи
        }

        this.label.string = tile.position.row + "," + tile.position.col;
    }

    private onClick(): void {
        if (this._onTileClick) {
            this._onTileClick(this.position);
        }
    }

    public animateRemove(): Promise<void> {
        return new Promise(resolve => {
            cc.tween(this.node)
                .to(0.2, { scale: 0, opacity: 0 })
                .call(() => {
                    this.node.active = false;
                    resolve();
                })
                .start();
        });
    }

    public animateAppear(): Promise<void> {
        this.node.setScale(0);
        this.node.active = true;
        
        return new Promise(resolve => {
            cc.tween(this.node)
                .to(0.3, { scale: 1 }, { easing: 'backOut' })
                .call(resolve)
                .start();
        });
    }
}