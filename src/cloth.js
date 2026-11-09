// Position-based (Verlet) cloth. Small, fast, and tuned per fabric:
//   mass      → how strongly air and the fingertip move it (chiffon floats, velvet hangs)
//   bend      → stiffness of skip-one constraints (organza holds a shape, rayon pours)
//   damping   → how quickly motion dies (crisp fabrics settle with a snap)
//   friction  → how much a moving fingertip drags the cloth along with it

export const WIDTH = 1.6;
export const HEIGHT = 2.2;

export class Cloth {
  constructor(nx, ny) {
    this.nx = nx; this.ny = ny;
    const n = nx * ny;
    this.n = n;
    this.pos = new Float32Array(n * 3);
    this.prev = new Float32Array(n * 3);
    this.invMass = new Float32Array(n).fill(1);
    this.pinTarget = new Float32Array(n * 3);
    this.pinned = new Uint8Array(n);
    this.grab = { active: false, idx: [], w: [], target: [0, 0, 0] };
    this.finger = { active: false, x: 0, y: 0, z: 0.2, r: 0.2, vx: 0, vy: 0 };
    this.params = { mass: 1, bend: 0.2, damping: 0.985, air: 0.5, friction: 0.4, wind: 1 };
    this.time = 0;
    this._buildConstraints();
    this.resetFlat();
  }

  idx(i, j) { return j * this.nx + i; }

