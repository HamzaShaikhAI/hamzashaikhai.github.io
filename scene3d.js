import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Interactive 3D Systems Architecture Lab
 * Built with Three.js 0.180 following 3dviz-pro-max studio PBR lighting principles:
 * - RoomEnvironment + PMREMGenerator as primary specular illumination
 * - Three discrete shaping lights (key, cobalt rim, bottom fill)
 * - Articulated hardware/node representations for KeplerBridge, AgentForge, and Notion Block Engine
 * - Theme-adaptive materials & studio grid for Dark and Light mode
 */

const stage = document.getElementById('labStage');
const canvas = document.getElementById('labCanvas');
const modeButtons = document.querySelectorAll('.lab-mode-btn');
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
    tag: 'ARCHITECTURE_01 // C++20 · DIRECT3D 12 → 11',
    title: 'KeplerBridge Shader & API Translation Core',
    desc: 'Direct3D 12 workload (left) feeds DXIL bytecode through the bounded KeplerBridge translation core (center heatsink & cache die) into a Direct3D 11 Kepler backend (right).',
    cameraPos: [0, 2.35, 6.4],
  },
  agentforge: {
    tag: 'ARCHITECTURE_02 // TYPESCRIPT · MCP ORCHESTRATION',
    title: 'AgentForge Permission-Gated Workflow Ring',
    desc: 'Central human-approval prism shielded inside dual gyroscopic policy rings routes deterministic calls from AI agents to isolated MCP service nodes.',
    cameraPos: [0, 2.6, 6.2],
  },
  notion: {
    tag: 'ARCHITECTURE_03 // TYPESCRIPT · ZERO-DEP AST',
    title: 'Notion Block Engine Bidirectional Lattice',
    desc: 'Markdown and HTML input layers converge into an octagonal Block AST normalizer crystal before serializing cleanly to Notion-compatible JSON blocks.',
    cameraPos: [0.4, 2.2, 6.3],
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
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(40, stage.clientWidth / stage.clientHeight, 0.1, 60);
  camera.position.set(...SCENES.kepler.cameraPos);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false; // preserve smooth page scroll
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(0, 0.35, 0);

  // Discrete shaping lights complementing RoomEnvironment
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(4.5, 6.5, 4.0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.4);
  rimLight.position.set(-5.0, 3.0, -4.0);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
  fillLight.position.set(0, -3.5, 3.0);
  scene.add(fillLight);

  // Subtle architectural studio floor grid
  let floorGrid = new THREE.GridHelper(14, 28, 0x3b82f6, 0x27272a);
  floorGrid.position.y = -0.85;
  floorGrid.material.transparent = true;
  floorGrid.material.opacity = 0.36;
  scene.add(floorGrid);

  // Shared PBR material palette (updated on theme change)
  const mats = {
    metalDark: new THREE.MeshStandardMaterial({ color: 0x1c1c22, metalness: 0.85, roughness: 0.26 }),
    metalTrim: new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.18 }),
    ceramicBase: new THREE.MeshStandardMaterial({ color: 0x27272f, metalness: 0.18, roughness: 0.62 }),
    glassBlue: new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      metalness: 0.05,
      roughness: 0.12,
      transmission: 0.62,
      thickness: 0.6,
      ior: 1.45,
      transparent: true,
      opacity: 0.88,
    }),
    accentCobalt: new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.2,
    }),
    accentGreen: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.75,
      metalness: 0.3,
      roughness: 0.22,
    }),
    conduit: new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.7, roughness: 0.35 }),
  };

  function syncThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    scene.environmentIntensity = isLight ? 1.05 : 0.85;
    mats.metalDark.color.setHex(isLight ? 0x27272a : 0x1c1c22);
    mats.ceramicBase.color.setHex(isLight ? 0xe4e4e7 : 0x27272f);
    mats.conduit.color.setHex(isLight ? 0xa1a1aa : 0x3f3f46);
    scene.remove(floorGrid);
    floorGrid.geometry.dispose();
    floorGrid.material.dispose();
    floorGrid = new THREE.GridHelper(14, 28, isLight ? 0x2563eb : 0x3b82f6, isLight ? 0xd4d4d8 : 0x27272a);
    floorGrid.position.y = -0.85;
    floorGrid.material.transparent = true;
    floorGrid.material.opacity = isLight ? 0.55 : 0.35;
    scene.add(floorGrid);
  }

  // Helper: curved conduit + moving packet bead
  const packets = [];
  function addConduit(group, points, packetMat) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.032, 10, false);
    const tube = new THREE.Mesh(tubeGeo, mats.conduit);
    group.add(tube);

    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), packetMat);
    group.add(bead);
    packets.push({ curve, bead, offset: Math.random() });
  }

  // ── 1. KeplerBridge Assembly ──
  const keplerGroup = new THREE.Group();
  // Left D3D12 Compute Slab
  const d3d12Base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 1.35), mats.ceramicBase);
  d3d12Base.position.set(-2.35, -0.2, 0);
  d3d12Base.castShadow = true;
  keplerGroup.add(d3d12Base);
  const d3d12Glass = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.62, 0.92), mats.glassBlue);
  d3d12Glass.position.set(-2.35, 0.32, 0);
  keplerGroup.add(d3d12Glass);

  // Center Hero: KeplerBridge Translation Core (machined base + heatsink fins + silicon die)
  const coreChassis = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.32, 1.65), mats.metalDark);
  coreChassis.position.set(0, -0.16, 0);
  coreChassis.castShadow = true;
  keplerGroup.add(coreChassis);
  const coreDie = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.95), mats.accentCobalt);
  coreDie.position.set(0, 0.08, 0);
  keplerGroup.add(coreDie);
  for (let i = -3; i <= 3; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.42, 0.06), mats.metalTrim);
    fin.position.set(0, 0.38, i * 0.19);
    fin.castShadow = true;
    keplerGroup.add(fin);
  }

  // Right D3D11 Kepler GPU Stack
  const d3d11Base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.24, 1.35), mats.metalDark);
  d3d11Base.position.set(2.35, -0.2, 0);
  d3d11Base.castShadow = true;
  keplerGroup.add(d3d11Base);
  const gpuRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.075, 16, 40), mats.metalTrim);
  gpuRing.rotation.x = Math.PI / 2;
  gpuRing.position.set(2.35, 0.18, 0);
  keplerGroup.add(gpuRing);
  const gpuCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.36, 24), mats.accentGreen);
  gpuCore.position.set(2.35, 0.22, 0);
  keplerGroup.add(gpuCore);

  addConduit(keplerGroup, [[-1.78, 0.1, -0.3], [-0.9, 0.32, -0.2], [-0.55, 0.08, -0.1]], mats.accentCobalt);
  addConduit(keplerGroup, [[-1.78, 0.1, 0.3], [-0.9, 0.28, 0.2], [-0.55, 0.08, 0.1]], mats.accentCobalt);
  addConduit(keplerGroup, [[0.55, 0.08, -0.15], [1.25, 0.3, -0.15], [1.78, 0.12, -0.15]], mats.accentGreen);
  addConduit(keplerGroup, [[0.55, 0.08, 0.15], [1.25, 0.26, 0.15], [1.78, 0.12, 0.15]], mats.accentGreen);

  // ── 2. AgentForge Assembly ──
  const agentGroup = new THREE.Group();
  const vaultPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.26, 32), mats.metalDark);
  vaultPedestal.position.set(0, -0.32, 0);
  agentGroup.add(vaultPedestal);

  const approvalPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), mats.glassBlue);
  approvalPrism.position.set(0, 0.55, 0);
  agentGroup.add(approvalPrism);

  const policyRingA = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 16, 48), mats.metalTrim);
  policyRingA.position.set(0, 0.55, 0);
  agentGroup.add(policyRingA);

  const policyRingB = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.035, 16, 48), mats.accentCobalt);
  policyRingB.position.set(0, 0.55, 0);
  policyRingB.rotation.x = Math.PI / 3;
  agentGroup.add(policyRingB);

  const mcpAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  mcpAngles.forEach((ang, idx) => {
    const x = Math.cos(ang) * 2.35;
    const z = Math.sin(ang) * 1.85;
    const nodeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.24, 24), mats.ceramicBase);
    nodeBase.position.set(x, -0.24, z);
    agentGroup.add(nodeBase);
    const nodeBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.34, 20),
      idx === 0 ? mats.accentCobalt : mats.accentGreen
    );
    nodeBeacon.position.set(x, 0.08, z);
    agentGroup.add(nodeBeacon);
    addConduit(agentGroup, [[0, 0.2, 0], [x * 0.5, 0.48, z * 0.5], [x, 0.05, z]], idx === 0 ? mats.accentCobalt : mats.accentGreen);
  });

  // ── 3. Notion Block Engine Assembly ──
  const notionGroup = new THREE.Group();
  const astCrystal = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.95), mats.glassBlue);
  astCrystal.position.set(0, 0.45, 0);
  notionGroup.add(astCrystal);

  const astCore = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.45), mats.accentCobalt);
  astCore.position.set(0, 0.45, 0);
  notionGroup.add(astCore);

  for (let row = 0; row < 3; row++) {
    const leftBlock = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 0.85), mats.ceramicBase);
    leftBlock.position.set(-2.15, -0.05 + row * 0.42, 0);
    notionGroup.add(leftBlock);

    const rightBlock = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 0.85), mats.metalDark);
    rightBlock.position.set(2.15, -0.05 + row * 0.42, 0);
    notionGroup.add(rightBlock);

    addConduit(
      notionGroup,
      [[-1.55, -0.05 + row * 0.42, 0], [-0.85, 0.2 + row * 0.22, 0.25], [-0.45, 0.45, 0]],
      mats.accentCobalt
    );
    addConduit(
      notionGroup,
      [[0.45, 0.45, 0], [0.85, 0.2 + row * 0.22, -0.25], [1.55, -0.05 + row * 0.42, 0]],
      mats.accentGreen
    );
  }

  const rootGroups = { kepler: keplerGroup, agentforge: agentGroup, notion: notionGroup };
  Object.values(rootGroups).forEach((g) => scene.add(g));

  let activeMode = 'kepler';
  let paused = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  let visible = true;

  function applyMode(mode) {
    activeMode = mode;
    Object.entries(rootGroups).forEach(([k, g]) => {
      g.visible = k === mode;
    });
    const meta = SCENES[mode];
    if (readoutTag) readoutTag.textContent = meta.tag;
    if (readoutTitle) readoutTitle.textContent = meta.title;
    if (readoutDesc) readoutDesc.textContent = meta.desc;
    camera.position.set(...meta.cameraPos);
    controls.target.set(0, 0.32, 0);
    controls.update();

    modeButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.scene === mode));
    });
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyMode(btn.dataset.scene));
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

  resetBtn?.addEventListener('click', () => {
    const meta = SCENES[activeMode];
    camera.position.set(...meta.cameraPos);
    controls.target.set(0, 0.32, 0);
    controls.update();
  });

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

  applyMode('kepler');

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!paused) {
      // Subtle meaningful system motion tied to each architecture
      if (activeMode === 'kepler') {
        gpuRing.rotation.z += dt * 1.4;
        coreDie.position.y = 0.08 + Math.sin(t * 2.2) * 0.015;
      } else if (activeMode === 'agentforge') {
        approvalPrism.rotation.y += dt * 0.7;
        policyRingA.rotation.y += dt * 0.45;
        policyRingB.rotation.z -= dt * 0.55;
      } else if (activeMode === 'notion') {
        astCrystal.rotation.y += dt * 0.45;
        astCore.rotation.y -= dt * 0.85;
      }

      for (const p of packets) {
        if (!p.bead.parent?.visible) continue;
        const progress = (t * 0.45 + p.offset) % 1;
        p.curve.getPointAt(progress, p.bead.position);
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
  tick();
}

initLab();
