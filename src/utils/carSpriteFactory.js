// Процедурная отрисовка машины вид сверху на canvas-текстуру.
// Спрайт смотрит «вверх» (нос к -Y), чтобы rotation = угол движения был естественным.
import { makeCanvasTexture, roundRect, bodyGradient, rgba, shade } from '../utils/textureUtils.js';

const PAD = 14; // отступ под колёса/зеркала/тень

export function buildCarTexture(scene, car, keyOverride) {
  const key = keyOverride || `car_${car.id}`;
  const { width: w, length: h } = car.body;
  const texW = w + PAD * 2;
  const texH = h + PAD * 2;

  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, texW, texH);
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, texW, texH);

  const cx = texW / 2;
  const top = PAD; // нос
  const bottom = PAD + h; // корма

  drawShadow(ctx, cx, top, w, h);
  drawWheels(ctx, cx, top, w, h);
  drawBody(ctx, car, cx, top, w, h);
  drawCabin(ctx, car, cx, top, w, h);
  drawDetails(ctx, car, cx, top, w, h);

  tex.refresh();
  return { key, frameWidth: texW, frameHeight: texH };
}

function drawShadow(ctx, cx, top, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, cx - w / 2 + 4, top + 6, w, h, 18);
  ctx.fill();
  ctx.restore();
}

function drawWheels(ctx, cx, top, w, h) {
  const ww = 11;
  const wh = 24;
  const positions = [
    [cx - w / 2 - 2, top + h * 0.18], // переднее левое
    [cx + w / 2 - ww + 2, top + h * 0.18], // переднее правое
    [cx - w / 2 - 2, top + h * 0.72], // заднее левое
    [cx + w / 2 - ww + 2, top + h * 0.72], // заднее правое
  ];
  for (const [x, y] of positions) {
    ctx.fillStyle = '#17181b';
    roundRect(ctx, x, y, ww, wh, 4);
    ctx.fill();
    // протектор
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 1, y + (wh / 4) * i);
      ctx.lineTo(x + ww - 1, y + (wh / 4) * i);
      ctx.stroke();
    }
  }
}

function drawBody(ctx, car, cx, top, w, h) {
  const { color } = car;
  ctx.save();
  ctx.fillStyle = bodyGradient(ctx, color, cx - w / 2, cx + w / 2);
  roundRect(ctx, cx - w / 2, top, w, h, 16);
  ctx.fill();

  // тёмный контур кузова
  ctx.strokeStyle = rgba(shade(color, -0.5), 0.9);
  ctx.lineWidth = 2;
  roundRect(ctx, cx - w / 2, top, w, h, 16);
  ctx.stroke();

  // блик вдоль левой стороны
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx, cx - w / 2 + 4, top + 8, 5, h - 16, 3);
  ctx.fill();
  ctx.restore();
}

function drawCabin(ctx, car, cx, top, w, h) {
  const b = car.body;
  const cabH = h * b.cabinRatio;
  const cabW = w * b.cabinWidthRatio;
  const cabY = top + h * 0.3;

  // стекло — тёмное с градиентом
  const g = ctx.createLinearGradient(0, cabY, 0, cabY + cabH);
  g.addColorStop(0, 'rgba(190,220,255,0.55)');
  g.addColorStop(0.5, 'rgba(30,40,60,0.92)');
  g.addColorStop(1, 'rgba(160,190,230,0.4)');
  ctx.fillStyle = g;
  roundRect(ctx, cx - cabW / 2, cabY, cabW, cabH, 10);
  ctx.fill();

  // рамка кабины
  ctx.strokeStyle = rgba(shade(car.color, -0.55), 0.95);
  ctx.lineWidth = 2.5;
  roundRect(ctx, cx - cabW / 2, cabY, cabW, cabH, 10);
  ctx.stroke();

  // крыша между стеклами
  ctx.fillStyle = rgba(shade(car.color, 0.12));
  roundRect(ctx, cx - cabW / 2 + 6, cabY + cabH * 0.42, cabW - 12, cabH * 0.3, 6);
  ctx.fill();

  if (b.roofStripe) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(cx - 4, top + 6, 3, h - 12);
    ctx.fillRect(cx + 1, top + 6, 3, h - 12);
  }
}

function drawDetails(ctx, car, cx, top, w, h) {
  const b = car.body;
  // Фары (спереди — белый жёлтый свет)
  ctx.fillStyle = 'rgba(255,244,200,0.95)';
  roundRect(ctx, cx - w / 2 + 5, top + 3, w * 0.2, 6, 3);
  ctx.fill();
  roundRect(ctx, cx + w / 2 - 5 - w * 0.2, top + 3, w * 0.2, 6, 3);
  ctx.fill();

  // Задние фонари
  ctx.fillStyle = 'rgba(255,60,60,0.9)';
  roundRect(ctx, cx - w / 2 + 5, top + h - 9, w * 0.22, 6, 3);
  ctx.fill();
  roundRect(ctx, cx + w / 2 - 5 - w * 0.22, top + h - 9, w * 0.22, 6, 3);
  ctx.fill();

  // Капот — продольные линии
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.18, top + 12);
  ctx.lineTo(cx - w * 0.18, top + h * 0.28);
  ctx.moveTo(cx + w * 0.18, top + 12);
  ctx.lineTo(cx + w * 0.18, top + h * 0.28);
  ctx.stroke();

  // Зеркала
  ctx.fillStyle = rgba(shade(car.color, -0.3));
  roundRect(ctx, cx - w / 2 - 7, top + h * 0.3, 7, 5, 2);
  ctx.fill();
  roundRect(ctx, cx + w / 2, top + h * 0.3, 7, 5, 2);
  ctx.fill();

  // Спойлер
  if (b.spoiler) {
    ctx.fillStyle = rgba(shade(car.color, -0.45));
    roundRect(ctx, cx - w / 2 - 3, top + h - 4, w + 6, 7, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(cx - w / 2 + 6, top + h - 8, 4, 6);
    ctx.fillRect(cx + w / 2 - 10, top + h - 8, 4, 6);
  }
}