  _buildConstraints() {
    const { nx, ny } = this;
    const dx = WIDTH / (nx - 1), dy = HEIGHT / (ny - 1);
    const list = [];
    const add = (a, b, rest, kind) => list.push([a, b, rest, kind]);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = this.idx(i, j);
      if (i < nx - 1) add(a, this.idx(i + 1, j), dx, 0);
      if (j < ny - 1) add(a, this.idx(i, j + 1), dy, 0);
      if (i < nx - 1 && j < ny - 1) {
        const d = Math.hypot(dx, dy);
        add(a, this.idx(i + 1, j + 1), d, 1);
        add(this.idx(i + 1, j), this.idx(i, j + 1), d, 1);
      }
      if (i < nx - 2) add(a, this.idx(i + 2, j), dx * 2, 2);
      if (j < ny - 2) add(a, this.idx(i, j + 2), dy * 2, 2);
    }
    const m = list.length;
    this.cA = new Int32Array(m); this.cB = new Int32Array(m);
    this.cRest = new Float32Array(m); this.cKind = new Uint8Array(m);
    list.forEach(([a, b, r, k], c) => { this.cA[c] = a; this.cB[c] = b; this.cRest[c] = r; this.cKind[c] = k; });
    this.dx = dx; this.dy = dy;
  }

  resetFlat() {
    const { nx, ny, pos, prev } = this;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = this.idx(i, j) * 3;
      pos[k] = -WIDTH / 2 + i * this.dx;
      pos[k + 1] = HEIGHT / 2 - j * this.dy;
      pos[k + 2] = 0;
    }
    prev.set(pos);
  }

  // Drape modes, each a real way these fabrics are worn.
  //  pleats  – saree pleats gathered at the waist (top edge concertinaed)
  //  pallu   – hanging free from the shoulder line
  //  dupatta – a swag held at two points, like a dupatta across the arms
  setMode(mode) {
    const { nx } = this;
    this.pinned.fill(0); this.invMass.fill(1);
    const top = HEIGHT / 2;
    if (mode === 'pallu') {
      // hung from a rod in soft waves (as cloth on rings or tucked at the shoulder):
      // the top edge follows a sine in z, spaced so each segment keeps its true length
      const waves = 3.5, A = 0.075;
      const xs = [0], zs = [];
      for (let i = 0; i < nx; i++) zs.push(A * Math.sin((i / (nx - 1)) * Math.PI * 2 * waves));
      for (let i = 1; i < nx; i++) {
        const dz = zs[i] - zs[i - 1];
        xs.push(xs[i - 1] + Math.sqrt(Math.max(1e-6, this.dx * this.dx - dz * dz)) * 0.97);
      }
      const off = xs[nx - 1] / 2;
      for (let i = 0; i < nx; i++) this._pin(this.idx(i, 0), xs[i] - off, top, zs[i]);
    } else if (mode === 'pleats') {
      const gathered = WIDTH * 0.42, step = gathered / (nx - 1);
      const amp = 0.5 * Math.sqrt(Math.max(0, this.dx * this.dx - step * step)) * 0.96;
      for (let i = 0; i < nx; i++) this._pin(this.idx(i, 0), -gathered / 2 + i * step, top, i % 2 ? amp : -amp);
    } else if (mode === 'dupatta') {
      const span = WIDTH * 0.6;
      this._pin(this.idx(0, 0), -span / 2, top, 0.05);
      this._pin(this.idx(1, 0), -span / 2 + 0.02, top - 0.01, 0.05);
      this._pin(this.idx(nx - 1, 0), span / 2, top, 0.05);
      this._pin(this.idx(nx - 2, 0), span / 2 - 0.02, top - 0.01, 0.05);
    }
    this.mode = mode;
    this.morph = 0; // 0 → 1 over ~0.6s: pins glide into place instead of teleporting
    this.pinFrom = this.pos.slice();
  }

  _pin(k, x, y, z) {
    this.pinned[k] = 1; this.invMass[k] = 0;
    this.pinTarget[k * 3] = x; this.pinTarget[k * 3 + 1] = y; this.pinTarget[k * 3 + 2] = z;
  }

  setFabric(f, weights) {
    const mass = weights[f.weight];
    const crisp = f.scales.crisp;
    this.params.mass = mass;
    this.params.bend = [0.03, 0.07, 0.14, 0.26, 0.42, 0.62][crisp];
    this.params.damping = 0.992 - crisp * 0.003 - (mass > 1.2 ? 0.006 : 0);
    this.params.air = (0.55 + (5 - f.scales.drape) * 0.04) / mass;
    this.params.friction = f.feel.drag * 0.9 + 0.1;
  }

  step(dt, opts = {}) {
    const { pos, prev, invMass, n, params } = this;
    this.time += dt;
    const t = this.time;
    const g = -9.8 * 0.55;
    const damp = params.damping;
    const windOn = opts.wind ?? 1;
    // wind: slow gusts + per-particle ripple
    const gust = (Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.9 + 1.3) * 0.3 + Math.sin(t * 0.23) * 0.6);
    const wx = 0.12 * gust * windOn, wz = (0.35 + 0.35 * Math.sin(t * 0.5)) * windOn;
    const air = params.air;

    // pin morph
    if (this.morph < 1) {
      this.morph = Math.min(1, this.morph + dt / 0.6);
      const e = 1 - Math.pow(1 - this.morph, 3);
      for (let i = 0; i < n; i++) if (this.pinned[i]) {
        const k = i * 3;
        for (let a = 0; a < 3; a++) pos[k + a] = this.pinFrom[k + a] + (this.pinTarget[k + a] - this.pinFrom[k + a]) * e;
        prev[k] = pos[k]; prev[k + 1] = pos[k + 1]; prev[k + 2] = pos[k + 2];
      }
    }

    const dt2 = dt * dt;
    for (let i = 0; i < n; i++) {
      if (invMass[i] === 0) continue;
      const k = i * 3;
      const x = pos[k], y = pos[k + 1], z = pos[k + 2];
      const vx = (x - prev[k]) * damp, vy = (y - prev[k + 1]) * damp, vz = (z - prev[k + 2]) * damp;
      const ripple = Math.sin(x * 3.1 + t * 2.2) * Math.cos(y * 2.3 - t * 1.4);
      const ax = wx * air * (1 + 0.4 * ripple);
      const az = wz * air * (0.6 + 0.6 * ripple) - z * 0.6 * air; // gentle restoring toward z=0
      prev[k] = x; prev[k + 1] = y; prev[k + 2] = z;
      pos[k] = x + vx + ax * dt2;
      pos[k + 1] = y + vy + g * dt2;
      pos[k + 2] = z + vz + az * dt2;
    }

    // fingertip: frictional drag (moves cloth along with a moving finger)
    const f = this.finger;
    if (f.active) {
      const R = f.r * 1.4, R2 = R * R;
      const fr = params.friction / Math.max(0.4, params.mass);
      for (let i = 0; i < n; i++) {
        if (invMass[i] === 0) continue;
        const k = i * 3;
        const dx = pos[k] - f.x, dy = pos[k + 1] - f.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        const w = (1 - d2 / R2) * fr * 0.016;
        pos[k] += f.vx * w; pos[k + 1] += f.vy * w;
      }
    }

    const iters = opts.iterations ?? 10;
    const { cA, cB, cRest, cKind } = this;
    const m = cA.length;
    const kb = params.bend;
    for (let it = 0; it < iters; it++) {
      for (let c = 0; c < m; c++) {
        const a = cA[c], b = cB[c];
        const wa = invMass[a], wb = invMass[b], w = wa + wb;
        if (w === 0) continue;
        const ka = a * 3, kb3 = b * 3;
        const dx = pos[kb3] - pos[ka], dy = pos[kb3 + 1] - pos[ka + 1], dz = pos[kb3 + 2] - pos[ka + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const kind = cKind[c];
        let s = (d - cRest[c]) / (d * w);
        if (kind === 2) { if (d > cRest[c]) continue; s *= kb; }      // bending resists folding only
        else if (kind === 1) s *= 0.9;
        pos[ka] += dx * s * wa; pos[ka + 1] += dy * s * wa; pos[ka + 2] += dz * s * wa;
        pos[kb3] -= dx * s * wb; pos[kb3 + 1] -= dy * s * wb; pos[kb3 + 2] -= dz * s * wb;
      }
      // fingertip as a sphere the cloth cannot pass through (a press, not a poke)
      if (f.active) {
        const r2 = f.r * f.r;
        for (let i = 0; i < n; i++) {
          if (invMass[i] === 0) continue;
          const k = i * 3;
          const dx = pos[k] - f.x, dy = pos[k + 1] - f.y, dz = pos[k + 2] - f.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < r2) {
            const d = Math.sqrt(d2) || 1e-6, s = (f.r - d) / d;
            pos[k] += dx * s; pos[k + 1] += dy * s; pos[k + 2] += dz * s;
          }
        }
      }
      // grabbed region follows the hand
      if (this.grab.active) {
        const G = this.grab;
        for (let q = 0; q < G.idx.length; q++) {
          const k = G.idx[q] * 3, w = G.w[q];
          pos[k] += (G.target[0] + G.off[q * 3] - pos[k]) * w;
          pos[k + 1] += (G.target[1] + G.off[q * 3 + 1] - pos[k + 1]) * w;
          pos[k + 2] += (G.target[2] + G.off[q * 3 + 2] - pos[k + 2]) * w;
        }
      }
    }
  }

  // grab every particle within radius of a point, with soft falloff
  startGrab(point, radius = 0.16) {
    const G = this.grab; G.idx = []; G.w = []; const off = [];
    for (let i = 0; i < this.n; i++) {
      if (this.invMass[i] === 0) continue;
      const k = i * 3;
      const dx = this.pos[k] - point.x, dy = this.pos[k + 1] - point.y, dz = this.pos[k + 2] - point.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < radius) { G.idx.push(i); G.w.push(Math.pow(1 - d / radius, 1.5) * 0.9 + 0.05); off.push(dx * 0.6, dy * 0.6, dz * 0.6); }
    }
    G.off = new Float32Array(off);
    G.target = [point.x, point.y, point.z];
    G.active = G.idx.length > 0;
    return G.active;
  }
  endGrab() { this.grab.active = false; }
}
