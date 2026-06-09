/**
 * Manages the game's audio effects.
 */
export default class AudioManager {
  constructor() {
    this.audioCtx = null;
  }

  /**
   * Plays a simple beep sound using WebAudio API.
   */
  playBeep() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = this.audioCtx;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      
      gainNode.gain.value = 0.0001;
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      
      oscillator.start(now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      oscillator.stop(now + 0.17);
    } catch (error) {
      console.warn("Audio context failed to start:", error);
    }
  }
}
