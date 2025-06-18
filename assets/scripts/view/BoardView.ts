import { Position } from "../GameConfig";
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
            if (tileView === null) {
                console.log("tileView is null");
            }
            this.tileViews.delete(`${dropMove.fromRow},${dropMove.col}`);
            this.tileViews.set(`${dropMove.toRow},${dropMove.col}`, tileView);
            tileView.updateView(dropMove.tile);
        }
    }

    public async updateView(board: Board): Promise<void> {
        await this.animateSwap(board.swapTile[0], board.swapTile[1]);
        this.updateSwapTiles(board.swapTile[0], board.swapTile[1]);
        if (board.createdMegaTile) {
            await this.animateCollapsesToMegaTile(board.collapseTiles, board.newMegaTileStartPosition);
            this.updateMegaTileView(board.createdMegaTile, board.newMegaTileStartPosition);
        } else {
            await this.animateCollapses(board.collapseTiles);
        }
        await this.delay(200);
        this.updateCollapsedTiles(board.collapseTiles);
        await this.animateFall(board.dropMoves);
        this.updateFallenTiles(board.dropMoves);
        this.addNewTileViews(board);
        await this.animateDropNew(board.dropMoves);
        
        this.printGrid();
    }

    private updateSwapTiles(tile1: Tile, tile2: Tile) : void {
        if (!tile1 || !tile2) return;

        const tileView1 = this.tileViews.get(`${tile1.position.row},${tile1.position.column}`);
        const tileView2 = this.tileViews.get(`${tile2.position.row},${tile2.position.column}`);

        this.tileViews.delete(`${tile1.position.row},${tile1.position.column}`);
        this.tileViews.delete(`${tile2.position.row},${tile2.position.column}`);
        
        this.tileViews.set(`${tile1.position.row},${tile1.position.column}`, tileView2);
        this.tileViews.set(`${tile2.position.row},${tile2.position.column}`, tileView1);

        tileView1.updateView(tile2);
        tileView2.updateView(tile1);
    }

    private async animateSwap(tile1: Tile, tile2: Tile) {
        if (!tile1 || !tile2) return;

        const node1 = this.tileViews.get(`${tile1.position.row},${tile1.position.column}`)?.node;
        const node2 = this.tileViews.get(`${tile2.position.row},${tile2.position.column}`)?.node;

        if (!node1 || !node2) return;

        const pos1 = node1.position.clone();
        const pos2 = node2.position.clone();

        await Promise.all([
            new Promise(resolve => cc.tween(node1).to(0.2, { position: pos2 }).call(resolve).start()),
            new Promise(resolve => cc.tween(node2).to(0.2, { position: pos1 }).call(resolve).start()),
        ]);
    }

    private updateMegaTileView(createdMegaTile: Tile, newMegaTileStartPosition: Position) {
        let megaTileView = this.tileViews.get(`${newMegaTileStartPosition.row},${newMegaTileStartPosition.column}`);
        if (megaTileView) {
            megaTileView.updateView(createdMegaTile);
        }
    }

    public async animateCollapsesToMegaTile(collapseTiles: Tile[], megaTileStartPosition: Position) {
        const animations: Promise<void>[] = [];

        const centerPos = new cc.Vec3(megaTileStartPosition.x, megaTileStartPosition.y);

        for (const tile of collapseTiles) {
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.column}`);
            if (!tileView) continue;

            const node = tileView.node;

            animations.push(new Promise(resolve => {
                cc.tween(node)
                    .to(0.3, { position: centerPos, scale: 0.3 }, { easing: 'backIn' }) // притягивание
                    .call(() => {
                        // Удаляем старый тайл визуально
                        tileView.node.active = false;
                        resolve();
                    })
                    .start();
            }));
        }

        // Ждём завершения всех анимаций
        await Promise.all(animations);

        // Здесь можно включить вспышку или масштаб мега-тайла
        const megaTileView = this.tileViews.get(`${megaTileStartPosition.row},${megaTileStartPosition.column}`);
        if (megaTileView) {
            const megaTileAnimation = new Promise<void>(resolve => {
                cc.tween(megaTileView.node)
                    .to(0.2, { scale: 1.3 }, { easing: 'sineOut' })
                    .to(0.2, { scale: 1.0 }, { easing: 'backIn' })
                    .call(() => {
                        resolve();
                    })
                    .start();
            });

            await megaTileAnimation;
        }
    }

    public updateCollapsedTiles(collapseTiles: Tile[]) {
        for (const tile of collapseTiles) {
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.column}`);
            this.tileViews.delete(`${tile.position.row},${tile.position.column}`);
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
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.column}`);
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

            const tileView = this.tileViews.get(`${dropMove.fromRow},${dropMove.newPosition.column}`);
            if (tileView === null) {
                console.log("tileView is null");
            }

            const node = tileView.node;
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

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}