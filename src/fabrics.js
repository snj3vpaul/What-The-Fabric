// What The Fabric! — curated material atlas for Punjabi suits, Pakistani suits and sarees.
//
// "Deeper, not broader": rather than every fabric on earth, these are the twenty cloths that
// actually reach an Indian or Pakistani tailor's table, each modelled in four layers:
//   1. how it FEELS (hand, first-touch temperature, friction under the fingertip)
//   2. how it BEHAVES with heat and humidity (breathability, absorbency, insulation)
//   3. WHEN to wear it (five South-Asian seasons) and WHAT to make from it
//   4. how it RENDERS and MOVES (weave micro-structure, light response, cloth physics)
//
// Scales are 0–5 editorial ratings for comparison, not lab measurements.

export const SEASONS = [
  { id: 'summer', label: 'Garmi', en: 'Summer', months: 'Apr – Jun', note: 'Dry heat, 35–45 °C across the North Indian and Punjab plains.' },
  { id: 'monsoon', label: 'Barsaat', en: 'Monsoon', months: 'Jul – Sep', note: 'Humid, 28–34 °C. Sweat does not evaporate; fabrics must absorb and dry fast.' },
  { id: 'festive', label: 'Tyohaar', en: 'Festive', months: 'Oct – Nov', note: 'Mild days, cool evenings. Wedding and festival season begins.' },
  { id: 'winter', label: 'Sardi', en: 'Winter', months: 'Dec – Feb', note: 'Northern nights drop to 3–8 °C. Insulation matters more than drape.' },
  { id: 'spring', label: 'Basant', en: 'Spring', months: 'Feb – Mar', note: 'Warm days, gentle evenings. The most forgiving season.' },
];

export const FAMILIES = [
  { id: 'silk', label: 'Silks & zari' },
  { id: 'sheer', label: 'Sheers & crepes' },
  { id: 'cotton', label: 'Cottons & bast' },
  { id: 'warm', label: 'Pile & wool' },
  { id: 'glam', label: 'Synthetics & glamour' },
];

// weight → simulation mass. crisp → bending stiffness.
export const WEIGHTS = { Feather: 0.32, Light: 0.6, Medium: 1, Heavy: 1.55 };

