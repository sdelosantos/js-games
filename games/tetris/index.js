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
 * Start Game
 * @param {{startup:(callback: (scene: GameScene)=>void)=>void}} currentScene } 
 */
const startGame = currentScene => currentScene.startup((scene) => {
    /** @type {TetrisGameObject} */
    const player = scene.getGameObject(PLAYER_GAME_OBJECT_NAME);

    const updateScore = ({totalScore})=>{
        const scoreSpan = document.querySelector('.score-counter .counter');
        scoreSpan.textContent = totalScore;
    }
    const solidifyItem = ()=>{
        scene.solidifyGameObjectToBoard(player).removeCompletedRows();
        player.reset();
    }

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

    scene.on('onUpdateScene', () => player.dropPiece(10))
    scene.on('customEvent', ({ event, data }) => {
        if (event === 'ScoreUpdated') 
            updateScore(data)
    })
    scene.on('onObjectCollision', (collision) => {
        if (collision.side.includes('BOTTOM')) 
            solidifyItem()
    });

})


export default {
    blank: () => {
        const scene = engine.scene('BLANK_SCREEN');
        scene.startup(() => { });
    },
    start: () => {
        const scene = engine.scene('TETRIS_GAME');
        startGame(scene);
    }
}