import "./style.css";
import Phaser from "phaser";
import "./keyboard.css";
import { createContourKeyboard } from "./keyboard-contour";
import sunGodVideo from "./assets/sun_god.webm";

import bgImg from "./assets/BG 3.png";
import groundImg from "./assets/Ground 1.png";
import pillarImg from "./assets/Pillar 1.png";

class MainScene extends Phaser.Scene {
  preload() {
    this.load.image("bg", bgImg);
    this.load.image("ground", groundImg);
    this.load.image("pillar", pillarImg);
    this.load.video("sunGod", sunGodVideo);
  }

  create() {
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);

    this.ground = this.add.image(0, 0, "ground").setOrigin(0, 0).setDepth(1);

    this.pillar = this.add.image(0, 0, "pillar").setOrigin(0, 0).setDepth(2);

    const sunGodStartX = this.scale.width / 2 - 550;
    const sunGodStartY = this.scale.height / 2 - 100;

    this.sunGodStartX = sunGodStartX;
    this.sunGodStartY = sunGodStartY;

    this.sunGod = this.add.video(sunGodStartX, sunGodStartY, "sunGod");

    this.sunGod.setDepth(5);
    this.sunGod.setScale(0.2);
    this.sunGod.play(true);

    // -- Bubble generator: creates canvas textures that look like glowing bubbles
    this.bubbleTextures = new Map();
    const createBubbleTexture = (
      key,
      size,
      color,
      letterColor,
      letter,
      rimColor,
    ) => {
      if (this.textures.exists(key)) return;

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

      this.textures.addCanvas(key, canvas);
    };

    const goldStyle = {
      size: 150,
      color: "rgba(255,180,50,1)",
      letterColor: "#fcdb80",
      rim: "rgba(255,200,100,0.3)",
    };
    const blueStyle = {
      size: 150,
      color: "rgba(100,120,160,1)",
      letterColor: "rgba(200,215,255,0.45)",
      rim: "rgba(150,180,255,0.15)",
    };

    const letters = ["F", "J"];
    letters.forEach((l) => {
      createBubbleTexture(
        `gold_${l}`,
        goldStyle.size,
        goldStyle.color,
        goldStyle.letterColor,
        l,
        goldStyle.rim,
      );
      createBubbleTexture(
        `blue_${l}`,
        blueStyle.size,
        blueStyle.color,
        blueStyle.letterColor,
        l,
        blueStyle.rim,
      );
    });

    const spacing = 35;
    const centerX = this.scale.width / 2;
    const verticalOffset = -130;
    const centerY = this.scale.height / 2 + verticalOffset;
    const groupScale = 0.85;

    this.bubbleQueue = [];
    this.maxBubbles = 5;
    this.currentLetter = "F";

    const getBubbleX = (index) => {
      const size = 150;
      const totalWidth =
        this.maxBubbles * size + (this.maxBubbles - 1) * spacing;
      const startX = centerX - totalWidth / 2;
      return startX + index * (size + spacing) + size / 2;
    };

    const spawnBubble = (index, letter, animate = false) => {
      const isFirst = index === 0;
      const key = `${isFirst ? "gold" : "blue"}_${letter}`;
      const x = getBubbleX(index);
      const img = this.add.image(x, centerY, key).setDepth(10 - index);
      img.setScale(isFirst ? groupScale * 1.4 : groupScale);
      img.setAlpha(0);
      img.letter = letter;

      this.tweens.add({
        targets: img,
        alpha: isFirst ? 1 : 0.55,
        duration: animate ? 400 : 0,
        delay: animate ? index * 80 : 0,
        ease: "Cubic.easeOut",
      });

      // floating animation
      const floatTween = this.tweens.add({
        targets: img,
        y: centerY + (isFirst ? 16 : 10),
        duration: 2500 + index * 300 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      img.floatTween = floatTween;

      return img;
    };

    const spawnBatch = () => {
      for (let i = 0; i < this.maxBubbles; i++) {
        this.bubbleQueue.push(spawnBubble(i, this.currentLetter, true));
      }
    };

    const jumpSunGod = () => {
      this.tweens.killTweensOf(this.sunGod);

      this.tweens.add({
        targets: this.sunGod,
        x: this.sunGod.x + 180,
        duration: 180,
        ease: "Sine.easeOut",
      });
    };

    const popAndShift = () => {
      const popped = this.bubbleQueue.shift();
      if (popped.floatTween) popped.floatTween.stop();

      // Pop animation
      this.tweens.add({
        targets: popped,
        scale: popped.scale * 1.8,
        alpha: 0,
        duration: 250,
        ease: "Back.easeOut",
        onComplete: () => popped.destroy(),
      });

      // NO SHIFTING. Just highlight the next one in place.
      if (this.bubbleQueue.length > 0) {
        const nextActive = this.bubbleQueue[0];
        nextActive.setTexture(`gold_${nextActive.letter}`);
        nextActive.setDepth(10);

        // Update its scale and float tween to gold style
        this.tweens.add({
          targets: nextActive,
          scale: groupScale * 1.4,
          alpha: 1,
          duration: 200,
          ease: "Sine.easeOut",
        });

        if (nextActive.floatTween) nextActive.floatTween.stop();
        nextActive.floatTween = this.tweens.add({
          targets: nextActive,
          y: centerY + 16,
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      } else {
        this.tweens.killTweensOf(this.sunGod);

        this.sunGod.setPosition(this.sunGodStartX, this.sunGodStartY);

        this.currentLetter = this.currentLetter === "F" ? "J" : "F";
        spawnBatch();
      }
    };

    spawnBatch();

    const keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    const keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

    const onKeyPress = (key) => {
      const active = this.bubbleQueue[0];
      if (active && active.letter === key) {
        this.playBeep();
        jumpSunGod();
        popAndShift();
      }
    };

    keyF.on("down", () => onKeyPress("F"));
    keyJ.on("down", () => onKeyPress("J"));

    // simple beep using WebAudio
    this.playBeep = () => {
      try {
        if (!this._audioCtx)
          this._audioCtx = new (
            window.AudioContext || window.webkitAudioContext
          )();
        const ctx = this._audioCtx;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
        o.start(now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        o.stop(now + 0.17);
      } catch (e) {}
    };
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
