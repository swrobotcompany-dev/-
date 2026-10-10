// Объекты фона гаража: верстак, запчасти, стеллажи, покрышки, бочки и т.п.
// Всё рисуется процедурно (graphics), без внешних картинок.
import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';
import { shade } from '../utils/textureUtils.js';

const METAL = COLORS.metal;
const METAL_DARK = COLORS.metalDark;
const RUBBER = COLORS.rubber;

/** Верстак с тисками и инструментами */
export function drawWorkbench(g, x, y, w = 260, h = 90) {
  // столешница
  g.fillStyle(0x6b4a2b).fillRoundedRect(x, y, w, h * 0.35, 4);
  g.fillStyle(0x8a6a45).fillRoundedRect(x, y, w, h * 0.22, 4);
  // ножки
  g.fillStyle(METAL_DARK);
  g.fillRect(x + 8, y + h * 0.35, 10, h * 0.65);
  g.fillRect(x + w - 18, y + h * 0.35, 10, h * 0.65);
  // ящики
  g.fillStyle(0x555c66).fillRect(x + 30, y + h * 0.4, w - 60, h * 0.5);
  g.lineStyle(2, 0x3c4148);
  for (let i = 1; i < 3; i++) {
    const yy = y + h * 0.4 + (h * 0.5 / 3) * i;
    g.lineBetween(x + 30, yy, x + w - 30, yy);
  }
  // тиски
  g.fillStyle(METAL).fillRect(x + w - 55, y - 14, 26, 16);
  g.fillStyle(METAL_DARK).fillRect(x + w - 49, y - 22, 14, 10);
  // гаечные ключи на столешнице
  drawWrench(g, x + 40, y + 8, 0.15);
  drawWrench(g, x + 80, y + 12, -0.4);
  // отвёртка
  g.fillStyle(0xd94f4f).fillRect(x + 130, y + 6, 16, 7);
  g.fillStyle(METAL).fillRect(x + 146, y + 8, 26, 3);
}

function drawWrench(g, x, y, rot) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle(METAL);
  g.fillRect(0, 0, 44, 6);
  g.fillCircle(0, 3, 7);
  g.fillCircle(44, 3, 7);
  g.fillStyle(COLORS.floor);
  g.fillCircle(0, 3, 3.5);
  g.fillCircle(44, 3, 3.5);
  g.restore();
}

/** Стопка покрышек */
export function drawTireStack(g, x, y, count = 4) {
  for (let i = 0; i < count; i++) {
    const yy = y - i * 12;
    g.fillStyle(RUBBER).fillEllipse(x, yy, 64, 26);
    g.fillStyle(0x2b2d31).fillEllipse(x, yy - 2, 60, 22);
    g.fillStyle(0x111215).fillEllipse(x, yy - 3, 30, 11);
    // протектор
    g.lineStyle(2, 0x33363b);
    g.strokeEllipse(x, yy, 64, 26);
  }
}

/** Одиночное колесо с диском */
export function drawWheelDisplay(g, x, y, r = 30) {
  g.fillStyle(RUBBER).fillCircle(x, y, r * 2);
  g.fillStyle(0x2a2c30).fillCircle(x, y, r * 1.6);
  g.fillStyle(METAL).fillCircle(x, y, r * 0.95);
  // спицы
  g.lineStyle(5, METAL_DARK);
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5;
    g.lineBetween(x, y, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8);
  }
  g.fillStyle(0x3a3f46).fillCircle(x, y, r * 0.28);
}

