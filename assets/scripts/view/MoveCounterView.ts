const {ccclass, property} = cc._decorator;

@ccclass
export class MoveCounterView extends  cc.Component {
    @property(cc.Label)
    private movesLabel: cc.Label = null;

    public updateMoves(moveLeft: number): void {
        this.movesLabel.string = moveLeft.toString();
    }
}