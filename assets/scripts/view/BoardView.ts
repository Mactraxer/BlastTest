//import { _decorator, Component, Node, Prefab, instantiate, Vec2, cclegacy, tween } from 'cc';
import { Board, Tile, TileColor } from '../model/Board';
import TileView from './TileView';

const { ccclass, property } = cc._decorator;

@ccclass('BoardView')
export class BoardView extends cc.Component {
    @property(cc.Prefab)
    tilePrefab: cc.Prefab = null;

    board: Board;
    tileSize = 60;
    tileNodes: Map<string, cc.Node> = new Map();

    start() {
        this.board = new Board(6, 6, [
            TileColor.Red,
            TileColor.Green,
            TileColor.Blue,
            TileColor.Yellow
        ]);
        this.renderBoard();
    }

    renderBoard() {
        this.tileNodes.forEach(node => node.destroy());
        this.tileNodes.clear();

        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const tile = this.board.getTile(r, c);
                if (!tile) continue;

                const tileNode = cc.instantiate(this.tilePrefab);
                tileNode.parent = this.node;

                const pos = this.getPosition(r, c);
                tileNode.setPosition(pos);

                const tileView = tileNode.getComponent(TileView);
                tileView.setTile(r, c, tile.color);
                tileNode.on('TileClicked', this.handleTileClick, this);

                this.tileNodes.set(`${r},${c}`, tileNode);
            }
        }
    }

    getPosition(row: number, col: number): cc.Vec2 {
        const boardWidth = this.board.cols * this.tileSize;
        const boardHeight = this.board.rows * this.tileSize;

        const offsetX = -boardWidth / 2 + this.tileSize / 2;
        const offsetY = -boardHeight / 2 + this.tileSize / 2;

        return new cc.Vec2(
            col * this.tileSize + offsetX,
            row * this.tileSize + offsetY + 200
        );
    }

    handleTileClick(tile: Tile) {
        const group = this.board.getConnectedTiles(tile.row, tile.col);
        if (group.length <= 1) return;

        this.board.burnTiles(group);
        for (const t of group) {
            const key = `${t.row},${t.col}`;
            const node = this.tileNodes.get(key);
            if (node && cc.isValid(node)) {
                this.tileNodes.delete(key);
                cc.tween(node)
                    .to(0.2, { scale: 0 })
                    .call(() => node.destroy())
                    .start();
            }
        }

        this.scheduleOnce(() => {
            const newTiles = this.board.dropAndFill();
            this.updateTiles(newTiles);
        }, 0.25);
    }

    updateTiles(newTiles: Tile[]) {
        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const tile = this.board.getTile(r, c);
                const key = `${r},${c}`;
                if (!this.tileNodes.has(key) && tile) {
                    const tileNode = cc.instantiate(this.tilePrefab);
                    tileNode.parent = this.node;

                    const startY = 800;
                    const x = this.getPosition(r, c).x;
                    tileNode.setPosition(x, startY);

                    const view = tileNode.getComponent(TileView);
                    view.setTile(tile.row, tile.col, tile.color);
                    tileNode.on('TileClicked', this.handleTileClick, this);

                    const targetY = this.getPosition(r, c).y;
                    cc.tween(tileNode).to(0.3, { position: new cc.Vec3(x, targetY) }).start();

                    this.tileNodes.set(key, tileNode);
                } else {
                    const node = this.tileNodes.get(key);
                    if (node && cc.isValid(node)) {
                        const targetPos = this.getPosition(r, c);
                        cc.tween(node).to(0.2, { position: new cc.Vec3(targetPos.x, targetPos.y) }).start();
                    }
                }
            }
        }
    }
}
