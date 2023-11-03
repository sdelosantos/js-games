//@ts-check

/**
 * @typedef {GameObjectElement} GameObjectElementType
 * @typedef {import('./scene').GameScene} GameSceneType
 * @typedef {{x: number; y: number}} GameObjectPosition
 * @typedef {Array<Array<string | number>>} GameObjectShapeType
 * 
 * @typedef CollisionType
 * @property {'BOARD_LIMIT' | 'SOLIDIFIED_STUFFED' | 'GAME_OBJECT'} type
 * @property {Array<'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'>} side
 * @property {Array<GameObjectPosition>} coordinates
 * @property {GameObjectElementType | null} gameObject
 */

export class GameObjectElement {
    get IS_VISIBLE() {
        return this.#_visible
    }
    get DEFAULT_GAME_OBJECT_COLOR() { return 'red' }

    /** @type {boolean} */
    #_visible = true
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
        return this.#_currentShape
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
                newShape.push({ x, y, value })
            })
        });

        return newShape;
    }

    checkBoardColision() {
        const scene = this.#_sceneInstance;
        const position = this.getPosition();
        if (scene && position) {
            const { x: currentX, y: currentY } = position;
            const characterAreaY = this.#_currentShape.length - 1;
            const characterAreaX = this.#_currentShape[0].length - 1;

            const adjacentX = currentX + characterAreaX, adjacentY = currentY + characterAreaY;
            const RightBoardLimit = scene.boardWidth - 1;
            const BottomBoardLimit = scene.boardHeight - 1;

            let sideCollision = {
                LEFT: currentX <= 0,
                RIGHT: adjacentX >= RightBoardLimit,
                TOP: currentY <= 0,
                BOTTOM: adjacentY >= BottomBoardLimit,
            }
            if (sideCollision.LEFT || sideCollision.RIGHT || sideCollision.BOTTOM || sideCollision.TOP) {
                const allCollisions = Object.keys(sideCollision).filter(ky => sideCollision[ky]);
                this.collision = {
                    gameObject: null,
                    type: 'BOARD_LIMIT',
                    coordinates: [{ x: adjacentX, y: adjacentY }],
                    // @ts-ignore
                    side: allCollisions
                }
            } else {
                const board = this.#_sceneInstance?.getBoardArray();
                const yPosition = adjacentY + 1;
                // @ts-ignore
                const xPosition = this.#_currentShape.slice(-1)[0].reduce((pre, xValue, x) => {
                    // @ts-ignore
                    if (xValue) pre.push(x + currentX)
                    return pre;
                }, []);

                const isOnCollision = board && board[yPosition].some((xRows, x) => {
                    return xRows && xPosition.includes(x);
                });

                if (isOnCollision) {
                    this.collision = {
                        gameObject: null,
                        type: 'SOLIDIFIED_STUFFED',
                        coordinates: [{ x: adjacentX, y: adjacentY }],
                        // @ts-ignore
                        side: ['BOTTOM']
                    }
                } else {
                    this.collision = null;
                }
            }
            if (this.collision) {
                this.#_sceneInstance?.emit('onObjectCollision', this.collision)
            }

        }
        return this;
    }
}