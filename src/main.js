import './style.css';
import { FABRICS, FAMILIES, SEASONS, byId, comfortAt, firstTouchAt } from './fabrics.js';
import { FabricStage, webglAvailable } from './scene.js';
import { Feel } from './feel.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;

const SCALE_LABELS = { drape: 'Drape', crisp: 'Crispness', sheen: 'Sheen', breath: 'Breathability', warmth: 'Warmth' };
const MODES = [
  { id: 'pleats', label: 'Saree pleats', hint: 'Gathered at the waist. Watch how the pleats fan out.' },
  { id: 'pallu', label: 'Pallu', hint: 'Falling free from the shoulder.' },
  { id: 'dupatta', label: 'Dupatta', hint: 'Held at two points, the swag shows weight.' },
];
const PRESETS = [
  { label: 'Delhi · May', t: 44, humid: false },
  { label: 'Mumbai · July', t: 31, humid: true },
  { label: 'Bengaluru · Nov', t: 23, humid: false },
  { label: 'Lahore · Jan', t: 7, humid: false },
];

const state = {
  id: (location.hash.slice(1) && byId[location.hash.slice(1)]) ? location.hash.slice(1) : 'velvet',
  color: 0, mode: 'pallu', temp: 31, humid: false, sound: false,
};

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dots = (n, max = 5) => Array.from({ length: max }, (_, i) => `<i class="${i < n ? 'f' : ''}"></i>`).join('');

document.getElementById('app').innerHTML = `
<header class="top">
  <a class="mark" href="#" aria-label="What The Fabric! home"><span>What The</span> <em>Fabric!</em></a>
  <p class="tag">A material lab for suits &amp; sarees</p>
  <nav><a href="#atlas">Atlas</a><a href="#seasons">Season guide</a><a href="#about">About the model</a></nav>
</header>

<main class="lab">
  <section class="stage" aria-label="Interactive fabric">
    <div class="canvas" id="canvas"></div>
    <div class="hud top-hud">
      <label class="select">
        <span class="mono">Fabric</span>
        <select id="fabric">${FAMILIES.map((fam) => `<optgroup label="${fam.label}">${FABRICS.filter((f) => f.family === fam.id).map((f) => `<option value="${f.id}">${f.name}</option>`).join('')}</optgroup>`).join('')}</select>
      </label>
      <div class="seg" role="radiogroup" aria-label="Drape">${MODES.map((m) => `<button role="radio" data-mode="${m.id}">${m.label}</button>`).join('')}</div>
    </div>
    <div class="hud bottom-hud">
      <div class="swatches" id="swatches" role="radiogroup" aria-label="Dye colour"></div>
      <div class="actions">
        <button class="ghost" id="sound" aria-pressed="false" title="Rustle sound and, on Android, light vibration">Sound &amp; haptics: off</button>
        <button class="ghost" id="zoom" aria-pressed="false">Look closer</button>
        <button class="ghost" id="reset">Reset drape</button>
      </div>
    </div>
    <p class="hint mono" id="hint">Hover to brush · drag to lift</p>
    <div class="ring" id="ring" aria-hidden="true"></div>
    <div class="ring-label" id="ringLabel" aria-hidden="true"><b data-hand></b><span data-temp></span></div>
  </section>

  <aside class="panel" id="panel" aria-live="polite"></aside>
</main>

<section class="atlas" id="atlas">
  <div class="section-head"><h2>The atlas</h2><p>Twenty cloths that actually reach a tailor’s table in India and Pakistan. Each one is modelled for touch, temperature and drape. Choose one to try it.</p></div>
  <div class="grid" id="grid"></div>
</section>

<section class="seasons" id="seasons">
  <div class="section-head"><h2>Season guide</h2><p>What to wear when, across the North Indian and Punjab plains. Fabrics listed are the strongest choices for each season.</p></div>
  <div class="season-rows" id="seasonRows"></div>
</section>

<section class="about" id="about">
  <h2>About the model</h2>
  <div class="cols">
    <p><b>The movement is simulated, not animated.</b> Each fabric is a grid of about 1,500 points joined by springs. Its weight decides how it hangs and how much air moves it. Its crispness sets how strongly it resists folding. Your cursor is a fingertip: it presses into the cloth, and its friction drags the cloth with it. Velvet grips; satin barely moves.</p>
    <p><b>The surface is built from the weave up.</b> Plain, satin, twill, crepe, slub, pile and net structures are generated as micro-relief. Silk and satin shine along the yarn direction, velvet and pashmina have a soft pile glow, organza and shimmer show colour shifts, and zari is treated as real metal. Velvet keeps the trail of your finger, as real velvet does.</p>
    <p><b>Honest limits.</b> A screen cannot transmit touch, so feel is translated into motion, light, optional sound and light vibration. The 0–5 ratings are editorial comparisons, not lab results; real fabrics vary by mill, blend and finish. Colours are artistic, not calibrated.</p>
  </div>
</section>
<footer class="foot mono">What The Fabric! · Material Lab</footer>
`;

