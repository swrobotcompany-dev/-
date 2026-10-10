// Стартовое меню
import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/constants.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super(SCENES.MENU); }

  create() {
    const { width, height } = this.scale;

    // фон: тёмный градиент-полосами
    const bg = this.add.graphics();
    for (let i = 0; i < 24; i++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        new Phaser.Display.Color(18, 22, 28),
        new Phaser.Display.Color(42, 52, 66),
        24, i,
      );
      bg.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      bg.fillRect(0, (height / 24) * i, width, height / 24 + 1);
    }

    // «дорожные» полосы на фоне
    const stripes = this.add.graphics().setAlpha(0.08);
    stripes.fillStyle(0xffffff);
    for (let i = 0; i < 8; i++) {
      stripes.fillRoundedRect(-100 + i * 190, height - 120, 120, 10, 5);
    }

    this.add.text(width / 2, height * 0.3, 'TOP RACER', {
      fontFamily: 'monospace',
      fontSize: '84px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0.5).setShadow(0, 6, '#000000', 12, true, true);

    this.add.text(width / 2, height * 0.3 + 70, 'Гараж • Выбор машины • Гонки вид сверху', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: COLORS.textDim,
    }).setOrigin(0.5);

    const startText = this.add.text(width / 2, height * 0.62, '▶  НАЧАТЬ — зайти в гараж', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: COLORS.accent,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: startText, alpha: { from: 1, to: 0.35 }, duration: 700, yoyo: true, repeat: -1,
    });

    const go = () => this.scene.start(SCENES.GARAGE);
    startText.on('pointerdown', go);
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);

    this.add.text(width / 2, height - 40, 'Управление: WASD / стрелки', {
      fontFamily: 'monospace', fontSize: '16px', color: COLORS.textDim,
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400);
  }
}
