import "./style.css";
import TetrisLauncher from "./games/tetris/tetris.launcher";

const LIST_GAMES = {
  TETRIS: TetrisLauncher,
};
LIST_GAMES.TETRIS.launchGame();
