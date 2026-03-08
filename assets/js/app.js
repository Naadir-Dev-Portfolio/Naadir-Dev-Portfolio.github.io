/**
 * Portfolio 2.0 — app.js
 * Reads from PROJECTS + SITE_CONFIG (defined in assets/data/projects.js)
 * and renders the entire portfolio dynamically.
 *
 * ─── TO ADD A PROJECT ────────────────────────────────────────────
 * Edit assets/data/projects.js — no changes needed here.
 * ─────────────────────────────────────────────────────────────────
 */

/* ══════════════════════════════════════════════════════════════
   HERO RAIL ICONS (inline SVG strings)
══════════════════════════════════════════════════════════════ */
const PANEL_ICONS = {
  excel:     '📊',
  python:    '🐍',
  ai:        '🤖',
  trading:   '📈',
  web:       '🌐',
  economics: '🏛️'
};

/* ══════════════════════════════════════════════════════════════
   STATUS LABELS
══════════════════════════════════════════════════════════════ */
const STATUS = {
  'live':        { label: 'Live',         cls: 'status-live'   },
  'wip':         { label: 'In Progress',  cls: 'status-wip'    },
  'coming-soon': { label: 'Coming Soon',  cls: 'status-coming' }
};

/* ══════════════════════════════════════════════════════════════
   CATEGORY DEFINITIONS (label + subcategory labels)
══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  {
    id: 'excel', label: 'Excel & VBA',
    subs: [
      { id: 'vba',          label: 'VBA & Macros'    },
      { id: 'powerquery',   label: 'Power Query'     },
      { id: 'powerautomate',label: 'Power Automate'  },
      { id: 'powerbi',      label: 'Power BI'        }
    ]
  },
  {
    id: 'python', label: 'Python',
    subs: [
      { id: 'desktop',    label: 'Desktop Apps'     },
      { id: 'automation', label: 'Automation'       },
      { id: 'utilities',  label: 'Utilities'        }
    ]
  },
  {
    id: 'ai', label: 'AI & ML',
    subs: [
      { id: 'agents',      label: 'AI Agents'         },
      { id: 'generativeai',label: 'Generative AI'     },
      { id: 'nlp',         label: 'NLP'               },
      { id: 'prompt',      label: 'Prompt Engineering' }
    ]
  },
  {
    id: 'trading', label: 'Trading & Quant',
    subs: [
      { id: 'backtesting', label: 'Backtesting'     },
      { id: 'livedata',    label: 'Live Data'        },
      { id: 'forecasting', label: 'Forecasting'      }
    ]
  },
  {
    id: 'web', label: 'Web & Games',
    subs: [
      { id: 'teamsites', label: 'Sites & Portals'    },
      { id: 'tools',     label: 'Tools'              },
      { id: 'cognitive', label: 'Cognitive Games'    }
    ]
  }
];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const el = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => [...document.querySelectorAll(sel)];

function imgOrPlaceholder(image, title, catIcon = '🖼️') {
  if (image) {
    return `<img src="assets/images/projects/${image}" alt="${title}" loading="lazy"
               onerror="this.parentElement.innerHTML=\`<div class='proj-placeholder'><div class='proj-placeholder-icon'>${catIcon}</div><span>${title}</span></div>\`">`;
  }
  return `<div class="proj-placeholder"><div class="proj-placeholder-icon">${catIcon}</div><span>${title}</span></div>`;
}

function statusBadge(status) {
  const s = STATUS[status] || STATUS['live'];
  return `<span class="status-badge ${s.cls}">${s.label}</span>`;
}

function tagHtml(tags = []) {
  if (!tags.length) return '';
  return `<div class="tag-row">${tags.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
}

/* ══════════════════════════════════════════════════════════════
   CARD TEMPLATES
══════════════════════════════════════════════════════════════ */
function projectCard(p, catIcon = '🖼️') {
  const isVideo = !!p.videoId;
  const thumb = isVideo
    ? `<img src="https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg" alt="${p.title}" loading="lazy">`
    : imgOrPlaceholder(p.image, p.title, catIcon);

  const links = [
    p.demo  ? `<a class="proj-link live-link" href="${p.demo}" target="_blank" rel="noreferrer">Live Demo</a>` : '',
    p.github ? `<a class="proj-link" href="${p.github}" target="_blank" rel="noreferrer">Code</a>` : ''
  ].filter(Boolean).join('');

  const playBtn = isVideo ? `<div class="play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>` : '';

  return `
    <div class="proj-card ${isVideo ? 'video-card' : ''} ${p.status === 'coming-soon' ? 'coming-soon-card' : ''}"
         ${isVideo ? `data-video-id="${p.videoId}"` : ''}>
      <div class="proj-card-thumb">
        ${thumb}
        ${playBtn}
      </div>
      <div class="proj-card-body">
        <div class="proj-card-top">
          <h3>${p.title}</h3>
          ${statusBadge(p.status || 'live')}
        </div>
        ${tagHtml(p.tags)}
        <p>${p.description || ''}</p>
        <div class="proj-card-links">${links}</div>
      </div>
    </div>`;
}

