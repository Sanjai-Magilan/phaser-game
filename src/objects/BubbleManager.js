import Phaser from "phaser";

/**
 * Manages bubble creation, spawning, and queue management.
 */
export default class BubbleManager {
  /**
   * @param {Phaser.Scene} scene - The Phaser scene.
   */
  constructor(scene) {
    this.scene = scene;
    this.bubbleQueue = [];
    this.maxBubbles = 5;
    this.spacing = 20;
    this.groupScale = 0.75;
    this.verticalOffset = -240;

    const centerX = this.scene.scale.width / 2;
    this.centerY = this.scene.scale.height / 2 + this.verticalOffset;
    this.centerX = centerX;

    this.initTextures();
  }

  /**
   * Initializes bubble textures using canvas.
   */
  initTextures() {
    const goldStyle = {
      size: 100,
      color: "rgba(255,180,50,1)",
      letterColor: "#fcdb80",
      rim: "rgba(255,200,100,0.3)",
    };
    const blueStyle = {
      size: 100,
      color: "rgba(100,120,160,1)",
      letterColor: "rgba(200,215,255,0.45)",
      rim: "rgba(150,180,255,0.15)",
    };

    const letters = ["F", "J"];
    letters.forEach((l) => {
      this.createBubbleTexture(
        `gold_${l}`,
        goldStyle.size,
        goldStyle.color,
        goldStyle.letterColor,
        l,
        goldStyle.rim,
      );
      this.createBubbleTexture(
        `blue_${l}`,
        blueStyle.size,
        blueStyle.color,
        blueStyle.letterColor,
        l,
        blueStyle.rim,
      );
    });
  }

  /**
   * Creates a canvas texture for a bubble.
   */
  createBubbleTexture(key, size, color, letterColor, letter, rimColor) {
    if (this.scene.textures.exists(key)) return;

    const padding = 20;
    const canvas = document.createElement("canvas");
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;
    const ctx = canvas.getContext("2d");

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = size / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Dark Glassy Body
    const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    body.addColorStop(0, "rgba(40, 45, 55, 0.95)");
    body.addColorStop(0.6, "rgba(25, 28, 35, 0.98)");
    body.addColorStop(1, "rgba(10, 12, 15, 1)");

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    // 2. Inner Bottom Glow
    const isGold = key.includes("gold");
    const glowColor = isGold
      ? "rgba(255, 180, 50, 0.35)"
      : "rgba(100, 130, 200, 0.15)";
    const glow = ctx.createRadialGradient(
      cx,
      cy + r * 0.5,
      0,
      cx,
      cy + r * 0.5,
      r * 0.8,
    );
    glow.addColorStop(0, glowColor);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // 3. Sharp Rim
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Letter
    ctx.fillStyle = letterColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.floor(r * 0.88)}px sans-serif`;
    ctx.fillText(letter, cx, cy);

    this.scene.textures.addCanvas(key, canvas);
  }

  /**
   * Calculates the X position for a bubble at a given index.
   * @param {number} index
   * @returns {number}
   */
  getBubbleX(index) {
    const bubbleSize = 150;

    const sunGodX = this.scene.sunGod.startX;
    const distanceFromSunGod = 280;

    const firstBubbleCenterX = sunGodX + distanceFromSunGod;

    return firstBubbleCenterX + index * 260;
  }

  /**
   * Spawns a single bubble.
   */
  spawnBubble(index, letter, animate = false) {
    const isFirst = index === 0;
    const key = `${isFirst ? "gold" : "blue"}_${letter}`;
    const x = this.getBubbleX(index);
    const img = this.scene.add.image(x, this.centerY, key).setDepth(10 - index);

    img.setScale(isFirst ? this.groupScale * 1.4 : this.groupScale);
    img.setAlpha(0);
    img.letter = letter;

    this.scene.tweens.add({
      targets: img,
      alpha: isFirst ? 1 : 0.55,
      duration: animate ? 400 : 0,
      delay: animate ? index * 80 : 0,
      ease: "Cubic.easeOut",
    });

    // floating animation
    const floatTween = this.scene.tweens.add({
      targets: img,
      y: this.centerY + (isFirst ? 16 : 10),
      duration: 2500 + index * 300 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    img.floatTween = floatTween;

    return img;
  }

  /**
   * Spawns a batch of bubbles.
   */
  spawnBatch(letter) {
    for (let i = 0; i < this.maxBubbles; i++) {
      this.bubbleQueue.push(this.spawnBubble(i, letter, true));
    }
  }

  /**
   * Pops the front bubble and handles the queue shift.
   * @param {Function} onBatchComplete - Callback when the batch is empty.
   */
  popAndShift(onBatchComplete) {
    if (this.bubbleQueue.length === 0) return;

    const popped = this.bubbleQueue.shift();
    if (popped.floatTween) popped.floatTween.stop();

    // Pop animation
    this.scene.tweens.add({
      targets: popped,
      scale: popped.scale * 1.8,
      alpha: 0,
      duration: 250,
      ease: "Back.easeOut",
      onComplete: () => popped.destroy(),
    });

    if (this.bubbleQueue.length > 0) {
      const nextActive = this.bubbleQueue[0];
      nextActive.setTexture(`gold_${nextActive.letter}`);
      nextActive.setDepth(10);

      // Update its scale and float tween to gold style
      this.scene.tweens.add({
        targets: nextActive,
        scale: this.groupScale * 1.4,
        alpha: 1,
        duration: 200,
        ease: "Sine.easeOut",
      });

      if (nextActive.floatTween) nextActive.floatTween.stop();
      nextActive.floatTween = this.scene.tweens.add({
        targets: nextActive,
        y: this.centerY + 16,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      if (onBatchComplete) onBatchComplete();
    }
  }

  /**
   * Gets the letter of the active bubble.
   * @returns {string|null}
   */
  getActiveLetter() {
    return this.bubbleQueue.length > 0 ? this.bubbleQueue[0].letter : null;
  }

  /**
   * Clears all bubbles in the queue.
   */
  clearAll() {
    this.bubbleQueue.forEach((bubble) => {
      if (bubble.floatTween) bubble.floatTween.stop();
      bubble.destroy();
    });
    this.bubbleQueue = [];
  }
}
