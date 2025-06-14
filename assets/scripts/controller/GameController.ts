import { Board, Tile } from "../model/Board";
import { GameState } from "../model/GameState";

export class GameController {
    public board: Board;
    public state: GameState;

    constructor(rows: number, cols: number, moves: number, targetScore: number) {
        this.board = new Board(rows, cols);
        this.state = new GameState(moves, targetScore);
    }

    // Только дополнение:
    public burnWithAnimation(tiles: Tile[], onComplete: () => void) {
        this.board.burnTiles(tiles);
        this.state.moves--;
        this.state.score += tiles.length * tiles.length;
        onComplete();
    }


    public onTileClicked(row: number, col: number): string {
        if (this.state.moves <= 0) return "No moves left";
        const group = this.board.getMatchingGroup(row, col);
        if (group.length < 2) return "Group too small";

        this.board.burnTiles(group);
        this.state.moves--;
        this.state.score += group.length * group.length;

        if (this.state.score >= this.state.targetScore) {
            return "Victory!";
        }

        if (this.state.moves === 0) {
            return "Game Over";
        }

        return `Score: ${this.state.score}, Moves: ${this.state.moves}`;
    }
}
