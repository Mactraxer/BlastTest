import { GameConfig } from "../config/GameConfig";
import { LevelViewFactory } from "../factory/LevelViewFactory";
import { TileViewFactory } from "../factory/TileViewFactory";
import { MovesChangedEvent, RestartEventName, ScoreChangedEvent } from "../GameEvents";
import { GameState } from "../model/GameState";
import { GameView } from "../view/GameView";
import { LevelController } from "./LevelController";

export class GameController {
    private readonly state: GameState;
    private readonly gameView: GameView;
    private readonly config: GameConfig;
    private readonly levelViewFactory: LevelViewFactory;
    private readonly tileViewFactory: TileViewFactory;
    private readonly gameNode: cc.Node;
    private level: LevelController;

    constructor(
        config: GameConfig,
        levelViewFactory: LevelViewFactory,
        tileViewFactory: TileViewFactory,
        gameNode: cc.Node
    ) {
        this.config = config;
        this.levelViewFactory = levelViewFactory;
        this.tileViewFactory = tileViewFactory;
        this.gameNode = gameNode;

        this.state = GameState.initial(config);
        this.state.gameEventEmitter.on(ScoreChangedEvent, this.handleScoreChanged.bind(this));
        this.state.gameEventEmitter.on(MovesChangedEvent, this.handleMovesChanged.bind(this));

        this.gameView = this.gameNode.getComponent(GameView);
        this.gameView.node.on(RestartEventName, this.onTapRestartButton, this);
    }

    
    public nextLevel() : void {
        this.gameView.hideLose();
        this.gameView.hideWin();
        const levelView = this.levelViewFactory.createLevel(this.gameNode);
        this.level = new LevelController(levelView, this.config, this.tileViewFactory, this.state);
    }
    
    private handleMovesChanged(event: {moves: number}) : void {
        if (event.moves <= 0) {
            this.disposeLevel();
            this.levelLose();
        }
    }
    
    private disposeLevel() : void {
        this.level.hide();
        this.level.destroy();
    }

    private handleScoreChanged(event: {score: number}) : void {
        if (event.score >= this.config.targetScore) {
            this.disposeLevel();
            this.levelWin();
        }
    }
    
    private levelLose() : void {
        this.gameView.showLose();
    }
    
    private levelWin() : void {
        this.gameView.showWin();
    }

    private onTapRestartButton() : void {
        this.state.reset(this.config);
        this.nextLevel();
    }
}