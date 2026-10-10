// Гонка вид сверху: трасса-кольцо, чекпоинты, круги, время, AI-соперники.
import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/constants.js';
import { CARS } from '../config/carCatalog.js';
import RaceTrack from '../entities/RaceTrack.js';
import PlayerCar from '../entities/PlayerCar.js';
import { getSelectedCar } from '../utils/gameState.js';

const LAPS_TOTAL = 3;

// Опорные точки трассы (координаты мира ~2400x1600)
const TRACK_POINTS = [
  [420, 800], [500, 420], [900, 260], [1400, 300],
  [1750, 220], [2050, 420], [2000, 780], [1700, 900],
  [1350, 780], [1000, 950], [900, 1250], [1200, 1420],
  [1700, 1400], [2050, 1250], [2200, 900], [2150, 1300],
  [1800, 1500], [1100, 1550], [600, 1400], [350, 1100],
];

export default class RaceScene extends Phaser.Scene {
  constructor() { super(SCENES.RACE); }

  create() {
    const car = this.registry.get('selectedCar') || getSelectedCar();

    // ---- мир и трасса ----
    this.track = new RaceTrack(TRACK_POINTS, 200);
    const worldW = 2600; const worldH = 1800;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    // трава/окружение
    const ground = this.add.graphics().setDepth(-30);
    ground.fillStyle(0x2e4632).fillRect(0, 0, worldW, worldH);
    // пятна травы светлее
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, worldW);
      const y = Phaser.Math.Between(0, worldH);
      ground.fillStyle(0x35513a, 0.5).fillEllipse(x, y, Phaser.Math.Between(60, 220), Phaser.Math.Between(40, 140));
    }
    // «гравий» вокруг трассы нарисуем бордюром ниже

    const curbG = this.add.graphics().setDepth(-20);
    const roadG = this.add.graphics().setDepth(-10);
    const lineG = this.add.graphics().setDepth(-5);
    this.track.draw(curbG, roadG, lineG);
    this.track.drawStartLine(lineG);

    // деревья/пни вдоль трассы для ориентира
    const deco = this.add.graphics().setDepth(-4);
    for (let i = 0; i < this.track.samples.length; i += 10) {
      const p = this.track.samples[i];
      const n = { x: p.x - this.track.center.x, y: p.y - this.track.center.y };
      const len = Math.hypot(n.x, n.y) || 1;
      const off = this.track.roadWidth / 2 + 70 + Phaser.Math.Between(20, 120);
      const tx = p.x + (n.x / len) * off;
      const ty = p.y + (n.y / len) * off;
      deco.fillStyle(0x1d2b1f).fillCircle(tx, ty + 4, 16); // тень
      deco.fillStyle(0x2f5d3a).fillCircle(tx, ty, 14);
      deco.fillStyle(0x3c7a4b).fillCircle(tx - 4, ty - 4, 7);
    }

    // ---- игрок ----
    const pose = this.track.startPose(-40);
    this.player = new PlayerCar(this, pose.x, pose.y, car);
    this.player.setRotation(pose.rotation);
    this.prevPos = this.player.position.clone();

    // ---- соперники (AI) ----
    this.aiCars = this.createOpponents(3);

    // ---- состояние гонки ----
    this.lap = 0;
    this.nextCheckpoint = 1;
    this.raceTime = 0;
    this.finished = false;
    this.countdownValue = 3;
    this.controlsEnabled = false;

    // следы от шин (дройф-марки)
    this.skidLayer = this.add.graphics().setDepth(-3);
    this.skidTimer = 0;

    // ---- HUD ----
    this.hudLap = this.add.text(20, 16, '', hudStyle(26)).setScrollFactor(0).setDepth(40);
    this.hudTime = this.add.text(20, 50, '', hudStyle(22)).setScrollFactor(0).setDepth(40);
    this.hudSpeed = this.add.text(this.scale.width - 20, this.scale.height - 60, '', hudStyle(30))
      .setOrigin(1, 0.5).setScrollFactor(0).setDepth(40);
    this.hudPos = this.add.text(this.scale.width - 20, 16, '', hudStyle(24))
      .setOrigin(1, 0).setScrollFactor(0).setDepth(40);
    this.countdownText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontFamily: 'monospace', fontSize: '110px', fontStyle: 'bold', color: COLORS.accent,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(45).setShadow(0, 6, '#000', 12, true, true);

    this.input.keyboard.on('keydown-ESC', () => this.scene.start(SCENES.GARAGE));

    // камера
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.fadeIn(400);

    this.time.delayedCall(300, () => this.runCountdown());
  }

  runCountdown() {
    const tick = () => {
      if (this.countdownValue > 0) {
        this.countdownText.setText(String(this.countdownValue));
        this.tweens.add({
          targets: this.countdownText, alpha: { from: 1, to: 0 }, scaleX: { from: 1.4, to: 1 },
          duration: 800, ease: 'Cubic.Out',
        });
        this.countdownValue -= 1;
        this.time.delayedCall(900, tick);
      } else {
        this.countdownText.setText('ПОЕХАЛИ!');
        this.countdownText.setColor('#37b26b');
        this.tweens.add({
          targets: this.countdownText, alpha: { from: 1, to: 0 }, duration: 900, delay: 300,
        });
        this.controlsEnabled = true;
      }
    };
    tick();
  }

  createOpponents(count) {
    const pool = CARS.filter((c) => c.id !== this.player.carDef.id);
    const list = [];
    for (let i = 0; i < count; i++) {
      const def = pool[i % pool.length];
      const pose = this.track.startPose(40 + i * 55);
      const bot = new PlayerCar(this, pose.x, pose.y, def);
      bot.isBot = true;
      bot.waypoint = 1;
      bot.lap = 0;
      bot.speedBias = 0.78 + i * 0.07; // разный темп соперников
      list.push(bot);
    }
    return list;
  }

  update(time, delta) {
    const dt = delta / 1000;
    if (!this.finished) this.raceTime += dt;

    // игрок
    if (this.controlsEnabled && !this.finished) {
      this.player.update(time, delta);
    } else {
      // во время отсчёта — сброс скорости
      this.player.speed *= 0.9;
      this.player.body.velocity.scale(0.9);
    }

    // ограничение вылета с трассы («мягкие отбойники»)
    this.constrainToTrack(this.player);

    // следы при дрифте
    this.skidTimer += delta;
    if (this.player.drifting && this.skidTimer > 16) {
      this.skidTimer = 0;
      const a = this.player.angle * Phaser.Math.DEG_TO_RAD;
      const backX = this.player.x - Math.cos(a - Math.PI / 2) * 30;
      const backY = this.player.y - Math.sin(a - Math.PI / 2) * 30;
      this.skidLayer.fillStyle(0x111111, 0.28);
      this.skidLayer.fillCircle(backX - 8, backY, 5);
      this.skidLayer.fillCircle(backX + 8, backY, 5);
      if (this.skidLayer.commandBuffer.length > 4000) this.skidLayer.clear();
    }

    // чекпоинты игрока
    this.checkProgress(this.player, true);
    // AI
    for (const bot of this.aiCars) {
      if (this.controlsEnabled && !this.finished) this.driveBot(bot);
      else bot.virtualInput = { forward: false, backward: false, left: false, right: false };
      bot.update(time, delta);
      this.constrainToTrack(bot);
      this.checkProgress(bot, false);
    }

    // позиция в гонке
    this.updateHud();

    this.prevPos.copy(this.player.position);
  }

  driveBot(bot) {
    // цель — следующая точка трассы за текущим чекпоинтом
    const targetIdx = (bot.waypoint * Math.floor(this.track.samples.length / this.track.checkpoints.length))
      % this.track.samples.length;
    const target = this.track.samples[targetIdx];
    const desired = Math.atan2(target.y - bot.y, target.x - bot.x);
    const diff = Phaser.Math.Angle.Wrap(desired - (bot.rotation - Math.PI / 2));

    const fastTurn = Math.abs(diff) > 0.5 && Math.abs(bot.speed) > bot.physics.maxSpeed * 0.45;
    bot.virtualInput = {
      forward: !fastTurn,
      backward: false,
      left: diff < -0.06,
      right: diff > 0.06,
    };
  }

  constrainToTrack(car) {
    const { point, dist } = this.track.nearestCenter(car.x, car.y);
    const limit = this.track.roadWidth / 2 + 55;
    if (dist > limit) {
      // выталкиваем обратно к краю трассы и глушим скорость (трава)
      const nx = (car.x - point.x) / dist;
      const ny = (car.y - point.y) / dist;
      car.x = point.x + nx * limit;
      car.y = point.y + ny * limit;
      car.speed *= 0.94;
      car.body.velocity.scale(0.9);
    }
  }

  checkProgress(car, isPlayer) {
    const cps = this.track.checkpoints;
    const cpIdx = isPlayer ? this.nextCheckpoint : car.waypoint;
    const cp = cps[cpIdx % cps.length];
    if (isPlayer) {
      if (this.track.crossedCheckpoint(cp, this.prevPos, car.position)) {
        this.nextCheckpoint = (this.nextCheckpoint + 1) % cps.length;
        // пересекли стартово-финишную линию (индекс 0) — круг завершён
        if (cpIdx === 0) {
          this.lap += 1;
          if (this.lap >= LAPS_TOTAL) this.finishRace();
        }
      }
    } else {
      const prev = car.prevPos || car.position.clone();
      if (this.track.crossedCheckpoint(cp, prev, car.position)) {
        car.waypoint = (car.waypoint + 1) % cps.length;
        if (cpIdx === 0) car.lap += 1;
      }
      car.prevPos = car.position.clone();
    }
  }

  finishRace() {
    this.finished = true;
    const myProg = this.lapProgress();
    const botsAhead = this.aiCars.filter(
      (b) => b.lap + b.waypoint / this.track.checkpoints.length > myProg,
    ).length;
    const place = botsAhead + 1;
    this.cameras.main.flash(400, 255, 255, 255);
    this.time.delayedCall(600, () => {
      this.registry.set('raceResult', {
        timeMs: this.raceTime * 1000,
        laps: LAPS_TOTAL,
        place,
        total: this.aiCars.length + 1,
        carName: this.player.carDef.name,
      });
      this.scene.start(SCENES.RESULT);
    });
  }

  lapProgress() {
    return this.lap + this.nextCheckpoint / this.track.checkpoints.length;
  }

  updateHud() {
    this.hudLap.setText(`КРУГ ${Math.min(this.lap + 1, LAPS_TOTAL)}/${LAPS_TOTAL}`);
    this.hudTime.setText(`ВРЕМЯ ${formatTime(this.raceTime * 1000)}`);
    const kmh = Math.round(Math.abs(this.player.speed) * 0.45);
    this.hudSpeed.setText(`${kmh} км/ч`);
    this.hudSpeed.setColor(kmh > 150 ? '#e0564f' : COLORS.text);

    const myProg = this.lapProgress();
    const ahead = this.aiCars.filter((b) => b.lap + b.waypoint / this.track.checkpoints.length > myProg).length;
    this.hudPos.setText(`МЕСТО ${ahead + 1}/${this.aiCars.length + 1}`);
  }
}

function hudStyle(size) {
  return {
    fontFamily: 'monospace',
    fontSize: `${size}px`,
    fontStyle: 'bold',
    color: COLORS.text,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: { x: 10, y: 4 },
  };
}

export function formatTime(ms) {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
