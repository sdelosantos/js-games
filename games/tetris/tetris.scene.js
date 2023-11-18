// @ts-check
/**
 * @typedef {TetrisScene} TetrisSceneType
 * @typedef {import('../../engine/gameObject').GameObjectElementType} GameObject
 */

import { GameScene } from "../../engine/scene";
import tetriPiece from "./tetris.player";
import { BLOCK_SIZE, BOAD_HEIGHT, BOAD_WIDTH } from "./tetris.utils";
const options = {
  width: BOAD_WIDTH,
  height: BOAD_HEIGHT,
  bgColor: "#000",
  disableRunner: false,
};

class TetrisScene extends GameScene {
  totalScore = 0;
  #pointsPerRows = 200;

  /**
   * Solidifies the piece on the game board.
   * @param {GameObject} gameObject - The game object representing the piece.
   * @returns {GameScene} Returns the current object to allow method chaining.
   */
  solidifyPiece(gameObject) {
    gameObject.getPoligoneShape().forEach(({ x, y, value }) => {
      if (value) {
        const yPosition = y >= this.boardHeight ? this.boardHeight - 1 : y;
        this.boardArray[yPosition][x] = value;
      }
    });
    return this;
  }

  canLevelUp() {
    const score =
      this.totalScore > 0 ? this.totalScore / this.#pointsPerRows : -1;

    if (score <= 2) return false;

    let fib1 = 0;
    let fib2 = 1;
    while (fib2 <= score) {
      if (fib2 === score) return true;

      const nextFib = fib1 + fib2;
      fib1 = fib2;
      fib2 = nextFib;
    }
    return false;
  }
  /**
   * This function iterates over the board and collects completed rows, updating the total score.
   * @returns {GameScene} Returns the current object to allow method chaining.
   */
  collectRowsCompleted() {
    const board = this.getBoardArray();
    let removedRowsCount = 0;

    for (let y = 0; y < board.length; y++) {
      const row = board[y];
      if (row.every((val) => val)) {
        removedRowsCount += 1;
        board.splice(y, 1);
        board.splice(0, 0, new Array(row.length).fill(0));
      }
    }

    if (removedRowsCount > 0) {
      const totalPoints = removedRowsCount * this.#pointsPerRows;
      this.totalScore += totalPoints;
      this.emit("scoreupdated", { totalScore: this.totalScore });
    }

    return this;
  }
  update() {
    this.checkGameOver();
    return this;
  }
  checkGameOver() {
    const board = this.boardArray;
    this.gameOver = board[2].some((v) => v);
    if (this.gameOver) {
      this.emit("gameover", null);
    }
    return this;
  }
}

export const TetrisGameScene = () =>
  new TetrisScene(options)
    .setBoardBlockSize(BLOCK_SIZE)
    .addGameObject(tetriPiece);

export const BankScreen = new TetrisScene({
  ...options,
  disableRunner: true,
}).setBoardBlockSize(20);
