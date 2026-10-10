// Экран результатов гонки
import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/constants.js';
import { formatTime } from './RaceScene.js';

export default class ResultScene extends Phaser.Scene {
  constructor() { super(SCENES.RESULT); }

  create() {
    const { width, height } = this.scale;
    const result = this.registry.get('raceResult') || {
      timeMs: 0, laps: 3, place: 1, total: 4, carName: '—',
    };

    // фон
    const bg = this.add.graphics();
    bg.fillStyle(0x12161b).fillRect(0, 0, width, height);
    bg.fillStyle(0x1a2129);
    for (let i = 0; i < 10; i++) {
      bg.fillRect(0, i * 78, width, 39);
    }

    const win = result.place === 1;
    const headline = win ? 'ПОБЕДА!' : `ФИНИШ — ${result.place} МЕСТО`;

    this.add.text(width / 2, height * 0.22, headline, {
      fontFamily: 'monospace', fontSize: '72px', fontStyle: 'bold',
      color: win ? '#ffd54a' : COLORS.text,
    }).setOrigin(0.5).setShadow(0, 6, '#000', 14, true, true);

    this.add.text(width / 2, height * 0.22 + 62, `${result.carName} • ${result.laps} круга`, {
      fontFamily: 'monospace', fontSize: '22px', color: COLORS.textDim,
    }).setOrigin(0.5);

    // время
    this.add.text(width / 2, height * 0.46, formatTime(result.timeMs), {
      fontFamily: 'monospace', fontSize: '56px', color: COLORS.accent,
    }).setOrigin(0.5).setShadow(0, 4, '#000', 10, true, true);
    this.add.text(width / 2, height * 0.46 + 44, 'ОБЩЕЕ ВРЕМЯ ГОНКИ', {
      fontFamily: 'monospace', fontSize: '16px', color: COLORS.textDim,
    }).setOrigin(0.5);

    // кнопки
    const mkBtn = (label, x, cb) => {
      const t = this.add.text(x, height * 0.72, label, {
        fontFamily: 'monospace', fontSize: '26px', color: COLORS.text,
        backgroundColor: 'rgba(255,255,255,0.08)', padding: { x: 22, y: 12 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => t.setColor(COLORS.accent));
      t.on('pointerout', () => t.setColor(COLORS.text));
      t.on('pointerdown', cb);
      return t;
    };

    mkBtn('🔁 ЕЩЁ РАЗ', width / 2 - 190, () => this.scene.start(SCENES.RACE));
    mkBtn('🔧 ГАРАЖ', width / 2 + 190, () => this.scene.start(SCENES.GARAGE));

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start(SCENES.RACE));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start(SCENES.GARAGE));

    // конфетти при победе
    if (win) {
      const conf = this.add.graphics().setDepth(10);
      for (let i = 0; i < 80; i++) {
        const x = Phaser.Math.Between(0, width);
        const g = this.add.graphics();
        g.fillStyle([0xffd54a, 0x37b26b, 0xe0564f, 0x4aa3e0][i % 4])
          .fillRect(0, 0, 8, 12);
        g.setPosition(x, -20).setDepth(10);
        this.tweens.add({
          targets: g,
          y: height + 30,
          x: x + Phaser.Math.Between(-120, 120),
          angle: Phaser.Math.Between(-360, 360),
          duration: Phaser.Math.Between(1800, 3600),
          delay: Phaser.Math.Between(0, 1500),
          repeat: -1,
        });
      }
      void conf;
    }

    this.cameras.main.fadeIn(400);
  }
}
