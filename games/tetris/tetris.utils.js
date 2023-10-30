// tetris piece
const piece1 = [[1, 1], [1, 1]];
const piece2 = [[0, 1, 0], [1, 1, 1]];
const piece3 = [[1, 0, 0], [1, 1, 1]];
const piece4 = [[1, 1, 1]];
const piece5 = [[1], [1], [1]];

export const BLOCK_SIZE = 20;
export const BOAD_WIDTH = 15;
export const BOAD_HEIGHT = 30;
export const PLAYER_GAME_OBJECT_NAME = 'PIECE_PLAYER'
export const ALL_TETRIS_PIECES = [piece1, piece2, piece3, piece4, piece5]
export const MoveDirection = {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    RIGHT: 'ArrowRight',
    LEFT: 'ArrowLeft',
}

const getRandomInt = function (start, end) {
    return Math.floor(Math.random() * end) + start;
}

export const getPosition = () => ({
    y: 2,
    x: getRandomInt(0, BOAD_WIDTH - 1)
});

export const getShape = () => (ALL_TETRIS_PIECES[getRandomInt(0, ALL_TETRIS_PIECES.length - 1)]);

export const initPlayerSetting = () => ({
    position: getPosition(),
    shape: getShape()
});

