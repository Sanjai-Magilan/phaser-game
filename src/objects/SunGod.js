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

    this.video = this.scene.add.video(x, y, "sunGod");
    this.video.setDepth(5);
    this.video.setScale(0.2);
    this.video.play(true);
  }

  /**
   * Handles the glide movement when a bubble is popped.
   */
  jump() {
    this.scene.tweens.killTweensOf(this.video);

    this.scene.tweens.add({
      targets: this.video,
      x: this.video.x + 180,
      duration: 180,
      ease: "Sine.easeOut",
    });
  }

  /**
   * Resets the Sun God to its starting position.
   */
  resetPosition() {
    this.scene.tweens.killTweensOf(this.video);
    this.video.setPosition(this.startX, this.startY);
  }

  /**
   * Returns the current X position of the Sun God.
   * @returns {number}
   */
  get x() {
    return this.video.x;
  }
}
