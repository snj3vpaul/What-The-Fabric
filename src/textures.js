import * as THREE from 'three';

// ─────────────── tileable value noise ───────────────
function makeNoise(period, seed = 1) {
  const g = new Float32Array(period * period);
  let s = seed * 9301 + 49297;
  for (let i = 0; i < g.length; i++) { s = (s * 9301 + 49297) % 233280; g[i] = s / 233280; }
  const at = (x, y) => g[((y % period + period) % period) * period + ((x % period + period) % period)];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function fbm(noises, x, y) {
  let v = 0, amp = 0.5, f = 1, n = 0;
  for (const nz of noises) { v += nz(x * f, y * f) * amp; n += amp; amp *= 0.5; f *= 2; }
  return v / n;
}

// ─────────────── weave height fields (0..1), tileable over [0,size) ───────────────
// threads = interlacings per tile. The texture is then repeated across the cloth.
export function weaveHeight(type, size, threads) {
  const h = new Float32Array(size * size);
  const nA = makeNoise(threads, 3), nB = makeNoise(threads, 7);
  const fine = [makeNoise(64, 11), makeNoise(128, 13), makeNoise(256, 17)];
  const hex = type === 'net';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * threads, v = (y / size) * threads;
      const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
      let val = 0;
      if (type === 'plain' || type === 'slub' || type === 'crepe') {
        // thickness variation (slub) along each yarn
        let tw = 1, tf = 1;
        if (type === 'slub') {
          tw = 0.55 + 0.9 * nA(i * 3.1, v * 0.7);
          tf = 0.55 + 0.9 * nB(u * 0.7, j * 3.1);
        }
        const warp = Math.pow(Math.max(0, Math.sin(Math.PI * fu)), 1 / tw) * (0.65 + 0.35 * Math.sin(Math.PI * fv));
        const weft = Math.pow(Math.max(0, Math.sin(Math.PI * fv)), 1 / tf) * (0.65 + 0.35 * Math.sin(Math.PI * fu));
        const warpTop = (i + j) % 2 === 0;
        val = warpTop ? Math.max(warp, weft * 0.55) : Math.max(weft, warp * 0.55);
        if (type === 'crepe') {
          const pebble = fbm(fine, x / 6, y / 6);
          val = val * 0.35 + pebble * 0.85;
        }
      } else if (type === 'satin') {
        // 5-harness satin: warp floats over 4, under 1, step 2
        const under = ((i * 2) % 5) === (j % 5);
        const warp = Math.max(0, Math.sin(Math.PI * fu));
        val = under ? Math.max(0, Math.sin(Math.PI * fv)) * 0.5 : warp * (0.85 + 0.15 * Math.sin(Math.PI * 2 * (v / 5)));
      } else if (type === 'twill') {
        const top = ((i + j) % 4) < 2;
        const warp = Math.max(0, Math.sin(Math.PI * fu)), weft = Math.max(0, Math.sin(Math.PI * fv));
        val = top ? warp * 0.9 + weft * 0.1 : weft * 0.8 + warp * 0.15;
      } else if (type === 'pile') {
        val = fbm(fine, x / 1.5, y / 1.5);
      } else if (hex) {
        // hexagonal mesh: distance to nearest edge of a hex lattice
        const sx = u * 1.0, sy = v * 0.8660254 * 2 / 1.7320508;
        const q = sx, r = sy;
        const cx = Math.round(q), cy = Math.round(r);
        let best = 9;
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const px = cx + ox + ((cy + oy) % 2 ? 0.5 : 0), py = cy + oy;
          const dx = q - px, dy = (r - py) * 0.866;
          best = Math.min(best, Math.hypot(dx, dy));
        }
        val = Math.min(1, Math.max(0, (best - 0.33) * 6)); // 1 on strands, 0 in holes
      }
      h[y * size + x] = val;
    }
  }
  return h;
}

