export class GameState {
    constructor(
        public moves: number,
        public targetScore: number,
        public score: number = 0
    ) {}
}