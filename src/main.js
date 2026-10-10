// Точка входа: конфигурация Phaser и регистрация сцен
import Phaser from 'phaser';
import { GAME } from './config/constants.js';
import MenuScene from './scenes/MenuScene.js';
import GarageScene from './scenes/GarageScene.js';
import RaceScene from './scenes/RaceScene.js';
import ResultScene from './scenes/ResultScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: '#12161b',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [MenuScene, GarageScene, RaceScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export default new Phaser.Game(config);
