// Игровая машина: arcade-физика вида сверху (газ, тормоз, поворот, дрифт)
import Phaser from 'phaser';
import { buildCarTexture } from '../utils/carSpriteFactory.js';
import { KEYMAP } from '../config/constants.js';

export default class PlayerCar extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, carDef) {
    const tex = buildCarTexture(scene, carDef);
    super(scene, x, y, tex.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.carDef = carDef;
    this.setDepth(10);
    this.setSize(carDef.body.width, carDef.body.length, true);

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys|object} */
    this.keys = {
      up: scene.input.keyboard.addKeys(...KEYMAP.UP),
      down: scene.input.keyboard.addKeys(...KEYMAP.DOWN),
      left: scene.input.keyboard.addKeys(...KEYMAP.LEFT),
      right: scene.input.keyboard.addKeys(...KEYMAP.RIGHT),
    };
    // для AI-машин — виртуальные флаги вместо реальных клавиш
    this.virtualInput = null;

    this.speed = 0; // px/сек вдоль носа
    this.drifting = false;
    this.engineRpm = 0;

    this.body.setAllowGravity(false);
    this.body.setDamping(true);
    this.setDrag(0.999); // торможение считаем вручную
  }

  get physics() {
    return this.carDef.physics;
  }

  update(time, delta) {
    const dt = delta / 1000;
    const p = this.physics;
    const body = this.body;

    let forward; let backward; let left; let right;
    if (this.virtualInput) {
      // AI-машина: флаги ставит трасса/драйвер
      ({ forward, backward, left, right } = this.virtualInput);
    } else {
      forward = isDown(this.keys.up);
      backward = isDown(this.keys.down);
      left = isDown(this.keys.left);
      right = isDown(this.keys.right);
    }

    // --- продольная тяга/торможение ---
    if (forward) this.speed += p.acceleration * dt;
    else if (backward) this.speed -= p.acceleration * 0.7 * dt;
    else this.speed *= Math.pow(p.friction, dt * 60); // накат

    // задний ход ограничен (у AI — с поправкой на «класс» бота)
    const cap = p.maxSpeed * (this.speedBias || 1);
    const maxReverse = cap * 0.35;
    this.speed = Phaser.Math.Clamp(this.speed, -maxReverse, cap);
    if (Math.abs(this.speed) < 2) this.speed = 0;

    // --- руление: угол зависит от скорости (на месте не крутимся) ---
    const speedFactor = Phaser.Math.Clamp(Math.abs(this.speed) / 120, 0, 1);
    const dir = this.speed >= 0 ? 1 : -1;
    const steerInput = (left ? -1 : 0) + (right ? 1 : 0);
    // на больших скоростях чуть «тяжелее» руль
    const highSpeedDamp = Phaser.Math.clampMap(
      Math.abs(this.speed), 0, p.maxSpeed, 1, 0.72,
    );
    this.rotation += steerInput * p.turnRate * speedFactor * dir * highSpeedDamp * dt;

    // --- дрифт: боковое скольжение при резком повороте на скорости ---
    const slip = Math.abs(steerInput) * (Math.abs(this.speed) / p.maxSpeed);
    this.drifting = slip > 0.55 && Math.abs(this.speed) > p.maxSpeed * 0.45;

    // вектор скорости: разложение на продольную/боковую в системе кузова.
    // чем выше grip-характеристика машины, тем быстрее вектор догоняет направление кузова
    const lateralGrip = Phaser.Math.Clamp(p.driftGrip + (this.drifting ? -0.28 : 0.06), 0.3, 0.999);
    const cosH = Math.cos(this.rotation - Math.PI / 2);
    const sinH = Math.sin(this.rotation - Math.PI / 2);

    const vx = body.velocity.x;
    const vy = body.velocity.y;
    let vLat = -vx * sinH + vy * cosH; // боковая составляющая

    // продольная — управляется газом/накатом (this.speed), боковая — гасится сцеплением
    vLat *= Math.pow(1 - lateralGrip, dt * 60);

    body.velocity.x = this.speed * cosH - vLat * sinH;
    body.velocity.y = this.speed * sinH + vLat * cosH;

    // RPM для звука/приборки
    const targetRpm = 800 + (Math.abs(this.speed) / p.maxSpeed) * 6500 + (forward ? 400 : 0);
    this.engineRpm = lerp(this.engineRpm, targetRpm, 0.1);
  }

  /** Сброс на позицию старта */
  respawn(x, y, rotation = -Math.PI / 2) {
    this.setPosition(x, y);
    this.setRotation(rotation);
    this.speed = 0;
    this.body.velocity.set(0, 0);
  }
}

function isDown(keyObj) {
  return Object.values(keyObj).some((k) => k.isDown);
}

function lerp(a, b, t) {
  return a + (b - a) * Phaser.Math.Clamp(t, 0, 1);
}
