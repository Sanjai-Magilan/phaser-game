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

      // add padding so glow/haze isn't clipped by the texture bounds
      const padding = Math.round(size * 0.28);
      const canvas = document.createElement("canvas");
      canvas.width = size + padding * 2;
      canvas.height = size + padding * 2;
      const ctx = canvas.getContext("2d");

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = (size / 2) * 0.9;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // strong outer halo via radial gradient
      const halo = ctx.createRadialGradient(
        cx,
        cy,
        r * 0.45,
        cx,
        cy,
        r + padding * 0.18,
      );
      const base = (a) => color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, `rgba($1,$2,$3,${a})`);
      halo.addColorStop(0, base(0.72));
      halo.addColorStop(0.25, base(0.36));
      halo.addColorStop(0.6, base(0.12));
      halo.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, r + padding * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // main circle body
      const body = ctx.createRadialGradient(
        cx - r * 0.18,
        cy - r * 0.18,
        r * 0.02,
        cx,
        cy,
        r,
      );
      body.addColorStop(0, "rgba(255,255,255,0.28)");
      body.addColorStop(
        0.35,
        color.replace(
          /rgba\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
          "rgba($1,$2,$3,0.84)",
        ),
      );
      body.addColorStop(
        1,
        color.replace(
          /rgba\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
          "rgba($1,$2,$3,0.12)",
        ),
      );

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      // soft outer rim stroke
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = Math.max(2, size * 0.035);
      const rimAlpha = key.includes("gold") ? 0.48 : 0.30;
      ctx.globalAlpha = rimAlpha;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // warm accent glow
      const accentIsGold = key.includes("gold");
      const accentColor = accentIsGold
        ? "rgba(255,165,40,0.82)"
        : "rgba(255,165,40,0.18)";
      const accent = ctx.createRadialGradient(
        cx,
        cy + r * 0.32,
        2,
        cx,
        cy + r * 0.32,
        r * 0.46,
      );
      accent.addColorStop(0, accentColor);
      accent.addColorStop(0.4, accentColor.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, "rgba($1,$2,$3,0.12)"));
      accent.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.fillStyle = accent;
      ctx.arc(cx, cy + r * 0.32, r * 0.46, 0, Math.PI * 2);
      ctx.fill();

      // highlight
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.arc(cx - r * 0.34, cy - r * 0.40, r * 0.085, 0, Math.PI * 2);
      ctx.fill();

      // letter
      ctx.fillStyle = letterColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.floor(r * 0.76)}px sans-serif`;
      ctx.fillText(letter, cx, cy + r * 0.02);

      this.textures.addCanvas(key, canvas);
    };

    const goldStyle = {
      size: 240,
      color: "rgba(255,200,80,0.95)",
      letterColor: "#ffe6a6",
      rim: "rgba(255,180,60,0.6)",
    };
    const blueStyle = {
      size: 240,
      color: "rgba(120,140,190,0.45)",
      letterColor: "#c6d6ff",
      rim: "rgba(100,120,160,0.36)",
    };

    const letters = ["F", "J"];
    letters.forEach(l => {
      createBubbleTexture(`gold_${l}`, goldStyle.size, goldStyle.color, goldStyle.letterColor, l, goldStyle.rim);
      createBubbleTexture(`blue_${l}`, blueStyle.size, blueStyle.color, blueStyle.letterColor, l, blueStyle.rim);
    });

    const spacing = 50;
    const centerX = this.scale.width / 2;
    const verticalOffset = -90;
    const centerY = this.scale.height / 2 + verticalOffset;
    const groupScale = 0.86;

    this.bubbleQueue = [];
    this.maxBubbles = 5;
    this.currentLetter = "F";

    const getBubbleX = (index) => {
      const size = 240;
      const totalWidth = this.maxBubbles * size + (this.maxBubbles - 1) * spacing;
      const startX = centerX - totalWidth / 2;
      return startX + index * (size + spacing) + size / 2;
    };

    const spawnBubble = (index, letter, animate = false) => {
      const isFirst = index === 0;
      const key = `${isFirst ? 'gold' : 'blue'}_${letter}`;
      const x = getBubbleX(index);
      const img = this.add.image(x, centerY, key).setDepth(10 - index);
      img.setScale(isFirst ? groupScale * 1.15 : groupScale);
      img.setBlendMode(Phaser.BlendModes.SCREEN);
      img.setAlpha(0);
      img.letter = letter;

      this.tweens.add({
        targets: img,
        alpha: isFirst ? 1 : 0.85,
        duration: animate ? 400 : 0,
        delay: animate ? index * 80 : 0,
        ease: 'Cubic.easeOut'
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
      updateSelectionRing();
    };

    this.selectionRing = this.add.graphics().setDepth(12);
    
    const updateSelectionRing = () => {
      const activeImg = this.bubbleQueue[0];
      if (!activeImg) return;
      
      const ringRadius = Math.max(32, (activeImg.width * groupScale * 1.15) / 2 + 8);
      this.selectionRing.clear();
      this.selectionRing.lineStyle(Math.max(3, ringRadius * 0.06), 0xffffff, 0.9);
      this.selectionRing.strokeCircle(0, 0, ringRadius);
      this.selectionRing.setScale(0.9);
      this.selectionRing.setAlpha(1);
      this.selectionRing.x = activeImg.x;
      this.selectionRing.y = activeImg.y;

      if (this._ringTween) this._ringTween.stop();
      this._ringTween = this.tweens.add({
        targets: this.selectionRing,
        scale: 1.18,
        alpha: 0,
        duration: 400,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.selectionRing.clear();
          this.selectionRing.lineStyle(Math.max(2, ringRadius * 0.045), 0xffffff, 0.15);
          this.selectionRing.strokeCircle(0, 0, ringRadius);
          this.selectionRing.setAlpha(1);
          this.selectionRing.setScale(1);
        },
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
        ease: 'Back.easeOut',
        onComplete: () => popped.destroy()
      });

      // NO SHIFTING. Just highlight the next one in place.
      if (this.bubbleQueue.length > 0) {
        const nextActive = this.bubbleQueue[0];
        nextActive.setTexture(`gold_${nextActive.letter}`);
        nextActive.setDepth(10);
        
        // Update its scale and float tween to gold style
        this.tweens.add({
          targets: nextActive,
          scale: groupScale * 1.15,
          alpha: 1,
          duration: 200,
          ease: 'Sine.easeOut'
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

        updateSelectionRing();
      } else {
        // Set cleared, switch letter and spawn another 5
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
        popAndShift();
      }
    };

    keyF.on('down', () => onKeyPress("F"));
    keyJ.on('down', () => onKeyPress("J"));

    // simple beep using WebAudio
    this.playBeep = () => {
      try {
        if (!this._audioCtx) this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = this._audioCtx;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
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
      } catch (e) {
      }
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
