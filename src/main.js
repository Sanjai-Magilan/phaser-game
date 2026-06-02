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

  create() {
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);

    this.ground = this.add.image(0, 0, "ground").setOrigin(0, 0).setDepth(1);

    this.pillar = this.add.image(0, 0, "pillar").setOrigin(0, 0).setDepth(2);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1920,
    height: 1080,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "app",
  // ensure Phaser attaches to the app container in index.html
  scene: MainScene,
});

// Create the contour-traced keyboard overlay (vector outlines from keyboard.png)
createContourKeyboard();
