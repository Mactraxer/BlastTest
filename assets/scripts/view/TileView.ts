import { Position, Tile, TileType } from "../model/Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export class TileView extends cc.Component {
    @property(cc.Sprite)
    private sprite: cc.Sprite = null;

    @property(cc.Label)
    private label: cc.Label = null;
    
    @property(cc.Integer)
    private animationTileRemoveDuration = 0.2;

    @property(cc.Integer)
    private animationTileRemoveScaleDownValue = 0;

    @property(cc.Integer)
    private animationTileRemoveOpacityDownValue = 0;

    @property(cc.Integer)
    private animationTileAppearDuration = 0.3;

    @property(cc.Integer)
    private animationTileAppearScaleUpValue = 1;

    private _onTileClick: (pos: Position) => void = null;

    public position: Position = null;

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    public init(tile: Tile, position: Position, scale: cc.Vec2, onClick: (pos: Position) => void): void {
        this.position = position;
        this.node.setPosition(cc.v3(position.x, position.y));
        this.node.width = scale.x;
        this.node.height = scale.y;
        this._onTileClick = onClick;
        this.updateView(tile);
    }

    public updateView(tile: Tile | null): void {
        this.label.string = "";
        if (!tile) {
            this.node.active = false;
            return;
        }

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
        }

        this.label.string = tile.position.row + "," + tile.position.column;
    }

    public animateRemove(): Promise<void> {
        return new Promise(resolve => {
            cc.tween(this.node)
                .to(this.animationTileRemoveDuration, { scale: this.animationTileRemoveScaleDownValue, opacity: this.animationTileRemoveOpacityDownValue })
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
                .to(this.animationTileAppearDuration, { scale: this.animationTileAppearScaleUpValue }, { easing: 'backOut' })
                .call(resolve)
                .start();
        });
    }

    private onClick(): void {
        if (this._onTileClick) {
            this._onTileClick(this.position);
        }
    }
}