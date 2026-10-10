// Гараж: выбор машины, фон с запчастями, тест-драйв прямо в гараже.
import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/constants.js';
import { CARS } from '../config/carCatalog.js';
import { buildCarTexture } from '../utils/carSpriteFactory.js';
import { buildGarageBackdrop } from '../objects/garageDecor.js';
import PlayerCar from '../entities/PlayerCar.js';
import { saveSelectedCar, getSelectedCar } from '../utils/gameState.js';

export default class GarageScene extends Phaser.Scene {
  constructor() { super(SCENES.GARAGE); }

  create() {
    const { width, height } = this.scale;
    this.width = width;
    this.height = height;

    // ---- фон гаража с запчастями ----
    buildGarageBackdrop(this, width, height);

    // ---- данные выбора ----
    this.selectedIndex = Math.max(0, CARS.findIndex((c) => c.id === getSelectedCar().id));
    this.previewSprite = null;
    this.testCar = null; // активный тест-драйв

    // ---- панель статистики (справа) ----
    this.statPanel = this.add.graphics().setDepth(20);
    this.statTexts = this.add.container(width - 230, 120).setDepth(21);
    this.nameText = this.add.text(width / 2, height * 0.42, '', {
      fontFamily: 'monospace', fontSize: '34px', fontStyle: 'bold', color: COLORS.text,
    }).setOrigin(0.5).setDepth(21).setShadow(0, 3, '#000', 8, true, true);
    this.tagText = this.add.text(width / 2, height * 0.42 + 36, '', {
      fontFamily: 'monospace', fontSize: '17px', color: COLORS.textDim,
    }).setOrigin(0.5).setDepth(21);

    // ---- подсказки снизу ----
    this.add.text(width / 2, height - 66, '◀ ▶ — выбрать машину        ENTER — на трассу        T — тест-драйв в гараже', {
      fontFamily: 'monospace', fontSize: '18px', color: COLORS.text,
    }).setOrigin(0.5).setDepth(21).setShadow(0, 2, '#000', 6, true, true);

    this.add.text(20, 14, 'ГАРАЖ', {
      fontFamily: 'monospace', fontSize: '26px', fontStyle: 'bold', color: COLORS.accent,
    }).setDepth(21);

    // ---- стрелки-кнопки ----
    const arrowL = this.add.text(width / 2 - 300, height * 0.62, '◀', {
      fontFamily: 'monospace', fontSize: '44px', color: COLORS.accent,
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
    const arrowR = this.add.text(width / 2 + 300, height * 0.62, '▶', {
      fontFamily: 'monospace', fontSize: '44px', color: COLORS.accent,
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
    arrowL.on('pointerdown', () => this.switchCar(-1));
    arrowR.on('pointerdown', () => this.switchCar(1));

    // ---- клавиатура ----
    this.input.keyboard.on('keydown-LEFT', () => this.switchCar(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.switchCar(1));
    this.input.keyboard.on('keydown-A', () => this.switchCar(-1));
    this.input.keyboard.on('keydown-D', () => this.switchCar(1));
    this.input.keyboard.on('keydown-ENTER', () => this.startRace());
    this.input.keyboard.on('keydown-T', () => this.toggleTestDrive());
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.testCar) this.toggleTestDrive();
      else this.scene.start(SCENES.MENU);
    });

    this.showCar(this.selectedIndex, true);

    // пометить весь уже созданный UI гаража (кроме фона-глубины и превью) —
    // чтобы скрывать его во время тест-драйва
    const tagged = this.children.list.filter(
      (ch) => ch.depth >= 15 && !ch.__garageUI && ch !== this.previewSprite,
    );
    tagged.forEach((ch) => { ch.__garageUI = true; });

    this.cameras.main.fadeIn(350);
  }

  switchCar(dir) {
    if (this.testCar) return; // во время теста не переключаемся
    this.selectedIndex = (this.selectedIndex + dir + CARS.length) % CARS.length;
    this.showCar(this.selectedIndex);
  }

  showCar(index, initial = false) {
    const car = CARS[index];
    saveSelectedCar(car.id);
    this.registry.set('selectedCar', car);

    // спрайт превью по центру «парковочного места»
    if (this.previewSprite) this.previewSprite.destroy();
    const tex = buildCarTexture(this, car);
    this.previewSprite = this.add.image(this.width / 2, this.height * 0.62, tex.key)
      .setDepth(15);

    if (!initial) {
      this.tweens.add({
        targets: this.previewSprite, scaleX: { from: 0.85, to: 1 }, scaleY: { from: 0.85, to: 1 },
        angle: { from: -6, to: 0 }, duration: 260, ease: 'Back.Out',
      });
    } else {
      this.tweens.add({
        targets: this.previewSprite, angle: { from: -90, to: 0 },
        duration: 700, ease: 'Cubic.Out',
      });
    }

    // лёгкое «дыхание» машины (как на подъёмнике)
    this.tweens.add({
      targets: this.previewSprite, y: this.height * 0.62 - 2,
      duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut',
    });

    this.nameText.setText(car.name);
    this.tagText.setText(car.tagline);
    this.drawStats(car);
  }

  drawStats(car) {
    const g = this.statPanel;
    g.clear();
    const x = this.width - 250;
    const y = 90;
    const w = 226;
    const h = 240;
    g.fillStyle(0x14171b, 0.85).fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, COLORS.accent, 0.6).strokeRoundedRect(x, y, w, h, 10);

    this.statTexts.removeAll(true);
    const rows = [
      ['Скорость', car.stats.speed],
      ['Разгон', car.stats.accel],
      ['Управление', car.stats.handling],
      ['Сцепление', car.stats.grip],
    ];
    this.statTexts.add(this.add.text(14, 10, 'ХАРАКТЕРИСТИКИ', {
      fontFamily: 'monospace', fontSize: '16px', color: COLORS.accent,
    }));
    rows.forEach(([label, val], i) => {
      const ry = 48 + i * 46;
      this.statTexts.add(this.add.text(14, ry, label, {
        fontFamily: 'monospace', fontSize: '15px', color: COLORS.text,
      }));
      // полоска-шкала
      const bx = 14; const by = ry + 22; const bw = w - 28;
      const bar = this.add.graphics();
      bar.fillStyle(0x2a2f36).fillRoundedRect(bx, by, bw, 10, 5);
      const colr = val >= 8 ? 0x37b26b : val >= 6 ? COLORS.accent : 0xe0564f;
      bar.fillStyle(colr).fillRoundedRect(bx, by, (bw * val) / 10, 10, 5);
      this.statTexts.add(bar);
      this.statTexts.add(this.add.text(w - 30, ry, `${val}`, {
        fontFamily: 'monospace', fontSize: '15px', color: COLORS.text,
      }).setOrigin(1, 0));
    });
  }

  toggleTestDrive() {
    if (this.testCar) {
      this.testCar.destroy();
      this.testCar = null;
      if (this.testFloor) { this.testFloor.destroy(); this.testFloor = null; }
      if (this.testHint) { this.testHint.destroy(); this.testHint = null; }
      // вернуть UI гаража
      this.children.list.forEach((ch) => { if (ch.__garageUI) ch.setVisible(true); });
      this.previewSprite.setVisible(true);
      this.cameras.main.setBounds(0, 0, this.width, this.height);
      this.physics.world.setBounds(0, 0, this.width, this.height);
      return;
    }
    const car = CARS[this.selectedIndex];
    this.previewSprite.setVisible(false);

    // скрыть элементы интерфейса гаража (они в координатах экрана)
    this.children.list.forEach((ch) => { if (ch.__garageUI) ch.setVisible(false); });

    // увеличенный «тестовый пол», камера следует за машиной
    const worldW = this.width * 2;
    const worldH = this.height * 2;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    const floor = this.add.graphics().setScrollFactor(1).setDepth(-20);
    floor.fillStyle(COLORS.floor).fillRect(0, 0, worldW, worldH);
    floor.lineStyle(1, COLORS.floorLine, 0.5);
    for (let yy = 0; yy < worldH; yy += 46) floor.lineBetween(0, yy, worldW, yy);
    for (let xx = 0; xx < worldW; xx += 46) floor.lineBetween(xx, 0, xx, worldH);
    // конусы-препятствия для теста
    const cones = this.add.graphics().setDepth(-9);
    for (let i = 0; i < 8; i++) {
      const cxp = worldW / 2 + Math.cos((i / 8) * Math.PI * 2) * 320;
      const cyp = worldH / 2 + Math.sin((i / 8) * Math.PI * 2) * 220;
      cones.fillStyle(0xe07a1f).fillCircle(cxp, cyp, 10);
      cones.fillStyle(0xffffff).fillCircle(cxp, cyp, 4);
    }
    this.testFloor = floor;
    this.testCones = cones;

    this.testCar = new PlayerCar(this, worldW / 2, worldH / 2, car);
    this.cameras.main.startFollow(this.testCar, true, 0.1, 0.1);

    this.testHint = this.add.text(this.width / 2, 40, 'ТЕСТ-ДРАЙВ — ESC вернуться к выбору', {
      fontFamily: 'monospace', fontSize: '20px', color: COLORS.accent,
      backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30);
  }

  startRace() {
    saveSelectedCar(CARS[this.selectedIndex].id);
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(300, () => this.scene.start(SCENES.RACE));
  }

  update(time, delta) {
    if (this.testCar) this.testCar.update(time, delta);
  }
}