export const FABRICS = [
  // ───────────────────────────── SILKS ─────────────────────────────
  {
    id: 'katan', name: 'Katan Silk', local: 'Resham · Katan', family: 'silk',
    fibre: 'Mulberry silk (Bombyx mori), continuous filament',
    construction: 'Plain weave of two-ply twisted silk — the ground cloth beneath most Banarasi sarees',
    weight: 'Light',
    hand: 'Smooth, cool and dry, with a faint crunch called “scroop”.',
    touch: 'The fingertip glides with almost no drag, then catches lightly as twisted yarns rub — silk’s signature whisper. It feels cooler than the room at first contact, then warms to your skin within seconds.',
    scales: { drape: 4, crisp: 2, sheen: 4, breath: 3, warmth: 3 },
    thermal: {
      firstTouch: 'cool', absorb: 3,
      hot: 'Breathes well, but sweat leaves visible water marks on pure silk. Wear it for evenings, not a noon outdoor function.',
      humid: 'Risky: moisture spots, and silk weakens slightly when wet. Choose georgette or chiffon instead.',
      mild: 'Silk’s best weather. It regulates temperature and the colour glows in soft light.',
      cold: 'Surprisingly warm for its weight — silk is a natural insulator. Pair with a pashmina for outdoor evenings.',
    },
    seasons: { summer: 1, monsoon: 0, festive: 2, winter: 1, spring: 2 },
    uses: ['Saree', 'Kameez', 'Dupatta'],
    care: 'Dry clean, or cold hand-wash with a mild detergent. Dry in shade. Iron on the silk setting through a press cloth.',
    expert: 'Silk fibre has a triangular, prism-like cross-section, so it splits light into soft shifting tones. Polyester “silk” is round and reflects one flat, glassy highlight. Tilt the cloth: real silk changes colour, imitation just gets brighter.',
    colors: ['#b0215a', '#0f5c6e', '#a3201c', '#efe6d2'],
    render: { weave: 'plain', threads: 14, normal: 0.35, roughness: 0.32, sheen: 0.35, aniso: 0.55, zari: 'border', iridescence: 0.08 },
    feel: { slip: 0.85, drag: 0.15, grain: 0.05, crisp: 0.2 },
    sound: { f: 2600, q: 1.4, gain: 0.5, crackle: 0.1 },
  },
  {
    id: 'tissue', name: 'Tissue Silk', local: 'Tissue · Zari tissue', family: 'silk',
    fibre: 'Silk (or silk-blend) warp with a metallic zari weft',
    construction: 'Metallic thread runs through every pick, so the whole cloth carries a molten metallic glimmer',
    weight: 'Light',
    hand: 'Crisp, papery and cool-metallic. It rustles.',
    touch: 'Your fingers feel a fine ribbed crispness — the zari picks — rather than silk’s glide. It holds a crease where you pinch it and springs back with a dry rustle.',
    scales: { drape: 2, crisp: 4, sheen: 5, breath: 2, warmth: 2 },
    thermal: {
      firstTouch: 'cool', absorb: 1,
      hot: 'Not a daytime summer fabric. The metal yarn does not absorb sweat and feels scratchy on damp skin.',
      humid: 'Avoid. Moisture speeds up zari tarnishing and the cloth goes limp.',
      mild: 'Ideal for festive evenings. Under warm lights it looks like poured gold.',
      cold: 'Light and thin. Wear it as a saree or dupatta over a warmer base, with a shawl.',
    },
    seasons: { summer: 0, monsoon: 0, festive: 2, winter: 1, spring: 1 },
    uses: ['Saree', 'Dupatta', 'Lehenga'],
    care: 'Dry clean only. Store wrapped in soft cotton cloth and refold every few months: zari cracks along permanent fold lines.',
    expert: 'Zari comes in three grades. Real zari is fine silver thread gilded with gold. Tested zari is copper wire plated with silver, then a gold tone. Imitation zari is metallised polyester film. Weight and slow, warm tarnish give the real thing away; imitation stays brassy and bright.',
    colors: ['#d6b46a', '#d8a08e', '#c9c9cc', '#7d1d33'],
    render: { weave: 'plain', threads: 18, normal: 0.5, roughness: 0.34, metalness: 0.55, aniso: 0.35, zari: 'tissue', iridescence: 0.25 },
    feel: { slip: 0.5, drag: 0.3, grain: 0.25, crisp: 0.85 },
    sound: { f: 5200, q: 0.9, gain: 0.85, crackle: 0.7 },
  },
  {
    id: 'tussar', name: 'Tussar Silk', local: 'Tussar · Kosa', family: 'silk',
    fibre: 'Wild (non-mulberry) silk from Antheraea moths, reeled by hand in Bihar, Jharkhand and Chhattisgarh',
    construction: 'Plain weave with uneven, slubby yarns and a natural honey-gold colour',
    weight: 'Medium',
    hand: 'Dry, firm and slightly coarse. Rich, but in a deep, low-gloss way.',
    touch: 'Your fingertip reads small ridges where thick and thin yarn alternate. It feels textured and papery-firm, like handmade paper made of silk.',
    scales: { drape: 3, crisp: 3, sheen: 3, breath: 4, warmth: 2 },
    thermal: {
      firstTouch: 'neutral', absorb: 3,
      hot: 'One of the better silks for heat. The porous, uneven yarn lets air through.',
      humid: 'Wearable, but it wrinkles and can water-spot. Choose darker shades.',
      mild: 'Excellent. Structured enough for office sarees, festive enough for pujas.',
      cold: 'Adds some warmth as a layer, but it is not a winter fabric on its own.',
    },
    seasons: { summer: 1, monsoon: 1, festive: 2, winter: 1, spring: 2 },
    uses: ['Saree', 'Kameez', 'Dupatta'],
    care: 'Dry clean for the first wash. After that, gentle cold hand-wash. Never wring.',
    expert: 'Slubs are the fingerprint of hand-reeled wild cocoons. A “tussar” with perfectly even yarns is almost always a blend or a power-loom imitation.',
    colors: ['#c8a46a', '#9c4a26', '#2d4b35', '#e6d3ab'],
    render: { weave: 'slub', threads: 15, normal: 0.5, roughness: 0.55, sheen: 0.2, aniso: 0.3, zari: 'border-thin', mottle: 0.12 },
    feel: { slip: 0.45, drag: 0.4, grain: 0.55, crisp: 0.45 },
    sound: { f: 3000, q: 1.0, gain: 0.55, crackle: 0.25 },
  },
  {
    id: 'banarasi', name: 'Banarasi Brocade', local: 'Banarasi · Kimkhwab · Jamawar', family: 'silk',
    fibre: 'Silk ground with supplementary zari and silk weft',
    construction: 'Brocade from Varanasi (GI-tagged). Motifs like buti, kalga (paisley) and jaal are woven in, not embroidered',
    weight: 'Heavy',
    hand: 'Structured and weighty. Cool raised motifs sit on a smooth ground.',
    touch: 'Running your finger across, you feel relief: the zari motifs stand slightly proud and feel cooler and harder than the silk between them. Turn it over and you meet the floats of the weft.',
    scales: { drape: 2, crisp: 3, sheen: 4, breath: 2, warmth: 3 },
    thermal: {
      firstTouch: 'cool', absorb: 2,
      hot: 'Heavy for a daytime summer wedding. The zari areas do not breathe at all.',
      humid: 'Avoid in monsoon. Humidity tarnishes zari and can mark the silk.',
      mild: 'The wedding fabric. Its weight makes pleats fall in clean columns.',
      cold: 'Its weight and density help, especially as a lehenga or a heavy dupatta.',
    },
    seasons: { summer: 0, monsoon: 0, festive: 2, winter: 2, spring: 1 },
    uses: ['Saree', 'Lehenga', 'Dupatta'],
    care: 'Dry clean only. Air it once a year, wrap it in muslin, and never spray perfume directly on the zari.',
    expert: 'Ask for the Handloom Mark or the GI tag. On handwoven pieces, small irregularities in motif spacing are the signature of the hand, not a flaw. Pakistan’s Jamawar comes from the same family of woven-pattern cloth.',
    colors: ['#6e1424', '#1c2f78', '#0f5a43', '#b4361f'],
    render: { weave: 'satin', threads: 20, normal: 0.4, roughness: 0.3, sheen: 0.25, aniso: 0.6, zari: 'brocade' },
    feel: { slip: 0.5, drag: 0.45, grain: 0.35, crisp: 0.5 },
    sound: { f: 2200, q: 1.1, gain: 0.45, crackle: 0.35 },
  },
  {
    id: 'satin', name: 'Satin', local: 'Satin · Charmeuse', family: 'silk',
    fibre: 'Silk or, far more often in the market, polyester',
    construction: 'Satin weave: long floating yarns make a mirror-smooth face and a dull back',
    weight: 'Light',
    hand: 'Slippery, cold and liquid.',
    touch: 'Almost no friction. Your finger skates, and the cloth pours away from the touch instead of gathering under it. The first contact feels distinctly cold.',
    scales: { drape: 4, crisp: 1, sheen: 5, breath: 1, warmth: 2 },
    thermal: {
      firstTouch: 'cool', absorb: 1,
      hot: 'Polyester satin traps sweat against the skin. It looks cool but wears hot.',
      humid: 'Clings and shows every damp patch.',
      mild: 'Good for evening kameez and as a slippery lining under net or organza.',
      cold: 'Feels cold to put on and offers little insulation.',
    },
    seasons: { summer: 0, monsoon: 0, festive: 2, winter: 1, spring: 1 },
    uses: ['Kameez', 'Saree', 'Lining'],
    care: 'Hand-wash cold. Iron on low, on the reverse. Keep away from rough surfaces.',
    expert: 'Satin is a weave, not a fibre. The long floats that make it shine also snag easily, so watch bangles, rings and sequinned bags.',
    colors: ['#d9c3a0', '#5a1530', '#18161a', '#3d5f8a'],
    render: { weave: 'satin', threads: 22, normal: 0.25, roughness: 0.2, aniso: 0.85, clearcoat: 0.15 },
    feel: { slip: 1, drag: 0.05, grain: 0, crisp: 0.05 },
    sound: { f: 1800, q: 1.6, gain: 0.25, crackle: 0 },
  },

  // ───────────────────────────── SHEERS ─────────────────────────────
  {
    id: 'chiffon', name: 'Chiffon', local: 'Shifon', family: 'sheer',
    fibre: 'Silk, or more commonly polyester',
    construction: 'Sheer plain weave from highly twisted yarns',
    weight: 'Feather',
    hand: 'Barely there. Slightly grainy, cool and floaty.',
    touch: 'There is almost nothing to hold. It slips between your fingers with a faint sandpaper grain from the twisted yarn, and the lightest breath lifts it.',
    scales: { drape: 5, crisp: 1, sheen: 2, breath: 4, warmth: 1 },
    thermal: {
      firstTouch: 'cool', absorb: 1,
      hot: 'Looks airy, but polyester chiffon does not absorb sweat. Pure silk chiffon, or a cotton kameez with a chiffon dupatta, is far kinder in heat.',
      humid: 'Dries in minutes and weighs nothing wet. A good monsoon dupatta.',
      mild: 'Perfect for dupattas and flowing sarees.',
      cold: 'Purely decorative. Layer it over something warm.',
    },
    seasons: { summer: 1, monsoon: 2, festive: 2, winter: 0, spring: 2 },
    uses: ['Dupatta', 'Saree', 'Kameez (lined)'],
    care: 'Hand-wash cold, roll in a towel and never wring. Cut edges fray quickly.',
    expert: 'The twist that gives chiffon its bounce also makes cut edges fray. That is why every chiffon dupatta is finished with a rolled hem, lace or a tassel edge.',
    colors: ['#e8a7a5', '#9fd2bd', '#e88a2a', '#f3ece0'],
    render: { weave: 'crepe', threads: 26, normal: 0.35, roughness: 0.65, sheen: 0.25, opacity: 0.42 },
    feel: { slip: 0.7, drag: 0.15, grain: 0.2, crisp: 0.05 },
    sound: { f: 3800, q: 0.8, gain: 0.2, crackle: 0 },
  },
  {
    id: 'georgette', name: 'Georgette', local: 'Georgette', family: 'sheer',
    fibre: 'Silk, or more commonly polyester',
    construction: 'Crepe weave from alternating S- and Z-twisted yarns. Heavier and less sheer than chiffon',
    weight: 'Light',
    hand: 'Dry, pebbly and springy.',
    touch: 'A matte, faintly gritty surface under the fingertip. It bounces back when crushed instead of creasing, and it falls in soft, swinging folds.',
    scales: { drape: 4, crisp: 2, sheen: 1, breath: 3, warmth: 2 },
    thermal: {
      firstTouch: 'neutral', absorb: 2,
      hot: 'Fine for evenings. In midday heat a polyester georgette can feel sticky.',
      humid: 'The monsoon workhorse. It barely creases, dries fast and hides damp patches.',
      mild: 'The everyday saree and anarkali fabric.',
      cold: 'Light. Needs a shawl or a velvet jacket after dark.',
    },
    seasons: { summer: 1, monsoon: 2, festive: 2, winter: 1, spring: 2 },
    uses: ['Saree', 'Kameez', 'Dupatta', 'Lehenga'],
    care: 'Gentle hand-wash. Hang to dry. Low iron or steam.',
    expert: 'Alternating S- and Z-twist yarns pull the surface into a micro-pebble. That texture is why georgette hides creases and survives an entire wedding day.',
    colors: ['#6b7a2a', '#b81f6e', '#1d2a4f', '#e3c4a8'],
    render: { weave: 'crepe', threads: 20, normal: 0.6, roughness: 0.82, opacity: 0.75 },
    feel: { slip: 0.45, drag: 0.35, grain: 0.35, crisp: 0.15 },
    sound: { f: 3200, q: 0.9, gain: 0.25, crackle: 0.05 },
  },
  {
    id: 'organza', name: 'Organza', local: 'Organza', family: 'sheer',
    fibre: 'Silk, nylon or polyester filament',
    construction: 'Sheer, dense plain weave of tightly twisted filament yarns',
    weight: 'Feather',
    hand: 'Crisp, wiry and papery. Rustles loudly.',
    touch: 'It resists your finger like a fine paper sail. It holds the shape you press into it and crackles as it moves. The edges can feel scratchy on bare skin.',
    scales: { drape: 1, crisp: 5, sheen: 3, breath: 3, warmth: 1 },
    thermal: {
      firstTouch: 'cool', absorb: 1,
      hot: 'Airy as an overlay, scratchy as a base layer. Keep it off sweaty skin.',
      humid: 'Holds its shape without going limp, especially nylon organza.',
      mild: 'Lovely for dupattas, sleeves and saree overlays that catch light.',
      cold: 'Gives no warmth at all.',
    },
    seasons: { summer: 1, monsoon: 1, festive: 2, winter: 0, spring: 2 },
    uses: ['Dupatta', 'Saree', 'Sleeves & overlays'],
    care: 'Dry clean or very gentle cold wash. Press with a cool iron through cloth.',
    expert: 'Organza is stiff because of twist and density, not starch, so it stays crisp after washing. Woven with different-coloured warp and weft, it becomes “shot” organza that flashes two colours as it moves.',
    colors: ['#f1e9da', '#b9a3d6', '#b9d39a', '#e6b0a1'],
    render: { weave: 'plain', threads: 30, normal: 0.3, roughness: 0.32, opacity: 0.38, iridescence: 0.55, sheen: 0.2 },
    feel: { slip: 0.6, drag: 0.2, grain: 0.15, crisp: 1 },
    sound: { f: 6000, q: 0.7, gain: 1, crackle: 0.8 },
  },
  {
    id: 'chanderi', name: 'Chanderi', local: 'Chanderi', family: 'sheer',
    fibre: 'Silk-cotton (silk warp, cotton weft), pure cotton or pure silk',
    construction: 'Sheer, lightweight handloom from Chanderi, Madhya Pradesh (GI-tagged), often scattered with zari coin butis',
    weight: 'Light',
    hand: 'Light, smooth and gently crisp. Feels cool.',
    touch: 'Smoother than cotton, crisper than silk. A clean, cool hand with tiny raised zari coins you can feel as you pass over them.',
    scales: { drape: 3, crisp: 3, sheen: 3, breath: 4, warmth: 1 },
    thermal: {
      firstTouch: 'cool', absorb: 3,
      hot: 'One of the best festive-summer fabrics: dressy without the weight.',
      humid: 'Comfortable, but pale shades may need a slip.',
      mild: 'Elegant for daytime functions and office wear.',
      cold: 'Too thin to stand alone. Layer it.',
    },
    seasons: { summer: 2, monsoon: 1, festive: 2, winter: 0, spring: 2 },
    uses: ['Saree', 'Kameez', 'Dupatta'],
    care: 'Dry clean for the first wash, then gentle hand-wash. Iron while slightly damp.',
    expert: 'Traditional Chanderi uses silk that has not been degummed in the warp. The gum keeps the yarn stiff and glassy, which is where the fabric’s famous crisp, see-through sheen comes from.',
    colors: ['#ece2c9', '#e2b23a', '#2c7676', '#d77d8f'],
    render: { weave: 'plain', threads: 22, normal: 0.3, roughness: 0.42, sheen: 0.25, opacity: 0.68, zari: 'coins', aniso: 0.25 },
    feel: { slip: 0.6, drag: 0.25, grain: 0.15, crisp: 0.5 },
    sound: { f: 4200, q: 1.0, gain: 0.5, crackle: 0.3 },
  },
  {
    id: 'net', name: 'Net', local: 'Net · Jaali', family: 'sheer',
    fibre: 'Nylon or polyester (occasionally silk or cotton)',
    construction: 'Open mesh made by knitting or bobbinet machines, not weaving, so it does not fray',
    weight: 'Feather',
    hand: 'Airy, springy and slightly scratchy.',
    touch: 'You feel the mesh, a fine grid that gently scratches, more than any surface. It is springy, holds volume, and its cut edges prickle.',
    scales: { drape: 3, crisp: 3, sheen: 1, breath: 5, warmth: 0 },
    thermal: {
      firstTouch: 'neutral', absorb: 0,
      hot: 'Air passes freely through the holes, but synthetic net itches on sweaty skin. Always line it.',
      humid: 'Unaffected by damp and dries instantly.',
      mild: 'The canvas for heavily embroidered lehengas and dupattas.',
      cold: 'Gives no warmth. Layer underneath.',
    },
    seasons: { summer: 1, monsoon: 1, festive: 2, winter: 0, spring: 1 },
    uses: ['Dupatta', 'Lehenga', 'Sleeves'],
    care: 'Hand-wash cold. Never iron directly. Steam from a distance.',
    expert: 'Because net is a looped mesh, it can carry heavy embroidery without unravelling. The cost is that cut mesh edges itch, so a soft lining is non-negotiable.',
    colors: ['#f1b39a', '#9a1f3f', '#b7b7bf', '#1a1a1d'],
    render: { weave: 'net', threads: 9, normal: 0.6, roughness: 0.55, opacity: 1, alphaTest: 0.5 },
    feel: { slip: 0.35, drag: 0.4, grain: 0.45, crisp: 0.55 },
    sound: { f: 4800, q: 0.8, gain: 0.35, crackle: 0.2 },
  },
  {
    id: 'crepe', name: 'Crepe', local: 'Crepe · Moss crepe', family: 'sheer',
    fibre: 'Silk, viscose or polyester',
    construction: 'Crinkled, pebbly surface made with high-twist yarns or embossing. Opaque',
    weight: 'Medium',
    hand: 'Matte, grainy and heavy-fluid.',
    touch: 'A fine pebble texture with a dry, matte feel. It has more weight than georgette, so it pulls down into long, quiet folds.',
    scales: { drape: 4, crisp: 1, sheen: 1, breath: 3, warmth: 2 },
    thermal: {
      firstTouch: 'neutral', absorb: 2,
      hot: 'Wearable, but heavier crepes feel warm by afternoon.',
      humid: 'Resists wrinkles and shows little sweat.',
      mild: 'Excellent for office kurtas and printed sarees.',
      cold: 'Fine with a layer underneath.',
    },
    seasons: { summer: 1, monsoon: 2, festive: 2, winter: 1, spring: 2 },
    uses: ['Kameez', 'Saree', 'Salwar'],
    care: 'Gentle wash. Expect a little shrinkage in viscose crepe. Steam rather than press.',
    expert: 'Crepe’s matte face scatters light in every direction. That is why prints on crepe look softer and richer than the same print on satin.',
    colors: ['#1f4a3a', '#c99a2e', '#5b2747', '#e4d6c3'],
    render: { weave: 'crepe', threads: 16, normal: 0.85, roughness: 0.88 },
    feel: { slip: 0.35, drag: 0.4, grain: 0.3, crisp: 0.1 },
    sound: { f: 2400, q: 0.9, gain: 0.15, crackle: 0 },
  },

  // ───────────────────────────── COTTONS & BAST ─────────────────────────────
  {
    id: 'lawn', name: 'Lawn', local: 'Lawn', family: 'cotton',
    fibre: 'Fine combed cotton',
    construction: 'Plain weave with a high thread count, usually printed. The base of Pakistani summer three-piece suits',
    weight: 'Light',
    hand: 'Soft-crisp, smooth and cool.',
    touch: 'A clean, smooth surface with a whisper of crispness. Your fingertip feels the print as nothing: the colour sits in the fibre, not on top of it.',
    scales: { drape: 3, crisp: 2, sheen: 1, breath: 5, warmth: 1 },
    thermal: {
      firstTouch: 'cool', absorb: 5,
      hot: 'The gold standard for dry heat. It soaks up sweat and lets it evaporate, so the cloth itself cools you.',
      humid: 'Comfortable, but slow to dry and it creases.',
      mild: 'Pleasant every day.',
      cold: 'Too thin. Switch to khaddar, karandi or wool blends.',
    },
    seasons: { summer: 2, monsoon: 1, festive: 1, winter: 0, spring: 2 },
    uses: ['Kameez', 'Salwar', 'Dupatta'],
    care: 'Machine wash cold, inside out, with dark colours separate. Iron while damp.',
    expert: 'Good lawn feels smooth, not starchy. A heavy starch finish that vanishes after the first wash, leaving a limp, see-through cloth, is the classic sign of low-count lawn.',
    colors: ['#f3efe6', '#a9cbe3', '#efe08a', '#efb6b9'],
    render: { weave: 'plain', threads: 28, normal: 0.3, roughness: 0.86, print: 'block' },
    feel: { slip: 0.5, drag: 0.35, grain: 0.1, crisp: 0.3 },
    sound: { f: 3400, q: 1.0, gain: 0.25, crackle: 0.05 },
  },
  {
    id: 'mulmul', name: 'Mulmul', local: 'Mulmul · Malmal (muslin)', family: 'cotton',
    fibre: 'Fine, soft cotton',
    construction: 'Loose, open plain weave. The everyday descendant of the legendary Dhaka muslin',
    weight: 'Feather',
    hand: 'Cloud-soft, airy and slightly crinkled.',
    touch: 'Feather-light and pillowy. Pinch it and you mostly feel air. It gets softer with every wash.',
    scales: { drape: 4, crisp: 1, sheen: 0, breath: 5, warmth: 1 },
    thermal: {
      firstTouch: 'neutral', absorb: 5,
      hot: 'Built for 45 °C. Air moves straight through the open weave and it dries in minutes.',
      humid: 'Very good: absorbent and quick-drying.',
      mild: 'Comfortable, if casual.',
      cold: 'No insulation.',
    },
    seasons: { summer: 2, monsoon: 2, festive: 0, winter: 0, spring: 1 },
    uses: ['Kameez', 'Dupatta', 'Saree'],
    care: 'Gentle machine or hand wash. Dry in shade so colours stay soft.',
    expert: 'Hold mulmul up to the light and you see the gaps. That openness is its air-conditioning. Pale mulmul needs a slip; deep colours usually do not.',
    colors: ['#f5f2ea', '#cfe0ea', '#f3cbb2', '#d7e3c4'],
    render: { weave: 'plain', threads: 22, normal: 0.55, roughness: 0.95, opacity: 0.84, mottle: 0.05 },
    feel: { slip: 0.4, drag: 0.35, grain: 0.15, crisp: 0.05 },
    sound: { f: 2800, q: 0.9, gain: 0.12, crackle: 0 },
  },
  {
    id: 'cambric', name: 'Cambric', local: 'Cambric cotton', family: 'cotton',
    fibre: 'Fine cotton',
    construction: 'Dense, closely woven plain weave, lightly calendered for a soft gloss',
    weight: 'Light',
    hand: 'Smooth, firm and crisp.',
    touch: 'Tighter and firmer than lawn. A smooth, slightly glazed face that feels clean and cool, and it holds a sharp crease.',
    scales: { drape: 2, crisp: 3, sheen: 2, breath: 4, warmth: 2 },
    thermal: {
      firstTouch: 'cool', absorb: 4,
      hot: 'Very good, and opaque enough to wear without a lining.',
      humid: 'Fine, but it creases.',
      mild: 'An office-suit favourite.',
      cold: 'Not enough on its own.',
    },
    seasons: { summer: 2, monsoon: 1, festive: 1, winter: 0, spring: 2 },
    uses: ['Kameez', 'Salwar'],
    care: 'Machine wash cold. Iron hot while slightly damp for a crisp finish.',
    expert: 'The gloss comes from calendering: pressing the cloth between heated rollers. It softens after a few washes, so judge the cloth underneath, not the shine.',
    colors: ['#8fb8d8', '#a8d5c2', '#e98b78', '#f1e7d0'],
    render: { weave: 'plain', threads: 30, normal: 0.25, roughness: 0.7, sheen: 0.1 },
    feel: { slip: 0.55, drag: 0.3, grain: 0.08, crisp: 0.4 },
    sound: { f: 3000, q: 1.1, gain: 0.3, crackle: 0.05 },
  },
  {
    id: 'khadi', name: 'Khadi', local: 'Khadi · Khaddar', family: 'cotton',
    fibre: 'Hand-spun cotton (also silk and wool khadi)',
    construction: 'Hand-spun, hand-woven. In Pakistan, “khaddar” means heavier hand-loom cotton for winter suits',
    weight: 'Medium',
    hand: 'Dry, nubby and honest.',
    touch: 'Irregular slubs run under your fingertip in both directions, with a faint fuzz. It has a dry, matte grip, never slippery, and softens noticeably with washing.',
    scales: { drape: 2, crisp: 3, sheen: 0, breath: 5, warmth: 3 },
    thermal: {
      firstTouch: 'neutral', absorb: 5,
      hot: 'Famously cool. Uneven hand-spun yarn leaves air channels through the cloth.',
      humid: 'Very absorbent but slow to dry. Expect creases.',
      mild: 'Comfortable all day.',
      cold: 'Heavier khaddar is a true winter cloth. “Cool in summer, warm in winter” is real: hand-spun yarn traps air.',
    },
    seasons: { summer: 2, monsoon: 1, festive: 1, winter: 2, spring: 2 },
    uses: ['Kameez', 'Salwar', 'Saree', 'Jacket'],
    care: 'Soak dark colours in salt water before the first wash. Wash cold and dry inside out.',
    expert: 'Genuine khadi shows irregular slubs in both warp and weft, with slight width variation. In India, look for the Khadi Mark issued by KVIC.',
    colors: ['#d9ceb6', '#2b3d66', '#8e3b2c', '#5c6b3c'],
    render: { weave: 'slub', threads: 14, normal: 0.6, roughness: 0.96, mottle: 0.07, fuzz: { layers: 6, length: 0.006, density: 0.18 } },
    feel: { slip: 0.25, drag: 0.55, grain: 0.75, crisp: 0.35 },
    sound: { f: 2000, q: 0.8, gain: 0.3, crackle: 0.1 },
  },
  {
    id: 'linen', name: 'Linen', local: 'Linen · Flax', family: 'cotton',
    fibre: 'Flax bast fibre',
    construction: 'Plain weave with natural slubs',
    weight: 'Medium',
    hand: 'Cool, dry and crisp. Creases freely.',
    touch: 'Noticeably cool at first touch, with a dry, slightly waxy smoothness interrupted by slubs. Crush it in your hand and it keeps the memory.',
    scales: { drape: 2, crisp: 4, sheen: 1, breath: 5, warmth: 1 },
    thermal: {
      firstTouch: 'cool', absorb: 4,
      hot: 'Excellent. Flax conducts heat away from the skin and dries fast.',
      humid: 'Very good. It absorbs moisture and releases it quickly.',
      mild: 'A breezy, relaxed-luxury suit.',
      cold: 'Too cool for winter.',
    },
    seasons: { summer: 2, monsoon: 2, festive: 0, winter: 0, spring: 2 },
    uses: ['Kameez', 'Saree', 'Salwar'],
    care: 'Machine wash gentle. Iron while damp. Embrace a few creases.',
    expert: 'Creases are part of the deal. A linen that never creases has usually been blended or resin-treated, and has lost some of its breathability along the way.',
    colors: ['#cbbfa6', '#6f7247', '#9caf95', '#e7e1d3'],
    render: { weave: 'slub', threads: 16, normal: 0.55, roughness: 0.8, sheen: 0.12, mottle: 0.06 },
    feel: { slip: 0.4, drag: 0.4, grain: 0.55, crisp: 0.65 },
    sound: { f: 2600, q: 1.0, gain: 0.4, crackle: 0.15 },
  },
  {
    id: 'rayon', name: 'Rayon', local: 'Rayon · Viscose', family: 'cotton',
    fibre: 'Regenerated cellulose from wood pulp',
    construction: 'Usually plain weave, often printed. The most common everyday kurti fabric',
    weight: 'Medium',
    hand: 'Soft, cool and slinky. It pours.',
    touch: 'Soft and cool with a gentle slip, somewhere between cotton and silk. It feels heavy for how thin it is and swings with the body.',
    scales: { drape: 5, crisp: 0, sheen: 2, breath: 4, warmth: 1 },
    thermal: {
      firstTouch: 'cool', absorb: 4,
      hot: 'Comfortable and absorbent, and it feels cool on the skin.',
      humid: 'Clings when damp and dries slowly.',
      mild: 'Fine for everyday wear.',
      cold: 'Too thin.',
    },
    seasons: { summer: 2, monsoon: 1, festive: 1, winter: 0, spring: 2 },
    uses: ['Kameez', 'Palazzo', 'Dupatta'],
    care: 'Cold, gentle wash. Never wring: rayon loses much of its strength when wet. Allow for shrinkage when tailoring.',
    expert: 'Rayon is plant-based but man-made, which is why it breathes like cotton yet drapes like silk. Its weakness is wet strength, so treat it gently in the wash.',
    colors: ['#b65a3b', '#1d1c1f', '#1f6f72', '#e9c46a'],
    render: { weave: 'plain', threads: 24, normal: 0.25, roughness: 0.6, sheen: 0.22, aniso: 0.2 },
    feel: { slip: 0.7, drag: 0.2, grain: 0.05, crisp: 0 },
    sound: { f: 2000, q: 1.2, gain: 0.15, crackle: 0 },
  },

  // ───────────────────────────── PILE & WOOL ─────────────────────────────
  {
    id: 'velvet', name: 'Velvet', local: 'Makhmal', family: 'warm',
    fibre: 'Silk, viscose or polyester pile on a woven base',
    construction: 'A dense, short cut pile stands up from the base cloth',
    weight: 'Heavy',
    hand: 'Plush, warm and directional.',
    touch: 'Stroke one way and it is liquid-smooth. Stroke against the nap and the pile resists, darkens and keeps the mark of your finger. It warms the instant you touch it.',
    scales: { drape: 3, crisp: 1, sheen: 4, breath: 1, warmth: 5 },
    thermal: {
      firstTouch: 'warm', absorb: 2,
      hot: 'Avoid. The pile traps a blanket of still air against you.',
      humid: 'The pile crushes and holds moisture.',
      mild: 'Fine for evenings, especially as a jacket or shawl.',
      cold: 'The classic winter-wedding fabric. Rich, warm and photogenic.',
    },
    seasons: { summer: 0, monsoon: 0, festive: 1, winter: 2, spring: 0 },
    uses: ['Kameez', 'Shawl', 'Lehenga'],
    care: 'Dry clean. Never iron the face; steam from the reverse. Hang it, do not fold it.',
    expert: 'Brush up against the nap and the colour deepens. Tailors cut every panel with the nap running the same way; if they do not, each panel reads as a different shade.',
    colors: ['#1d3cb8', '#12402e', '#5e0f22', '#121014'],
    render: { weave: 'pile', threads: 40, normal: 0.3, roughness: 0.92, sheen: 1, sheenRough: 0.3, fuzz: { layers: 14, length: 0.012, density: 0.9 }, crush: true },
    feel: { slip: 0.15, drag: 0.85, grain: 0.1, crisp: 0 },
    sound: { f: 700, q: 0.6, gain: 0.22, crackle: 0 },
  },
  {
    id: 'pashmina', name: 'Pashmina', local: 'Pashm', family: 'warm',
    fibre: 'Fine undercoat fibre of the Changthangi goat of Ladakh',
    construction: 'Hand-spun and handwoven in Kashmir (GI-tagged), usually in a fine twill',
    weight: 'Light',
    hand: 'Buttery, weightless warmth.',
    touch: 'Soft enough that you notice the warmth before the texture. A faint halo of fibre rises from the surface; it feels matte, dry and warm almost immediately.',
    scales: { drape: 4, crisp: 0, sheen: 1, breath: 3, warmth: 5 },
    thermal: {
      firstTouch: 'warm', absorb: 3,
      hot: 'No.',
      humid: 'No. Damp wool smells and felts.',
      mild: 'A light shawl for cool evenings.',
      cold: 'Unbeatable warmth for its weight. The fine fibres trap still air in a light, breathable layer.',
    },
    seasons: { summer: 0, monsoon: 0, festive: 1, winter: 2, spring: 1 },
    uses: ['Shawl', 'Dupatta', 'Stole'],
    care: 'Dry clean, or hand-wash cold with wool shampoo and dry flat. Store with neem leaves or cedar.',
    expert: 'Genuine pashmina fibre is extraordinarily fine (around 12–16 microns). A “pashmina” that is shiny and slippery is almost always blended with viscose or silk.',
    colors: ['#b99a73', '#8e8a86', '#3a3a3e', '#ece4d4'],
    render: { weave: 'twill', threads: 30, normal: 0.22, roughness: 0.95, sheen: 0.7, sheenRough: 0.85, fuzz: { layers: 12, length: 0.02, density: 0.5 }, zari: 'embroidery' },
    feel: { slip: 0.3, drag: 0.6, grain: 0.05, crisp: 0 },
    sound: { f: 650, q: 0.6, gain: 0.2, crackle: 0 },
  },

  // ───────────────────────────── GLAMOUR ─────────────────────────────
  {
    id: 'shimmer', name: 'Shimmer', local: 'Shimmer · Lurex', family: 'glam',
    fibre: 'Polyester or nylon with metallised film yarn (lurex) or a foil finish',
    construction: 'Knit or woven, with flat metallic yarns that act as tiny mirrors',
    weight: 'Light',
    hand: 'Slick to slightly scratchy. Glittering.',
    touch: 'Smooth between the sparkles, with a faint metallic tick when your fingertip meets the film yarns. It feels synthetic-warm after a moment.',
    scales: { drape: 3, crisp: 2, sheen: 5, breath: 1, warmth: 2 },
    thermal: {
      firstTouch: 'neutral', absorb: 0,
      hot: 'Traps heat and sweat. Save it for air-conditioned venues.',
      humid: 'Sticky.',
      mild: 'The party-saree fabric: it photographs beautifully.',
      cold: 'Decorative. Layer it.',
    },
    seasons: { summer: 0, monsoon: 0, festive: 2, winter: 1, spring: 1 },
    uses: ['Saree', 'Dupatta', 'Lehenga'],
    care: 'Hand-wash cold. Iron low and on the reverse: metallic film can melt.',
    expert: 'Shimmer is engineered light. Each flat metallic yarn flashes at one particular angle, so a sea of them twinkles as you move. Think of it as an evening-only fabric.',
    colors: ['#c99083', '#bfc3c9', '#6b1a35', '#2a3f6b'],
    render: { weave: 'plain', threads: 34, normal: 0.2, roughness: 0.32, metalness: 0.45, zari: 'sparkle', iridescence: 0.25 },
    feel: { slip: 0.65, drag: 0.25, grain: 0.3, crisp: 0.4 },
    sound: { f: 4600, q: 1.0, gain: 0.45, crackle: 0.45 },
  },
];

