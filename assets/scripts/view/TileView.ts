import { TileColor } from "../model/Board";

const COLOR_MAP = {
    [TileColor.Red]: cc.Color.RED,
    [TileColor.Green]: cc.Color.GREEN,
    [TileColor.Blue]: cc.Color.BLUE,
    [TileColor.Yellow]: cc.Color.YELLOW,
};

const {ccclass} = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
    tileRow: number;
    tileCol: number;

    public get width(): number {
        return this.node.width;
    }

    public get height(): number {
        return this.node.height;
    }

    public setTile(row: number, col: number, color: TileColor) {
        this.tileRow = row;
        this.tileCol = col;

        const sprite = this.getComponent(cc.Sprite);
        sprite.node.color = COLOR_MAP[color];
    }

    public animateBurn(callback: () => void) {
        cc.tween(this.node)
            .to(0.2, { scale: 0 })
            .call(() => callback && callback())
            .start();
    }

    public animateFall(newY: number, delay: number = 0) {
        cc.tween(this.node)
            .delay(delay)
            .to(0.3, { y: newY }, { easing: 'quadOut' })
            .start();
    }

    onClick() {
        this.node.emit("TileClicked", { row: this.tileRow, col: this.tileCol });
    }
}
