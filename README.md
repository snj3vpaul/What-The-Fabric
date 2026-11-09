# What The Fabric! — Material Lab

An interactive textile explorer for Punjabi suits, Pakistani suits and sarees. Built with Vite and Three.js. Designed for deployment on Vercel.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173). Link straight to a fabric with a hash, e.g. `/#banarasi`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com/new (framework preset **Vite**).
3. Build command `npm run build`, output directory `dist`.
4. Deploy. No API keys, backend or environment variables required.

## What's inside

```
src/
  fabrics.js   The atlas: 20 fabrics × feel, thermal behaviour, seasons, uses, care, expert notes,
               plus render and physics parameters. Comfort and first-touch models live here too.
  cloth.js     Verlet cloth simulation (≈1,500 particles). Weight, crispness, damping, air drag and
               fingertip friction come from each fabric. Three drape modes.
  textures.js  Procedural weave micro-relief (plain, satin, twill, crepe, slub, pile, net), zari
               borders, Banarasi kalga butis, Chanderi coins, lawn block prints, sozni embroidery,
               shimmer sparkle, the velvet finger-trail canvas and the jharokha backdrop.
  scene.js     Three.js stage: physically based materials (sheen, anisotropy, iridescence, metal zari,
               sheer opacity, net alpha), shell-textured pile and fuzz, shadows, loupe zoom, pointer → fingertip.
  feel.js      Touch translated for screens: fingertip ring with fabric-specific inertia, grain jitter
               and crisp ticks; optional synthesized rustle; light vibration on Android.
  main.js      UI: fabric dropdown, drape modes, dye colours, climate presets and comfort verdict,
               the atlas grid and the season guide.
  style.css    Editorial layout.
```

### The twenty fabrics
Silks & zari: Katan silk, Tissue silk, Tussar, Banarasi brocade, Satin ·
Sheers & crepes: Chiffon, Georgette, Organza, Chanderi, Net, Crepe ·
Cottons & bast: Lawn, Mulmul, Cambric, Khadi/Khaddar, Linen, Rayon ·
Pile & wool: Velvet, Pashmina · Glamour: Shimmer (lurex)

### Interactions
- **Hover** acts as a fingertip that presses into the cloth. Its friction drags the cloth along: velvet grips, satin slips away.
- **Drag** lifts the fabric toward you.
- **Saree pleats / Pallu / Dupatta** re-pin the same cloth the way it is worn.
- **Look closer** moves to macro distance, where the weave, zari and pile become visible and your hand pans like a loupe.
- **Velvet** keeps the trail of your finger, which slowly recovers.
- **Climate presets** (Delhi May, Mumbai July, Bengaluru Nov, Lahore Jan), a temperature slider and a humid toggle drive the comfort verdict and the first-touch sensation. The fingertip ring turns blue for cool-touch fabrics and amber for warm ones.
- **Sound & haptics** (opt-in): a band-filtered rustle tuned per fabric (organza crackles, silk whispers, velvet is near-silent) and short vibrations for slubby or crisp cloth on Android.

## Honest limitations
This is an art-directed material simulation, not a measured one. The cloth solver is real but coarse (≈4 cm grid), with no self-collision. A screen cannot transmit touch, so feel is translated into motion, light and sound. The 0–5 ratings are editorial comparisons, not lab data. Fibre facts are general and real fabrics vary by mill, blend and finish. Colours are artistic, not calibrated.

## Suggested next steps
1. Compare mode: two fabrics side by side under the same climate.
2. Measured parameters (bending rigidity, areal density, friction) from fabric samples to replace the editorial scales.
3. Photographed macro textures (with licensing) for a few signature fabrics.
4. GPU cloth (compute or transform feedback) for finer grids and self-collision.
5. Embroidery layer: zardozi, gota patti and phulkari on any base fabric.
