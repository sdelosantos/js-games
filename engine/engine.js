// @ts-check
/**
 * @typedef {import('./scene').GameScene} GameScene
 */

/**
 * Class to manage objects and scenes of the game and the interaction between them
 */
class PixelEngine {
    /** @type {HTMLCanvasElement} */
    #currentCanvas;
    /** @type {{[ky: string]: GameScene}} */
    #scenesPool = {};

    constructor(appContainerSelector) {
        const canvas = document.createElement('canvas');
        const appContainer = document.querySelector(appContainerSelector);
        appContainer?.append(canvas);
        this.#currentCanvas = canvas;
    }

    /**
     * Register a scene instance
     * @param {string} name - set scene key name
     * @param {GameScene} scene - set scene object
     * @returns {PixelEngine} - return Pixel Engine
     */
    addScene(name, scene) {
        this.#scenesPool[name] = scene;
        return this;
    }

    /**
     * Get startup scene  
     * @param {string} name - name of registed scene
     * @return {{startup:(callback:(scene: GameScene)=>void)=>void}} 
    */
    scene(name) {
        return {
            startup: (callback) => this.#startup(this.#scenesPool[name], callback)
        }
    }

    /**
     * @param {GameScene} selectedScene 
     * @param {(scene: GameScene)=>void} callback 
     */
    #startup(selectedScene, callback = function () { }) {
        if (selectedScene) {
            selectedScene.build(this.#currentCanvas);
            const initDaemon = () => {
                selectedScene.render();
                selectedScene.emit('onUpdateScene', selectedScene);
                !selectedScene.options.disableRunner && window.requestAnimationFrame(initDaemon);
            }
            callback(selectedScene);
            initDaemon();
            selectedScene.emit('onRenderScene', this);
        }
    }

}

export default {
    init: function getEngine(appRender) {
        return new PixelEngine(appRender);
    }
}