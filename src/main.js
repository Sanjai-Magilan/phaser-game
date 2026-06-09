import "./style.css";
import "./keyboard.css";
import Phaser from "phaser";
import { gameConfig } from "./config/gameConfig";


const initGame = () => {
  new Phaser.Game(gameConfig);
};

// Start the game
initGame();
