import GameScene from "../scenes/GameScene";
import Phaser from "phaser";

export const gameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1920,
    height: 1080,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "app",
  scene: GameScene,
};