function featuredCard(p, isHeroSpot = false) {
  const imgHtml = p.image
    ? `<img src="assets/images/projects/${p.image}" alt="${p.title}" loading="lazy"
          onerror="this.style.display='none'">`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:2rem;">${PANEL_ICONS[p.category] || '🖥️'}</div>`;

  const highlights = isHeroSpot && p.highlights
    ? `<div class="featured-highlights">${p.highlights.map(h => `<div class="featured-highlight">${h}</div>`).join('')}</div>`
    : '';

  const links = [
    p.demo   ? `<a class="card-link card-link-primary" href="${p.demo}" target="_blank" rel="noreferrer">Live Demo</a>` : '',
    p.github ? `<a class="card-link" href="${p.github}" target="_blank" rel="noreferrer">View Code →</a>` : ''
  ].filter(Boolean).join('');

  if (isHeroSpot) {
    return `
      <div class="featured-card hero-spot">
        <div class="featured-card-img">${imgHtml}</div>
        <div class="featured-card-body">
          <div class="featured-label">⭐ Flagship Project</div>
          <h3>${p.title}</h3>
          <div class="tag-row">${(p.tags || []).map(t => `<span class="tag tag-purple">${t}</span>`).join('')}</div>
          <p>${p.description || ''}</p>
          ${highlights}
          <div class="card-links-row">${links}</div>
        </div>
      </div>`;
  }

  return `
    <div class="featured-card">
      <div class="featured-card-img">${imgHtml}</div>
      <div class="featured-card-body">
        <h3>${p.title}</h3>
        <div class="tag-row">${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <p>${p.description || ''}</p>
        <div class="card-links-row">${links}</div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════════
   RENDER: HERO COPY
══════════════════════════════════════════════════════════════ */
function renderHero() {
  const cfg = SITE_CONFIG;
  const nameEl = qs('[data-hero-name]');
  if (nameEl) nameEl.textContent = cfg.name;
  const taglineEl = qs('[data-hero-tagline]');
  if (taglineEl) taglineEl.textContent = cfg.tagline;
  const pillsEl = qs('[data-hero-pills]');
  if (pillsEl) {
    pillsEl.innerHTML = cfg.subtitle.map(s => `<span class="hero-subtitle-pill">${s}</span>`).join('');
  }
}

/* ══════════════════════════════════════════════════════════════
   RENDER: HERO RAIL PANELS
══════════════════════════════════════════════════════════════ */
function renderHeroRail() {
  const rail = el('hero-rail');
  if (!rail) return;
  rail.innerHTML = SITE_CONFIG.heroRailPanels.map(p => `
    <div class="hero-panel" onclick="location.href='${p.link}'">
      <div class="hero-panel-icon">${PANEL_ICONS[p.svg] || '📌'}</div>
      <h3>${p.label}</h3>
      <p>${p.sub}</p>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════
   RENDER: FEATURED SPOTLIGHT
══════════════════════════════════════════════════════════════ */
function renderFeatured() {
  const grid = el('featured-grid');
  if (!grid || !PROJECTS.featured) return;
  const [hero, ...rest] = PROJECTS.featured;
  let html = '';
  if (hero) html += featuredCard(hero, true);
  html += rest.map(p => featuredCard(p, false)).join('');
  grid.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════════
   RENDER: PROJECTS TABS + GRIDS
══════════════════════════════════════════════════════════════ */
function renderProjects() {
  const tabBar   = el('cat-tabs');
  const subArea  = el('sub-tabs-area');
  const gridArea = el('projects-grid-area');
  if (!tabBar || !gridArea) return;

  /* Build primary tabs */
  tabBar.innerHTML = CATEGORIES.map((cat, i) => `
    <button class="cat-tab ${i === 0 ? 'active' : ''}"
            data-cat="${cat.id}">${cat.label}</button>
  `).join('');

  /* Build sub-tabs and grids for each category */
  let subHtml  = '';
  let gridHtml = '';

  CATEGORIES.forEach((cat, ci) => {
    const isActive = ci === 0;
    const catData  = PROJECTS[cat.id] || {};
    const catIcon  = PANEL_ICONS[cat.id] || '📌';

    /* Sub-tabs row */
    subHtml += `
      <div class="sub-tabs cat-panel ${isActive ? 'active' : ''}" id="subs-${cat.id}">
        ${cat.subs.map((sub, si) =>
          `<button class="sub-tab ${si === 0 ? 'active' : ''}"
                   data-cat="${cat.id}" data-sub="${sub.id}">${sub.label}</button>`
        ).join('')}
      </div>`;

    /* Grid panels */
    cat.subs.forEach((sub, si) => {
      const projects = catData[sub.id] || [];
      const cards = projects.length
        ? projects.map(p => projectCard(p, catIcon)).join('')
        : `<div class="empty-state">No projects yet in this category — coming soon.</div>`;

      gridHtml += `
        <div class="sub-panel cat-panel ${isActive && si === 0 ? 'active' : ''}"
             id="grid-${cat.id}-${sub.id}"
             data-cat="${cat.id}" data-sub="${sub.id}">
          <div class="projects-grid">${cards}</div>
        </div>`;
    });
  });

  subArea.innerHTML  = subHtml;
  gridArea.innerHTML = gridHtml;

  /* Primary tab click */
  tabBar.addEventListener('click', e => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    const cat = btn.dataset.cat;

    qsa('.cat-tab').forEach(t => t.classList.toggle('active', t === btn));
    qsa('.cat-panel').forEach(p => p.classList.remove('active'));

    const subs = el(`subs-${cat}`);
    if (subs) {
      subs.classList.add('active');
      /* activate first sub-tab and its grid */
      const firstSubBtn = subs.querySelector('.sub-tab');
      if (firstSubBtn) {
        firstSubBtn.classList.add('active');
        const grid = el(`grid-${cat}-${firstSubBtn.dataset.sub}`);
        if (grid) grid.classList.add('active');
      }
    }
  });

  /* Sub-tab click (delegated on the sub-tabs area) */
  subArea.addEventListener('click', e => {
    const btn = e.target.closest('.sub-tab');
    if (!btn) return;
    const { cat, sub } = btn.dataset;

    /* Deactivate siblings */
    qsa(`#subs-${cat} .sub-tab`).forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    /* Show correct grid */
    qsa(`.sub-panel[data-cat="${cat}"]`).forEach(p => p.classList.remove('active'));
    const grid = el(`grid-${cat}-${sub}`);
    if (grid) grid.classList.add('active');
  });
}

/* ══════════════════════════════════════════════════════════════
   RENDER: ECONOMIC INDICATORS PREVIEW
══════════════════════════════════════════════════════════════ */
function renderEconPreview() {
  const grid = el('econ-grid');
  if (!grid) return;
  const indicators = [
    { label: 'US 10Y Yield', val: '4.28%',  change: '+0.04%', dir: 'up' },
    { label: 'UK 10Y Gilt',  val: '4.51%',  change: '-0.02%', dir: 'down' },
    { label: 'Shiller CAPE', val: '34.2',   change: '+0.3',   dir: 'up' },
    { label: 'US HY OAS',    val: '312 bps', change: '+8 bps', dir: 'up' }
  ];
  grid.innerHTML = indicators.map(i => `
    <div class="econ-indicator">
      <div class="label">${i.label}</div>
      <div class="val">${i.val}</div>
      <div class="change change-${i.dir}">${i.dir === 'up' ? '▲' : '▼'} ${i.change}</div>
    </div>`
  ).join('');
}

/* ══════════════════════════════════════════════════════════════
   VIDEO MODAL
══════════════════════════════════════════════════════════════ */
function initVideoModal() {
  const overlay = el('video-modal');
  if (!overlay) return;
  const iframe = overlay.querySelector('iframe');

  document.addEventListener('click', e => {
    const card = e.target.closest('.video-card');
    if (card) {
      const id = card.dataset.videoId;
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      overlay.classList.add('open');
    }
    if (e.target === overlay || e.target.closest('.modal-close')) {
      overlay.classList.remove('open');
      iframe.src = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { overlay.classList.remove('open'); iframe.src = ''; }
  });
}

/* ══════════════════════════════════════════════════════════════
   AI ASSISTANT
══════════════════════════════════════════════════════════════ */
function initAIAssistant() {
  const fab     = el('ai-fab');
  const panel   = el('ai-panel');
  const msgArea = el('ai-messages');
  const input   = el('ai-input');
  const sendBtn = el('ai-send');
  if (!fab || !panel) return;

  /* Toggle */
  fab.addEventListener('click', () => {
    fab.classList.toggle('open');
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && msgArea.children.length === 0) {
      appendMsg('assistant', "Hi! I'm Naadir's portfolio assistant. Ask me about any of his projects, skills or experience.");
    }
    if (panel.classList.contains('open') && input) setTimeout(() => input.focus(), 300);
  });

  /* Scroll nav AI link */
  qsa('[data-open-ai]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      if (!panel.classList.contains('open')) fab.click();
    });
  });

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.textContent = text;
    msgArea.appendChild(div);
    msgArea.scrollTop = msgArea.scrollHeight;
    return div;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'ai-msg assistant ai-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgArea.appendChild(div);
    msgArea.scrollTop = msgArea.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMsg('user', text);

    const typing = appendTyping();

    try {
      // Calls Portfolio-Backend-API (renamed from secret-service)
      const res = await fetch('/.netlify/functions/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemPrompt: SITE_CONFIG.aiSystemPrompt
        })
      });
      const data = await res.json();
      typing.remove();
      appendMsg('assistant', data.reply || "I couldn't get a response — please try again.");
    } catch {
      typing.remove();
      appendMsg('assistant', "Connection error — make sure the backend is deployed. Try again later.");
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════════════════════════════ */
function initNav() {
  const toggle = el('nav-toggle');
  const links  = el('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', links.classList.contains('open'));
  });
  /* Close on link click */
  links.querySelectorAll('a, button').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  qsa('.reveal').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   ROTATING TAGLINE
