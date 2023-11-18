import { CollisionTypes, Directions } from "../../engine/engine.utils";
import { MoveDirection, PLAYER_GAME_OBJECT_NAME } from "./tetris.utils";

export default function TetrisGame(scene) {
  const player = scene.getGameObject(PLAYER_GAME_OBJECT_NAME);
  const levelSpan = document.querySelector("#level");
  const scoreSpan = document.querySelector("#score");

  let currentLevel = 1;
  let pieceDropSpeed = 3;

  const nextLevelUp = () => {
    currentLevel += 1;
    pieceDropSpeed += 1;
    levelSpan.textContent = currentLevel;
  };

  const updateScore = ({ totalScore }) => {
    scoreSpan.textContent = totalScore;
    if (scene.canLevelUp()) {
      nextLevelUp();
    }
  };

  const solidifyItem = () => {
    scene.solidifyPiece(player).checkGameOver().collectRowsCompleted();
    player.reset();
  };

  const movePiece = function (key) {
    if (player) {
      switch (key) {
        case MoveDirection.UP:
          player.rotate();
          break;
        case MoveDirection.DOWN:
          player.movePiece("bottom");
          break;
        case MoveDirection.RIGHT:
          player.movePiece("right");
          break;
        case MoveDirection.LEFT:
          player.movePiece("left");
          break;
      }
    }
  };

  scene.on("updatescene", () => player.dropPiece(pieceDropSpeed));
  scene.on("scoreupdated", updateScore);
  scene.on("collisiondetected", (collisiones) => {
    if (
      collisiones.some(
        (col) =>
          (col.side && col.side.includes(Directions.BOTTOM)) ||
          col.collisionType == CollisionTypes.ALLOCATED_BOARD_SPACE
      )
    )
      solidifyItem();
  });

  document.addEventListener("keydown", (e) => movePiece(e.key));
  levelSpan.textContent = currentLevel;
}
