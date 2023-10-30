/**
 * @typedef {import('./tetris.player').TetrisGameObjectType} TetrisGameObject
 */

import Engine from '../../engine/engine';
import { GameScene } from '../../engine/scene';
import { BankScreen, TetrisGameScene } from './tetris.scene';
import { MoveDirection, PLAYER_GAME_OBJECT_NAME } from './tetris.utils';

const engine = Engine.init('#app')
    .addScene('TETRIS_GAME', TetrisGameScene)
    .addScene('BLANK_SCREEN', BankScreen);

/**
 * @param {{startup:(callback: (scene: GameScene)=>void)=>void}} currentScene } currentScene 
 */
const startGame = currentScene => currentScene.startup((scene) => {
    /** @type {TetrisGameObject} */
    const player = scene.getGameObject(PLAYER_GAME_OBJECT_NAME);

    scene.on('onUpdateScene', () => player.dropPiece(5))
    scene.on('customEvent', ({ event, data }) => {
        if (event === 'ScoreUpdated') {
            const { totalScore } = data;
            const scoreSpan = document.querySelector('.score-counter .counter');
            scoreSpan.textContent = totalScore;
        }
    })

    scene.on('onObjectCollision', (collision) => {
        if (collision.side.includes('BOTTOM')) {
            scene.getSolidifyGameObject(player).removeCompletedRows();
            player.reset();
        }
    });


    document.addEventListener('keydown', (e) => {
        if (player) {
            switch (e.key) {
                case MoveDirection.UP:
                    player.rotatePiece()
                    break;
                case MoveDirection.DOWN:
                    player.movePiece('bottom')
                    break;
                case MoveDirection.RIGHT:
                    player.movePiece('right')
                    break;
                case MoveDirection.LEFT:
                    player.movePiece('left')
                    break;
            }
        }
    });

})


export default {
    blank: () => {
        const scene = engine.selectScene('BLANK_SCREEN');
        scene.startup(() => { });
    },
    start: () => {
        const scene = engine.selectScene('TETRIS_GAME');
        startGame(scene);
    }
}