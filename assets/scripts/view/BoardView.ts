import { GameConfig, Position } from "../GameConfig";
import { Board, TileDropMove } from "../model/Board";
import { Tile } from "../model/Tile";
import { TileView } from "./TileView";
import { TileViewFactory } from "./TileViewFactory";

const {ccclass, property} = cc._decorator;

// BoardView.ts
@ccclass
export class BoardView extends cc.Component {
    @property(cc.Label)
    private debugBoard: cc.Label = null;

    private tileViews: Map<string, TileView>;
    private tileViewFactory: TileViewFactory;
    private _onTileClick: (pos: Position) => void = null;
    private board: Board;

    public initialize(tileViewFactory: TileViewFactory, width: number, height: number, tileWidth: number, tileHeight: number, board: Board, onTileClick: (pos: Position) => void): void {
        this._onTileClick = onTileClick;
        this.board =  board;
        this.tileViewFactory = tileViewFactory;
        this.tileViews = new Map<string, TileView>()
        for (let row = 0; row < height; row++) {
            for (let collumn = 0; collumn < width; collumn++) {
                const tileView = this.tileViewFactory.createTileView();
                tileView.node.parent = this.node;
                tileView.init(board.grid[row][collumn], board.grid[row][collumn].position, new cc.Vec2(tileWidth, tileHeight), this.handleTileClick.bind(this));
                this.tileViews.set(`${row},${collumn}`, tileView);
            }
        }

        this.printGrid();
    }

    private handleTileClick(position: Position): void {
        if (this._onTileClick) {
            this._onTileClick(position);
        }
    }

    private updateFallenTiles(dropMoves: TileDropMove[]): void {
        for (const dropMove of dropMoves) {
            if (dropMove.fromRow == this.board.config.verticalTileCount) continue;
            
            const tileView = this.tileViews.get(`${dropMove.fromRow},${dropMove.col}`);
            this.tileViews.delete(`${dropMove.fromRow},${dropMove.col}`);
            this.tileViews.set(`${dropMove.toRow},${dropMove.col}`, tileView);
        }
    }

    public async updateView(board: Board): Promise<void> {
        const animations: Promise<void>[] = [];
        this.printGrid();
        await this.animateCollapses(board.collapseTiles);
        this.updateCollapsedTiles(board.collapseTiles);
        await this.animateFall(board.DropMoves);
        this.updateFallenTiles(board.DropMoves);
        this.addNewTileViews(board);
        await this.animateDropNew(board.DropMoves);

        await Promise.all(animations);
    }

    public updateCollapsedTiles(collapseTiles: Tile[]) {
        for (const tile of collapseTiles) {
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.col}`);
            this.tileViews.delete(`${tile.position.row},${tile.position.col}`);
            this.tileViewFactory.dispose(tileView);
        }
    }

    public addNewTileViews(board: Board) {
        for (let row = 0; row < board.config.verticalTileCount; row++) {
            for (let collumn = 0; collumn < board.config.horizontalTileCount; collumn++) {
                if (this.tileViews.has(`${row},${collumn}`)) continue;
                
                const tile = board.grid[row][collumn];
                const tileView = this.tileViewFactory.createTileView();
                tileView.node.parent = this.node;
                const startPosition = new cc.Vec3(collumn * board.config.tileWidth, board.config.tileHeight * board.config.verticalTileCount);
                tileView.init(tile, new Position(startPosition.x, startPosition.y, row, collumn), new cc.Vec2(this.board.config.tileWidth, this.board.config.tileHeight), this.handleTileClick.bind(this));
                this.tileViews.set(`${row},${collumn}`, tileView);
            }
        }
    }

    private async animateDropNew(dropMoves: TileDropMove[]) {
        const animations: Promise<void>[] = [];
        const durationMove = 0.25;
        const durationNew = 0.35;

        dropMoves.forEach(tile => {
            if (tile.fromRow === this.board.config.verticalTileCount) {
                console.log("new tile in position =", tile.toRow, tile.col);
                const tileView = this.tileViews.get(`${tile.toRow},${tile.col}`);
                const node = tileView.node;
                animations.push(new Promise(resolve => {
                    cc.tween(node)
                    .delay(durationMove) // ждем падения существующих
                    .to(durationNew, { position: new cc.Vec3(tile.newPosition.x, tile.newPosition.y) }, { easing: 'bounceOut' })
                    .call(() => resolve())
                    .start();
                }));
            }
        });

        await Promise.all(animations);
    }

    private async animateCollapses(collapseTiles: Tile[]) {
        const animations: Promise<void>[] = [];
        collapseTiles.forEach(tile => {
            let i = 0;
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.col}`);
            if (tileView) {
                animations.push(new Promise(resolve => {
                    cc.tween(tileView.node)
                        .to(0.2, { scale: 0 }, { easing: 'backIn' })
                        .delay(i * 0.05)
                        .call(() => {
                            tileView.node.active = false;
                            resolve();
                        })
                        .start();
                }));
            }
            i++;
        });

        await Promise.all(animations);
    }

    public async animateFall(dropMoves: TileDropMove[]) {
        const animations: Promise<void>[] = [];

        const durationMove = 0.25;

        for (const dropMove of dropMoves) {
            if (dropMove.fromRow == this.board.config.verticalTileCount) continue;

            const node = this.tileViews.get(`${dropMove.fromRow},${dropMove.newPosition.col}`).node;
            if (node && cc.isValid(node)) {
                animations.push(new Promise(resolve => {
                    cc.tween(node)
                        .to(durationMove, { position: new cc.Vec3(dropMove.newPosition.x, dropMove.newPosition.y) }, { easing: 'quadOut' })
                        .call(() => resolve())
                        .start();
                }));
            }
        }

        await Promise.all(animations);
    }

    private printGrid() {
        let rowString = "";
        for (let row = 0; row < this.board.config.verticalTileCount; row++) {
            for (let collumn = 0; collumn < this.board.config.horizontalTileCount; collumn++) {
                rowString += "[" + row + "," + collumn + "]" + this.board.grid[row][collumn].type + " ";
            }
            rowString += "\n";
        }

        this.debugBoard.string = rowString;
    }
}