function heightToNormal(h, size, strength) {
  const data = new Uint8Array(size * size * 4);
  const at = (x, y) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
    const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    let nx = -dx, ny = -dy, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const k = (y * size + x) * 4;
    data[k] = (nx * 0.5 + 0.5) * 255; data[k + 1] = (ny * 0.5 + 0.5) * 255; data[k + 2] = (nz * 0.5 + 0.5) * 255; data[k + 3] = 255;
  }
  return data;
}

function dataTex(data, size, linear = true) {
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8;
  if (linear) t.colorSpace = THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}

const cache = new Map();
export function weaveTextures(render) {
  const key = `${render.weave}:${render.threads}`;
  if (cache.has(key)) return cache.get(key);
  const size = 256;
  const h = weaveHeight(render.weave, size, render.threads);
  const normal = dataTex(heightToNormal(h, size, render.weave === 'pile' ? 3 : 6), size);
  // AO-ish / alpha from height
  const a = new Uint8Array(size * size * 4);
  for (let i = 0; i < h.length; i++) { const v = Math.round(h[i] * 255); a[i * 4] = a[i * 4 + 1] = a[i * 4 + 2] = v; a[i * 4 + 3] = 255; }
  const height = dataTex(a, size);
  const out = { normal, height };
  cache.set(key, out);
  return out;
}

// Fur / pile strand mask for shell texturing. Random per-pixel strand heights.
let furTex = null;
export function furTexture() {
  if (furTex) return furTex;
  const size = 256, d = new Uint8Array(size * size * 4);
  let s = 12345;
  for (let i = 0; i < size * size; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const r = s / 0x7fffffff;
    const v = Math.pow(r, 0.7) * 255;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
  }
  furTex = dataTex(d, size);
  furTex.minFilter = THREE.NearestMipmapLinearFilter;
  furTex.magFilter = THREE.NearestFilter;
  return furTex;
}

// ─────────────── surface artwork (colour + zari mask), 1× over the whole cloth ───────────────
const ZARI = '#d8b45c';

function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return `#${c.getHexString()}`;
}
function contrastInk(hex) {
  const c = new THREE.Color(hex); const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return l > 0.55;
}

function paisley(ctx, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.bezierCurveTo(0.9, -0.9, 0.9, 0.6, 0, 0.75);
  ctx.bezierCurveTo(-0.75, 0.85, -0.85, 0.05, -0.35, -0.15);
  ctx.bezierCurveTo(0.05, -0.3, -0.1, -0.7, 0, -1);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
function flower(ctx, x, y, r, petals = 5) {
  for (let p = 0; p < petals; p++) {
    const a = (p / petals) * Math.PI * 2;
    ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.28, a, 0, Math.PI * 2); ctx.fill();
  }
}

