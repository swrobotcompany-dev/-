// Трасса гонки: замкнутый сплайн, отрисовка асфальта/бордюров/разметки, чекпоинты.
import Phaser from 'phaser';

export default class RaceTrack {
  /**
   * @param {number[][]} controlPoints — опорные точки центра трассы [x,y] (замыкается в кольцо)
   * @param {number} roadWidth — ширина асфальта
   */
  constructor(controlPoints, roadWidth = 190) {
    this.roadWidth = roadWidth;
    this.curve = new Phaser.Curves.Spline(
      controlPoints.map(([x, y]) => new Phaser.Geom.Point(x, y)),
    );
    this.samples = this.curve.getPoints(320);
    this._buildEdges();
    this.checkpoints = this._buildCheckpoints(8);
    // центр кольца — для корректного направления «наружу»
    const cx = this.samples.reduce((a, p) => a + p.x, 0) / this.samples.length;
    const cy = this.samples.reduce((a, p) => a + p.y, 0) / this.samples.length;
    this.center = new Phaser.Geom.Point(cx, cy);
  }

  _normalAt(i) {
    const p = this.samples[i];
    const q = this.samples[(i + 1) % this.samples.length];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: -dy / len, y: dx / len };
  }

  _buildEdges() {
    const hw = this.roadWidth / 2;
    this.leftEdge = [];
    this.rightEdge = [];
    for (let i = 0; i < this.samples.length; i++) {
      const p = this.samples[i];
      const n = this._normalAt(i);
      let left = new Phaser.Geom.Point(p.x + n.x * hw, p.y + n.y * hw);
      let right = new Phaser.Geom.Point(p.x - n.x * hw, p.y - n.y * hw);
      // левая граница должна быть ДАЛЬШЕ от центра кольца, чем правая
      if (dist(left, this.center) < dist(right, this.center)) {
        [left, right] = [right, left];
      }
      this.leftEdge.push(left);
      this.rightEdge.push(right);
    }
  }

  /** Отрисовать трассу на переданные graphics-слои (в координатах мира) */
  draw(curbG, roadG, lineG) {
    const s = this.samples;
    const L = this.leftEdge;
    const R = this.rightEdge;

    // --- бордюр: расширенная полоса за краями дороги ---
    curbG.fillStyle(0xb03232);
    for (let i = 0; i < s.length; i++) {
      const j = (i + 1) % s.length;
      quad(curbG, out(L[i], L[j], 16), out(R[i], R[j], 16), R[i], L[i]);
    }
    // белые сегменты бордюра в шахматном порядке
    curbG.fillStyle(0xf2f2f2);
    for (let i = 0; i < s.length; i += 8) {
      const j = (i + 4) % s.length;
      quad(curbG, out(L[i], L[j], 16), out(L[j], L[(j + 1) % s.length], 16), L[j], L[i]);
      quad(
        curbG,
        out(R[j], R[i], 16), out(R[(j + 1) % s.length], R[j], 16),
        R[(j + 1) % s.length], R[j],
      );
    }

    // --- асфальт ---
    roadG.fillStyle(0x3d4148);
    for (let i = 0; i < s.length; i++) {
      const j = (i + 1) % s.length;
      quad(roadG, L[i], R[i], R[j], L[j]);
    }
    // следы резины ближе к краям
    roadG.fillStyle(0x2b2e33, 0.55);
    for (let i = 0; i < s.length; i += 3) {
      const j = (i + 3) % s.length;
      quad(
        roadG,
        lerpP(L[i], s[i], 0.12), lerpP(L[j], s[j], 0.12),
        lerpP(L[j], s[j], 0.26), lerpP(L[i], s[i], 0.26),
      );
      quad(
        roadG,
        lerpP(R[i], s[i], 0.12), lerpP(R[j], s[j], 0.12),
        lerpP(R[j], s[j], 0.26), lerpP(R[i], s[i], 0.26),
      );
    }

    // --- осевая прерывистая разметка ---
    lineG.fillStyle(0xf5f0dc, 0.9);
    for (let i = 0; i < s.length; i += 12) {
      const j = (i + 5) % s.length;
      const t = 5;
      lineG.fillPoints([
        perpOffset(s[i], this._normalAt(i), -t),
        perpOffset(s[j], this._normalAt(j), -t),
        perpOffset(s[j], this._normalAt(j), t),
        perpOffset(s[i], this._normalAt(i), t),
      ], true);
    }
  }

  drawStartLine(g) {
    const p = this.samples[0];
    const q = this.samples[2];
    const n = this._normalAt(0);
    const hw = this.roadWidth / 2;
    const cells = 12;
    const cellW = (hw * 2) / cells;
    const tanLen = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const tx = (q.x - p.x) / tanLen;
    const ty = (q.y - p.y) / tanLen;
    const rowH = 12;
    for (let row = 0; row < 2; row++) {
      for (let c = 0; c < cells; c++) {
        g.fillStyle((c + row) % 2 === 0 ? 0xf5f5f5 : 0x15171a);
        const off = -hw + c * cellW;
        const bx = p.x + n.x * off + tx * row * rowH;
        const by = p.y + n.y * off + ty * row * rowH;
        g.fillPoints([
          pt(bx, by),
          pt(bx + n.x * cellW, by + n.y * cellW),
          pt(bx + n.x * cellW + tx * rowH, by + n.y * cellW + ty * rowH),
          pt(bx + tx * rowH, by + ty * rowH),
        ], true);
      }
    }
  }

  _buildCheckpoints(count) {
    const cps = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((this.samples.length * i) / count);
      const p = this.samples[idx];
      const n = this._normalAt(idx);
      cps.push({
        x: p.x, y: p.y,
        // нормаль чекпоинта = касательная трассы (по ней определяем пересечение)
        nx: -n.y, ny: n.x,
        half: this.roadWidth / 2 + 40,
        index: i,
      });
    }
    return cps;
  }

  startPose(laneOffset = 0) {
    const p = this.samples[0];
    const q = this.samples[2];
    const n = this._normalAt(0);
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    return { x: p.x + n.x * laneOffset, y: p.y + n.y * laneOffset, rotation: angle };
  }

  nearestCenter(x, y) {
    let best = Infinity;
    let bestP = null;
    let bestI = 0;
    for (let i = 0; i < this.samples.length; i++) {
      const p = this.samples[i];
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < best) { best = d; bestP = p; bestI = i; }
    }
    return { point: bestP, dist: Math.sqrt(best), index: bestI };
  }

  /** Пересёк ли объект линию чекпоинта между prev и cur позициями */
  crossedCheckpoint(cp, prev, cur) {
    const s1 = (prev.x - cp.x) * cp.nx + (prev.y - cp.y) * cp.ny;
    const s2 = (cur.x - cp.x) * cp.nx + (cur.y - cp.y) * cp.ny;
    if (Math.sign(s1) === Math.sign(s2)) return false;
    // координата вдоль линии чекпоинта (перпендикуляр нормали)
    const lx = -cp.ny;
    const ly = cp.nx;
    const t = (cur.x - cp.x) * lx + (cur.y - cp.y) * ly;
    return Math.abs(t) < cp.half;
  }
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function pt(x, y) { return new Phaser.Geom.Point(x, y); }

function lerpP(a, b, t) {
  return new Phaser.Geom.Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
}

/** Точка a, смещённая наружу (относительно середины сегмента a->b) на d */
function out(a, b, d) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const nx = -vy;
  const ny = vx;
  const len = Math.hypot(nx, ny) || 1;
  return new Phaser.Geom.Point(a.x + (nx / len) * d, a.y + (ny / len) * d);
}

function perpOffset(p, n, d) {
  return new Phaser.Geom.Point(p.x + n.x * d, p.y + n.y * d);
}

function quad(g, a, b, c, d) {
  g.fillPoints([a, b, c, d], true);
}
