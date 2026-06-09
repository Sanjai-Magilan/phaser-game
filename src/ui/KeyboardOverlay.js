import { createContourKeyboard } from "./keyboard-contour";

/**
 * Wraps the keyboard contour overlay functionality.
 */
export default class KeyboardOverlay {
  constructor() {
    this.init();
  }

  /**
   * Initializes the keyboard overlay.
   */
  async init() {
    await createContourKeyboard();
  }
}