══════════════════════════════════════════════════════════════ */
function initRotatingSubtitle() {
  const el = qs('[data-rotating-subtitle]');
  if (!el || !SITE_CONFIG.subtitle?.length) return;
  let i = 0;
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      i = (i + 1) % SITE_CONFIG.subtitle.length;
      el.textContent = SITE_CONFIG.subtitle[i];
      el.style.opacity = '1';
    }, 300);
  }, 3000);
  el.style.transition = 'opacity 0.3s ease';
  el.textContent = SITE_CONFIG.subtitle[0];
}

/* ══════════════════════════════════════════════════════════════
   HERO RAIL AUTO-SCROLL
══════════════════════════════════════════════════════════════ */
function initRailAutoScroll() {
  const rail = el('hero-rail');
  if (!rail) return;
  let paused = false;
  rail.addEventListener('mouseenter', () => { paused = true; });
  rail.addEventListener('mouseleave', () => { paused = false; });
  setInterval(() => {
    if (paused) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    if (rail.scrollLeft >= maxScroll - 2) {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      rail.scrollBy({ left: 260, behavior: 'smooth' });
    }
  }, 3500);
}

/* ══════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderHero();
  renderHeroRail();
  renderFeatured();
  renderProjects();
  renderEconPreview();
  initVideoModal();
  initAIAssistant();
  initNav();
  initScrollReveal();
  initRotatingSubtitle();
  initRailAutoScroll();
});