// ───────── stage ─────────
let stage = null, feel = null;
const canvasEl = $('#canvas');
if (webglAvailable()) {
  stage = new FabricStage(canvasEl, { lowPower, reducedMotion });
  feel = new Feel($('#ring'), $('#ringLabel'), { reducedMotion, bounds: () => document.querySelector('.stage').getBoundingClientRect() });
  stage.on('hover', (h) => feel.update(h));
  stage.on('grab', (g) => { $('#hint').classList.add('used'); document.body.classList.toggle('grabbing', g); });
} else {
  canvasEl.innerHTML = `<div class="fallback"><div class="fallback-swatch" id="fbSwatch"></div><p>Your browser can’t run the 3D view, so here are the full notes and a colour swatch instead.</p></div>`;
}

// ───────── controls ─────────
const sel = $('#fabric');
sel.addEventListener('change', () => selectFabric(sel.value));
document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
$('#reset').addEventListener('click', () => stage?.reset());
$('#zoom').addEventListener('click', (e) => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', on);
  e.currentTarget.textContent = on ? 'Step back' : 'Look closer';
  stage?.setZoom(on);
});
$('#sound').addEventListener('click', async (e) => {
  state.sound = !state.sound;
  e.currentTarget.setAttribute('aria-pressed', state.sound);
  e.currentTarget.textContent = `Sound & haptics: ${state.sound ? 'on' : 'off'}`;
  await feel?.enableAudio(state.sound);
});

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-checked', b.dataset.mode === mode));
  stage?.setMode(mode);
  $('#hint').textContent = MODES.find((m) => m.id === mode).hint + ' Hover to brush · drag to lift';
}

function renderSwatches(f) {
  $('#swatches').innerHTML = f.colors.map((c, i) => `<button role="radio" aria-checked="${i === state.color}" aria-label="Colour ${i + 1}" style="--c:${c}" data-i="${i}"></button>`).join('');
  $('#swatches').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    state.color = +b.dataset.i; renderSwatches(f);
    applyAccent(f); stage?.setColor(f.colors[state.color]);
    const fb = $('#fbSwatch'); if (fb) fb.style.background = f.colors[state.color];
  }));
}

// Accent follows the dye, but pale dyes (ivory, mint) are deepened so text stays legible on paper.
function applyAccent(f) {
  const hex = f.colors[state.color];
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const k = lum > 0.5 ? 0.5 / lum * 0.75 : 1;
  const ink = `rgb(${Math.round(r * k)}, ${Math.round(g * k)}, ${Math.round(b * k)})`;
  document.documentElement.style.setProperty('--accent', ink);
}

