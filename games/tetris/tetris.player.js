//@ts-check
/**
 * @typedef {TetrisGameObject} TetrisGameObjectType
 * @typedef {'left' | 'right' | 'top' | 'bottom'} Direction
 */
import { GameObjectElement } from "../../engine/gameObject";
import { PLAYER_GAME_OBJECT_NAME, initPlayerSetting, getPosition, getShape } from "./tetris.utils";

class TetrisGameObject extends GameObjectElement {
    #_START_DATE = new Date();

    /**
     * Move the piece
     * @param {Direction} direction 
    */
    movePiece(direction, unitMove = 1) {
        const position = this.getPosition();
        const hasCollision = (side) => (this.collision && this.collision.side.includes(side));
        if (position && this.IS_VISIBLE) {
            switch (direction) {
                case 'right':
                    const right = position.x + unitMove;  
                    if (!hasCollision('RIGHT')) {
                        this.setPosition({ ...position, x: right })
                    }
                    break;
                case 'left':
                    const left = position.x - unitMove;
                    if (!hasCollision('LEFT'))
                        this.setPosition({ ...position, x: left })
                    break
                case 'top':
                    this.rotatePiece();
                    break
                case 'bottom':
                    const bottom = position.y + unitMove;
                    if (!hasCollision('BOTTOM'))
                        this.setPosition({ ...position, y: bottom })
                                        break
            }
        }
    }
    reset() {
        this.setPosition(getPosition());
        this.setShape(getShape());
        return this;
    }

    /**
     * @param {number} dropSpeed 
     */
    dropPiece(dropSpeed = 1) {
        let now = new Date();
        // @ts-ignore
        const diff = now - this.#_START_DATE;
        const rateUpdate = diff / 1000;

        if (rateUpdate >= (1 / dropSpeed)) {
            this.movePiece('bottom');
            this.#_START_DATE = new Date();
        }
    }
    rotatePiece() {
        const shape = this.getCurrentShape();
        const numRows = shape.length;
        const numCols = shape[0].length;
        const scene = this.getScene();
        const position = this.getPosition();

        if (scene && position) {
            // avoid rotate vertical if the space available is less of the piece size
            if (numCols > numRows && (position.y + 2 < numCols || (scene.boardHeight - position.y) < numCols)) {
                return;
            }
            const rotatedShape = Array.from({ length: numCols }, () => Array(numRows));

            for (let y = 0; y < numRows; y++) {
                for (let x = 0; x < numCols; x++) {
                    rotatedShape[x][numRows - y - 1] = shape[y][x];
                }
            }
            this.setShape(rotatedShape);
        }
    }
}

export default new TetrisGameObject(PLAYER_GAME_OBJECT_NAME, initPlayerSetting());