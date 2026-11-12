import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Interactive 3D Systems Architecture Lab (Blender 5.1.2 GLB + Three.js 0.180)
 * Loads precision-beveled multi-part Blender assemblies with:
 * - RoomEnvironment PBR studio illumination + directional shadow rig
 * - Articulated Blender pivots (GPU_Fan_Rotor, Gimbal_Outer/Inner, Approval_Core, AST_Crystal, Token_Ring)
 * - Animated optical data packets along curved splines
 * - Smooth camera preset glides (Overview / Close-Up Core / Top View)
 * - Real-time Dark / Light theme adaptation + offscreen IntersectionObserver pause
 */

const stage = document.getElementById('labStage');
const canvas = document.getElementById('labCanvas');
const modeButtons = document.querySelectorAll('.lab-mode-btn');
const viewButtons = document.querySelectorAll('.lab-view-btn');
const pauseBtn = document.getElementById('labPauseBtn');
const resetBtn = document.getElementById('labResetBtn');
const readoutTag = document.getElementById('labTag');
const readoutTitle = document.getElementById('labTitle');
const readoutDesc = document.getElementById('labDesc');

if (!stage || !canvas) {
  throw new Error('3D Lab stage elements missing');
}

const SCENES = {
  kepler: {
    url: '/assets/models/kepler-core.glb',
    tag: 'BLENDER_CAD_01 // C++20 · DIRECT3D 12 → 11',
    title: 'KeplerBridge Dual-Stage Translation Bench',
    desc: 'Machined testbench assembly: D3D12 sapphire shader banks (left) feed through copper heatpipes & exposed silicon die (center) into a recessed 9-blade D3D11 turbine GPU (right).',
    views: {
      overview: { pos: [0.2, 2.75, 6.4], target: [0, 0.05, 0] },
      closeup: { pos: [0.35, 1.35, 2.65], target: [0, 0.25, 0] },
      top: { pos: [0, 6.2, 0.85], target: [0, 0, 0] },
    },
    packets: [
      { pts: [[-1.68, -0.15, 0.35], [-1.28, 0.14, 0.35], [-0.82, -0.10, 0.25]], color: 0x3b82f6 },
      { pts: [[-1.68, -0.15, -0.35], [-1.28, 0.14, -0.35], [-0.82, -0.10, -0.25]], color: 0x3b82f6 },
      { pts: [[0.82, -0.10, 0.25], [1.22, 0.16, 0.35], [1.58, -0.12, 0.35]], color: 0x10b981 },
      { pts: [[0.82, -0.10, -0.25], [1.22, 0.16, -0.35], [1.58, -0.12, -0.35]], color: 0x10b981 },
    ],
  },
  agentforge: {
    url: '/assets/models/agentforge-core.glb',
    tag: 'BLENDER_CAD_02 // TYPESCRIPT · MCP ORCHESTRATION',
    title: 'AgentForge Multi-Axis Policy Gimbal & MCP Hub',
    desc: 'Stepped octagonal CNC dais supporting a triple-axis approval gimbal & sapphire core, wired to 3 ribbed MCP satellite nodes with optical emitters.',
    views: {
      overview: { pos: [0.4, 2.85, 6.1], target: [0, 0.35, 0] },
      closeup: { pos: [0.5, 1.35, 2.65], target: [0, 0.72, 0] },
      top: { pos: [0, 6.4, 0.9], target: [0, 0.2, 0] },
    },
    packets: [
      { pts: [[1.02, -0.36, -0.59], [1.43, -0.08, -0.83], [1.85, -0.34, -1.07]], color: 0x3b82f6 },
      { pts: [[-1.02, -0.36, -0.59], [-1.43, -0.08, -0.83], [-1.85, -0.34, -1.07]], color: 0x10b981 },
      { pts: [[0, -0.36, 1.18], [0, -0.08, 1.5], [0, -0.34, 1.72]], color: 0x10b981 },
    ],
  },
  notion: {
    url: '/assets/models/blockast-core.glb',
    tag: 'BLENDER_CAD_03 // TYPESCRIPT · ZERO-DEP AST',
    title: 'Notion Block Engine Optical Compiler Bridge',
    desc: 'Left Markdown/HTML wafer rack feeds 3 optical buses through the rotating AST crystal & orbiting syntax tokens into modular Notion output cartridges (right).',
    views: {
      overview: { pos: [0.3, 2.55, 6.2], target: [0, 0.28, 0] },
      closeup: { pos: [0.45, 1.05, 2.75], target: [0, 0.42, 0] },
      top: { pos: [0, 6.2, 0.85], target: [0, 0.2, 0] },
    },
    packets: [
      { pts: [[-1.55, -0.10, 0], [-0.95, 0.12, 0.25], [-0.42, 0.42, 0]], color: 0x3b82f6 },
      { pts: [[-1.55, 0.58, 0], [-0.95, 0.80, -0.25], [-0.42, 0.42, 0]], color: 0x3b82f6 },
      { pts: [[0.42, 0.42, 0], [0.95, 0.12, -0.25], [1.55, -0.10, 0]], color: 0x10b981 },
      { pts: [[0.42, 0.42, 0], [0.95, 0.80, 0.25], [1.55, 0.58, 0]], color: 0x10b981 },
    ],
  },
};