/** Стеллаж с запчастями и коробками */
export function drawShelf(g, x, y, w = 180, h = 200) {
  g.fillStyle(METAL_DARK).fillRect(x, y, w, h);
  g.fillStyle(0x4a4f57);
  const shelves = 3;
  for (let i = 0; i <= shelves; i++) {
    g.fillRect(x - 4, y + (h / shelves) * i - 5, w + 8, 8);
  }
  // коробки и детали на полках
  const boxColors = [0xb3541e, 0x3f6db3, 0x6da54f];
  for (let s = 0; s < shelves; s++) {
    const shelfY = y + (h / shelves) * s - 5;
    let bx = x + 10;
    for (let b = 0; b < 3; b++) {
      const bw = 26 + ((s * 7 + b * 13) % 18);
      const bh = 22 + ((s + b) % 3) * 8;
      g.fillStyle(boxColors[(s + b) % 3]).fillRect(bx, shelfY - bh, bw, bh);
      // блик на коробке (тот же цвет, чуть светлее)
      g.fillStyle(0xffffff, 0.12).fillRect(bx, shelfY - bh, bw, 4);
      bx += bw + 8;
      if (bx > x + w - 30) break;
    }
    // шестерёнка на каждой полке
    drawGear(g, x + w - 22, shelfY - 14, 12, 8);
  }
}

/** Шестерёнка */
export function drawGear(g, x, y, r, teeth = 8) {
  const pts = [];
  for (let i = 0; i < teeth * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.72;
    const a = (Math.PI * i) / teeth;
    pts.push(new Phaser.Geom.Point(x + Math.cos(a) * rad, y + Math.sin(a) * rad));
  }
  g.fillStyle(METAL).fillPoints(pts, true);
  g.fillStyle(COLORS.wall).fillCircle(x, y, r * 0.35);
}

/** Двигатель на подставке */
export function drawEngine(g, x, y, scale = 1) {
  g.fillStyle(0x5a6068).fillRect(x - 34 * scale, y - 26 * scale, 68 * scale, 52 * scale);
  g.fillStyle(0x6e757f).fillRect(x - 34 * scale, y - 26 * scale, 68 * scale, 12 * scale);
  // клапанная крышка
  g.fillStyle(0x8d949e).fillRect(x - 22 * scale, y - 34 * scale, 44 * scale, 10 * scale);
  // цилиндры/рёбра
  g.lineStyle(2, 0x454a52);
  for (let i = 0; i < 5; i++) {
    const xx = x - 26 * scale + i * 13 * scale;
    g.lineBetween(xx, y - 12 * scale, xx, y + 20 * scale);
  }
  // шкив
  g.fillStyle(METAL_DARK).fillCircle(x + 38 * scale, y, 10 * scale);
  g.fillStyle(0x2f333a).fillCircle(x + 38 * scale, y, 4 * scale);
  // подставка
  g.fillStyle(0xc0392b).fillRect(x - 40 * scale, y + 26 * scale, 80 * scale, 8 * scale);
}

/** Масляная бочка */
export function drawBarrel(g, x, y, color = 0x2e7d32) {
  const dark = shade(color, -0.3);
  g.fillStyle(color).fillRoundedRect(x - 22, y - 40, 44, 80, 8);
  g.fillStyle(dark).fillRoundedRect(x - 22, y - 40, 44, 12, 6);
  g.lineStyle(3, dark);
  g.lineBetween(x - 22, y - 14, x + 22, y - 14);
  g.lineBetween(x - 22, y + 12, x + 22, y + 12);
  // блик
  g.fillStyle(0xffffff, 0.15).fillRect(x - 16, y - 36, 6, 72);
  g.fillStyle(0xe8eaed).fillCircle(x, y - 34, 4);
}

/** Домкрат и ключ-баллонник */
export function drawJack(g, x, y) {
  g.fillStyle(0xb03030);
  g.fillRect(x - 30, y + 10, 60, 8);
  g.fillTriangle(x - 26, y + 10, x - 14, y - 26, x - 2, y + 10);
  g.fillTriangle(x + 2, y + 10, x + 14, y - 26, x + 26, y + 10);
  g.fillStyle(METAL).fillRect(x - 16, y - 32, 32, 7);
  g.lineStyle(4, METAL);
  g.lineBetween(x - 14, y - 26, x + 34, y - 40);
  g.fillStyle(METAL_DARK).fillCircle(x + 36, y - 41, 5);
}

