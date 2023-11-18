export class GameLauncher {
  #gameContainer;
  DEFAULT_SCREEN_WIDTH = 0;
  DEFAULT_SCREEN_HEIGHT = 0;

  constructor(gameContainer) {
    this.#gameContainer = gameContainer;
  }

  getTemplate(id) {
    const template = document.getElementById(id);
    const tempClone = template.content.cloneNode(true);
    return tempClone;
  }
  clearContent() {
    document.querySelector(this.#gameContainer).innerHTML = "";
    return this;
  }
  /** @return {HTMLElement} */
  getContainer() {
    return document.querySelector(this.#gameContainer);
  }
  get(selector) {
    return this.getContainer().querySelector(selector);
  }
  startScreen() {}
  gameOverScreen() {}
  startGame() {}
  launchGame() {}
}
