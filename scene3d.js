import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Interactive 3D Systems Architecture Lab (Blender 5.1.2 GLB + Three.js 0.180)
 * - Supports "All 3 Systems" panoramic view + individual KeplerBridge / AgentForge / Block AST views
 * - Interactive Component Inspector + 3D Raycaster mesh-click picking
 * - Exploded View, Wireframe CAD overlay, Auto-Orbit, Camera Presets, Pause/Reset
 * - Theme-adaptive lighting & studio grid for Dark & Light mode
 */

const stage = document.getElementById('labStage');
const canvas = document.getElementById('labCanvas');
const modeButtons = document.querySelectorAll('.lab-mode-btn');
const viewButtons = document.querySelectorAll('.lab-view-btn');
const explodeBtn = document.getElementById('labExplodeBtn');
const wireBtn = document.getElementById('labWireBtn');
const orbitBtn = document.getElementById('labOrbitBtn');
const lightBtn = document.getElementById('labLightBtn');
const pauseBtn = document.getElementById('labPauseBtn');
const resetBtn = document.getElementById('labResetBtn');
const hoverTip = document.getElementById('labHoverTip');

const readoutTag = document.getElementById('labTag');
const readoutTitle = document.getElementById('labTitle');
const readoutDesc = document.getElementById('labDesc');

const inspBadge = document.getElementById('inspBadge');
const inspRepo = document.getElementById('inspRepo');
const inspTitle = document.getElementById('inspTitle');
const inspSummary = document.getElementById('inspSummary');
const partsListEl = document.getElementById('labPartsList');

if (!stage || !canvas) {
  throw new Error('3D Lab stage elements missing');
}

