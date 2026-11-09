// Translating touch into what a screen CAN do: motion, sound and (on phones) vibration.
//
//  slip  → the fingertip ring follows fast and overshoots     (satin, silk: your finger skates)
//  drag  → the ring lags and is heavily damped               (velvet, pashmina: the pile holds you)
//  grain → micro-jitter proportional to speed                 (khadi, linen, tussar: slubs under the finger)
//  crisp → the ring "ticks" when direction changes            (organza, tissue: crackle, snap)
//
// Sound is a filtered noise rustle whose loudness follows hand speed. It is off until the user opts in.

import { firstTouchAt } from './fabrics.js';

export class Feel {
  constructor(ring, label, { reducedMotion = false, bounds = null } = {}) {
    this.bounds = bounds;
    this.ring = ring; this.label = label;
    this.reducedMotion = reducedMotion;
    this.pos = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 };
    this.target = null; this.lastDir = 0; this.tick = 0;
    this.speed = 0;
    this.audioOn = false; this.audio = null;
    this.lastBuzz = 0;
    this.temp = 30;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  setFabric(f) { this.fabric = f; this._updateTone(); this._setLabel(); }
  setTemp(t) { this.temp = t; this._setLabel(); }

  _setLabel() {
    if (!this.fabric) return;
    const ft = firstTouchAt(this.fabric, this.temp);
    this.label.querySelector('[data-hand]').textContent = this.fabric.hand;
    this.label.querySelector('[data-temp]').textContent = ft.words;
    // ring tint: cool → blue, warm/hot → amber
    const i = ft.intensity;
    const col = i > 0 ? `rgba(${Math.round(200 - 110 * i)}, ${Math.round(220 - 30 * i)}, 255, 0.95)` : `rgba(255, ${Math.round(205 + 30 * i)}, ${Math.round(150 + 60 * i)}, 0.95)`;
    this.ring.style.setProperty('--ring', col);
  }

  update(h) {
    if (!h) { this.target = null; this.ring.classList.remove('on'); this.label.classList.remove('on'); return; }
    if (!this.target) { this.pos = { x: h.x, y: h.y }; this.vel = { x: 0, y: 0 }; }
    this.target = { x: h.x, y: h.y };
    this.speed = h.speed || 0;
    this.ring.classList.add('on'); this.label.classList.add('on');
    this.ring.classList.toggle('grab', !!h.grabbing);
  }

  _loop() {
    requestAnimationFrame(this._loop);
    const f = this.fabric?.feel;
    if (this.target && f) {
      if (this.reducedMotion) { this.pos = { ...this.target }; }
      else {
        const k = 0.08 + f.slip * 0.32 - f.drag * 0.05;          // spring stiffness
        const damp = 0.55 + f.drag * 0.35 - f.slip * 0.25;       // velocity loss per frame
        this.vel.x = this.vel.x * (1 - damp) + (this.target.x - this.pos.x) * k;
        this.vel.y = this.vel.y * (1 - damp) + (this.target.y - this.pos.y) * k;
        this.pos.x += this.vel.x; this.pos.y += this.vel.y;
      }
      const sp = Math.min(3, this.speed);
      const j = this.reducedMotion ? 0 : f.grain * sp * 2.2;
      const jx = (Math.random() - 0.5) * j, jy = (Math.random() - 0.5) * j;
      // crisp: a tick of scale when horizontal direction flips
      const dir = Math.sign(this.vel.x);
      if (dir && dir !== this.lastDir && Math.abs(this.vel.x) > 1.5) { this.tick = f.crisp; this._crackle(f.crisp); }
      this.lastDir = dir || this.lastDir;
      this.tick *= 0.85;
      const scale = 1 + this.tick * 0.35 - f.drag * Math.min(1, sp) * 0.15;
      this.ring.style.transform = `translate(${this.pos.x + jx}px, ${this.pos.y + jy}px) translate(-50%, -50%) scale(${scale})`;
      // keep the label inside the stage: flip to the left / above near the edges
      const b = this.bounds?.(), lw = this.label.offsetWidth || 220, lh = this.label.offsetHeight || 60;
      const lx = b && this.pos.x + 26 + lw > b.right - 8 ? this.pos.x - 26 - lw : this.pos.x + 26;
      const ly = b && this.pos.y + 22 + lh > b.bottom - 70 ? this.pos.y - 22 - lh : this.pos.y + 22;
      this.label.style.transform = `translate(${lx}px, ${ly}px)`;
      this._audioFrame(sp);
      this._haptic(sp);
    } else this._audioFrame(0);
  }

  // ───── sound ─────
  async enableAudio(on) {
    this.audioOn = on;
    if (!on) { if (this.audio) this.audio.gain.gain.setTargetAtTime(0, this.audio.ctx.currentTime, 0.05); return; }
    if (!this.audio) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      const gain = ctx.createGain(); gain.gain.value = 0;
      const master = ctx.createGain(); master.gain.value = 0.6;
      src.connect(bp).connect(gain).connect(master).connect(ctx.destination); src.start();
      this.audio = { ctx, bp, gain, buf };
      this._updateTone();
    }
    if (this.audio.ctx.state === 'suspended') await this.audio.ctx.resume();
  }
  _updateTone() {
    if (!this.audio || !this.fabric) return;
    const s = this.fabric.sound, t = this.audio.ctx.currentTime;
    this.audio.bp.frequency.setTargetAtTime(s.f, t, 0.05);
    this.audio.bp.Q.setTargetAtTime(s.q, t, 0.05);
  }
  _audioFrame(sp) {
    if (!this.audio || !this.audioOn || !this.fabric) return;
    const g = Math.min(0.35, sp * this.fabric.sound.gain * 0.22);
    this.audio.gain.gain.setTargetAtTime(g, this.audio.ctx.currentTime, 0.04);
  }
  _crackle(amount) {
    if (!this.audio || !this.audioOn || !this.fabric || amount < 0.2) return;
    const { ctx, buf } = this.audio;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(0.25 * this.fabric.sound.crackle, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    src.connect(hp).connect(g).connect(ctx.destination); src.start(t, Math.random()); src.stop(t + 0.07);
  }

  // ───── haptics (Android browsers; iOS Safari ignores navigator.vibrate) ─────
  _haptic(sp) {
    if (!this.audioOn || !navigator.vibrate || !this.fabric || sp < 0.3) return;
    const now = performance.now(), f = this.fabric.feel;
    if (f.grain < 0.2 && f.crisp < 0.5) return;
    if (now - this.lastBuzz > 90 - f.grain * 40) { navigator.vibrate(Math.round(4 + f.grain * 10)); this.lastBuzz = now; }
  }
}
