import { GameConfig, Position } from "../GameConfig";
import { Board } from "../model/Board";
import { Tile } from "../model/Tile";
import { TileView } from "./TileView";

const {ccclass, property} = cc._decorator;

// BoardView.ts
@ccclass
export class BoardView extends cc.Component {
    @property(cc.Prefab)
    private tilePrefab: cc.Prefab = null;

    private tileViews: TileView[][] = [];
    private _onTileClick: (pos: Position) => void = null;

    public initialize(width: number, height: number, tileWidth: number, tileHeight: number, board: Board, onTileClick: (pos: Position) => void): void {
        this._onTileClick = onTileClick;
        this.tileViews = [];

        for (let row = 0; row < height; row++) {
            this.tileViews[row] = [];
            for (let collumn = 0; collumn < width; collumn++) {
                const tileNode = cc.instantiate(this.tilePrefab);
                tileNode.parent = this.node;
                const tileView = tileNode.getComponent(TileView);
                tileView.init(board.grid[row][collumn], board.grid[row][collumn].position, new cc.Vec2(tileWidth, tileHeight), this.handleTileClick.bind(this));
                this.tileViews[row][collumn] = tileView;
            }
        }
    }

    private handleTileClick(position: Position): void {
        if (this._onTileClick) {
            this._onTileClick(position);
        }
    }

    public async updateView(board: Board): Promise<void> {
        const animations: Promise<void>[] = [];
        
        for (let row = 0; row < this.tileViews.length; row++) {
            for (let collumn = 0; collumn < this.tileViews[row].length; collumn++) {
                const tileView = this.tileViews[row][collumn];
                const tile = board.getTileAt(tileView.position);
                
                if (tile) {
                    tileView.updateView(tile);
                    if (!tileView.node.active) {
                        animations.push(tileView.animateAppear());
                    }
                } else if (tileView.node.active) {
                    animations.push(tileView.animateRemove());
                }
            }
        }
        
        await Promise.all(animations);
    }

    // BoardView.ts
    public async animateTileChanges(oldBoard: Board, newBoard: Board): Promise<void> {
        const animations: Promise<void>[] = [];
        
        for (let y = 0; y < this.tileViews.length; y++) {
            for (let x = 0; x < this.tileViews[y].length; x++) {
                const position = this.tileViews[y][x].position;
                const oldTile = oldBoard.getTileAt(position);
                const newTile = newBoard.getTileAt(position);
                
                if (!oldTile && newTile) {
                    // Появление нового тайла
                    animations.push(this.animateTileAppear(position));
                } else if (oldTile && !newTile) {
                    // Исчезновение тайла
                    animations.push(this.animateTileRemove(position));
                } else if (oldTile && newTile && oldTile.type !== newTile.type) {
                    // Изменение типа тайла
                    animations.push(this.animateTileChange(position, newTile));
                }
            }
        }
        
        await Promise.all(animations);
    }

    private animateTileAppear(position: Position): Promise<void> {
        return new Promise(resolve => {
            const tileView = this.tileViews[position.y][position.x];
            tileView.node.setScale(0);
            tileView.node.active = true;
            
            cc.tween(tileView.node)
                .to(0.3, { scale: 1 }, { easing: 'backOut' })
                .call(resolve)
                .start();
        });
    }

    private animateTileRemove(position: Position): Promise<void> {
        return new Promise(resolve => {
            const tileView = this.tileViews[position.y][position.x];
            
            cc.tween(tileView.node)
                .to(0.2, { scale: 0, opacity: 0 })
                .call(() => {
                    tileView.node.active = false;
                    resolve();
                })
                .start();
        });
    }

    private animateTileChange(position: Position, newTile: Tile): Promise<void> {
        return new Promise(resolve => {
            const tileView = this.tileViews[position.y][position.x];
            
            cc.tween(tileView.node)
                .to(0.1, { scale: 0 })
                .call(() => tileView.updateView(newTile))
                .to(0.1, { scale: 1 })
                .call(resolve)
                .start();
        });
    }
}