export const byId = Object.fromEntries(FABRICS.map((f) => [f.id, f]));

// ───────── comfort model ─────────
// Ideal "warmth" rating for a given air temperature (°C). Piecewise-linear.
function idealWarmth(t) {
  const pts = [[6, 5], [12, 4], [18, 3], [24, 2], [30, 1], [38, 0.4]];
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, w0] = pts[i - 1], [t1, w1] = pts[i];
      return w0 + ((t - t0) / (t1 - t0)) * (w1 - w0);
    }
  }
  return pts[pts.length - 1][1];
}

export function comfortAt(f, t, humid) {
  const s = f.scales;
  let score = 5 - 1.05 * Math.abs(s.warmth - idealWarmth(t));
  if (t >= 28) {
    const heat = Math.min(1, (t - 26) / 10);
    score -= (5 - s.breath) * 0.35 * heat;          // can air move through it?
    score -= (5 - f.thermal.absorb) * 0.3 * heat;    // can it take up sweat so it evaporates?
  }
  if (humid && t >= 22) score -= (5 - f.thermal.absorb) * 0.22 + (s.drape >= 4 && f.thermal.absorb >= 4 ? 0.3 : 0);
  score = Math.max(0, Math.min(5, Math.round(score * 2) / 2));
  const label = score >= 4 ? 'Ideal' : score >= 3 ? 'Comfortable' : score >= 2 ? 'Wearable with care' : score >= 1 ? 'Uncomfortable' : 'Avoid';
  const bucket = t < 16 ? 'cold' : humid && t >= 24 ? 'humid' : t >= 30 ? 'hot' : 'mild';
  return { score, label, bucket, note: f.thermal[bucket] };
}

// What the first touch feels like. Skin surface is ~33 °C. Below that, the cloth is cooler
// than you; smooth, dense, low-loft cloth pulls heat out of the fingertip fastest and so feels coldest.
export function firstTouchAt(f, t) {
  const k = { cool: 1, neutral: 0.55, warm: 0.15 }[f.thermal.firstTouch];
  const delta = 33 - t; // positive = fabric colder than skin
  const intensity = Math.max(-1, Math.min(1, (delta / 20) * k));
  let words;
  if (delta > 3) words = intensity > 0.55 ? 'cold on first touch' : intensity > 0.25 ? 'cool on first touch' : 'warms to you instantly';
  else if (delta < -3) words = k > 0.7 ? 'feels hot from the air' : 'feels warm, not hot';
  else words = 'skin-neutral';
  return { intensity, words }; // intensity: +1 coldest … −1 hottest
}