function selectFabric(id, { scroll = false } = {}) {
  const f = byId[id];
  state.id = id; state.color = 0;
  sel.value = id;
  history.replaceState(null, '', `#${id}`);
  renderSwatches(f); applyAccent(f);
  stage?.setFabric(f, f.colors[0]);
  feel?.setFabric(f); feel?.setTemp(state.temp);
  const fb = $('#fbSwatch'); if (fb) fb.style.background = f.colors[0];
  renderPanel(f);
  document.querySelectorAll('.card').forEach((c) => c.setAttribute('aria-current', c.dataset.id === id));
  if (scroll) document.querySelector('.lab').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

// ───────── panel ─────────
function renderPanel(f) {
  const fam = FAMILIES.find((x) => x.id === f.family).label;
  $('#panel').innerHTML = `
    <p class="eyebrow mono">${esc(fam)} · ${esc(f.weight)}</p>
    <h1>${esc(f.name)}</h1>
    <p class="local">${esc(f.local)}</p>
    <p class="hand">${esc(f.hand)}</p>

    <div class="block">
      <h3 class="mono">Under the fingertip</h3>
      <p>${esc(f.touch)}</p>
    </div>

    <div class="block scales">
      ${Object.entries(SCALE_LABELS).map(([k, l]) => `<div class="scale"><span>${l}</span><span class="dots" aria-label="${f.scales[k]} of 5">${dots(f.scales[k])}</span></div>`).join('')}
    </div>

    <div class="block climate">
      <h3 class="mono">On your skin</h3>
      <div class="presets">${PRESETS.map((p, i) => `<button class="chip" data-p="${i}">${p.label}</button>`).join('')}</div>
      <div class="temp-row">
        <input type="range" id="temp" min="0" max="46" step="1" value="${state.temp}" aria-label="Air temperature in °C" />
        <label class="humid"><input type="checkbox" id="humid" ${state.humid ? 'checked' : ''}/> Humid</label>
      </div>
      <div class="verdict" id="verdict"></div>
    </div>

    <div class="block">
      <h3 class="mono">Seasons</h3>
      <div class="season-chips">${SEASONS.map((s) => `<span class="s s${f.seasons[s.id]}" title="${s.en}, ${s.months}">${s.label}<small>${s.en}</small></span>`).join('')}</div>
    </div>

    <div class="block">
      <h3 class="mono">Make it into</h3>
      <div class="uses">${f.uses.map((u) => `<span class="chip static">${esc(u)}</span>`).join('')}</div>
    </div>

    <div class="block facts">
      <div><h3 class="mono">Fibre</h3><p>${esc(f.fibre)}</p></div>
      <div><h3 class="mono">Construction</h3><p>${esc(f.construction)}</p></div>
      <div><h3 class="mono">Care</h3><p>${esc(f.care)}</p></div>
    </div>

    <blockquote class="expert"><span class="mono">Expert’s eye</span>${esc(f.expert)}</blockquote>
  `;
  const temp = $('#temp'), humid = $('#humid');
  temp.addEventListener('input', () => { state.temp = +temp.value; updateVerdict(f); });
  humid.addEventListener('change', () => { state.humid = humid.checked; updateVerdict(f); });
  document.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
    const p = PRESETS[+b.dataset.p]; state.temp = p.t; state.humid = p.humid;
    temp.value = p.t; humid.checked = p.humid; updateVerdict(f);
  }));
  updateVerdict(f);
}

function updateVerdict(f) {
  const c = comfortAt(f, state.temp, state.humid);
  const ft = firstTouchAt(f, state.temp);
  feel?.setTemp(state.temp);
  const pct = (state.temp / 46) * 100;
  $('#temp').style.setProperty('--p', `${pct}%`);
  $('#verdict').innerHTML = `
    <div class="v-top"><span class="deg">${state.temp}°<small>C${state.humid ? ' · humid' : ''}</small></span>
      <span class="v-score"><span class="dots big">${dots(Math.round(c.score))}</span><b>${c.label}</b></span></div>
    <p>${esc(c.note)}</p>
    <p class="first mono">First touch: ${esc(ft.words)}</p>`;
}

// ───────── atlas + seasons ─────────
$('#grid').innerHTML = FABRICS.map((f) => `
  <button class="card" data-id="${f.id}">
    <span class="sw" style="--c:${f.colors[0]}"></span>
    <span class="c-name">${esc(f.name)}</span>
    <span class="c-local mono">${esc(f.local)}</span>
    <span class="c-hand">${esc(f.hand)}</span>
    <span class="c-bars">
      <span><em>Breath</em><span class="dots">${dots(f.scales.breath)}</span></span>
      <span><em>Warmth</em><span class="dots">${dots(f.scales.warmth)}</span></span>
    </span>
    <span class="c-seasons">${SEASONS.map((s) => `<i class="s${f.seasons[s.id]}" title="${s.en}">${s.en.slice(0, 2)}</i>`).join('')}</span>
  </button>`).join('');
document.querySelectorAll('.card').forEach((c) => c.addEventListener('click', () => selectFabric(c.dataset.id, { scroll: true })));

$('#seasonRows').innerHTML = SEASONS.map((s) => {
  const best = FABRICS.filter((f) => f.seasons[s.id] === 2);
  return `<div class="srow"><div class="s-head"><b>${s.label}</b><span>${s.en} · ${s.months}</span><p>${s.note}</p></div>
    <div class="s-list">${best.map((f) => `<button class="chip" data-go="${f.id}">${esc(f.name)}</button>`).join('')}</div></div>`;
}).join('');
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => selectFabric(b.dataset.go, { scroll: true })));

window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (byId[id] && id !== state.id) selectFabric(id); });

setMode(state.mode);
selectFabric(state.id);