/** Вытяжное освещение / лампы на стене — просто жёлтые прямоугольники сверху */
export function drawCeilingLamps(scene, width) {
  for (let i = 0; i < 3; i++) {
    const x = width * (0.25 + i * 0.25);
    const glow = scene.add.graphics().setDepth(-5).setAlpha(0.12);
    glow.fillStyle(0xfff2c0).fillEllipse(x, 60, 320, 160);
    const lamp = scene.add.graphics().setDepth(-4);
    lamp.fillStyle(0x22262c).fillRect(x - 46, 14, 92, 10);
    lamp.fillStyle(0xfff6d5).fillRect(x - 40, 22, 80, 6);
  }
}

/** Задняя стена гаража с воротами */
export function drawBackWall(g, x, y, w, h) {
  g.fillStyle(COLORS.wall).fillRect(x, y, w, h);
  // панели стены
  g.lineStyle(1, COLORS.wallLight, 0.25);
  for (let i = 1; i < 6; i++) {
    g.lineBetween(x, y + (h / 6) * i, x + w, y + (h / 6) * i);
  }
  // секционные ворота
  const gw = w * 0.42;
  const gx = x + w - gw - 30;
  g.fillStyle(0x494f58).fillRect(gx, y + h * 0.18, gw, h * 0.82);
  g.lineStyle(2, 0x33383f);
  for (let i = 1; i < 5; i++) {
    const yy = y + h * 0.18 + (h * 0.82 / 5) * i;
    g.lineBetween(gx, yy, gx + gw, yy);
  }
  g.fillStyle(0x5d646f).fillRect(gx, y + h * 0.18, gw, 10);
  // окна в воротах
  g.fillStyle(0x1a2530);
  for (let i = 0; i < 4; i++) {
    g.fillRect(gx + 14 + i * (gw - 28) / 4, y + h * 0.24, (gw - 28) / 4 - 8, 18);
  }
}

/** Построить весь фон гаража одной функцией */
export function buildGarageBackdrop(scene, width, height) {
  const wallH = height * 0.34;
  const bg = scene.add.graphics().setScrollFactor(0).setDepth(-10);

  // пол
  bg.fillStyle(COLORS.floor).fillRect(0, wallH, width, height - wallH);
  // плитка пола
  bg.lineStyle(1, COLORS.floorLine, 0.5);
  for (let y = wallH; y < height; y += 46) bg.lineBetween(0, y, width, y);
  for (let x = 0; x < width; x += 46) bg.lineBetween(x, wallH, x, height);
  // «линия парковки»
  bg.lineStyle(3, 0xf1c40f, 0.35);
  bg.strokeRect(width / 2 - 190, wallH + 90, 380, 300);

  drawBackWall(bg, 0, 0, width, wallH);

  drawCeilingLamps(scene, width);

  // объекты вдоль стен
  drawShelf(scene.add.graphics().setDepth(-8), 20, wallH * 0.25);
  drawShelf(scene.add.graphics().setDepth(-8), width - 200, wallH * 0.2);
  drawWorkbench(scene.add.graphics().setDepth(-8), width / 2 - 130, wallH + 6);
  drawEngine(scene.add.graphics().setDepth(-8), 120, height - 120, 1.1);
  drawTireStack(scene.add.graphics().setDepth(-8), width - 90, height - 60, 5);
  drawTireStack(scene.add.graphics().setDepth(-8), width - 190, height - 40, 3);
  drawBarrel(scene.add.graphics().setDepth(-8), 250, height - 70, 0x2e7d32);
  drawBarrel(scene.add.graphics().setDepth(-8), 300, height - 60, 0x8d6e1f);
  drawJack(scene.add.graphics().setDepth(-8), width - 320, height - 80);
  drawWheelDisplay(scene.add.graphics().setDepth(-8), 420, height - 90, 26);

  // виньетка по углам для глубины
  const vig = scene.add.graphics().setDepth(50).setScrollFactor(0);
  vig.fillStyle(0x000000, 0.25).fillRect(0, 0, width, 8);
}
