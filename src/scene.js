import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Cloth, WIDTH, HEIGHT } from './cloth.js';
import { WEIGHTS } from './fabrics.js';
import { weaveTextures, artwork, furTexture, makeCrushCanvas, backdropTexture } from './textures.js';

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch { return false; }
}

export class FabricStage {
  constructor(container, { lowPower = false, reducedMotion = false } = {}) {
    this.container = container;
    this.reducedMotion = reducedMotion;
    this.lowPower = lowPower;
    this.listeners = {};

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x17151a);
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 0.0, 5.0);
    this.camBase = new THREE.Vector3(0, 0, 5.0);

    // Key light follows the pointer a little: sheen and zari visibly respond to your hand.
    const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
    key.position.set(1.8, 2.4, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
    Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 1.8, bottom: -1.8, near: 0.5, far: 10 });
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
    scene.add(key); this.key = key;
    const rim = new THREE.DirectionalLight(0xbcd0ff, 1.1); rim.position.set(-2.5, 1.0, -1.5); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x201a18, 0.35));

    // backdrop wall with a jharokha arch (visible through sheers) — receives the cloth's shadow
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshStandardMaterial({ map: backdropTexture(), roughness: 1 }));
    wall.position.set(0, 0, -0.9); wall.receiveShadow = true; scene.add(wall);

    // brass rod (pallu / pleats) and two pegs (dupatta)
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.28 });
    this.rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, WIDTH + 0.3, 24), brass);
    this.rod.rotation.z = Math.PI / 2; this.rod.position.set(0, HEIGHT / 2 + 0.02, 0); this.rod.castShadow = true;
    scene.add(this.rod);
    this.pegs = new THREE.Group();
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 16), brass);
      p.position.set(s * WIDTH * 0.3, HEIGHT / 2 + 0.03, 0.05); p.castShadow = true; this.pegs.add(p);
    }
    scene.add(this.pegs);

    // cloth
    const nx = lowPower ? 24 : 34, ny = lowPower ? 33 : 46;
    this.cloth = new Cloth(nx, ny);
    this.geometry = this._buildGeometry(nx, ny);
    this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshStandardMaterial());
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.shells = [];
    this.crush = makeCrushCanvas();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(9, 9);
    this.pointerPx = { x: 0, y: 0 };
    this.hover = null;
    this.parallax = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.zoom = 0; this.zoomTarget = 0;
    this.visible = true;

    this._bindPointer();
    this._resize = this._resize.bind(this);
    new ResizeObserver(this._resize).observe(container);
    this._resize();
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(container);
    this.setMode('pallu');
    renderer.setAnimationLoop(() => this._frame());
  }

  on(evt, fn) { (this.listeners[evt] ||= []).push(fn); }
  emit(evt, data) { (this.listeners[evt] || []).forEach((fn) => fn(data)); }

  _buildGeometry(nx, ny) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.cloth.pos, 3).setUsage(THREE.DynamicDrawUsage));
    const uv = new Float32Array(nx * ny * 2);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = (j * nx + i) * 2; uv[k] = i / (nx - 1); uv[k + 1] = 1 - j / (ny - 1);
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const idx = [];
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  setMode(mode) {
    this.mode = mode;
    this.cloth.setMode(mode);
    this.rod.visible = mode !== 'dupatta';
    this.pegs.visible = mode === 'dupatta';
    if (mode === 'pleats') { this.rod.scale.set(1, 0.48, 1); } else { this.rod.scale.set(1, 1, 1); }
  }

  // Loupe: move in to macro distance, where weave, zari and pile become visible.
  setZoom(on) { this.zoomTarget = on ? 1 : 0; }

  reset() {
    this.cloth.resetFlat();
    this.cloth.setMode(this.mode);
    this.crush.clear();
  }

  setFabric(fabric, color) {
    this.fabric = fabric;
    this.cloth.setFabric(fabric, WEIGHTS);
    this._applyMaterial(fabric, color);
  }

  setColor(color) { if (this.fabric) this._applyMaterial(this.fabric, color); }

  _disposeMaterial() {
    const m = this.mesh.material;
    if (m) { if (m.map !== this.crush?.tex) m.map?.dispose(); m.metalnessMap?.dispose(); m.dispose(); }
    for (const s of this.shells) { this.scene.remove(s); s.material.dispose(); }
    this.shells = [];
  }

  _applyMaterial(f, color) {
    this._disposeMaterial();
    const r = f.render;
    const weave = weaveTextures(r);
    const art = artwork(f, color);
    const repeat = r.weave === 'pile' ? 10 : r.weave === 'net' ? 7 : 9;
    const normalMap = weave.normal.clone(); normalMap.needsUpdate = true;
    normalMap.repeat.set(repeat * (WIDTH / HEIGHT) * 1.4, repeat);
    const ns = r.normal ?? 0.4;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: art.map,
      normalMap, normalScale: new THREE.Vector2(ns, ns),
      roughness: r.roughness ?? 0.6,
      metalness: art.metal ? 1 : 0,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    if (art.metal) { mat.metalnessMap = art.metal; mat.roughnessMap = art.metal; mat.metalness = 1; }
    if (r.sheen) {
      mat.sheen = r.sheen;
      mat.sheenRoughness = r.sheenRough ?? 0.5;
      mat.sheenColor = new THREE.Color(color).lerp(new THREE.Color(0xffffff), r.crush ? 0.12 : 0.3);
      if (r.crush) { art.map.dispose(); this.crush.setBase(color); mat.map = this.crush.tex; mat.color.setScalar(0.5); mat.sheenColor = new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.28); }
    }
    if (r.aniso) { mat.anisotropy = r.aniso; mat.anisotropyRotation = Math.PI / 2; }
    if (r.clearcoat) { mat.clearcoat = r.clearcoat; mat.clearcoatRoughness = 0.35; }
    if (r.iridescence) { mat.iridescence = r.iridescence; mat.iridescenceIOR = 1.35; mat.iridescenceThicknessRange = [180, 520]; }
    if (r.opacity && r.opacity < 1) { mat.transparent = true; mat.opacity = r.opacity; mat.depthWrite = false; }
    if (r.weave === 'net') {
      const a = weave.height.clone(); a.needsUpdate = true; a.repeat.copy(normalMap.repeat).multiplyScalar(1.6);
      mat.alphaMap = a; mat.alphaTest = r.alphaTest ?? 0.5;
      normalMap.repeat.copy(a.repeat);
    }
    this.mesh.material = mat;
    this.mesh.castShadow = !(r.opacity && r.opacity < 0.5);

    if (r.fuzz) this._buildShells(r.fuzz, color, r.crush ? this.crush.tex : null);
  }

  // Shell texturing: N copies of the cloth pushed out along the normal; each discards pixels
  // whose strand is shorter than its height. Together they read as pile, fuzz or a wool halo.
  _buildShells(fuzz, color, tintMap = null) {
    const fur = furTexture();
    const base = new THREE.Color(color);
    for (let l = 1; l <= fuzz.layers; l++) {
      const t = l / fuzz.layers;
      const furMap = fur.clone(); furMap.needsUpdate = true;
      const rep = 34 / Math.max(0.2, fuzz.density) * 0.5 + 18;
      furMap.repeat.set(rep * (WIDTH / HEIGHT), rep);
      const m = new THREE.MeshStandardMaterial({
        // with a tint map (velvet) the strands carry the crush trail; otherwise a flat dye
        color: tintMap ? new THREE.Color(0xffffff).multiplyScalar(0.5 + 0.55 * t) : base.clone().multiplyScalar(0.45 + 0.5 * t).lerp(new THREE.Color(0xffffff), t * t * 0.08),
        map: tintMap,
        roughness: 0.85,
        alphaMap: furMap,
        alphaTest: Math.min(0.98, 1 - (1 - t) * fuzz.density - 0.02 + t * 0.15),
        side: THREE.FrontSide,
      });
      const offset = fuzz.length * t;
      m.onBeforeCompile = (s) => {
        s.uniforms.uShell = { value: offset };
        s.vertexShader = s.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uShell;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += objectNormal * uShell + vec3(0.0, -uShell * 0.35, 0.0);');
      };
      m.customProgramCacheKey = () => 'shell';
      const mesh = new THREE.Mesh(this.geometry, m);
      mesh.frustumCulled = false;
      mesh.renderOrder = l;
      this.scene.add(mesh); this.shells.push(mesh);
    }
  }

  _bindPointer() {
    const el = this.renderer.domElement;
    el.style.touchAction = 'none';
    const toNdc = (e) => {
      const r = el.getBoundingClientRect();
      this.pointerPx = { x: e.clientX - r.left, y: e.clientY - r.top, cx: e.clientX, cy: e.clientY };
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    this._lastMove = performance.now();
    el.addEventListener('pointermove', (e) => { toNdc(e); this.pointerInside = true; this._lastMove = performance.now(); });
    el.addEventListener('pointerleave', () => { this.pointerInside = false; this.cloth.finger.active = false; this.cloth.endGrab(); this.emit('hover', null); });
    el.addEventListener('pointerdown', (e) => {
      toNdc(e); this.pointerInside = true;
      el.setPointerCapture(e.pointerId);
      const hit = this._raycast();
      if (hit) {
        this.cloth.startGrab(hit.point, 0.18);
        this.grabDepth = hit.point.z + 0.35; // lift the cloth toward you
        this.emit('grab', true);
      }
    });
    const up = () => { if (this.cloth.grab.active) { this.cloth.endGrab(); this.emit('grab', false); } };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }

  _raycast() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.geometry.computeBoundingSphere();
    const hits = this.raycaster.intersectObject(this.mesh, false);
    return hits[0] || null;
  }

  _rayAtZ(z) {
    const ray = this.raycaster.ray;
    const t = (z - ray.origin.z) / ray.direction.z;
    return ray.origin.clone().addScaledVector(ray.direction, t);
  }

  _resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%'; this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    // fit the full cloth height (plus margin) and width, whichever is tighter
    const fov = this.camera.fov * Math.PI / 180;
    const needH = HEIGHT + 0.7, needW = WIDTH + 0.9;
    const dH = (needH / 2) / Math.tan(fov / 2);
    const dW = (needW / 2) / (Math.tan(fov / 2) * this.camera.aspect);
    this.camBase.z = Math.max(dH, dW);
    this.camera.updateProjectionMatrix();
  }

  _frame() {
    if (!this.visible || document.hidden) return;
    const dt = Math.min(1 / 30, this.clock.getDelta());

    // pointer → fingertip / grab
    const cloth = this.cloth;
    let hit = null;
    if (this.pointerInside) {
      hit = this._raycast();
      if (cloth.grab.active) {
        const p = this._rayAtZ(this.grabDepth);
        cloth.grab.target = [p.x, p.y, p.z];
      } else if (hit) {
        const p = this._rayAtZ(0.16);
        const f = cloth.finger;
        const vx = (p.x - f.x) / Math.max(dt, 1e-3), vy = (p.y - f.y) / Math.max(dt, 1e-3);
        f.vx = f.active ? THREE.MathUtils.lerp(f.vx, vx, 0.5) : 0;
        f.vy = f.active ? THREE.MathUtils.lerp(f.vy, vy, 0.5) : 0;
        f.x = p.x; f.y = p.y; f.z = 0.16; f.r = 0.2; f.active = true;
        if (this.fabric?.render.crush && hit.uv) {
          const speed = Math.hypot(f.vx, f.vy);
          if (speed > 0.03) this.crush.stroke(hit.uv.x, hit.uv.y, Math.min(1, 0.35 + speed * 0.8));
        }
      } else {
        cloth.finger.active = false;
      }
    }
    if (this.fabric?.render.crush && (this._f = (this._f || 0) + 1) % 6 === 0) this.crush.recover(0.02);

    const sub = 2;
    for (let s = 0; s < sub; s++) cloth.step(dt / sub, { wind: this.reducedMotion ? 0.15 : 1, iterations: this.lowPower ? 7 : 9 });
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();

    // camera + light parallax: the light grazes the cloth differently as you move
    const px = this.pointerInside ? this.pointer.x : 0, py = this.pointerInside ? this.pointer.y : 0;
    const k = this.reducedMotion ? 0 : 1;
    this.parallax.lerp(new THREE.Vector2(px, py), 0.06);
    this.zoom += (this.zoomTarget - this.zoom) * (this.reducedMotion ? 1 : 0.06);
    const z = this.zoom;
    // zoomed: the hand pans across the cloth like a loupe; wide: gentle parallax
    const panX = this.parallax.x * (0.25 * k * (1 - z) + 0.55 * z), panY = this.parallax.y * (0.15 * k * (1 - z) + 0.75 * z);
    const dist = THREE.MathUtils.lerp(this.camBase.z, 1.15, z);
    this.camera.position.set(panX, panY + 0.1 * z, dist);
    this.camera.lookAt(panX * z * 0.9, -0.05 * (1 - z) + (panY + 0.1) * z * 0.9, 0);
    this.key.position.set(1.8 + this.parallax.x * 1.6 * k, 2.4 + this.parallax.y * 1.0 * k, 3.2);

    this.emit('hover', hit ? { x: this.pointerPx.cx, y: this.pointerPx.cy, uv: hit.uv, speed: Math.hypot(cloth.finger.vx, cloth.finger.vy), grabbing: cloth.grab.active } : (cloth.grab.active ? { x: this.pointerPx.cx, y: this.pointerPx.cy, grabbing: true, speed: 0 } : null));
    this.renderer.render(this.scene, this.camera);
  }
}
