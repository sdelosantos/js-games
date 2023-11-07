//@ts-check

/**
 * @typedef {import('./gameObject').GameObjectElementType} GameObjectType
 * @typedef {import('./gameObject').GameObjectPosition} GameObjectPosition
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
   * Add event listener
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
   * Dispatch a custome events
   * @param {EventType} event
   * @param {any} data
   */
  emit(event, data) {
    const listeners = this.#_eventCallbackPool[event];
    if (listeners) {
      listeners.forEach((callback) => {
        callback(data);
      });
    }
  }
}
export class GameScene extends SceneEventHandle {
  get DEFAULT_BOARD_COLOR() {
    return "#ffef45";
  }
  get DEFAULT_SCENE_BG() {
    return "#000";
  }

  /** @type {{[k:string]: GameObjectType}} */
  #gameObjectPool;
  /** @type {number} */
  #blockSize;
  /** @type {GameSceneOptions} */
  options;
  /** @type {Array<Array<number | string>>} */
  boardArray;
  /** @type {number} */
  boardWidth;
  /** @type {number} */
  boardHeight;
  /** @type {number} */
  canvasWidth;
  /** @type {number} */
  canvasHeight;
  /** @type {CanvasRenderingContext2D | null}} */
  canvasContext = null;

  /**
   * @param {GameSceneOptions} options
   */
  constructor(options) {
    super();
    this.options = options;
    this.boardArray = [];
    this.#gameObjectPool = {};
    this.#blockSize = 20;

    this.setBoardSize(options.width, options.height);
  }

  /**
   * @param {number} blockSize
   * @returns {GameScene}
   */
  setBoardBlockSize(blockSize) {
    this.#blockSize = blockSize;
    return this;
  }

  /**  @returns {Array<Array<number | string>>} */
  getBoardArray() {
    return this.boardArray;
  }

  /**
   * Define canvas element size and board array size
   * @param {number} width - set width size in block units
   * @param {number} height - set height size in block units
   * @returns {GameScene}
   */
  setBoardSize(width, height) {
    this.boardWidth = width;
    this.boardHeight = height;
    this.canvasWidth = width * this.#blockSize;
    this.canvasHeight = height * this.#blockSize;

    this.boardArray = new Array(height).fill(new Array(width));
    return this;
  }

  /**
   * Register a Game Object inside the scene
   * @param {GameObjectType} gameObject
   * @returns {GameScene}
   */
  addGameObject(gameObject) {
    gameObject.$injectScene(this);
    if (gameObject.name) this.#gameObjectPool[gameObject.name] = gameObject;
    else throw "much be set a name to the game object";
    return this;
  }

  /**
   * Remove a Game object of the scene
   * @param {string} name - game object key name
   * @returns {GameScene} - game object instance
   */
  removeGameObject(name) {
    delete this.#gameObjectPool[name];
    return this;
  }

  /**
   * Get a game object by name
   * @param {string} name
   * @returns {GameObjectType}
   */
  getGameObject(name) {
    return this.#gameObjectPool[name];
  }

  /**
   * Get all registered game objects
   * @returns {GameObjectType[]}
   */
  getAllGameObject() {
    return Object.entries(this.#gameObjectPool).map(
      ([, gameObject]) => gameObject
    );
  }
  /**
   * Create the canvas context based on the setting provided
   * @param {HTMLCanvasElement} canvas
   * @returns {GameScene}
   */
  build(canvas) {
    this.canvasContext = this.#getContent(canvas);
    return this;
  }

  /**
   * Draw on  the canvas the scene with all game objects registered
   */
  render() {
    this.#cleanCanvas().#drawSceneBoard().#drawGameObjects();
  }

  /**
   * Build and return the scene's canvas context
   * @param {HTMLCanvasElement} canvas - canvas elements to get the context
   * @returns {CanvasRenderingContext2D | null}
   */
  #getContent(canvas) {
    const context = canvas.getContext("2d");
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    if (context) {
      context.fillStyle = this.options.bgColor || this.DEFAULT_SCENE_BG;
      context?.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      context.scale(this.#blockSize, this.#blockSize);
    }

    return context;
  }

  /**
   * Clean all rendered elements on the canvas
   * @returns {GameScene}
   */
  #cleanCanvas() {
    const context = this.canvasContext;
    if (context) {
      context.fillStyle = this.options.bgColor || this.DEFAULT_SCENE_BG;
      context?.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    return this;
  }

  /**
   * Draw the registered game object on the canvas
   * @returns {GameScene}
   */
  #drawGameObjects() {
    if (this.canvasContext) {
      const context = this.canvasContext;
      Object.entries(this.#gameObjectPool).forEach(([, gameObject]) => {
        const shape = gameObject.getPoligoneShape();

        shape.forEach(({ x, y, value }) => {
          const blockColor =
            typeof value === "string"
              ? value
              : gameObject.DEFAULT_GAME_OBJECT_COLOR;
          if (gameObject.IS_VISIBLE) {
            if (value) {
              if (context) {
                context.fillStyle = blockColor;
                context.fillRect(x, y, 1, 1);
              }
            }
          }
        });
      });
    }
    return this;
  }

  /**
   * Draw the board on the canvas
   * @returns {GameScene}
   */
  #drawSceneBoard() {
    const context = this.canvasContext;
    this.boardArray.forEach((row, y) => {
      row.forEach((valueRgb, x) => {
        if (valueRgb) {
          const blockColor =
            typeof valueRgb === "string" ? valueRgb : this.DEFAULT_BOARD_COLOR;

          if (context) {
            context.fillStyle = blockColor;
            context.fillRect(x, y, 1, 1);
          }
        }
      });
    });
    return this;
  }
}
