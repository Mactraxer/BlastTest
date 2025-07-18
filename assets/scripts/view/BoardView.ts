import { TileViewFactory } from "../factory/TileViewFactory";
import { Board, TileDropMove } from "../model/Board";
import { Position, Tile } from "../model/Tile";
import { AnimatorBoardView } from "./AnimatorBoardView";
import { TileView } from "./TileView";

const {ccclass, property} = cc._decorator;

@ccclass
export class BoardView extends cc.Component {
    @property(cc.Label)
    private debugBoard: cc.Label = null;

    @property(AnimatorBoardView)
    private animator: AnimatorBoardView = null;

    @property(cc.Integer)
    private animationBeforeCreateTileDelay = 200;

    private tileViews: Map<string, TileView>;
    private tileViewFactory: TileViewFactory;
    private board: Board;
    private _onTileClick: (pos: Position) => void = null;
    private horizontalTileCount: number;
    private verticalTileCount: number;
    private tileWidth: number;
    private tileHeight: number;

    public initialize(tileViewFactory: TileViewFactory, width: number, height: number, tileWidth: number, tileHeight: number, board: Board, onTileClick: (pos: Position) => void): void {
        this.horizontalTileCount = width;
        this.verticalTileCount = height;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this._onTileClick = onTileClick;
        this.board =  board;
        this.tileViewFactory = tileViewFactory;
        this.tileViews = new Map<string, TileView>();
        this.setupView(width, tileWidth, height, tileHeight);

        for (let row = 0; row < height; row++) {
            for (let collumn = 0; collumn < width; collumn++) {
                const tileView = this.tileViewFactory.createTileView(this.node);
                tileView.init(board.grid[row][collumn], this.getViewTilePosition(row, collumn), new cc.Vec2(tileWidth, tileHeight), this.handleTileClick.bind(this));
                this.tileViews.set(`${row},${collumn}`, tileView);
            }
        }

        this.updateRenderOrder(height, width);

        this.animator.setup(this.tileViews, this);
    }

    public async updateView(board: Board, selectedTile: Tile): Promise<void> {
        await this.animator.animateSwap(board.swapTile[0], board.swapTile[1]);
        this.updateSwapTiles(board.swapTile[0], board.swapTile[1]);
        if (board.createdMegaTile) {
            await this.animator.animateCollapsesToMegaTile(board.collapseTiles, board.createdMegaTileStartPosition);
            this.updateMegaTileView(board.createdMegaTile, board.createdMegaTileStartPosition);
        } else {
            await this.animator.animateCollapses(board.collapseTiles);
        }
        await this.delay(this.animationBeforeCreateTileDelay);
        this.updateCollapsedTiles(board.collapseTiles);
        await this.animator.animateFall(board.dropMoves, this.board.config.verticalTileCount);
        this.updateFallenTiles(board.dropMoves);
        this.addNewTileViews(board);
        await this.animator.animateDropNew(board.dropMoves, this.board.config.verticalTileCount);
    }

    private setupView(width: number, tileWidth: number, height: number, tileHeight: number) : void {
        this.node.width = width * tileWidth;
        this.node.height = height * tileHeight;
    }

    private updateRenderOrder(height: number, width: number) : void {
        let siblingIndex = height * width + 1;

        for (let row = 0; row < height; row++) {
            for (let collumn = 0; collumn < width; collumn++) {
                const tileView = this.tileViews.get(`${row},${collumn}`);
                tileView.node.setSiblingIndex(siblingIndex);
                siblingIndex--;
            }
        }
    }

    private handleTileClick(position: Position): void {
        if (this._onTileClick) {
            this._onTileClick(position);
        }
    }

    private updateFallenTiles(dropMoves: TileDropMove[]): void {
        for (const dropMove of dropMoves) {
            if (dropMove.fromRow == this.board.config.verticalTileCount) continue;
            
            const tileView = this.tileViews.get(`${dropMove.fromRow},${dropMove.column}`);
            if (tileView === null) {
                console.log("tileView is null");
            }
            this.tileViews.delete(`${dropMove.fromRow},${dropMove.column}`);
            this.tileViews.set(`${dropMove.toRow},${dropMove.column}`, tileView);
            tileView.updateView(dropMove.tile);
        }
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

    private updateMegaTileView(createdMegaTile: Tile, newMegaTileStartPosition: Position) : void {
        let megaTileView = this.tileViews.get(`${newMegaTileStartPosition.row},${newMegaTileStartPosition.column}`);
        if (megaTileView) {
            megaTileView.updateView(createdMegaTile);
        }
    }

    private updateCollapsedTiles(collapseTiles: Tile[]) : void {
        for (const tile of collapseTiles) {
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.column}`);
            this.tileViews.delete(`${tile.position.row},${tile.position.column}`);
            this.tileViewFactory.dispose(tileView);
        }
    }

    private addNewTileViews(board: Board) : void {
        for (let row = 0; row < board.config.verticalTileCount; row++) {
            for (let collumn = 0; collumn < board.config.horizontalTileCount; collumn++) {
                if (this.tileViews.has(`${row},${collumn}`)) continue;
                
                const tile = board.grid[row][collumn];
                const tileView = this.tileViewFactory.createTileView(this.node);
                const startPosition = this.getViewTilePosition(-1, collumn);
                tileView.init(tile, new Position(startPosition.x, startPosition.y, row, collumn), new cc.Vec2(this.tileWidth, this.tileHeight), this.handleTileClick.bind(this));
                this.tileViews.set(`${row},${collumn}`, tileView);
            }
        }

        this.updateRenderOrder(board.config.verticalTileCount, board.config.horizontalTileCount);
    }

    public getViewTilePosition(row: number, collumn: number): Position {
        const boardOrigin = this.node.getPosition();

        const boardWidth = this.tileWidth * this.horizontalTileCount;
        const boardHeight = this.tileHeight * this.verticalTileCount;

        const topLeftX = boardOrigin.x - boardWidth / 2;
        const topLeftY = boardOrigin.y + boardHeight / 2;

        const x = topLeftX + collumn * this.tileWidth + this.tileWidth / 2;
        const y = topLeftY - row * this.tileHeight - this.tileHeight / 2;

        return new Position(x, y, row, collumn);
    }

    private printGrid() : void {
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