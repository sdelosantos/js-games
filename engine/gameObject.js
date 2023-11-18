//@ts-check

import {
  allocatedSpaceCollisionDetection,
  boundaryCollisionDetection,
} from "./engine.utils";

/**
 * @typedef {GameObjectElement} GameObjectElementType
 * @typedef {import('./scene').GameScene} GameSceneType
 * @typedef {{x: number; y: number}} GameObjectPosition
 * @typedef {Array<Array<string | number>>} GameObjectShapeType
 *
 * @typedef CollisionType
 * @property {'GAME_OBJECT' | 'BOUNDARY_COLLISION' | 'ALLOCATED_BOARD_SPACE'} type
 * @property {Array<'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'>} side
 * @property {Array<GameObjectPosition>} coordinates
 * @property {GameObjectElementType | null} gameObject
 */

export class GameObjectElement {
  get IS_VISIBLE() {
    return this.#_visible;
  }
  get DEFAULT_GAME_OBJECT_COLOR() {
    return "red";
  }

  /** @type {boolean} */
  #_visible = true;
  /** @type {GameObjectShapeType} */
  #_currentShape = [];
  /** @type {GameObjectPosition | undefined} */
  #_currentPosition = undefined;
  /** @type {GameSceneType | null} */
  #_sceneInstance = null;

  /** @type {CollisionType | null} */
  collision = null;
  /** @type {string | null} */
  name = null;

  /**
   * @param {string} name
   * @param {{position: GameObjectPosition; shape: GameObjectShapeType, isVisible?: boolean }} initGameObject
   */
  constructor(name, initGameObject) {
    this.name = name;
    this.#_currentShape = [...initGameObject.shape];
    this.#_currentPosition = { ...initGameObject.position };
    if (initGameObject.isVisible !== undefined)
      this.#_visible = initGameObject.isVisible;
  }

  /**
   * @param {GameObjectPosition} position
   * @returns {GameObjectElementType}
   */
  setPosition(position) {
    this.#_currentPosition = position;
    return this;
  }

  getPosition() {
    return this.#_currentPosition;
  }
  /**
   * @param {GameObjectShapeType} shape
   * @returns {GameObjectElementType}
   */
  setShape(shape = []) {
    this.#_currentShape = [...shape];
    return this;
  }

  getCurrentShape() {
    return this.#_currentShape;
  }
  /**
   * @param {boolean} visible
   * @returns {GameObjectElement}
   */
  setVisibility(visible) {
    this.#_visible = visible;
    return this;
  }

  /**
   * @returns {GameSceneType | null}
   */
  getScene() {
    return this.#_sceneInstance;
  }

  /**
   * @param {GameSceneType} sceneInstance
   */
  $injectScene(sceneInstance) {
    this.#_sceneInstance = sceneInstance;
  }
  /**
   * @returns {Array<GameObjectPosition & {value: string | number}>}
   */
  getPoligoneShape() {
    const newShape = [];
    const shape = this.#_currentShape;

    shape.forEach((row, yPosition) => {
      row.forEach((value, xPosition) => {
        const x = xPosition + (this.#_currentPosition?.x || 0);
        const y = yPosition + (this.#_currentPosition?.y || 0);
        newShape.push({ x, y, value });
      });
    });

    return newShape;
  }

  checkCollision({ x, y }, callback) {
    const scene = this.#_sceneInstance;

    if (scene) {
      Promise.all([
        Promise.resolve(
          boundaryCollisionDetection({
            poligonObject: this.#_currentShape,
            poligonPositionX: x,
            poligonPositionY: y,
            sceneHeight: scene.boardHeight,
            sceneWidth: scene.boardWidth,
          })
        ),
        Promise.resolve(
          allocatedSpaceCollisionDetection({
            boardArray: scene.getBoardArray(),
            poligonObject: this.#_currentShape,
            poligonPositionX: x,
            poligonPositionY: y,
          })
        ),
      ]).then(([col, col2]) => {
        const collisiones = [...col, ...col2];
        collisiones.length > 0 &&
          this.#_sceneInstance?.emit("collisiondetected", collisiones);
        callback(collisiones);
      });
    }
    return this;
  }
}
