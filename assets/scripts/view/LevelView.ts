import { BoardView } from "./BoardView";
import { MoveCounterView } from "./MoveCounterView";
import { ScoreCounterView } from "./ScoreCounterView";

const  {ccclass, property} = cc._decorator;

@ccclass
export class LevelView extends cc.Component {
    public static readonly BombTapEventName = 'onTapBoombButton';
    public static readonly TeleportTapEventName = 'onTapTeleportButton';
    
    @property(ScoreCounterView)
    private scoreCounterView: ScoreCounterView = null;
    
    @property(MoveCounterView)
    private moveCounterView: MoveCounterView = null;
    
    @property(BoardView)
    public boardView: BoardView = null;
    
    @property(cc.Button)
    private bombButton: cc.Button = null;
    
    @property(cc.Button)
    private teleportButton: cc.Button = null;
    
    protected onLoad(): void {      
        this.bombButton.node.on(cc.Node.EventType.TOUCH_END, this.onTapBoombButton, this);
        this.teleportButton.node.on(cc.Node.EventType.TOUCH_END, this.onTapTeleportButton, this);
    }
    
    protected onDestroy(): void {
        this.bombButton.node.off(cc.Node.EventType.TOUCH_END, this.onTapBoombButton, this);
        this.teleportButton.node.off(cc.Node.EventType.TOUCH_END, this.onTapTeleportButton, this);
    }

    public hide() {
        this.node.active = false;
    }

    public updateScore(score: number) {
        this.scoreCounterView.updateScore(score);
    }

    public updateMoves(moves: number) {
        this.moveCounterView.updateMoves(moves);
    }

    public onTapBoombButton() {
        this.node.emit(LevelView.BombTapEventName);
    }

    public onTapTeleportButton() {
        this.node.emit(LevelView.TeleportTapEventName);
    }
}