(() => {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const progressBar = document.getElementById("scrollProgress");
  const toastEl = document.getElementById("toast");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  // ── Theme toggle (icon-only circular button) ──
  const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  const ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  const savedTheme = localStorage.getItem("hs_theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }

  function syncThemeBtn() {
    if (!themeBtn) return;
    const isLight = root.getAttribute("data-theme") === "light";
    themeBtn.setAttribute("aria-pressed", String(isLight));
    themeBtn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    themeBtn.setAttribute("title", isLight ? "Switch to dark mode" : "Switch to light mode");
    themeBtn.innerHTML = isLight ? ICON_MOON : ICON_SUN;
  }
  syncThemeBtn();

  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("hs_theme", next);
    syncThemeBtn();
    showToast(`Switched to ${next} mode`);
  });

  // ── Mobile navigation ──
  function setMenu(open) {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.innerHTML = open ? ICON_CLOSE : ICON_MENU;
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", (e) => {
    if (navLinks?.classList.contains("open") &&
        !navLinks.contains(e.target) &&
        !menuToggle?.contains(e.target)) {
      setMenu(false);
    }
  });

  // ── Hero HUD Interactive Telemetry Tabs ──
  const hudNodes = {
    kepler: {
      meta: "NODE_01 // C++20 · WIN_X64",
      status: "v0.5.0-rc1",
      title: "KeplerBridge",
      desc: "Bounded Direct3D 12-to-Direct3D 11 translation layer with DXIL-to-DXBC shader conversion and persistent cache.",
      pipe: "D3D12 App  →  DXIL→DXBC  →  D3D11 Kepler GPU",
      url: "https://github.com/HamzaShaikhAI/KeplerBridge",
      cta: "Inspect KeplerBridge Repository ↗"
    },
    agentforge: {
      meta: "NODE_02 // TYPESCRIPT · NODE.JS",
      status: "ACTIVE_DEV",
      title: "AgentForge",
      desc: "Local-first AI agent orchestration harness unifying MCP bridges, human approval checkpoints, and credential isolation.",
      pipe: "Agent  →  Approval Gate  →  MCP Bridge",
      url: "https://github.com/HamzaShaikhAI/AgentForge",
      cta: "Inspect AgentForge Repository ↗"
    },
    remotion: {
      meta: "NODE_03 // TYPESCRIPT · REACT · REMOTION",
      status: "OPEN_SOURCE",
      title: "Remotion-For-Antigravity",
      desc: "Autonomous video motion graphics, editing & multimedia engine for Google Antigravity 2.0 AI agents with deterministic spring physics.",
      pipe: "Antigravity Agent  →  React Remotion  →  Zero-Config FFmpeg Video",
      url: "https://github.com/HamzaShaikhAI/Remotion-For-Antigravity",
      cta: "Inspect Remotion-For-Antigravity Repository ↗"
    },
    notion: {
      meta: "NODE_04 // TYPESCRIPT · ZERO_DEPS",
      status: "OPEN_SOURCE",
      title: "Notion Block Engine",
      desc: "Bidirectional Markdown, HTML, and clipboard sanitizer converting rich content into a Notion-compatible Block AST.",
      pipe: "Markdown / HTML  ⇄  Block AST  ⇄  Notion JSON",
      url: "https://github.com/HamzaShaikhAI/notion-block-engine",
      cta: "Inspect Notion Block Engine ↗"
    }
  };

  const hudTabs = document.querySelectorAll(".hud-tab");
  const hudMeta = document.getElementById("hudMeta");
  const hudStatus = document.getElementById("hudStatus");
  const hudTitle = document.getElementById("hudTitle");
  const hudDesc = document.getElementById("hudDesc");
  const hudPipe = document.getElementById("hudPipe");
  const hudLink = document.getElementById("hudLink");

  const hudScreen = document.querySelector(".hud-screen");
  hudTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const node = hudNodes[tab.dataset.node];
      if (!node) return;
      hudTabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      if (hudScreen) {
        hudScreen.classList.add("is-switching");
      }
      setTimeout(() => {
        if (hudMeta) hudMeta.textContent = node.meta;
        if (hudStatus) hudStatus.textContent = node.status;
        if (hudTitle) hudTitle.textContent = node.title;
        if (hudDesc) hudDesc.textContent = node.desc;
        if (hudPipe) hudPipe.textContent = node.pipe;
        if (hudLink) {
          hudLink.href = node.url;
          hudLink.textContent = node.cta;
        }
        hudScreen?.classList.remove("is-switching");
      }, 130);
    });
  });

  // ── Pointer Spotlight Glow on Bento Cards ──
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!reducedMotion) {
    document.querySelectorAll(".spotlight-card").forEach((card) => {
      let rafId = null;
      card.addEventListener("pointermove", (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          card.style.setProperty("--my", `${e.clientY - rect.top}px`);
          rafId = null;
        });
      });
    });
  }

  // ── Scroll progress & active nav spy ──
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const sections = navAnchors
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && max > 0) {
      progressBar.style.width = `${Math.min(100, (scrollTop / max) * 100)}%`;
    }
    let currentId = sections[0]?.id || "";
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= 145) {
        currentId = sec.id;
      }
    }
    for (const a of navAnchors) {
      a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Project category filter + live power-user search ──
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  const filterStatus = document.getElementById("filterStatus");
  const projectSearch = document.getElementById("projectSearch");

  let currentCat = "all";
  let currentQuery = "";

  function applyProjectFilter() {
    let shown = 0;
    const q = currentQuery.trim().toLowerCase();
    projectCards.forEach((card) => {
      const catMatch = currentCat === "all" || card.dataset.category === currentCat;
      const textMatch = !q || card.textContent.toLowerCase().includes(q);
      const match = catMatch && textMatch;
      card.classList.remove("is-entering");
      card.classList.toggle("is-hidden", !match);
      if (match) {
        card.style.animationDelay = `${shown * 40}ms`;
        void card.offsetWidth;
        card.classList.add("is-entering");
        shown++;
      }
    });
    if (filterStatus) {
      const suffix = q ? ` matching "${currentQuery.trim()}"` : "";
      filterStatus.textContent = `Showing ${shown} project${shown === 1 ? "" : "s"}${suffix}`;
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCat = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      applyProjectFilter();
    });
  });

  projectSearch?.addEventListener("input", (e) => {
    currentQuery = e.target.value;
    applyProjectFilter();
  });

  // ── Audience Value Switcher (Companies vs Power Users) ──
  const audienceData = {
    companies: [
      {
        title: "MIT-Licensed & Audit-Ready",
        text: "All flagship tools ship under permissive MIT licensing with transparent CI checks, clear boundaries, and documented failure post-mortems."
      },
      {
        title: "Deterministic AI Guardrails",
        text: "AgentForge enforces human-in-the-loop approval checkpoints and credential isolation before external commits, pushes, or API writes."
      },
      {
        title: "Autonomous Video & Multimedia AI",
        text: "Remotion-For-Antigravity powers programmatic 4K/60fps video rendering via the REA CLI with deterministic spring physics and broadcast-grade EBU R128 audio normalization."
      }
    ],
    power: [
      {
        title: "Drop-In d3d12.dll Proxy",
        text: "Run supported DirectX 12 workloads on NVIDIA Kepler (GeForce GT 740 / GK107 / GTX 7xx) simply by placing d3d12.dll beside the .exe."
      },
      {
        title: "Local-First Full Control",
        text: "Zero telemetry trackers, local Manager UI in AgentForge, and Ollama/local-LLM workflows (PS-O1) that keep keys and prompts on your machine."
      },
      {
        title: "Programmatic React Video Engine",
        text: "Generate broadcast-ready developer demos and animations with REA CLI, React Remotion, and bundled zero-config FFmpeg in one command."
      }
    ]
  };

  const audTabs = document.querySelectorAll(".aud-tab");
  const audGrid = document.getElementById("audienceGrid");

  audTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.audience;
      const cards = audienceData[key];
      if (!cards || !audGrid) return;
      audTabs.forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
      audGrid.innerHTML = cards
        .map((c) => `<div class="audience-card"><h3>${c.title}</h3><p>${c.text}</p></div>`)
        .join("");
    });
  });

  // ── Quick-Start CLI & Config Snippet Drawer ──
  const cliSnippets = {
    kepler: "git clone https://github.com/HamzaShaikhAI/KeplerBridge.git\n# Place d3d12.dll + kepler_bridge.ini next to your 64-bit game .exe (MIT)",
    agentforge: "git clone https://github.com/HamzaShaikhAI/AgentForge.git && cd AgentForge\nnpm install && npm run build   # Node.js >=20 · TypeScript 5.6",
    remotion: "git clone https://github.com/HamzaShaikhAI/Remotion-For-Antigravity.git\ncd Remotion-For-Antigravity && npm install\nnpx rea --help   # Autonomous React video engine for Google Antigravity 2.0",
    notion: "git clone https://github.com/HamzaShaikhAI/notion-block-engine.git\n# Zero runtime dependencies (<15 KB): HTML / Markdown <-> Notion Block AST"
  };

  const cliTabs = document.querySelectorAll(".cli-tab");
  const cliCode = document.getElementById("cliCode");
  const cliCopyBtn = document.getElementById("cliCopyBtn");

  cliTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.cli;
      cliTabs.forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
      if (cliCode && cliSnippets[key]) cliCode.textContent = cliSnippets[key];
    });
  });

  cliCopyBtn?.addEventListener("click", () => {
    if (cliCode) copyText(cliCode.textContent.trim(), "CLI snippet copied");
  });

  // ── Clickable Tech Skill Pills -> Filter Projects ──
  document.querySelectorAll(".tech-pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const term = btn.dataset.skill || btn.textContent.trim();
      currentCat = "all";
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === "all")));
      currentQuery = term;
      if (projectSearch) projectSearch.value = term;
      applyProjectFilter();
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
      showToast(`Filtered projects by "${term}"`);
    });
  });

  // ── Collaboration pitch generator ──
  const pitches = {
    "open-source":
      "Hi Hamza, I explored your open-source repositories (KeplerBridge / AgentForge / Notion Block Engine) and would love to collaborate or contribute.",
    "ai-agents":
      "Hi Hamza, we're building AI agent / MCP workflows and want to connect about your work on AgentForge and local-first automation.",
    "systems":
      "Hi Hamza, I saw KeplerBridge and your Direct3D / C++20 systems work — reaching out to discuss graphics or Windows engineering.",
    "remote":
      "Hi Hamza, we're hiring / collaborating globally on AI and systems software and would like to connect with you via LinkedIn or GitHub."
  };

  const topicPills = document.querySelectorAll(".topic-pill");
  const pitchPreview = document.getElementById("pitchPreview");
  const copyPitchBtn = document.getElementById("copyPitchBtn");
  const copyUrlBtn = document.getElementById("copyUrlBtn");

  topicPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const key = pill.dataset.topic;
      topicPills.forEach((p) => p.setAttribute("aria-pressed", String(p === pill)));
      if (pitchPreview && pitches[key]) {
        pitchPreview.textContent = pitches[key];
        pitchPreview.classList.remove("is-updated");
        void pitchPreview.offsetWidth;
        pitchPreview.classList.add("is-updated");
      }
    });
  });

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      showToast("Copy unavailable — please select text manually");
    }
  }

  copyPitchBtn?.addEventListener("click", () => {
    if (pitchPreview) copyText(pitchPreview.textContent.trim(), "Intro message copied to clipboard");
  });

  copyUrlBtn?.addEventListener("click", () => {
    copyText("https://hamzashaikhai.github.io/", "Portfolio URL copied");
  });

  // ── Quick-Jump Command Palette (Ctrl+K / Cmd+K) ──
  const paletteBackdrop = document.getElementById("paletteBackdrop");
  const paletteInput = document.getElementById("paletteInput");
  const paletteItems = Array.from(document.querySelectorAll(".palette-item"));

  function openPalette() {
    if (!paletteBackdrop) return;
    paletteBackdrop.classList.add("open");
    paletteBackdrop.setAttribute("aria-hidden", "false");
    if (paletteInput) {
      paletteInput.value = "";
      filterPalette("");
      setTimeout(() => paletteInput.focus(), 20);
    }
  }

  function closePalette() {
    if (!paletteBackdrop) return;
    paletteBackdrop.classList.remove("open");
    paletteBackdrop.setAttribute("aria-hidden", "true");
  }

  function filterPalette(query) {
    const q = query.trim().toLowerCase();
    paletteItems.forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  }

  paletteBackdrop?.addEventListener("click", (e) => {
    if (e.target === paletteBackdrop) closePalette();
  });
  paletteInput?.addEventListener("input", (e) => filterPalette(e.target.value));

  paletteItems.forEach((item) => {
    item.querySelector("button")?.addEventListener("click", () => {
      const action = item.dataset.action;
      closePalette();
      if (action === "theme") {
        themeBtn?.click();
      } else if (action === "copy-url") {
        copyUrlBtn?.click();
      } else if (action?.startsWith("#")) {
        document.querySelector(action)?.scrollIntoView({ behavior: "smooth" });
      } else if (action?.startsWith("http") || action?.startsWith("/")) {
        window.open(action, "_blank", "noopener,noreferrer");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      paletteBackdrop?.classList.contains("open") ? closePalette() : openPalette();
    } else if (e.key === "Escape") {
      closePalette();
      setMenu(false);
    }
  });

  // ── Scroll reveal ──
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }
})();
