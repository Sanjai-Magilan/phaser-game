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

    this.sprite.setDepth(5);

    this.sprite.play("sunGodIdle");
  }

  enterScreen() {
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.startX,
      duration: 800,
      ease: "Sine.easeOut",
    });
  }

  exitScreen(callback) {
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.scene.scale.width + 300,
      duration: 800,
      ease: "Sine.easeIn",
      onComplete: () => {
        if (callback) callback();
      },
    });
  }
  /**
   * Handles the glide movement when a bubble is popped.
   */
  jump() {
    this.scene.tweens.killTweensOf(this.sprite);

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + 260,
      duration: 350,
      ease: "Sine.easeOut",
    });
  }

  /**
   * Resets the Sun God to its starting position.
   */
  resetPosition() {
  this.scene.tweens.killTweensOf(this.sprite);

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
