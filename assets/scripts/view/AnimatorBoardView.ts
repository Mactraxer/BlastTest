import { TileDropMove } from "../model/Board";
import { Position, Tile } from "../model/Tile";
import { TileView } from "./TileView";

const {ccclass, property} = cc._decorator;

@ccclass
export class AnimatorBoardView extends cc.Component {
    
    @property(cc.Integer)
    private animationTileFallDuration = 0.25;
    
    @property(cc.Integer)
    private animationSimpleTileCollapseDelay = 0.05;

    @property(cc.Integer)
    private animationSwapDuration = 0.2;

    @property(cc.Integer)
    private animationCollapseToMegaTileDuration = 0.3;

    @property(cc.Integer)
    private animationCollapseToMegaTileScale = 0.3;

    @property(cc.Integer)
    private animationMegaTileScaleUpDuration = 0.2;

    @property(cc.Integer)
    private animationMegaTileScaleUpValue = 1.3;

    @property(cc.Integer)
    private animationMegaTileCommonScaleValue = 1.0;

    @property(cc.Integer)
    private animationDropNewDelayBetweenEach = 0.25;

    @property(cc.Integer)
    private animationDropNewDuration = 0.35;

    @property(cc.Integer)
    private animationCollapseSimpleTileDuration = 0.2;

    @property(cc.Integer)
    private animationCollapseSimpleTileScaleDownValue = 0;

    private tileViews: Map<string, TileView>;

    public setup(tileViews: Map<string, TileView>) : void {
        this.tileViews = tileViews;
    }

    public async animateSwap(tile1: Tile, tile2: Tile) :  Promise<void> {
        if (!tile1 || !tile2) return;

        const node1 = this.tileViews.get(`${tile1.position.row},${tile1.position.column}`)?.node;
        const node2 = this.tileViews.get(`${tile2.position.row},${tile2.position.column}`)?.node;

        if (!node1 || !node2) return;

        const pos1 = node1.position.clone();
        const pos2 = node2.position.clone();

        await Promise.all([
            new Promise(resolve => cc.tween(node1).to(this.animationSwapDuration, { position: pos2 }).call(resolve).start()),
            new Promise(resolve => cc.tween(node2).to(this.animationSwapDuration, { position: pos1 }).call(resolve).start()),
        ]);
    }

    public async animateCollapsesToMegaTile(collapseTiles: Tile[], superTileStartPosition: Position) : Promise<void> {
        const animations: Promise<void>[] = [];

        const centerPos = new cc.Vec3(superTileStartPosition.x, superTileStartPosition.y);

        for (const tile of collapseTiles) {
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.column}`);
            if (!tileView) continue;

            const node = tileView.node;

            animations.push(new Promise(resolve => {
                cc.tween(node)
                    .to(this.animationCollapseToMegaTileDuration, { position: centerPos, scale: this.animationCollapseToMegaTileScale }, { easing: 'backIn' })
                    .call(() => {
                        tileView.node.active = false;
                        resolve();
                    })
                    .start();
            }));
        }

        await Promise.all(animations);

        const megaTileView = this.tileViews.get(`${superTileStartPosition.row},${superTileStartPosition.column}`);
        if (megaTileView) {
            const megaTileAnimation = new Promise<void>(resolve => {
                cc.tween(megaTileView.node)
                    .to(this.animationMegaTileScaleUpDuration, { scale: this.animationMegaTileScaleUpValue }, { easing: 'sineOut' })
                    .to(this.animationMegaTileScaleUpDuration, { scale: this.animationMegaTileCommonScaleValue }, { easing: 'backIn' })
                    .call(() => {
                        resolve();
                    })
                    .start();
            });

            await megaTileAnimation;
        }
    }

    public async animateDropNew(dropMoves: TileDropMove[], verticalTileCount: number) : Promise<void> {
        const animations: Promise<void>[] = [];

        dropMoves.forEach(tile => {
            if (tile.fromRow === verticalTileCount) {
                const tileView = this.tileViews.get(`${tile.toRow},${tile.col}`);
                const node = tileView.node;
                animations.push(new Promise(resolve => {
                    cc.tween(node)
                    .delay(this.animationDropNewDelayBetweenEach)
                    .to(this.animationDropNewDuration, { position: new cc.Vec3(tile.newPosition.x, tile.newPosition.y) }, { easing: 'bounceOut' })
                    .call(() => resolve())
                    .start();
                }));
            }
        });

        await Promise.all(animations);
    }

    public async animateCollapses(collapseTiles: Tile[]) : Promise<void> {
        const animations: Promise<void>[] = [];
        collapseTiles.forEach(tile => {
            let i = 0;
            const tileView = this.tileViews.get(`${tile.position.row},${tile.position.column}`);
            if (tileView) {
                animations.push(new Promise(resolve => {
                    cc.tween(tileView.node)
                        .to(this.animationCollapseSimpleTileDuration, { scale: this.animationCollapseSimpleTileScaleDownValue }, { easing: 'backIn' })
                        .delay(i * this.animationSimpleTileCollapseDelay)
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

    public async animateFall(dropMoves: TileDropMove[], verticalTileCount: number) : Promise<void> {
        const animations: Promise<void>[] = [];

        this.animationTileFallDuration;

        for (const dropMove of dropMoves) {
            if (dropMove.fromRow == verticalTileCount) continue;

            const tileView = this.tileViews.get(`${dropMove.fromRow},${dropMove.newPosition.column}`);
            if (tileView === null) {
                console.log("tileView is null");
            }

            const node = tileView.node;
            if (node && cc.isValid(node)) {
                animations.push(new Promise(resolve => {
                    cc.tween(node)
                        .to(this.animationTileFallDuration, { position: new cc.Vec3(dropMove.newPosition.x, dropMove.newPosition.y) }, { easing: 'quadOut' })
                        .call(() => resolve())
                        .start();
                }));
            }
        }

        await Promise.all(animations);
    }
}