const SYSTEMS = {
  all: {
    tag: 'BLENDER_CAD_ALL // 3 FLAGSHIP REPOSITORIES',
    badge: '3 BLENDER MODELS · 18 INSPECTABLE PARTS',
    repoUrl: 'https://github.com/HamzaShaikhAI?tab=repositories',
    repoLabel: 'All GitHub Repos ↗',
    title: 'Complete Engineering Portfolio (3D Trio)',
    summary: 'All 3 Blender-modeled assemblies staged side by side: KeplerBridge (left), AgentForge (center), and Notion Block Engine (right). Click any system below or directly on a 3D model to inspect.',
    desc: 'Panoramic view of all 3 repositories. Click a system card on the right—or click any 3D model directly—to zoom in and inspect its internal parts.',
    views: {
      overview: { pos: [0, 5.2, 13.8], target: [0, 0.25, 0] },
      closeup: { pos: [0, 3.1, 8.6], target: [0, 0.3, 0] },
      top: { pos: [0, 14.5, 2.2], target: [0, 0, 0] },
    },
    parts: [
      {
        id: 'jump-kepler',
        name: '01 · KeplerBridge (D3D12 → D3D11)',
        mat: 'C++20 · v0.5.0-rc1 · MIT',
        desc: 'Left assembly: drop-in d3d12.dll proxy running DirectX 12 workloads on NVIDIA Kepler (GT 740 / GK107 / GTX 7xx) GPUs.',
        switchMode: 'kepler',
      },
      {
        id: 'jump-agentforge',
        name: '02 · AgentForge (MCP Runtime)',
        mat: 'TypeScript 5.6 · Node ≥20 · MIT',
        desc: 'Center assembly: local-first AI agent workflow harness with permission gates, human approval checkpoints, and credential vault.',
        switchMode: 'agentforge',
      },
      {
        id: 'jump-notion',
        name: '03 · Notion Block Engine (AST)',
        mat: 'TypeScript 5.0+ · <15 KB · 0 Deps',
        desc: 'Right assembly: zero-dependency bidirectional HTML/Markdown/Clipboard sanitizer and Notion Block AST serializer.',
        switchMode: 'notion',
      },
    ],
  },
  kepler: {
    url: '/assets/models/kepler-core.glb',
    tag: 'BLENDER_CAD_01 // C++20 · DIRECT3D 12 → 11 (GT 740 / KEPLER)',
    badge: '7 COMPONENTS · KEPLERBRIDGE',
    repoUrl: 'https://github.com/HamzaShaikhAI/KeplerBridge',
    repoLabel: 'KeplerBridge Repo ↗',
    title: 'KeplerBridge Dual-Stage Translation Bench',
    summary: 'Drop-in 64-bit d3d12.dll proxy enabling DirectX 12 games on Feature Level 11_0 NVIDIA Kepler GPUs (GeForce GT 740, GTX 760–780, TITAN) without driver edits.',
    desc: 'Select any component in the right panel (or click its 3D mesh) to zoom in and see what happens inside each stage of the DX12→DX11 pipeline.',
    views: {
      overview: { pos: [0.25, 2.75, 6.3], target: [0, 0.05, 0] },
      closeup: { pos: [0.35, 1.35, 2.55], target: [0, 0.25, 0] },
      top: { pos: [0, 6.4, 0.85], target: [0, 0, 0] },
    },
    packets: [
      { pts: [[-1.68, -0.15, 0.35], [-1.28, 0.14, 0.35], [-0.82, -0.10, 0.25]], color: 0x3b82f6 },
      { pts: [[-1.68, -0.15, -0.35], [-1.28, 0.14, -0.35], [-0.82, -0.10, -0.25]], color: 0x3b82f6 },
      { pts: [[0.82, -0.10, 0.25], [1.22, 0.16, 0.35], [1.58, -0.12, 0.35]], color: 0x10b981 },
      { pts: [[0.82, -0.10, -0.25], [1.22, 0.16, -0.35], [1.58, -0.12, -0.35]], color: 0x10b981 },
    ],
    parts: [
      {
        id: 'd3d12-bank',
        name: '1. D3D12 Shader & Command Bank',
        mat: 'Sapphire Glass + Gold PCIe Pins',
        prefixes: ['D3D12_', 'ShaderBank_'],
        cam: { pos: [-2.1, 1.55, 2.6], target: [-2.32, 0.15, 0] },
        desc: 'Intercepts application D3D12CreateDevice, root signatures, command lists, and Shader Model 6.0 DXIL blobs via the drop-in 64-bit d3d12.dll proxy.',
      },
      {
        id: 'dxil-bus',
        name: '2. Dual Optical Bus Conduits',
        mat: 'Sheathed Cable + Brushed Collars',
        prefixes: ['Bus_'],
        cam: { pos: [0, 1.65, 3.8], target: [0, 0, 0] },
        desc: 'Routes captured DXIL shader payloads and resource descriptors from the D3D12 front-end into the translation socket, then forwards translated D3D11 calls out.',
      },
      {
        id: 'coldplate',
        name: '3. CNC Coldplate & Gold LGA Socket',
        mat: 'Anodized Aluminum + Gold Pads',
        prefixes: ['Core_SocketPCB', 'Core_Coldplate', 'Core_DieSubstrate', 'SMD_'],
        cam: { pos: [0.3, 1.25, 2.3], target: [0, -0.05, 0] },
        desc: 'Isolates runtime API interception strictly in user-space next to the game .exe—requiring zero Windows system-file changes and zero NVIDIA driver hacks.',
      },
      {
        id: 'silicon-die',
        name: '4. DXIL → DXBC Silicon Translation Die',
        mat: 'Iridescent Silicon + Glass Shield',
        prefixes: ['Core_SiliconDie', 'Core_TopGlass', 'Core_Standoff', 'Core_TopBolt'],
        cam: { pos: [0.25, 1.45, 2.05], target: [0, 0.25, 0] },
        desc: 'Core compiler stage: decodes Shader Model 6.0 DXIL bitcode into Shader Model 5.0 DXBC bytecode with bounded translation and persistent disk shader caching.',
      },
      {
        id: 'heatsink',
        name: '5. Copper Heatpipes & 11-Fin Heatsink',
        mat: 'Pure Copper + Brushed Aluminum',
        prefixes: ['HeatsinkFin_', 'Heatpipe_'],
        cam: { pos: [0.85, 1.4, 2.35], target: [0, 0.35, 0] },
        desc: 'Represents capability-aware fallback passes, descriptor-heap flattening, and runtime telemetry logged continuously to kepler_bridge.log.',
      },
      {
        id: 'd3d11-gpu',
        name: '6. D3D11 Kepler GPU & 9-Blade Turbine',
        mat: 'Boolean Unibody + Spinning Rotor',
        prefixes: ['GPU_', 'Fan_', 'FanBlade_'],
        cam: { pos: [2.2, 1.55, 2.65], target: [2.32, 0.05, 0] },
        desc: 'Executes the translated graphics pipeline on an optimized Direct3D 11 Feature Level 11_0 immediate context (GK107 GT 740, GK104, GK208) via DXGI swapchains.',
      },
      {
        id: 'plinth',
        name: '7. Optical Testbench Plinth & Ticks',
        mat: 'Anodized Carbon + Calibration Ticks',
        prefixes: ['Testbench_', 'Foot_', 'DeckBolt_', 'Tick_'],
        cam: { pos: [0.25, 2.75, 6.3], target: [0, -0.25, 0] },
        desc: 'Anchors runtime configuration loaded from kepler_bridge.ini (debug toggles, shader cache paths, and per-workload compatibility flags).',
      },
    ],
  },
  agentforge: {
    url: '/assets/models/agentforge-core.glb',
    tag: 'BLENDER_CAD_02 // TYPESCRIPT 5.6 · NODE ≥20 · MCP',
    badge: '6 COMPONENTS · AGENTFORGE',
    repoUrl: 'https://github.com/HamzaShaikhAI/AgentForge',
    repoLabel: 'AgentForge Repo ↗',
    title: 'AgentForge Multi-Axis Policy Gimbal & MCP Hub',
    summary: 'Local-first deterministic execution runtime for Google Antigravity featuring Manager UI, MCP presets, fine-grained permission gates, and credential isolation.',
    desc: 'Select any component on the right (or click directly on the 3D model) to inspect how AgentForge enforces permission boundaries and isolates secrets.',
    views: {
      overview: { pos: [0.4, 2.85, 6.1], target: [0, 0.35, 0] },
      closeup: { pos: [0.55, 1.35, 2.65], target: [0, 0.72, 0] },
      top: { pos: [0, 6.4, 0.9], target: [0, 0.2, 0] },
    },
    packets: [
      { pts: [[1.02, -0.36, -0.59], [1.43, -0.08, -0.83], [1.85, -0.34, -1.07]], color: 0x3b82f6 },
      { pts: [[-1.02, -0.36, -0.59], [-1.43, -0.08, -0.83], [-1.85, -0.34, -1.07]], color: 0x10b981 },
      { pts: [[0, -0.36, 1.18], [0, -0.08, 1.5], [0, -0.34, 1.72]], color: 0x10b981 },
    ],
    parts: [
      {
        id: 'af-dais',
        name: '1. Octagonal Runtime Dais',
        mat: 'Anodized Carbon + Cobalt Bus',
        prefixes: ['AF_Plinth', 'AF_DaisBolt'],
        cam: { pos: [0.6, 1.8, 3.8], target: [0, -0.3, 0] },
        desc: 'Hosts the local-first Node.js (≥20) & TypeScript 5.6 execution engine and local Manager UI dashboard, keeping state and audit logs on the developer machine.',
      },
      {
        id: 'af-yoke',
        name: '2. Support Arch Yoke & Trunnions',
        mat: 'Machined Slate + Brushed Bearings',
        prefixes: ['AF_SupportArch', 'AF_Pillar', 'AF_Trunnion'],
        cam: { pos: [0.3, 1.85, 3.4], target: [0, 0.65, 0] },
        desc: 'Separates Google Antigravity LLM cognitive reasoning (above) from deterministic tool execution & external side effects (below).',
      },
      {
        id: 'af-outer-gimbal',
        name: '3. Outer Policy Enforcement Gimbal',
        mat: 'Brushed Aluminum + 12 Policy Ticks',
        prefixes: ['Gimbal_Outer', 'OuterNotch'],
        cam: { pos: [0.85, 1.55, 2.8], target: [0, 0.72, 0] },
        desc: 'Enforces fine-grained capability rules across Read, Local Write, External Write, Publish, and Destructive actions before any tool runs.',
      },
      {
        id: 'af-inner-gimbal',
        name: '4. Inner Approval Checkpoint Ring',
        mat: 'Emissive Cobalt Policy Ring',
        prefixes: ['Gimbal_Inner'],
        cam: { pos: [-0.85, 1.45, 2.6], target: [0, 0.72, 0] },
        desc: 'Pauses high-risk operations (git push, npm publish, deletions, external posts) at explicit human-in-the-loop approval checkpoints.',
      },
      {
        id: 'af-core',
        name: '5. Sapphire Credential Vault Core',
        mat: 'Transmissive Sapphire + Inner Core',
        prefixes: ['Approval_'],
        cam: { pos: [0.4, 1.25, 2.2], target: [0, 0.72, 0] },
        desc: 'Isolates API keys, OAuth tokens, and service secrets away from LLM prompts, chat transcripts, and source control commits.',
      },
      {
        id: 'af-mcp',
        name: '6. 3 Extensible MCP Satellite Nodes',
        mat: 'Ribbed Aluminum + Optical Domes',
        prefixes: ['MCP_'],
        cam: { pos: [0.4, 2.85, 6.1], target: [0, 0.1, 0] },
        desc: 'Represents preset Model Context Protocol (MCP) servers & native service bridges (GitHub, YouTube, LinkedIn, CLI tools) routed through isolated conduits.',
      },
    ],
  },
  notion: {
    url: '/assets/models/blockast-core.glb',
    tag: 'BLENDER_CAD_03 // TYPESCRIPT 5.0+ · <15 KB · 0 DEPS',
    badge: '5 COMPONENTS · NOTION BLOCK ENGINE',
    repoUrl: 'https://github.com/HamzaShaikhAI/notion-block-engine',
    repoLabel: 'Block Engine Repo ↗',
    title: 'Notion Block Engine Optical Compiler Bridge',
    summary: 'Zero-dependency (<15 KB) bidirectional engine converting dirty Google Docs / MS Word clipboard HTML, GFM Markdown, and semantic HTML into Notion Block ASTs.',
    desc: 'Select any stage on the right (or click its 3D mesh) to see how dirty clipboard markup transforms into clean Notion blocks with zero DOM dependencies.',
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
    parts: [
      {
        id: 'ast-input',
        name: '1. Markdown & Dirty HTML Wafer Rack',
        mat: 'Slate Blades + Sapphire Glass',
        prefixes: ['LeftRail_', 'InputBlade_', 'InputGlass_', 'InputStrip_'],
        cam: { pos: [-2.0, 1.4, 2.7], target: [-2.15, 0.35, 0] },
        desc: 'Ingests GFM Markdown and dirty clipboard HTML from Google Docs (docs-internal-guid spans) or MS Word (mso XML comments) without heavy jsdom overhead.',
      },
      {
        id: 'ast-buses',
        name: '2. Zero-Dep Sanitizer Fiber Buses',
        mat: 'Optical Sheath + Flanged Collars',
        prefixes: ['AST_In_', 'AST_Out_'],
        cam: { pos: [0, 1.6, 3.8], target: [0, 0.3, 0] },
        desc: 'Strips unsafe tags/scripts, unwraps redundant inline spans, and normalizes rich-text annotations in a pure <15 KB TypeScript runtime.',
      },
      {
        id: 'ast-crystal',
        name: '3. Octagonal AST Normalizer Crystal',
        mat: 'Sapphire Crystal + Cobalt Axis',
        prefixes: ['AST_Crystal', 'AST_InnerAxis', 'Bridge'],
        cam: { pos: [0.45, 1.05, 2.45], target: [0, 0.42, 0] },
        desc: 'Core bidirectional intermediate representation (IR): maps parsed document trees into a clean, deterministic Notion-style Block Abstract Syntax Tree.',
      },
      {
        id: 'ast-tokens',
        name: '4. Orbiting Syntax Token Ring',
        mat: 'Brushed Ring + 6 Token Cubes',
        prefixes: ['Token_Ring', 'TokenNode_'],
        cam: { pos: [0.8, 1.3, 2.5], target: [0, 0.42, 0] },
        desc: 'Preserves complex structures bidirectionally—callouts, task checklists, fenced code blocks, nested lists, and tables—without silent data loss.',
      },
      {
        id: 'ast-output',
        name: '5. Notion Block Cartridge Dock',
        mat: 'Anodized Cartridges + Emerald Lock',
        prefixes: ['RightRail_', 'Cartridge_'],
        cam: { pos: [2.0, 1.4, 2.7], target: [2.15, 0.35, 0] },
        desc: 'Serializes validated AST nodes cleanly into official Notion API JSON blocks, clean GFM Markdown, or semantic HTML output.',
      },
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

  const camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 80);
  camera.position.set(...SYSTEMS.kepler.views.overview.pos);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.08;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(...SYSTEMS.kepler.views.overview.target);

  // Studio 3-point rig
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.75);
  keyLight.position.set(5, 8.5, 5.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -7;
  keyLight.shadow.bias = -0.0004;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.35);
  rimLight.position.set(-6.5, 4.2, -5.0);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
  fillLight.position.set(0, -3.5, 4.0);
  scene.add(fillLight);

  const shadowFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 24),
    new THREE.ShadowMaterial({ opacity: 0.26 })
  );
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.y = -0.66;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  let floorGrid = new THREE.GridHelper(28, 56, 0x3b82f6, 0x27272a);
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
    floorGrid = new THREE.GridHelper(28, 56, isLight ? 0x2563eb : 0x3b82f6, isLight ? 0xd4d4d8 : 0x27272a);
    floorGrid.position.y = -0.655;
    floorGrid.material.transparent = true;
    floorGrid.material.opacity = isLight ? 0.55 : 0.34;
    scene.add(floorGrid);
  }

  const loader = new GLTFLoader();
  const loadedModels = {}; // mode -> { root, meshes: [], origPos: Map, explodeOffsets: Map, refs: {} }
  const packetGroups = {};

  let activeMode = 'kepler';
  let activePartId = null;
  let exploded = false;
  let wireframe = false;
  let autoOrbit = false;
  let paused = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  let visible = true;

  let glideActive = false;
  const glidePos = new THREE.Vector3(...SYSTEMS.kepler.views.overview.pos);
  const glideTarget = new THREE.Vector3(...SYSTEMS.kepler.views.overview.target);

  controls.addEventListener('start', () => {
    glideActive = false;
  });

  function computeExplodeOffset(mode, name) {
    if (mode === 'kepler') {
      if (name.startsWith('Core_Top') || name.startsWith('Core_Standoff')) return new THREE.Vector3(0, 0.72, 0);
      if (name.startsWith('HeatsinkFin_') || name.startsWith('Heatpipe_')) return new THREE.Vector3(0, 0.42, 0);
      if (name.startsWith('ShaderBank_')) return new THREE.Vector3(-0.32, 0.25, 0);
      if (name.startsWith('GPU_Fan') || name.startsWith('Fan')) return new THREE.Vector3(0.32, 0.38, 0);
    } else if (mode === 'agentforge') {
      if (name.startsWith('Approval_')) return new THREE.Vector3(0, 0.48, 0);
      if (name.startsWith('Gimbal_Inner')) return new THREE.Vector3(0, 0.25, 0);
      if (name.startsWith('MCP_Dome') || name.startsWith('MCP_Emitter') || name.startsWith('MCP_Mast')) return new THREE.Vector3(0, 0.32, 0);
    } else if (mode === 'notion') {
      if (name.startsWith('Input') || name.startsWith('LeftRail')) return new THREE.Vector3(-0.45, 0.15, 0);
      if (name.startsWith('Cartridge') || name.startsWith('RightRail')) return new THREE.Vector3(0.45, 0.15, 0);
      if (name.startsWith('AST_') || name.startsWith('Token')) return new THREE.Vector3(0, 0.32, 0);
    }
    return new THREE.Vector3(0, 0, 0);
  }

  function buildPacketSystem(mode) {
    const cfg = SYSTEMS[mode];
    if (!cfg.packets) return;
    const grp = new THREE.Group();
    const list = [];
    cfg.packets.forEach((p, idx) => {
      const curve = new THREE.CatmullRomCurve3(p.pts.map((v) => new THREE.Vector3(...v)));
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 14, 14),
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
    const cfg = SYSTEMS[mode];
    const gltf = await loader.loadAsync(cfg.url);
    const root = gltf.scene;
    const meshes = [];
    const origPos = new Map();
    const explodeOffsets = new Map();
    const refs = {};

    root.traverse((obj) => {
      if (['GPU_Fan_Rotor', 'Gimbal_Outer', 'Gimbal_Inner', 'Approval_Core', 'AST_Crystal', 'Token_Ring'].includes(obj.name)) {
        refs[obj.name] = obj;
      }
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        // Clone material so per-part highlight & wireframe never leak across meshes
        if (obj.material) {
          obj.material = obj.material.clone();
          obj.userData.baseEmissive = obj.material.emissive ? obj.material.emissive.clone() : new THREE.Color(0x000000);
          obj.userData.baseEmissiveInt = obj.material.emissiveIntensity ?? 0;
        }
        obj.userData.systemMode = mode;
        meshes.push(obj);
      }
      if (obj.parent === root || Object.values(refs).includes(obj)) {
        origPos.set(obj, obj.position.clone());
        explodeOffsets.set(obj, computeExplodeOffset(mode, obj.name));
      }
    });

    loadedModels[mode] = { root, meshes, origPos, explodeOffsets, refs };
    buildPacketSystem(mode);
    scene.add(root);
    return loadedModels[mode];
  }

  function applyLayoutTransforms() {
    const isAll = activeMode === 'all';
    const xOffsets = { kepler: -6.8, agentforge: 0, notion: 6.8 };
    const scales = isAll ? 0.86 : 1.0;

    ['kepler', 'agentforge', 'notion'].forEach((m) => {
      const entry = loadedModels[m];
      const pg = packetGroups[m];
      const show = isAll || activeMode === m;
      if (entry) {
        entry.root.visible = show;
        entry.root.position.set(isAll ? xOffsets[m] : 0, 0, 0);
        entry.root.scale.setScalar(scales);
      }
      if (pg) {
        pg.group.visible = show;
        pg.group.position.set(isAll ? xOffsets[m] : 0, 0, 0);
        pg.group.scale.setScalar(scales);
      }
    });
  }

  function highlightPart(partId) {
    activePartId = partId;
    const cfg = SYSTEMS[activeMode];
    const part = cfg.parts.find((p) => p.id === partId) || null;

    // Reset all mesh highlights
    Object.values(loadedModels).forEach((entry) => {
      entry.meshes.forEach((mesh) => {
        if (!mesh.material || !mesh.material.emissive) return;
        mesh.material.emissive.copy(mesh.userData.baseEmissive);
        mesh.material.emissiveIntensity = mesh.userData.baseEmissiveInt;
      });
    });

    if (part && part.prefixes && loadedModels[activeMode]) {
      loadedModels[activeMode].meshes.forEach((mesh) => {
        const match = part.prefixes.some((pre) => mesh.name.startsWith(pre));
        if (match && mesh.material && mesh.material.emissive) {
          mesh.material.emissive.setHex(0x2563eb);
          mesh.material.emissiveIntensity = Math.max(mesh.userData.baseEmissiveInt, 0.55);
        }
      });
    }

    if (part && part.cam) {
      glidePos.set(...part.cam.pos);
      glideTarget.set(...part.cam.target);
      glideActive = !paused;
      if (paused) {
        camera.position.copy(glidePos);
        controls.target.copy(glideTarget);
        controls.update();
      }
    }

    if (part && readoutTag && readoutTitle && readoutDesc) {
      readoutTag.textContent = `${cfg.tag.split('//')[0].trim()} // INSPECTING COMPONENT`;
      readoutTitle.textContent = part.name;
      readoutDesc.textContent = part.desc;
    }

    partsListEl?.querySelectorAll('.lab-part-card').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.part === partId));
    });
  }

  function renderInspector(mode) {
    const cfg = SYSTEMS[mode];
    if (inspBadge) inspBadge.textContent = cfg.badge;
    if (inspRepo) {
      inspRepo.href = cfg.repoUrl;
      inspRepo.textContent = cfg.repoLabel;
    }
    if (inspTitle) inspTitle.textContent = cfg.title;
    if (inspSummary) inspSummary.textContent = cfg.summary;

    if (!partsListEl) return;
    partsListEl.innerHTML = '';
    cfg.parts.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lab-part-card';
      btn.dataset.part = p.id;
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <div class="lab-part-top">
          <span class="lab-part-name">${p.name}</span>
          <span class="lab-part-mat mono">${p.mat}</span>
        </div>
        <div class="lab-part-desc">${p.desc}</div>
      `;
      btn.addEventListener('click', () => {
        if (p.switchMode) {
          applyMode(p.switchMode);
        } else {
          highlightPart(p.id);
        }
      });
      partsListEl.appendChild(btn);
    });
  }

  function glideToView(viewName) {
    const cfg = SYSTEMS[activeMode];
    const v = cfg.views[viewName] || cfg.views.overview;
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
    activePartId = null;
    const cfg = SYSTEMS[mode];
    if (readoutTag) readoutTag.textContent = cfg.tag;
    if (readoutTitle) readoutTitle.textContent = cfg.title;
    if (readoutDesc) readoutDesc.textContent = cfg.desc;

    modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scene === mode)));
    renderInspector(mode);
    glideToView('overview');

    try {
      if (mode === 'all') {
        await Promise.all([ensureModel('kepler'), ensureModel('agentforge'), ensureModel('notion')]);
      } else {
        await ensureModel(mode);
      }
      applyLayoutTransforms();
      highlightPart(null);
    } catch (err) {
      console.error('GLB load failed:', err);
      stage.classList.add('no-webgl');
    }
  }

  // Click directly on 3D mesh via Raycaster to focus system or component!
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downXY = { x: 0, y: 0 };

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const targets = [];
    Object.values(loadedModels).forEach((entry) => {
      if (entry.root.visible) targets.push(...entry.meshes);
    });
    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length && hoverTip) {
      const hit = hits[0].object;
      const hm = hit.userData.systemMode;
      const part = SYSTEMS[hm]?.parts.find((p) => p.prefixes?.some((pre) => hit.name.startsWith(pre)));
      hoverTip.textContent = part ? `${SYSTEMS[hm].badge.split('·')[1]?.trim() || hm} · ${part.name}` : hit.name;
      hoverTip.classList.add('visible');
      canvas.style.cursor = 'pointer';
    } else if (hoverTip) {
      hoverTip.classList.remove('visible');
      canvas.style.cursor = 'grab';
    }
  });

  canvas.addEventListener('pointerleave', () => {
    hoverTip?.classList.remove('visible');
  });

  canvas.addEventListener('pointerdown', (e) => {
    downXY = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('pointerup', (e) => {
    const dist = Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y);
    if (dist > 6) return; // ignore orbit drags

    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const targets = [];
    Object.values(loadedModels).forEach((entry) => {
      if (entry.root.visible) targets.push(...entry.meshes);
    });
    const hits = raycaster.intersectObjects(targets, false);
    if (!hits.length) return;

    const hit = hits[0].object;
    const hitMode = hit.userData.systemMode;
    if (activeMode === 'all' && hitMode) {
      applyMode(hitMode);
      return;
    }
    if (hitMode && SYSTEMS[hitMode]) {
      const part = SYSTEMS[hitMode].parts.find((p) =>
        p.prefixes?.some((pre) => hit.name.startsWith(pre))
      );
      if (part) {
        highlightPart(part.id);
        const card = partsListEl?.querySelector(`[data-part="${part.id}"]`);
        card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  });

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyMode(btn.dataset.scene));
  });

  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      highlightPart(null);
      const cfg = SYSTEMS[activeMode];
      if (readoutTag) readoutTag.textContent = cfg.tag;
      if (readoutTitle) readoutTitle.textContent = cfg.title;
      if (readoutDesc) readoutDesc.textContent = cfg.desc;
      glideToView(btn.dataset.view);
    });
  });

  explodeBtn?.addEventListener('click', () => {
    exploded = !exploded;
    explodeBtn.setAttribute('aria-pressed', String(exploded));
  });

  wireBtn?.addEventListener('click', () => {
    wireframe = !wireframe;
    wireBtn.setAttribute('aria-pressed', String(wireframe));
    Object.values(loadedModels).forEach((entry) => {
      entry.meshes.forEach((m) => {
        if (m.material) m.material.wireframe = wireframe;
      });
    });
  });

  const lightModes = ['studio', 'dramatic', 'inspect'];
  let lightIdx = 0;
  function applyLightRig(mode) {
    const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    if (mode === 'studio') {
      scene.environmentIntensity = isLightTheme ? 1.15 : 0.95;
      keyLight.intensity = 1.75;
      rimLight.intensity = 1.35;
      fillLight.intensity = 0.65;
    } else if (mode === 'dramatic') {
      scene.environmentIntensity = isLightTheme ? 0.65 : 0.42;
      keyLight.intensity = 2.4;
      rimLight.intensity = 2.6;
      fillLight.intensity = 0.25;
    } else {
      scene.environmentIntensity = 1.4;
      keyLight.intensity = 1.1;
      rimLight.intensity = 0.8;
      fillLight.intensity = 1.25;
    }
    if (lightBtn) {
      lightBtn.textContent = `Light: ${mode[0].toUpperCase() + mode.slice(1)}`;
    }
  }

  lightBtn?.addEventListener('click', () => {
    lightIdx = (lightIdx + 1) % lightModes.length;
    applyLightRig(lightModes[lightIdx]);
  });

  orbitBtn?.addEventListener('click', () => {
    autoOrbit = !autoOrbit;
    controls.autoRotate = autoOrbit;
    controls.autoRotateSpeed = 1.4;
    orbitBtn.setAttribute('aria-pressed', String(autoOrbit));
  });

  function syncPauseBtn() {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  }
  syncPauseBtn();

  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    syncPauseBtn();
  });

  resetBtn?.addEventListener('click', () => {
    exploded = false;
    wireframe = false;
    autoOrbit = false;
    controls.autoRotate = false;
    explodeBtn?.setAttribute('aria-pressed', 'false');
    wireBtn?.setAttribute('aria-pressed', 'false');
    orbitBtn?.setAttribute('aria-pressed', 'false');
    Object.values(loadedModels).forEach((entry) => {
      entry.meshes.forEach((m) => { if (m.material) m.material.wireframe = false; });
    });
    highlightPart(null);
    const cfg = SYSTEMS[activeMode];
    if (readoutTag) readoutTag.textContent = cfg.tag;
    if (readoutTitle) readoutTitle.textContent = cfg.title;
    if (readoutDesc) readoutDesc.textContent = cfg.desc;
    glideToView('overview');
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
    (entries) => { visible = entries[0]?.isIntersecting ?? true; },
    { threshold: 0.05 }
  );
  io.observe(stage);

  // Initial load: KeplerBridge, then preload the other 2 Blender GLBs for instant All-3 / tab switching
  applyMode('kepler').then(() => {
    Promise.all([ensureModel('agentforge'), ensureModel('notion')]).then(() => {
      applyLayoutTransforms();
    });
  });

  const clock = new THREE.Clock();
  const tmpTargetVec = new THREE.Vector3();

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (glideActive) {
      camera.position.lerp(glidePos, 0.09);
      controls.target.lerp(glideTarget, 0.09);
      if (camera.position.distanceTo(glidePos) < 0.03) {
        glideActive = false;
      }
    }

    // Smooth Exploded View interpolation across all loaded models
    Object.values(loadedModels).forEach((entry) => {
      if (!entry.root.visible) return;
      entry.origPos.forEach((basePos, obj) => {
        const off = entry.explodeOffsets.get(obj);
        if (!off) return;
        tmpTargetVec.copy(basePos);
        if (exploded) tmpTargetVec.add(off);
        obj.position.lerp(tmpTargetVec, 0.12);
      });
    });

    if (!paused) {
      const activeList = activeMode === 'all' ? ['kepler', 'agentforge', 'notion'] : [activeMode];
      activeList.forEach((m) => {
        const refs = loadedModels[m]?.refs || {};
        if (m === 'kepler' && refs.GPU_Fan_Rotor) {
          refs.GPU_Fan_Rotor.rotation.y += dt * 4.2;
        } else if (m === 'agentforge') {
          if (refs.Gimbal_Outer) refs.Gimbal_Outer.rotation.y += dt * 0.55;
          if (refs.Gimbal_Inner) refs.Gimbal_Inner.rotation.x -= dt * 0.72;
          if (refs.Approval_Core) refs.Approval_Core.rotation.y -= dt * 0.9;
        } else if (m === 'notion') {
          if (refs.AST_Crystal) refs.AST_Crystal.rotation.y += dt * 0.5;
          if (refs.Token_Ring) refs.Token_Ring.rotation.z += dt * 0.42;
        }

        const pg = packetGroups[m];
        if (pg && pg.group.visible) {
          for (const p of pg.list) {
            const progress = (t * 0.52 + p.offset) % 1;
            p.curve.getPointAt(progress, p.bead.position);
          }
        }
      });
    }

    controls.update();
    renderer.render(scene, camera);
  }
  tick();
}

initLab();
