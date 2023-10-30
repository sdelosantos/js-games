// @ts-check
/**
 * @typedef {TetrisScene} TetrisSceneType
 * @typedef {import('../../engine/gameObject').GameObjectElementType} GameObject
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
    #pointsPerBlocks = 200;

    /**
     * Fix a tetris piece on the scene board to keep it
     * @param {GameObject} gameObject 
     * @returns {GameScene}
     */
    solidifyGameObjectToBoard(gameObject) {
        gameObject.getPoligoneShape().forEach(({ x, y, value }) => {
            if (value) {
                const yPosition = y >= this.boardHeight ? this.boardHeight - 1 : y;
                this.boardArray[yPosition][x] = 1
            }
        });
        return this;
    }


    /**
     * Remove the row if all the space has been filled, to collect the score points
     * @returns {GameScene}
     */
    removeCompletedRows() {
        const board = this.getBoardArray();
        for (let y = 0; y < board.length; y++) {
            const row = board[y];
            if (row.every(val => val)) {
                const calcPoints = row.length * this.#pointsPerBlocks;
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
