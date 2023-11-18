import { GameLauncher } from "../util";
import Engine from "../../engine/engine";
import TetrisGame from "./index";
import { TetrisGameScene } from "./tetris.scene";
const tetrisAudioTheme = new Audio(
  "https://ia902905.us.archive.org/11/items/TetrisThemeMusic/Tetris.mp3"
);
const gameContentainer = "#app";

class TetrisLaucher extends GameLauncher {
  constructor(containerSelector, screenWidth, screenHeight) {
    super(containerSelector);
    this.DEFAULT_SCREEN_HEIGHT = screenHeight;
    this.DEFAULT_SCREEN_WIDTH = screenWidth;
  }

  startScreen() {
    const container = this.clearContent().getContainer();
    const template = this.getTemplate("tetris-start-screen");
    container.appendChild(template);
  }
  gameOverScreen() {
    const container = this.clearContent().getContainer();
    const template = this.getTemplate("tetris-gameover-screen");
    container.appendChild(template);
    this.get('[role="button"').addEventListener("click", () => {
      this.start();
    });
  }
  playBackgroundAudio() {
    tetrisAudioTheme.play();
    tetrisAudioTheme.loop = true;
    tetrisAudioTheme.volume = 0.5;

    return this;
  }
  start() {
    this.playBackgroundAudio().drawGameCanvasContainer().startGame();
    return this;
  }
  drawGameCanvasContainer() {
    const container = this.clearContent().getContainer();
    const template = this.getTemplate("tetris-game");
    container.appendChild(template);
    return this;
  }
  launchGame() {
    const container = this.getContainer();
    container.style.width = `${this.DEFAULT_SCREEN_WIDTH}px`;
    container.style.height = `${this.DEFAULT_SCREEN_HEIGHT}px`;

    this.clearContent().startScreen();
    this.get('[role="button"').addEventListener("click", () => {
      this.start();
    });
  }
  startGame() {
    const SCENE_NAME = "TETRIS_GAME";
    const tetris = Engine.init("#tetris-game-canvas")
      .addScene(SCENE_NAME, TetrisGameScene())
      .scene(SCENE_NAME);
    tetris.startup(TetrisGame);
    tetris.instance.on("gameover", () => this.gameOverScreen());
  }
}

const w = 600;
const h = 612;

export default new TetrisLaucher(gameContentainer, w, h);
