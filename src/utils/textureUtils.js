// Утилиты генерации процедурной графики (без внешних ассетов)
import Phaser from 'phaser';

/**
 * Создаёт canvas-текстуру и возвращает её контекст 2D.
 */
export function makeCanvasTexture(scene, key, width, height) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const tex = scene.textures.createCanvas(key, width, height);
  return tex;
}

/**
 * Скруглённый прямоугольник для ctx (Path2D-совместимый).
 */
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

/**
 * Линейный градиент «металлик» для кузова: светлее к центру, темнее по краям.
 */
export function bodyGradient(ctx, baseColor, x0, x1) {
  const c = new Phaser.Display.Color.IntegerToColor(baseColor);
  const light = c.clone().lighten(0.28).color;
  const mid = c.color;
  const dark = c.clone().darken(0.35).color;
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, rgba(dark));
  g.addColorStop(0.35, rgba(mid));
  g.addColorStop(0.55, rgba(light));
  g.addColorStop(1, rgba(dark));
  return g;
}

export function rgba(colorInt, a = 1) {
  const r = (colorInt >> 16) & 0xff;
  const g = (colorInt >> 8) & 0xff;
  const b = colorInt & 0xff;
  return `rgba(${r},${g},${b},${a})`;
}

export function shade(colorInt, amount /* -1..1 */) {
  const c = new Phaser.Display.Color.IntegerToColor(colorInt);
  if (amount >= 0) return c.clone().lighten(amount).color;
  return c.clone().darken(-amount).color;
}
