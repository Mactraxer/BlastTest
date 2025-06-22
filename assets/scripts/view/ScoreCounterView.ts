const  {ccclass, property} = cc._decorator;

@ccclass
export class ScoreCounterView extends cc.Component {
    @property(cc.Label)
    private scoreLabel: cc.Label = null;

    public updateScore(score: number): void {
        this.scoreLabel.string = score.toString();
    }
}