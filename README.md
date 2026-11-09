# What The Fabric! — Material Lab

An original, interactive textile explorer built with Vite and Three.js. Designed for deployment on Vercel.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

## Deploy to Vercel

1. Create a GitHub repository and push this folder.
2. Import the repository at https://vercel.com/new.
3. Choose framework preset **Vite** (or let Vercel detect it).
4. Build command: `npm run build`; output directory: `dist`.
5. Deploy. No API keys, backend, or environment variables required.

Or install Vercel CLI and run `npx vercel` from the project directory.

## What works

- Eight selectable fabrics: silk, tissue silk, shimmer, linen, cotton, velvet, chiffon, organza.
- Interactive WebGL 3D cloth with per-fabric deformation, lighting and material response.
- Pointer hover, mouse drag, touch drag and reset.
- Fabric-specific descriptions, feel, season, illustrative relative drape/airflow/warmth scales and facts.
- Responsive layout and reduced-motion support.
- Graceful text fallback when WebGL is unavailable.

## Important limitations

This is an **art-directed material simulation**, not physically accurate cloth physics or tactile haptics. It cannot reproduce real touch sensations through a screen. Airflow, drape and warmth scores are editorial illustrations, not measured material data. The simulation currently uses a procedural geometry rather than scanned textile microstructure. Fabric color and material settings are artistic interpretations, not calibrated samples. For physical fidelity, the next phase would require measured fabric parameters (bending rigidity, areal density, friction, reflectance), texture maps and a cloth solver.

## Design rationale

The main motion has a job: distinguish the character of materials through deformation and reflected light. Supporting UI is quiet and editorial, and motion is optional. Inspiration: Impeccable design guidance and the interaction principles of Oversight Supply, with original implementation rather than copied sections.

## Suggested next steps

1. Add macro photo references for each fabric, with image licensing and attribution.
2. Implement compare-two-fabrics mode.
3. Add a structured material dataset with sourced fiber composition, typical construction and test results.
4. Add optional tactile vibration cues on supported devices, carefully labeled as illustrative.
5. Performance-test mobile GPUs and add a low-power renderer setting.
