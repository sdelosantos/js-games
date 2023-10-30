//@ts-check

/**
 * @typedef {import('./gameObject').GameObjectElementType} GameObjectType
 * @typedef {'onUpdateScene'| 'onRenderScene' | 'customEvent' | 'onObjectCollision'} EventType
 * @typedef GameSceneOptions
 * @property {number} width - define screen widht on points unit
 * @property {number} height - define screen height on points unit
 * @property {string?} bgColor - define the background screen color
 * @property {boolean?} disableRunner - Disable the screen update loop
 */
class SceneEventHandle {
    /** @type {{[k in EventType]: Array<(data:any)=>void>}} */
    #_eventCallbackPool;
    constructor() {
        // @ts-ignore
        this.#_eventCallbackPool = {};
    }
    /**
     * @param {EventType} event 
     * @param {(data:any)=>void} callback 
     */
    on(event, callback) {
        if (!this.#_eventCallbackPool[event]) {
            this.#_eventCallbackPool[event] = [];
        }
        this.#_eventCallbackPool[event].push(callback);
    }

    /**
    * @param {EventType} event 
    * @param {any} data 
    */
    emit(event, data) {
        const listeners = this.#_eventCallbackPool[event];
        if (listeners) {
            listeners.forEach((callback) => {
                callback(data);
            })
        }
    }
}
export class GameScene extends SceneEventHandle {
    get DEFAULT_BOARD_COLOR() { return '#ffef45'; }
    get DEFAULT_SCENE_BG() { return '#000' }

    /** @type {GameSceneOptions} */
    options;
    /** @type {Array<Array<number | string>>} */
    #_boardArray;
    /** @type {number} */
    #_blockSize;
    /** @type {number} */
    boardWidth;
    /** @type {number} */
    boardHeight;
    /** @type {number} */
    canvasWidth;
    /** @type {number} */
    canvasHeight;
    /** @type {{[k:string]: GameObjectType}} */
    #_hasTableGamesObject;
    /** @type {CanvasRenderingContext2D | null}} */
    canvasContext = null;

    /**
     * @param {GameSceneOptions} options
     */
    constructor(options) {
        super();
        this.options = options;
        this.#_boardArray = [];
        this.#_hasTableGamesObject = {};
        this.#_blockSize = 20;

        this.setBoardSize(options.width, options.height);
    }

    /**
     * @param {number} blockSize 
     * @returns {GameScene}
     */
    setBoardBlockSize(blockSize) {
        this.#_blockSize = blockSize;
        return this;
    }

    /**  @returns {Array<Array<number | string>>} */
    getBoardArray() {
        return this.#_boardArray;
    }

    /**
     * @param {number} width 
     * @param {number} height 
     * @returns {GameScene}
     */
    setBoardSize(width, height) {
        this.boardWidth = width;
        this.boardHeight = height;
        this.canvasWidth = width * this.#_blockSize;
        this.canvasHeight = height * this.#_blockSize;
        this.#_boardArray = [];
        for (let y = 0; y < height; y++) {
            const xArray = [];
            for (let x = 0; x < width; x++) {
                xArray.push(0);
            }
            this.#_boardArray.push(xArray)
        }

        return this;
    }

    /**
     * @param {GameObjectType} gameObject 
     * @returns {GameScene}
     */
    addGameObject(gameObject) {
        gameObject.$injectScene(this);
        if (gameObject.name)
            this.#_hasTableGamesObject[gameObject.name] = gameObject;
        else
            throw 'much be set a name to the game object'
        return this;
    }

    /**
     * @param {string} name 
     * @returns {GameScene}
     */
    removeGameObject(name) {
        delete this.#_hasTableGamesObject[name];
        return this;
    }

    /**
     * @param {string} name 
     * @returns {GameObjectType}
     */
    getGameObject(name) {
        return this.#_hasTableGamesObject[name];
    }

    /**
     * @returns {GameObjectType[]}
     */
    getAllGameObject() {
        return Object.entries(this.#_hasTableGamesObject).map(([, gameObject]) => gameObject);
    }

    /**
     * @param {GameObjectType} gameObject 
     * @returns {GameScene}
     */
    getSolidifyGameObject(gameObject) {
        gameObject.getPoligoneShape().forEach(({ x, y, value }, inx) => {
            if (value) {
                const yPosition = y >= this.boardHeight ? this.boardHeight - 1 : y;
                this.#_boardArray[yPosition][x] = 1
            }
        });
        return this;
    }

    /**
     * @param {HTMLCanvasElement} canvas 
     * @returns {GameScene}
     */
    build(canvas) {
        this.canvasContext = this.#getContent(canvas);
        return this;
    }

    render() {
        this.#resetCanvas()
            .#drawSceneBoard()
            .#drawGameObjects();
    }

    /**
     * @param {HTMLCanvasElement} canvas 
     * @returns {CanvasRenderingContext2D | null}
     */
    #getContent(canvas) {
        const context = canvas.getContext('2d');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        if (context) {
            context.fillStyle = this.options.bgColor || this.DEFAULT_SCENE_BG;
            context?.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            context.scale(this.#_blockSize, this.#_blockSize);
        }

        return context;
    }

    #resetCanvas() {
        const context = this.canvasContext;
        if (context) {
            context.fillStyle = this.options.bgColor || this.DEFAULT_SCENE_BG;
            context?.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

        return this;
    }
    /** @returns {GameScene} */
    #drawGameObjects() {
        if (this.canvasContext !== null) {
            const context = this.canvasContext;
            Object.keys(this.#_hasTableGamesObject).forEach((gameObjectName) => {
                const gameObject = this.#_hasTableGamesObject[gameObjectName];
                const shape = gameObject.getPoligoneShape();

                shape.forEach(({ x, y, value }) => {
                    const blockColor = typeof value === 'string'
                        ? value
                        : gameObject.DEFAULT_GAME_OBJECT_COLOR;
                    if (gameObject.IS_VISIBLE) {
                        if (value) {
                            if (context) {
                                context.fillStyle = blockColor;
                                context.fillRect(x, y, 1, 1);
                            }
                        }
                    } else {
                        if (context) {
                            context.fillStyle = this.options.bgColor || this.DEFAULT_SCENE_BG;
                            context?.fillRect(x, y, 1, 1);
                        }
                    }
                })
            })
        }
        return this;
    }

    /**  @returns {GameScene} */
    #drawSceneBoard() {
        const context = this.canvasContext;
        this.#_boardArray.forEach((row, y) => {
            row.forEach((valueRgb, x) => {
                if (valueRgb) {
                    const blockColor = typeof valueRgb === 'string'
                        ? valueRgb
                        : this.DEFAULT_BOARD_COLOR;

                    if (context) {
                        context.fillStyle = blockColor;
                        context.fillRect(x, y, 1, 1);
                    }
                }
            })
        })
        return this;
    }
}