// Returns { map, metal } canvases. metal: G = roughness factor, B = metalness factor.
export function artwork(fabric, color, W = 744, H = 1024) {
  const r = fabric.render;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const m = document.createElement('canvas'); m.width = W; m.height = H;
  const mx = m.getContext('2d');
  const baseMetal = Math.round((r.metalness || 0) * 255);
  mx.fillStyle = `rgb(0,255,${baseMetal})`; mx.fillRect(0, 0, W, H);

  // base + dye mottle (hand-dyed / hand-spun irregularity)
  ctx.fillStyle = color; ctx.fillRect(0, 0, W, H);
  if (r.mottle) {
    const n = makeNoise(16, 5);
    const img = ctx.getImageData(0, 0, W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 4;
      const v = (n(x / 60, y / 9) - 0.5) * 2 * r.mottle * 255; // streaky along weft
      img.data[k] += v; img.data[k + 1] += v; img.data[k + 2] += v;
    }
    ctx.putImageData(img, 0, 0);
  }

  const zari = (fill = ZARI) => { ctx.fillStyle = fill; mx.fillStyle = 'rgb(0,110,255)'; };
  const both = (fn) => { fn(ctx); fn(mx); };

  if (r.zari === 'tissue') {
    // gold-shot ground: blend toward gold, fine weft lines in the metal map
    ctx.fillStyle = 'rgba(216,180,92,0.35)'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 3) { mx.fillStyle = `rgb(0,${150 + (y % 6 ? 0 : 40)},${y % 6 ? 200 : 255})`; mx.fillRect(0, y, W, 2); }
  }

  if (r.zari === 'border' || r.zari === 'brocade' || r.zari === 'border-thin' || r.zari === 'tissue' || r.zari === 'coins') {
    const thin = r.zari === 'border-thin' || r.zari === 'coins';
    const bh = thin ? H * 0.035 : H * (r.zari === 'brocade' ? 0.12 : 0.085);
    // bottom border (pallu end / hem) — the most visible zari on a hanging saree
    zari(); both((g) => g.fillRect(0, H - bh, W, bh));
    ctx.fillStyle = color; mx.fillStyle = `rgb(0,255,${baseMetal})`;
    both((g) => g.fillRect(0, H - bh * 0.62, W, bh * 0.12));
    if (!thin) {
      // small repeated motifs inside the border
      ctx.fillStyle = shade(color, -0.05); mx.fillStyle = `rgb(0,255,${baseMetal})`;
      for (let x = 18; x < W; x += 36) both((g) => paisley(g, x, H - bh * 0.3, bh * 0.16, Math.PI * 0.15));
    }
    // side selvedge lines
    zari(); both((g) => { g.fillRect(0, 0, thin ? 4 : 8, H); g.fillRect(W - (thin ? 4 : 8), 0, thin ? 4 : 8, H); });
  }

  if (r.zari === 'brocade') {
    // kalga (paisley) jaal + small butis, woven in zari
    zari();
    for (let y = 70, row = 0; y < H * 0.84; y += 88, row++) {
      for (let x = (row % 2 ? 62 : 18); x < W; x += 88) {
        both((g) => paisley(g, x, y, 17, row % 2 ? 0.5 : -0.5));
        both((g) => { g.beginPath(); g.arc(x + 44, y + 44, 4, 0, Math.PI * 2); g.fill(); });
      }
    }
  }
  if (r.zari === 'coins') {
    zari();
    for (let y = 40, row = 0; y < H * 0.92; y += 64, row++)
      for (let x = (row % 2 ? 52 : 20); x < W; x += 64) both((g) => { g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); });
  }
  if (r.zari === 'sparkle') {
    let s = 7;
    for (let i = 0; i < 9000; i++) {
      s = (s * 16807) % 2147483647; const x = (s % W);
      s = (s * 16807) % 2147483647; const y = (s % H);
      s = (s * 16807) % 2147483647; const b = 120 + (s % 135);
      mx.fillStyle = `rgb(0,60,${b})`; mx.fillRect(x, y, 2, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
  if (r.zari === 'embroidery') {
    // sozni-style needlework border in silk thread (not metal)
    const ink = contrastInk(color) ? shade(color, -0.35) : shade(color, 0.3);
    ctx.fillStyle = ink;
    for (let x = 30; x < W; x += 60) { paisley(ctx, x, H - 70, 18, 0.4); flower(ctx, x + 30, H - 34, 9); }
    ctx.fillRect(0, H - 108, W, 3); ctx.fillRect(0, H - 14, W, 3);
  }
  if (r.print === 'block') {
    // hand block-print bootas: a two-colour floral on a staggered grid
    const light = contrastInk(color);
    const ink1 = light ? '#2f4f86' : '#f5efe2', ink2 = light ? '#b5452f' : shade(color, 0.25);
    for (let y = 40, row = 0; y < H - 80; y += 74, row++) {
      for (let x = (row % 2 ? 56 : 18); x < W; x += 76) {
        ctx.fillStyle = ink1; flower(ctx, x, y, 13, 6);
        ctx.fillStyle = ink2; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink1; ctx.beginPath(); ctx.ellipse(x + 15, y + 15, 7, 3, 0.8, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = ink1; ctx.fillRect(0, H - 60, W, 26);
    ctx.fillStyle = ink2; for (let x = 10; x < W; x += 26) flower(ctx, x, H - 47, 8, 5);
  }

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const metal = new THREE.CanvasTexture(m);
  metal.colorSpace = THREE.NoColorSpace; metal.anisotropy = 8;
  const hasMetal = !!(r.zari && r.zari !== 'embroidery') || !!r.metalness;
  return { map, metal: hasMetal ? metal : null };
}

// Velvet "finger trail": brushing against the nap tilts the pile, so light hits the fibre ends
// and the colour deepens. The canvas IS the velvet's colour map; the trail slowly recovers.
export function makeCrushCanvas(size = 512) {
  const c = document.createElement('canvas'); c.width = Math.round(size * 0.727); c.height = size;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let base = '#1d3cb8', deep = '#0d1d66';
  const api = {
    tex,
    setBase(hex) {
      base = hex; const col = new THREE.Color(hex); const hsl = {}; col.getHSL(hsl);
      col.setHSL(hsl.h, Math.min(1, hsl.s * 1.1), hsl.l * 0.55); deep = `#${col.getHexString()}`;
      api.clear();
    },
    stroke(u, v, strength = 1) {
      const x = u * c.width, y = (1 - v) * c.height, r = 8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const d = new THREE.Color(deep);
      g.addColorStop(0, `rgba(${d.r * 255 | 0},${d.g * 255 | 0},${d.b * 255 | 0},${0.14 * strength})`);
      g.addColorStop(1, `rgba(${d.r * 255 | 0},${d.g * 255 | 0},${d.b * 255 | 0},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      tex.needsUpdate = true;
    },
    recover(rate = 0.006) {
      const b = new THREE.Color(base);
      ctx.fillStyle = `rgba(${b.r * 255 | 0},${b.g * 255 | 0},${b.b * 255 | 0},${rate})`; ctx.fillRect(0, 0, c.width, c.height); tex.needsUpdate = true;
    },
    clear() { ctx.fillStyle = base; ctx.fillRect(0, 0, c.width, c.height); tex.needsUpdate = true; },
  };
  return api;
}

// Backdrop: a jharokha arch on a warm wall — it shows through sheer fabrics.
export function backdropTexture() {
  const W = 1024, H = 1024;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(W / 2, H * 0.45, 50, W / 2, H / 2, W * 0.75);
  grd.addColorStop(0, '#3a3530'); grd.addColorStop(1, '#17151a');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // arch
  g.strokeStyle = 'rgba(214,180,120,0.22)'; g.lineWidth = 3;
  const archW = 520, cx = W / 2, top = 150, base = 930;
  g.beginPath();
  g.moveTo(cx - archW / 2, base); g.lineTo(cx - archW / 2, 420);
  g.bezierCurveTo(cx - archW / 2, 260, cx - 90, 230, cx, top);
  g.bezierCurveTo(cx + 90, 230, cx + archW / 2, 260, cx + archW / 2, 420);
  g.lineTo(cx + archW / 2, base);
  g.stroke();
  g.fillStyle = 'rgba(214,180,120,0.05)'; g.fill();
  g.save(); g.clip();
  // jaali lattice inside
  g.strokeStyle = 'rgba(214,180,120,0.07)'; g.lineWidth = 2;
  for (let i = -20; i < 20; i++) {
    g.beginPath(); g.moveTo(cx - archW / 2 + i * 40, base); g.lineTo(cx - archW / 2 + i * 40 + 500, base - 500); g.stroke();
    g.beginPath(); g.moveTo(cx + archW / 2 - i * 40, base); g.lineTo(cx + archW / 2 - i * 40 - 500, base - 500); g.stroke();
  }
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
