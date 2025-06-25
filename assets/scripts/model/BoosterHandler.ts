import { Board } from "./Board";
import { Tile } from "./Tile";
import { BoosterType } from "./BoosterType";
import { ScoreCounter } from "./ScoreCounter";
import { BoosterView } from "../view/BoosterView";

export class BoosterHandler {
    private board: Board;
    private activeBooster: BoosterType;
    private firstSelectionTile: Tile | null;
    private secondSelectionTile: Tile | null;
    private scoreCounter: ScoreCounter;
    private boosterView: BoosterView = null;
    private boosterBombCount: number;
    private boosterTeleportCount: number;
    
    constructor(board: Board, scoreCounter: ScoreCounter, boosterView: BoosterView, boosterTeleportCount: number, boosterBombCount: number) {
        this.board = board;
        this.activeBooster = BoosterType.None;
        this.scoreCounter = scoreCounter;
        this.boosterView = boosterView;
        this.boosterBombCount = boosterBombCount;
        this.boosterTeleportCount = boosterTeleportCount;

        this.subscribesToBoosterButtonsEvent();
        this.boosterView.updateView(this.boosterTeleportCount, this.boosterBombCount);
    }

    public isSelectedBooster(): boolean {
        return this.activeBooster !== BoosterType.None;
    }

    public selectBooster(boosterType: BoosterType) : void {
        this.activeBooster = boosterType;
    }
    
    public useActiveBoosterIn(tile: Tile) : void {
        this.handleBooster(tile);
    }

    public unblockBoosters() : void {
        this.subscribesToBoosterButtonsEvent();
    }
    public blockBoosters() : void {
        this.unsubscribesFromBoosterButtonsEvent();
    }

    private subscribesToBoosterButtonsEvent() : void {
        this.boosterView.node.on(BoosterView.TeleportTapEventName, this.onTapTeleportButton, this);
        this.boosterView.node.on(BoosterView.BombTapEventName, this.onTapBoombButton, this);
    }

    private unsubscribesFromBoosterButtonsEvent() : void {
        this.boosterView.node.off(BoosterView.TeleportTapEventName, this.onTapTeleportButton, this);
        this.boosterView.node.off(BoosterView.BombTapEventName, this.onTapBoombButton, this);
    }
    
    private handleBooster(tile: Tile) : void {
        switch (this.activeBooster) {
            case BoosterType.Teleport:
                if (this.firstSelectionTile == null) {
                    this.firstSelectionTile = tile;
                } else {
                    this.secondSelectionTile = tile;
                    this.teleportTiles();
                    this.boosterTeleportCount--;
                    this.boosterView.updateView(this.boosterTeleportCount, this.boosterBombCount);
                    this.offActive();
                }
                break;
            case BoosterType.Bomb:
                this.bombTile(tile);
                this.boosterBombCount--;
                this.boosterView.updateView(this.boosterTeleportCount, this.boosterBombCount);
                this.offActive();
                break;
            default:
                break;
        }

        if (this.boosterTeleportCount <= 0) {
            this.boosterView.disableTeleport();
        }

        if (this.boosterBombCount <= 0) {
            this.boosterView.disableBomb();
        }
    }

    private offActive() : void {
        this.firstSelectionTile = null;
        this.secondSelectionTile = null;
        this.activeBooster = BoosterType.None;
        this.boosterView.setActiveBooster(BoosterType.None);
    }

    private bombTile(tile: Tile) : void {
        const removeTiles: Tile[] = [];
        const [centerRow, centerColumn] = [tile.position.row, tile.position.column];
        const radius = this.board.config.superTileRadius;

        for (let row = centerRow - radius; row <= centerRow + radius; row++) {
            for (let column = centerColumn - radius; column <= centerColumn + radius; column++) {
                if (
                    row >= 0 && row < this.board.config.verticalTileCount &&
                    column >= 0 && column < this.board.config.horizontalTileCount
                ) {
                    removeTiles.push(this.board.grid[row][column]);
                }
            }
        }

        this.board.setCollapseTiles(removeTiles);
        this.board.removeTiles(removeTiles.map(m => m.position));

        this.scoreCounter.updateScore(removeTiles);
    }

    private teleportTiles() : void {
        const [rowFirstTitle, columnFirstTitle] = [this.firstSelectionTile.position.row, this.firstSelectionTile.position.column];
        const [rowSecondTitle, columnSecondTitle] = [this.secondSelectionTile.position.row, this.secondSelectionTile.position.column];

        const temp = this.board.grid[rowFirstTitle][columnFirstTitle];
        this.board.grid[rowFirstTitle][columnFirstTitle] = this.board.grid[rowSecondTitle][columnSecondTitle];
        this.board.grid[rowSecondTitle][columnSecondTitle] = temp;
        
        const positionTemp = this.board.grid[rowFirstTitle][columnFirstTitle].position;
        this.board.grid[rowFirstTitle][columnFirstTitle].position = this.board.grid[rowSecondTitle][columnSecondTitle].position;
        this.board.grid[rowSecondTitle][columnSecondTitle].position = positionTemp;

        this.board.swapTile = [this.firstSelectionTile, this.secondSelectionTile];
    }

    private onTapBoombButton() : void {
        if (this.activeBooster === BoosterType.Bomb) {
            this.offActive();
        } else {
            this.activeBooster = BoosterType.Bomb;
            this.boosterView.setActiveBooster(BoosterType.Bomb);
        }
    }

    private onTapTeleportButton() : void {
        if (this.activeBooster === BoosterType.Teleport) {
            this.offActive();
        } else {
            this.activeBooster = BoosterType.Teleport;
            this.boosterView.setActiveBooster(BoosterType.Teleport);
        }
    }
}