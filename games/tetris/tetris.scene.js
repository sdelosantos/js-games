// @ts-check
/**
 * @typedef {TetrisScene} TetrisSceneType
 */

import { GameScene } from "../../engine/scene";
import { getTetriPiece } from "./tetris.player";
import { BOAD_HEIGHT, BOAD_WIDTH } from "./tetris.utils";
const options = {
    width: BOAD_WIDTH,
    height: BOAD_HEIGHT,
    bgColor: '#000',
    disableRunner: false
}

class TetrisScene extends GameScene {
    totalScore = 0;
    #scorePointForBlocks = 200;

    removeCompletedRows() {
        const board = this.getBoardArray();
        for (let y = 0; y < board.length; y++) {
            const row = board[y];
            if (row.every(val => val)) {
                const calcPoints = row.length * this.#scorePointForBlocks;
                this.totalScore += calcPoints;
                this.emit('customEvent', { event: 'ScoreUpdated', data: { totalScore: this.totalScore } })
                board.splice(y, 1);
                board.splice(0, 0, new Array(row.length).fill(0));
            }
        }
        return this;
    }
}

export const TetrisGameScene = new TetrisScene(options)
    .setBoardBlockSize(20)
    .addGameObject(getTetriPiece())

export const BankScreen = new TetrisScene({ ...options, disableRunner: true })
    .setBoardBlockSize(20)
