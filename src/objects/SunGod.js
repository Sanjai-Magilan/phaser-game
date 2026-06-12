import Phaser from "phaser";

/**
 * Represents the Sun God character.
 */
export default class SunGod {
  /**
   * @param {Phaser.Scene} scene - The Phaser scene.
   * @param {number} x - The initial X position.
   * @param {number} y - The initial Y position.
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.startX = x;
    this.startY = y;

    this.sprite = this.scene.add.sprite(-300, y, "sunGod");
    this.sprite.setScale(0.67);

    this.sprite.setDepth(1);

    this.sprite.play("sunGodIdle");
    this.hoverAmount = 10;
    this.hoverTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.startY - this.hoverAmount,
      duration: 1200,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  enterScreen() {
    this.hoverTween.pause();

    this.sprite.setPosition(-300, this.startY);

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.startX,
      duration: 600,
      ease: "Sine.easeOut",
      onComplete: () => {
        console.log("resume hover");
        this.hoverTween.resume();
      },
    });
  }
  exitScreen(callback) {
    this.hoverTween.pause();

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.scene.scale.width + 300,
      duration: 1000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (callback) callback();
      },
    });
  }
  /**
   * Handles the glide movement when a bubble is popped.
   */
  jump() {
    this.hoverTween.pause();
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 260,
      duration: 400,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.hoverTween.resume();
      },
    });
  }

  /**
   * Resets the Sun God to its starting position.
   */
  resetPosition() {
    this.sprite.setPosition(-300, this.startY);
  }

  /**
   * Returns the current X position of the Sun God.
   * @returns {number}
   */
  get x() {
    return this.sprite.x;
  }
}
