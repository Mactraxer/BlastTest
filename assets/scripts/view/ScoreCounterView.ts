const  {ccclass, property} = cc._decorator;

@ccclass
export class ScoreCounterView extends cc.Component {
    @property(cc.Label)
    private scoreLabel: cc.Label = null;

    private targetScore: string;
    private scoreTextParts: string[] = [];

    public init(targetScore: number) : void {
        this.targetScore = targetScore.toString();
        this.scoreTextParts =  ["0", "/", this.targetScore];
        this.scoreLabel.string = this.scoreTextParts.join("");
    }

    public updateScore(score: number): void {
        this.scoreTextParts[0] = score.toString();
        this.scoreLabel.string = this.scoreTextParts.join("");
    }
}