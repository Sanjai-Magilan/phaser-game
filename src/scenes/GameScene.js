import Phaser from "phaser";
import SunGod from "../objects/SunGod";
import BubbleManager from "../objects/BubbleManager";
import AudioManager from "../systems/AudioManager";
import KeyboardOverlay from "../ui/KeyboardOverlay";

// Asset imports
import bgImg from "../assets/images/bg.png";
import groundImg from "../assets/images/ground.png";
import pillarImg from "../assets/images/pillar.png";
import sunGodVideo from "../assets/videos/sun_god.webm";
import sunGodSheet from "../assets/images/sun_god_sheet.png";

/**
 * Main game scene that orchestrates gameplay.
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.currentLetter = "F";
  }

  /**
   * Loads game assets.
   */
  preload() {
    this.load.image("bg", bgImg);
    this.load.image("ground", groundImg);
    this.load.image("pillar", pillarImg);
    this.load.video("sunGod", sunGodVideo);
    this.load.spritesheet("sunGod", sunGodSheet, {
      frameWidth: 272,
      frameHeight: 328,
    });
  }

  /**
   * Initializes game objects and systems.
   */
  create() {
    // 1. Systems
    this.audio = new AudioManager();
    this.keyboardOverlay = new KeyboardOverlay();

    // 2. Background Elements
    this.add.image(0, 0, "bg").setOrigin(0, 0).setDepth(0);
    this.add.image(0, 0, "ground").setOrigin(0, 0).setDepth(1);
    this.add.image(0, 0, "pillar").setOrigin(0, 0).setDepth(2);

    // 3. Game Objects
    const sunGodStartX = this.scale.width / 2 - 550;
    const sunGodStartY = this.scale.height / 2 - 100;
    this.sunGod = new SunGod(this, sunGodStartX, sunGodStartY);

    this.bubbleManager = new BubbleManager(this);
    this.bubbleManager.spawnBatch(this.currentLetter);
    if (!this.anims.exists("sunGodIdle")) {
      this.anims.create({
        key: "sunGodIdle",
        frames: this.anims.generateFrameNumbers("sunGod", {
          start: 0,
          end: 80,
        }),
        frameRate: 30,
        repeat: -1,
      });
    }

    // 4. Input Wiring
    this.setupInput();
  }

  /**
   * Sets up keyboard input listeners.
   */
  setupInput() {
    const keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    const keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

    keyF.on("down", () => this.handleKeyPress("F"));
    keyJ.on("down", () => this.handleKeyPress("J"));
  }

  /**
   * Handles a key press and checks against the active bubble.
   * @param {string} key
   */
  handleKeyPress(key) {
    const activeLetter = this.bubbleManager.getActiveLetter();

    if (activeLetter && activeLetter === key) {
      this.audio.playBeep();
      this.sunGod.jump();

      this.bubbleManager.popAndShift(() => {
        // Callback when a batch is complete
        this.sunGod.resetPosition();
        this.currentLetter = this.currentLetter === "F" ? "J" : "F";
        this.bubbleManager.spawnBatch(this.currentLetter);
      });
    }
  }
}