function initLab() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (_) {
    stage.classList.add('no-webgl');
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.95;

  const camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 60);
  camera.position.set(...SCENES.kepler.views.overview.pos);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.10;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(...SCENES.kepler.views.overview.target);

  // Studio 3-point rig complementing RoomEnvironment
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.75);
  keyLight.position.set(4.5, 7.2, 4.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -4.5;
  keyLight.shadow.camera.right = 4.5;
  keyLight.shadow.camera.top = 4.5;
  keyLight.shadow.camera.bottom = -4.5;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.35);
  rimLight.position.set(-5.5, 3.8, -4.5);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
  fillLight.position.set(0, -3.5, 3.5);
  scene.add(fillLight);

  // Studio floor + grid
  const shadowFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.ShadowMaterial({ opacity: 0.28 })
  );
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.y = -0.66;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  let floorGrid = new THREE.GridHelper(16, 32, 0x3b82f6, 0x27272a);
  floorGrid.position.y = -0.655;
  floorGrid.material.transparent = true;
  floorGrid.material.opacity = 0.34;
  scene.add(floorGrid);

  function syncThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    scene.environmentIntensity = isLight ? 1.15 : 0.95;
    shadowFloor.material.opacity = isLight ? 0.14 : 0.32;
    scene.remove(floorGrid);
    floorGrid.geometry.dispose();
    floorGrid.material.dispose();
    floorGrid = new THREE.GridHelper(16, 32, isLight ? 0x2563eb : 0x3b82f6, isLight ? 0xd4d4d8 : 0x27272a);
    floorGrid.position.y = -0.655;
    floorGrid.material.transparent = true;
    floorGrid.material.opacity = isLight ? 0.55 : 0.34;
    scene.add(floorGrid);
  }

  // Load Blender GLB assemblies with caching
  const loader = new GLTFLoader();
  const loadedModels = {};
  const packetGroups = {};
  const animParts = {};

  let activeMode = 'kepler';
  let activeView = 'overview';
  let paused = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  let visible = true;

  // Smooth camera glide target
  let glideActive = false;
  const glidePos = new THREE.Vector3(...SCENES.kepler.views.overview.pos);
  const glideTarget = new THREE.Vector3(...SCENES.kepler.views.overview.target);

  controls.addEventListener('start', () => {
    glideActive = false; // user drag takes ownership immediately
  });

  function buildPacketSystem(mode) {
    const grp = new THREE.Group();
    const list = [];
    const cfg = SCENES[mode];
    cfg.packets.forEach((p, idx) => {
      const curve = new THREE.CatmullRomCurve3(p.pts.map((v) => new THREE.Vector3(...v)));
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 16),
        new THREE.MeshBasicMaterial({ color: p.color })
      );
      grp.add(bead);
      list.push({ curve, bead, offset: idx * 0.27 });
    });
    packetGroups[mode] = { group: grp, list };
    scene.add(grp);
  }

  async function ensureModel(mode) {
    if (loadedModels[mode]) return loadedModels[mode];
    const cfg = SCENES[mode];
    const gltf = await loader.loadAsync(cfg.url);
    const root = gltf.scene;

    const refs = {};
    root.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
      if (['GPU_Fan_Rotor', 'Gimbal_Outer', 'Gimbal_Inner', 'Approval_Core', 'AST_Crystal', 'Token_Ring'].includes(obj.name)) {
        refs[obj.name] = obj;
      }
    });

    loadedModels[mode] = root;
    animParts[mode] = refs;
    buildPacketSystem(mode);
    scene.add(root);
    return root;
  }

  function glideTo(viewName) {
    activeView = viewName;
    const v = SCENES[activeMode].views[viewName] || SCENES[activeMode].views.overview;
    glidePos.set(...v.pos);
    glideTarget.set(...v.target);
    glideActive = !paused;
    if (paused) {
      camera.position.copy(glidePos);
      controls.target.copy(glideTarget);
      controls.update();
    }
    viewButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === viewName)));
  }

  async function applyMode(mode) {
    activeMode = mode;
    const cfg = SCENES[mode];
    if (readoutTag) readoutTag.textContent = cfg.tag;
    if (readoutTitle) readoutTitle.textContent = cfg.title;
    if (readoutDesc) readoutDesc.textContent = cfg.desc;

    modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scene === mode)));

    Object.entries(loadedModels).forEach(([k, m]) => { m.visible = k === mode; });
    Object.entries(packetGroups).forEach(([k, pg]) => { pg.group.visible = k === mode; });

    glideTo('overview');

    try {
      await ensureModel(mode);
      Object.entries(loadedModels).forEach(([k, m]) => { m.visible = k === activeMode; });
      Object.entries(packetGroups).forEach(([k, pg]) => { pg.group.visible = k === activeMode; });
    } catch (err) {
      console.error('GLB load failed:', err);
      stage.classList.add('no-webgl');
    }
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyMode(btn.dataset.scene));
  });

  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => glideTo(btn.dataset.view));
  });

  function syncPauseBtn() {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.textContent = paused ? 'Resume Motion' : 'Pause Motion';
  }
  syncPauseBtn();

  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    syncPauseBtn();
  });

  resetBtn?.addEventListener('click', () => glideTo('overview'));

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();

  const themeObserver = new MutationObserver(syncThemeColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  syncThemeColors();

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.05 }
  );
  io.observe(stage);

  // Load initial scene + preload others quietly in background
  applyMode('kepler').then(() => {
    ensureModel('agentforge').then(() => {
      if (loadedModels.agentforge) loadedModels.agentforge.visible = activeMode === 'agentforge';
      if (packetGroups.agentforge) packetGroups.agentforge.group.visible = activeMode === 'agentforge';
    });
    ensureModel('notion').then(() => {
      if (loadedModels.notion) loadedModels.notion.visible = activeMode === 'notion';
      if (packetGroups.notion) packetGroups.notion.group.visible = activeMode === 'notion';
    });
  });

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (glideActive) {
      camera.position.lerp(glidePos, 0.08);
      controls.target.lerp(glideTarget, 0.08);
      if (camera.position.distanceTo(glidePos) < 0.03) {
        glideActive = false;
      }
    }

    if (!paused) {
      const refs = animParts[activeMode] || {};
      if (activeMode === 'kepler' && refs.GPU_Fan_Rotor) {
        refs.GPU_Fan_Rotor.rotation.y += dt * 4.2; // spin turbine blade rotor around vertical axis
      } else if (activeMode === 'agentforge') {
        if (refs.Gimbal_Outer) refs.Gimbal_Outer.rotation.y += dt * 0.55;
        if (refs.Gimbal_Inner) refs.Gimbal_Inner.rotation.x -= dt * 0.72;
        if (refs.Approval_Core) refs.Approval_Core.rotation.y -= dt * 0.9;
      } else if (activeMode === 'notion') {
        if (refs.AST_Crystal) refs.AST_Crystal.rotation.y += dt * 0.5;
        if (refs.Token_Ring) refs.Token_Ring.rotation.z += dt * 0.42;
      }

      const pg = packetGroups[activeMode];
      if (pg) {
        for (const p of pg.list) {
          const progress = (t * 0.52 + p.offset) % 1;
          p.curve.getPointAt(progress, p.bead.position);
        }
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
  tick();
}

initLab();
