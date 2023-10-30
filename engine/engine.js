/**
 * @typedef {import('./scene').GameScene} GameScene
 */

const SCENES_POOL = {}

// @ts-check
class PixelEngine {
    /** @type {HTMLCanvasElement} */
    #_currentCanvas;
    /** @type {GameScene} */
    #_selectedScene;

    constructor(appContainerSelector) {
        const canvas = document.createElement('canvas');
        const appContainer = document.querySelector(appContainerSelector);
        appContainer?.append(canvas);
        this.#_currentCanvas = canvas;
    }

    /**
     * @param {string} name 
     * @param {GameScene} scene 
     * @returns {PixelEngine}
     */
    addScene(name, scene) {
        SCENES_POOL[name] = scene;
        return this;
    }

    selectScene(name) {
        return {
            /**
             ** @param {(scene: GameScene)=>void} callback 
             * @returns 
             */
            startup: (callback) => this.#startup(SCENES_POOL[name], callback)
        }
    }

    /**
     * @param {GameScene} selectedScene 
     * @param {(scene: GameScene)=>void} callback 
     */
    #startup(selectedScene, callback = function () { }) {
        if (selectedScene) {
            selectedScene.build(this.#_currentCanvas);
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

/**
 * @param {string} appRender 
 * @returns 
 */
export default {
    init: function getEngine(appRender) {
        return new PixelEngine(appRender);
    }
}