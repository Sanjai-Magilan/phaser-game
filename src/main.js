import "./style.css";
import Phaser from "phaser";
import "./keyboard.css";
import { createContourKeyboard } from "./keyboard-contour";

class MainScene extends Phaser.Scene {
  preload() {
    this.load.image("bg", "/assets/BG%203.png");
    this.load.image("ground", "/assets/Ground%201.png");
    this.load.image("pillar", "/assets/Pillar%201.png");
  }

  layout(width, height) {
    this.bg.setDisplaySize(width, height);
    this.ground.setDisplaySize(width, height);
    this.pillar.setDisplaySize(width, height);
  }

  create() {
    const { width, height } = this.scale;

    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);

    this.ground = this.add.image(0, 0, "ground").setOrigin(0, 0).setDepth(1);

    this.pillar = this.add.image(0, 0, "pillar").setOrigin(0, 0).setDepth(2);

    this.layout(width, height);

    this.scale.on("resize", (gameSize) => {
      this.layout(gameSize.width, gameSize.height);
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  parent: "app",
  // ensure Phaser attaches to the app container in index.html
  scene: MainScene,
});

// Create the contour-traced keyboard overlay (vector outlines from keyboard.png)
createContourKeyboard();
