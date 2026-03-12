/* ══════════════════════════════════════════════
   PORTFOLIO V2 — JS
   Per-panel nature videos, editorial cards, AI chat
   ══════════════════════════════════════════════ */
(function(){
  'use strict';

  const GITHUB  = 'https://github.com/Naadir-Dev-Portfolio';
  const IMGS    = 'assets/images/projects/';
  const AI_URL  = 'https://subtle-khapse-c232ff.netlify.app/.netlify/functions/gemini-proxy';
  const AI_SYS  = `You are Naadir's AI Assistant. Professional and concise. Naadir builds automation tools, AI systems, data pipelines and mobile apps. Projects include: Spheria (hero project — AI desktop OS with multi-agent orchestration, tool calling and persistent memory), Mobile Health Planner (React Native / Expo SDK 54 cross-platform health app for Android), Health Planner Desktop (PyQt6 + QWebEngineView hybrid desktop health app), Trading-Algo-Backtester (ML-powered backtester), Finance & Health PyQt6 dashboards, Adobe Script Toolkit (Python+COM sticker pack pipeline, JSX automation for Illustrator & After Effects), ComfyUI Workflows (Stable Diffusion image generation pipelines with Python batch automation), Enterprise GenAI assistant, AI Quiz Bot, Finance NL Query (natural language financial data interface), economic data scripts, educational web games, VBA/SAP automation tools, Power Query M templates, Power BI dashboards, crypto news aggregator, and more. Skills: Python, VBA/Excel, Power Query, Power BI, Power Automate, JavaScript, React Native, TypeScript, AI/ML, multi-agent systems, prompt engineering, ExtendScript/JSX, ComfyUI, PyQt6, Streamlit. Keep answers brief and professional.`.trim();

  /* ══════════════════════════════════════════════
     PROJECT DATA
     ══════════════════════════════════════════════ */
  const DATA = {

    /* ── PYTHON ───────────────────────────────────────── */
    python:{
      desktop:[
        /* n:1 is always the featured editorial card (full-width, 3-image panel).
           Add your own screenshots to assets/images/projects/ and update filenames. */
        {n:1, title:'Finance Dashboard', img:'FinanceScreen.png', imgs:['FinanceScreen.png','financeDashboard.jpg','eer.webp'], desc:'Interactive finance KPIs dashboard with automated data importing, charting and portfolio tracking — built with PyQt6.', code:`${GITHUB}/Finance-Dashboard/blob/main/Ui_finance.py`, details:`${GITHUB}/Finance-Dashboard/blob/main/README.md`, tags:['python','pyqt','data-viz']},
        {n:2, title:'YouTube Stats Dashboard', img:'yt_viewCountScreen.webp', desc:'Cross-platform PyQt6 dashboard integrating the YouTube Data API to visualise channel growth and engagement trends.', code:`${GITHUB}/YouTube-Stats-Dashboard/blob/main/main.py`, details:`${GITHUB}/YouTube-Stats-Dashboard/blob/main/README.md`, tags:['python','pyqt','api']},
        {n:3, title:'Health Dashboard', img:'healthDashboardScreen.png', desc:'OpenGL-powered health metrics dashboard with dynamic 3D body model selection and vitals tracking.', code:`${GITHUB}/Health-Dashboard/blob/main/Ui_health.py`, details:`${GITHUB}/Health-Dashboard/blob/main/README.md`, tags:['python','pyqt','opengl']},
        {n:4, title:'Mortgage Overpayment Tracker', img:'mortgageTrackerScreen.webp', desc:'Amortisation simulation tool — model overpayment scenarios, see interest saved and payoff date at a glance.', code:`${GITHUB}/Mortgage-Overpayment-Tracker/blob/main/main.py`, details:`${GITHUB}/Mortgage-Overpayment-Tracker/blob/main/README.md`, tags:['python','finance']},
        {n:5, title:'Income Prophet', img:'', desc:'Time-series income forecasting — models growth trajectories and projects future earnings using statistical modelling.', code:`${GITHUB}/Income-Prophet/blob/main/main.py`, details:`${GITHUB}/Income-Prophet/blob/main/README.md`, tags:['python','forecasting','finance']},
        {n:6, title:'Desktop Widgets', img:'', desc:'Collection of always-on-top PyQt6 overlay widgets — BTC ticker, SPY/FTSE/Treasuries charts, crypto alerts, news reader, health tracker, mortgage calc and more.', code:`${GITHUB}/Desktop-Widgets`, details:`${GITHUB}/Desktop-Widgets/blob/main/README.md`, tags:['python','pyqt','crypto','api']},
        {n:7, title:'OCR Spin Extractor', img:'', desc:'Extracts spin session and exercise performance data from workout screenshots using an OCR pipeline, exported to CSV.', code:`${GITHUB}/OCR-Spin-Extractor/blob/main/main.py`, details:`${GITHUB}/OCR-Spin-Extractor/blob/main/README.md`, tags:['python','ocr','automation']},
        {n:8, title:'Health Planner Desktop', img:'', desc:'Cross-platform desktop health planner built with PyQt6 and QWebEngineView — hybrid Python/web UI for tracking workout regimens, health metrics and exercise logs.', code:`${GITHUB}/Health-Planner-Desktop/blob/main/main.py`, details:`${GITHUB}/Health-Planner-Desktop/blob/main/README.md`, tags:['python','pyqt','health','automation']}
      ],
      automation:[
        {n:1, title:'Adobe Script Toolkit', videoId:'JtVEtAiz0UU', desc:'Full Adobe automation toolkit — Python drives Illustrator via COM to run a complete sticker pack export pipeline (multi-size PNG/JPEG/SVG, watermarked previews, PDF sticker sheets, promo video). Plus native JSX scripts for Illustrator and After Effects: batch artboard export, vectorize, layer renaming, render queue automation.', code:`${GITHUB}/Adobe-Script-Toolkit/blob/main/illustrator/sticker_pack_export_pipeline.py`, details:`${GITHUB}/Adobe-Script-Toolkit/blob/main/README.md`, tags:['python','automation','extendscript','adobe','jsx']},
        {n:2, title:'PDF Data Extractor', img:'', desc:'Batch PDF text and table extraction pipeline — processes folders of PDFs, pulls structured data into usable formats.', code:`${GITHUB}/PDF-Data-Extractor/blob/main/main.py`, details:`${GITHUB}/PDF-Data-Extractor/blob/main/README.md`, tags:['python','automation','ocr']}
      ],
      trading:[
        {n:1, title:'Trading Algo Backtester', img:'', desc:'Multi-strategy algorithmic trading backtester with a scikit-learn ML layer — runs historical analysis and live market signals on crypto and equities.', code:`${GITHUB}/Trading-Algo-Backtester/blob/main/main.py`, details:`${GITHUB}/Trading-Algo-Backtester/blob/main/README.md`, tags:['python','trading','ml','backtesting']},
        {n:2, title:'Crypto News Aggregator', img:'', desc:'Scrapes CryptoPanic, organises articles by coin and sentiment, outputs clean Excel reports for market research.', code:`${GITHUB}/Crypto-News-Aggregator/blob/main/main.py`, details:`${GITHUB}/Crypto-News-Aggregator/blob/main/README.md`, tags:['python','crypto','trading','excel']}
      ],
      quant:[
        {n:1, title:'Quant Research Scripts', img:'', desc:'Quantitative finance experiments — NeuralProphet neural time-series forecasting and inflation-adjusted stock price analysis.', code:`${GITHUB}/Quant-Research-Scripts`, details:`${GITHUB}/Quant-Research-Scripts/blob/main/README.md`, tags:['python','quant','ml','forecasting']},
        {n:2, title:'Economic Dashboard', img:'', desc:'26 Python data pipelines pulling FRED API data — yield curves, housing starts, unemployment, CAPE ratio, credit spreads and more.', code:`${GITHUB}/Economic-Dashboard`, details:`${GITHUB}/Economic-Dashboard/blob/main/README.md`, tags:['python','economics','api','data-viz']}
      ]
    },

    /* ── EXCEL & VBA ──────────────────────────────────── */
    excelvba:{
      'vba-macros':[
        {n:1, title:'VBA Toolkit', img:'', desc:'General-purpose VBA macro library — reusable patterns for data processing, report formatting, file handling and Excel automation.', code:`${GITHUB}/VBA-Toolkit`, details:`${GITHUB}/VBA-Toolkit/blob/main/README.md`, tags:['vba','excel','automation']},
        {n:2, title:'VBA Report Automation', img:'', desc:'VBA macro suite automating end-to-end audit and operational reporting pipelines — from raw data extraction to formatted, distributable output.', code:`${GITHUB}/VBA-Report-Automation`, details:`${GITHUB}/VBA-Report-Automation/blob/main/README.md`, tags:['vba','excel','automation','reporting']},
        {n:3, title:'SAP GUI Automation', img:'', desc:'SAP GUI scripting templates using VBA — automates standard SAP transactions, data pulls and form submissions.', code:`${GITHUB}/SAP-GUI-Automation`, details:`${GITHUB}/SAP-GUI-Automation/blob/main/README.md`, tags:['vba','sap','automation']}
      ],
      'powerquery':[
        {n:1, title:'Power Query Toolkit', img:'', desc:'Power Query M templates for common data transformation patterns — cleaning, reshaping, merging and loading data in Excel. Production-ready and reusable across projects.', code:`${GITHUB}/Power-Query-Toolkit`, details:`${GITHUB}/Power-Query-Toolkit/blob/main/README.md`, tags:['excel','power-query','etl']},
        {n:2, title:'Excel Report Templates', img:'', desc:'Collection of professional Excel workbook templates — operational reports, team analytics, financial tools and SAP-integrated extracts. Sanitised for public use.', code:`${GITHUB}/Excel-Report-Templates`, details:`${GITHUB}/Excel-Report-Templates/blob/main/README.md`, tags:['excel','vba','reporting']}
      ],
      'power-automate':[]
    },

    /* ── POWER BI ─────────────────────────────────────── */
    powerbi:{
      dashboards:[],
      dataflow:[]
    },

    /* ── AI PROJECTS ──────────────────────────────────── */
    ai:{
      agents:[
        {n:1, title:'Spheria', img:'', desc:'Hero project — AI desktop OS with multi-agent orchestration, tool calling, persistent memory, and a custom animated orb interface. A fully autonomous desktop AI built in Python and PyQt6.', code:`${GITHUB}/Spheria`, details:`${GITHUB}/Spheria/blob/main/README.md`, tags:['ai','multi-agent','python','pyqt']}
      ],
      generativeai:[
        {n:1, title:'Enterprise GenAI Assistant', img:'ccmiChatbot_demo.webp', desc:'Custom enterprise chatbot leveraging Gemini 1.5 Flash — built and deployed for a team within days. RAG pipeline over internal documentation.', code:`${GITHUB}/Enterprise-GenAI-Assistant/blob/main/main.py`, demo:'https://ccmi-genai-chat.streamlit.app/', details:`${GITHUB}/Enterprise-GenAI-Assistant/blob/main/README.md`, tags:['ai','streamlit','gemini','prompt-eng']},
        {n:2, title:'AI Quiz Bot', img:'aiQuizbot.webp', desc:'Interactive knowledge testing with adaptive questioning powered by Gemini 1.5 Flash — generates fresh quizzes on any topic.', code:`${GITHUB}/AI-Quizbot/blob/main/main.py`, demo:'https://aiquizbot.streamlit.app/', details:`${GITHUB}/AI-Quizbot/blob/main/README.md`, tags:['ai','streamlit','gemini','prompt-eng']},
        {n:3, title:'Finance NL Query', img:'', desc:'Natural language interface for financial data — ask plain-English questions and get structured, queryable answers without writing code.', code:`${GITHUB}/Finance-NL-Query/blob/main/main.py`, details:`${GITHUB}/Finance-NL-Query/blob/main/README.md`, tags:['ai','nlp','finance','python']},
        {n:4, title:'ComfyUI Workflows', img:'', desc:'ComfyUI node-graph workflows for AI image generation pipelines — txt2img, img2img with 4x ESRGAN upscaling, plus Python automation scripts for batch queuing and auto-renaming generated outputs.', code:`${GITHUB}/ComfyUI-Workflows`, details:`${GITHUB}/ComfyUI-Workflows/blob/main/README.md`, tags:['ai','comfyui','stable-diffusion','python']},
        {n:5, title:'Portfolio AI Assistant', img:'', desc:'The AI assistant embedded in this portfolio — a Gemini-powered chat interface that knows my full project history and answers questions about my skills and experience in real time.', code:`${GITHUB}/Naadir-Dev-Portfolio.github.io`, details:`${GITHUB}/Naadir-Dev-Portfolio.github.io/blob/main/README.md`, tags:['ai','gemini','prompt-eng','js']}
      ],
      prompt:[
        {n:1, title:'AI Prompt Generator', img:'', desc:'Generates 1000+ diverse, categorised AI prompts and appends them to a master library — covers creative, technical, educational and analytical domains.', code:`${GITHUB}/AI-Prompt-Generator/blob/main/main.py`, details:`${GITHUB}/AI-Prompt-Generator/blob/main/README.md`, tags:['ai','prompt-eng','python']}
      ]
    },

    /* ── WEB APPS ─────────────────────────────────────── */
    web:{
      teamsites:[
        {n:1, title:'Team Hub Website', img:'ccmisite_demo.webp', desc:'Professional front-end portal for an internal data team — showcasing tools, projects and team info with a clean, responsive layout.', code:`${GITHUB}/Team-Hub-Website/tree/main`, demo:'https://ccmiteamsite-by-naadir.netlify.app/', details:`${GITHUB}/Team-Hub-Website/blob/main/README.md`, tags:['web','html','css','js']},
        {n:2, title:'Power BI Request Portal', img:'pbirequest.webp', desc:'Interactive request portal that walks stakeholders through the Power BI report commissioning process — replaces email back-and-forth.', code:`${GITHUB}/PowerBI-Request-Portal/blob/main/index.html`, demo:'https://powerbirequest-by-naadir.netlify.app/', details:`${GITHUB}/PowerBI-Request-Portal/blob/main/README.md`, tags:['web','html','powerbi']},
        {n:3, title:'Economics Dashboard Web', img:'', desc:'Interactive browser-based economics dashboard — live macro data, yield curves, housing, employment and inflation. Currently in development.', code:`${GITHUB}/Economics-Dashboard-Web`, details:`${GITHUB}/Economics-Dashboard-Web/blob/main/README.md`, tags:['web','js','economics','data-viz']}
      ],
      tools:[],
      cognitive:[
        {n:1, title:'Rain Drops Arithmetics', img:'raindropsScreen.webp', desc:'Fast-paced arithmetic training game inspired by Lumosity\'s Rain Drops — tests mental calculation speed under pressure.', code:`${GITHUB}/RainDrops/blob/main/index.html`, demo:'https://raindrops-by-naadir.netlify.app/', tags:['web','js','game']},
        {n:2, title:'Hexamatch Fractions', img:'hexamatchScreen.webp', desc:'Hexagonal tile-matching game that builds intuitive understanding of equivalent fractions through play.', code:`${GITHUB}/Hexamatch/blob/main/index.html`, demo:'https://hexamatch-by-naadir.netlify.app/', tags:['web','js','game']},
        {n:3, title:'AlgebraVerse', img:'algebraverseScreen.webp', desc:'Progressive algebra challenge system — from basic equations to multi-step problem solving, with difficulty scaling.', code:`${GITHUB}/Algebraverse/blob/main/index.html`, demo:'https://algebraverse-by-naadir.netlify.app/', tags:['web','js','game']},
        {n:4, title:'Logic Grid Boolean', img:'logicgridscreen.webp', desc:'Visual boolean logic gate puzzle — helps players build intuitive understanding of AND, OR and NOT operations.', code:`${GITHUB}/LogicGrid/blob/main/index.html`, demo:'https://logicgrid-by-naadir.netlify.app/', tags:['web','js','game']}
      ]
    },

    /* ── MOBILE ───────────────────────────────────────── */
    mobile:{
      android:[
        {n:1, title:'Mobile Health Planner', img:'', desc:'React Native health planning app for Android — workout logger, regimen tracker and health metrics built with Expo SDK 54 and TypeScript. Deep-link ready with custom URI scheme.', code:`${GITHUB}/Mobile-Health-Planner`, details:`${GITHUB}/Mobile-Health-Planner/blob/main/README.md`, tags:['react-native','mobile','health','typescript']}
      ]
    },

    /* ── BROWSER EXTENSIONS ───────────────────────────── */
    browserextensions:{'google-chrome':[]}

  };

  const BOOKS = [
    {title:'SMART OFFICE: Harness AI to Work Better', img:'smartOffice.png'},
    {title:'Prompt Playground: 1000 AI Prompts', img:'prompt.png'},
    {title:'Start Coding with AI', img:'code.png'},
    {title:'Cognitive Upgrade: Learn Faster with AI', img:'cognitive.png'}
  ];

  /* ══════════════════════════════════════════════
     1. HERO RAIL — smooth infinite carousel
        + staggered per-panel video injection
     ══════════════════════════════════════════════ */
  function initHeroRail(){
    const rail = document.getElementById('heroRail');
    if(!rail) return;

    // Apply per-panel skew
    rail.querySelectorAll('.hero-panel').forEach(p=>{
      const sk = p.dataset.skew||'-8';
      p.style.setProperty('--sk', sk+'deg');
    });

    // Build infinite loop track from original panels
    const orig = Array.from(rail.querySelectorAll('.hero-panel'));
    const track = document.createElement('div');
    track.className = 'hero-track';
    orig.forEach(p=>track.appendChild(p));
    orig.forEach(p=>{ const c=p.cloneNode(true); c.setAttribute('aria-hidden','true'); track.appendChild(c); });
    rail.appendChild(track);

    const all   = track.querySelectorAll('.hero-panel');
    const firstClone = all[orig.length];

    let x=0, loopW=1, spd=0, drag=false, dx0=0, off0=0;
    let prev=0;
    const TARGET = window.matchMedia('(pointer:coarse)').matches ? 24 : 32;

    function measure(){
      if(!firstClone||!all[0]) return;
      loopW = Math.max(1, firstClone.offsetLeft - all[0].offsetLeft);
      x = ((x%loopW)+loopW)%loopW;
    }

    function tick(ts){
      if(!prev) prev=ts;
      const dt = Math.min(30, ts-prev)/1000;
      prev=ts;
      if(loopW<=1) measure();
      const tgt = drag ? 0 : TARGET;
      spd += (tgt-spd)*0.05;
      if(!drag && Math.abs(spd)>0.05){
        x += spd*dt;
        x = ((x%loopW)+loopW)%loopW;
      }
      track.style.transform = `translate3d(${-x}px,0,0)`;
      requestAnimationFrame(tick);
    }

    rail.addEventListener('pointerdown', e=>{
      if(e.pointerType==='mouse'&&e.button!==0) return;
      drag=true; dx0=e.clientX; off0=x;
      rail.classList.add('dragging');
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', e=>{
      if(!drag) return;
      x = ((off0-(e.clientX-dx0)*1.4)%loopW+loopW)%loopW;
      e.preventDefault();
    });
    function stopDrag(){
      if(!drag) return;
      drag=false; rail.classList.remove('dragging');
    }
    rail.addEventListener('pointerup', stopDrag);
    rail.addEventListener('pointercancel', stopDrag);
    rail.addEventListener('lostpointercapture', stopDrag);
    rail.addEventListener('touchstart',()=>{ drag=true; },{passive:true});
    rail.addEventListener('touchend',  ()=>{ drag=false; },{passive:true});

    measure();
    window.addEventListener('resize', measure, {passive:true});
    requestAnimationFrame(tick);

    // Inject videos into originals AND their clones simultaneously so both
    // instances play the same video — seamless on ultra-wide screens.
    const clones = Array.from(all).slice(orig.length);
    injectPanelVideos(orig, clones);
  }

  /* Inject one YouTube iframe per original panel AND its clone in parallel.
     Both fire at the same stagger slot so wide screens see continuous playback.
     Notes:
       • vq=large  → requests 480p quality to save bandwidth
       • NO loading="lazy" — lazy-load blocks off-viewport iframes immediately
       • Full allow= string required by Chrome autoplay policy
       • Stagger starts at 600ms so first panels get video quickly          */
  function injectPanelVideos(panels, mirrors){
    const PARAMS = 'autoplay=1&mute=1&loop=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&showinfo=0&enablejsapi=0&vq=large';

    function makeIframe(vid, targetPanel){
      if(targetPanel.querySelector('.panel-iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${vid}?${PARAMS}&playlist=${vid}`;
      // Full allow string — Chrome requires all of these for muted autoplay
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.tabIndex = -1;
      iframe.className = 'panel-iframe';
      targetPanel.insertBefore(iframe, targetPanel.querySelector('.hero-panel-glass'));
    }

    panels.forEach((panel, i)=>{
      const vid = panel.dataset.video;
      if(!vid) return;

      // Stagger: 600ms, 1200ms, 1800ms, 2400ms, 3000ms
      // Original and its clone both injected at the same moment
      setTimeout(()=>{
        makeIframe(vid, panel);
        const mirror = mirrors && mirrors[i];
        if(mirror) makeIframe(vid, mirror);
      }, 600 + i * 600);
    });
  }

  /* ══════════════════════════════════════════════
     2. TABS & EDITORIAL CARDS
     ══════════════════════════════════════════════ */

  /* Featured card (n===1) — editorial horizontal split, single image. */
  function buildFeaturedCard(p){
    const src = p.videoId
      ? `https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`
      : `${IMGS}${p.img || (p.imgs && p.imgs[0]) || ''}`;
    return `
      <div class="card card-featured" ${p.videoId?`data-vid="${p.videoId}"`:''}>
        <div class="card-editorial-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="card-links">
            ${p.demo?`<a href="${p.demo}" target="_blank" rel="noreferrer">Live</a>`:''}
            ${p.code?`<a href="${p.code}" target="_blank" rel="noreferrer">Code</a>`:''}
            ${p.details?`<a href="${p.details}" target="_blank" rel="noreferrer">Details</a>`:''}
          </div>
        </div>
        <div class="card-editorial-img">
          <img src="${src}" alt="${p.title}" loading="lazy">
        </div>
      </div>`;
  }

  /* Gallery cards (n>1) — landscape split: text left, image right */
  function buildGalleryCard(p){
    const src = p.videoId
      ? `https://img.youtube.com/vi/${p.videoId}/hqdefault.jpg`
      : `${IMGS}${p.img}`;
    return `
      <div class="card card-gallery" ${p.videoId?`data-vid="${p.videoId}"`:''}>
        <img src="${src}" alt="${p.title}" loading="lazy">
        <div class="card-gal-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="card-links">
            ${p.demo?`<a href="${p.demo}" target="_blank" rel="noreferrer">Live</a>`:''}
            ${p.code?`<a href="${p.code}" target="_blank" rel="noreferrer">Code</a>`:''}
            ${p.details?`<a href="${p.details}" target="_blank" rel="noreferrer">Details</a>`:''}
          </div>
        </div>
      </div>`;
  }

  function buildCard(p){
    return p.n === 1 ? buildFeaturedCard(p) : buildGalleryCard(p);
  }

  /* initGrid — renders featured card + paginated gallery (6 per page) */
  function initGrid(g, arr){
    if(!arr.length){
      g.innerHTML = '<div class="card placeholder-card"><div><h3>Coming Soon</h3><p>Projects arriving shortly.</p></div></div>';
      return;
    }
    const featured = arr.filter(p => p.n === 1);
    const rest     = arr.filter(p => p.n !== 1);
    const PAGE = 6;

    function render(page){
      const totalPages = Math.max(1, Math.ceil(rest.length / PAGE));
      const slice = rest.slice(page * PAGE, page * PAGE + PAGE);
      const dots = Array.from({length:totalPages}, (_,i) =>
        `<span class="page-dot${i===page?' active':''}" data-p="${i}"></span>`
      ).join('');
      const paginator = totalPages > 1 ? `
        <div class="pagination">
          <button class="page-btn page-prev"${page===0?' disabled':''}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span class="page-dots">${dots}</span>
          <button class="page-btn page-next"${page===totalPages-1?' disabled':''}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>` : '';

      g.innerHTML = [...featured.map(buildCard), ...slice.map(buildCard), paginator].join('');

      g.querySelector('.page-prev')?.addEventListener('click', ()=>render(page-1));
      g.querySelector('.page-next')?.addEventListener('click', ()=>render(page+1));
      g.querySelectorAll('.page-dot').forEach(d =>
        d.addEventListener('click', () => render(+d.dataset.p))
      );
    }

    render(0);
  }

  function populateGrids(){
    for(const [cat,subs] of Object.entries(DATA)){
      for(const [sub,arr] of Object.entries(subs)){
        const g = document.getElementById(`grid-${cat}-${sub}`);
        if(!g) continue;
        initGrid(g, arr);
      }
    }
  }

  function initTabs(){
    const bar  = document.getElementById('proj-tabs');
    const sub$ = document.getElementById('proj-subtitle');
    if(!bar) return;

    function showTab(cat, desc){
      bar.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.target===cat));
      document.querySelectorAll('.sub-nav').forEach(s=>s.classList.toggle('open', s.id===`sub-${cat}`));
      if(sub$&&desc) sub$.textContent = desc;
    }

    function showPanel(cat,sub){
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      const el=document.getElementById(`panel-${cat}-${sub}`);
      if(el) el.classList.add('active');
    }

    function showSub(cat,sub){
      const nav=document.getElementById(`sub-${cat}`);
      if(!nav) return;
      nav.querySelectorAll('.sub-btn').forEach(b=>b.classList.toggle('active', b.dataset.subtarget===sub));
      showPanel(cat,sub);
    }

    bar.addEventListener('click', e=>{
      const b=e.target.closest('.tab-btn');
      if(!b) return;
      showTab(b.dataset.target, b.dataset.desc);
      const nav=document.getElementById(`sub-${b.dataset.target}`);
      const first=nav?.querySelector('.sub-btn.active')||nav?.querySelector('.sub-btn');
      if(first) showSub(b.dataset.target, first.dataset.subtarget);
    });

    document.querySelectorAll('.sub-nav').forEach(nav=>{
      nav.addEventListener('click', e=>{
        const b=e.target.closest('.sub-btn');
        if(!b) return;
        showSub(nav.id.replace('sub-',''), b.dataset.subtarget);
      });
    });

    showTab('ai', bar.querySelector('[data-target="ai"]')?.dataset.desc||'');
    showSub('ai','agents');
  }

  /* Click gallery/featured card video to open YouTube */
  function initVideoCards(){
    document.addEventListener('click', e=>{
      const card = e.target.closest('[data-vid]');
      if(!card) return;
      // Open YouTube in new tab (gallery cards don't inline-play — keeps layout clean)
      const vid = card.dataset.vid;
      if(vid && !e.target.closest('.card-links')){
        window.open(`https://www.youtube.com/watch?v=${vid}`, '_blank', 'noreferrer');
      }
    });
  }

  /* ══════════════════════════════════════════════
     3. SKILLS — auto-calculated from project data
     ══════════════════════════════════════════════ */
  function initSkills(){
    const grid=document.getElementById('skills-grid');
    if(!grid) return;
    const tagN={}, catN={};
    for(const [cat,subs] of Object.entries(DATA)){
      let n=0;
      for(const arr of Object.values(subs)){
        n+=arr.length;
        arr.forEach(p=>(p.tags||[]).forEach(t=>{ tagN[t]=(tagN[t]||0)+1; }));
      }
      catN[cat]=n;
    }
    const defs=[
      {name:'Python',               cats:['python'],                    tags:['python','pyqt'],                base:22},
      {name:'VBA / Excel',          cats:['excelvba'],                  tags:['vba','excel'],                  base:26},
      {name:'Power BI',             cats:['powerbi'],                   tags:['powerbi'],                      base:21},
      {name:'JavaScript / Web',     cats:['web','browserextensions'],   tags:['js','web','html','css','game'], base:12},
      {name:'AI / Machine Learning',cats:['ai'],                        tags:['ai','gemini','streamlit'],      base:16},
      {name:'Automation',           cats:[],                            tags:['automation','extendscript'],    base:22},
      {name:'Prompt Engineering',   cats:[],                            tags:['prompt-eng'],                   base:19},
      {name:'Data Visualisation',   cats:[],                            tags:['data-viz','pyqt'],              base:16},
      {name:'React Native / Mobile',cats:['mobile'],                    tags:['react-native','mobile'],        base:8},
      {name:'Power Automate',       cats:['excelvba'],                  tags:['power-automate'],               base:19}
    ];
    const scores=defs.map(d=>{
      let s=d.base;
      d.cats.forEach(c=>{s+=(catN[c]||0)*8});
      d.tags.forEach(t=>{s+=(tagN[t]||0)*5});
      return {name:d.name,s};
    });
    const max=Math.max(...scores.map(x=>x.s));
    const skills=scores
      .map(x=>({name:x.name, pct:Math.min(96,Math.max(30,Math.round(x.s/max*96)))}))
      .sort((a,b)=>b.pct-a.pct);
    grid.innerHTML=skills.map(s=>`
      <div class="skill-item">
        <div class="skill-label-row"><span>${s.name}</span><span class="pct">${s.pct}%</span></div>
        <div class="skill-track"><div class="skill-fill" data-w="${s.pct}"></div></div>
      </div>`).join('');
  }
  function animateSkills(){
    document.querySelectorAll('.skill-fill').forEach(f=>{f.style.width=f.dataset.w+'%'});
  }

  /* ══════════════════════════════════════════════
     4. BOOKS CAROUSEL
     ══════════════════════════════════════════════ */
  function initBooks(){
    const track=document.getElementById('booksTrack');
    if(!track) return;
    const all=[...BOOKS,...BOOKS,...BOOKS];
    track.innerHTML=all.map(b=>`
      <div class="book-card"><a href="#">
        <img src="${IMGS}${b.img}" alt="${b.title}">
        <span>${b.title}</span>
      </a></div>`).join('');
    let pos=0,spd=0.2,tgt=0.2,drag=false,dx0=0,dp0=0,vel=0,lx=0,lt=0,held=false;
    const bw=170+14.4, loop=bw*BOOKS.length;
    (function frame(){
      if(!drag) spd+=(tgt-spd)*0.07;
      if(!drag) pos-=spd;
      if(pos<=-loop) pos+=loop; if(pos>0) pos-=loop;
      track.style.transform=`translateX(${pos}px)`;
      requestAnimationFrame(frame);
    })();
    track.addEventListener('mousedown',e=>{drag=true;dx0=e.clientX;dp0=pos;lx=dx0;lt=Date.now();track.classList.add('dragging')});
    track.addEventListener('touchstart',e=>{drag=true;dx0=e.touches[0].clientX;dp0=pos;lx=dx0;lt=Date.now()},{passive:true});
    document.addEventListener('mousemove',e=>{if(!drag)return;pos=dp0+(e.clientX-dx0);const n=Date.now();if(n-lt>0){vel=(lx-e.clientX)/(n-lt);lx=e.clientX;lt=n}});
    document.addEventListener('touchmove',e=>{if(!drag)return;const cx=e.touches[0].clientX;pos=dp0+(cx-dx0);const n=Date.now();if(n-lt>0){vel=(lx-cx)/(n-lt);lx=cx;lt=n}},{passive:true});
    function end(){if(!drag)return;drag=false;track.classList.remove('dragging');if(Math.abs(vel)>0.1){tgt=vel*18;setTimeout(()=>{tgt=0.2},700)}}
    document.addEventListener('mouseup',end);document.addEventListener('touchend',end);
    track.addEventListener('mouseenter',()=>{if(!held)tgt=0});
    track.addEventListener('mouseleave',()=>{if(!held)tgt=0.2});
    const prev=document.querySelector('.carousel-prev'),next=document.querySelector('.carousel-next');
    if(prev){prev.addEventListener('mousedown',()=>{held=true;tgt=-2});prev.addEventListener('touchstart',()=>{held=true;tgt=-2},{passive:true})}
    if(next){next.addEventListener('mousedown',()=>{held=true;tgt=2});next.addEventListener('touchstart',()=>{held=true;tgt=2},{passive:true})}
    document.addEventListener('mouseup',()=>{if(held){held=false;tgt=0.2}});
  }

  /* ══════════════════════════════════════════════
     5. FLOATING AI CHAT
     ══════════════════════════════════════════════ */
  function initAI(){
    const fab=document.getElementById('ai-fab'),chat=document.getElementById('ai-chat');
    const close=document.getElementById('ai-close'),form=document.getElementById('ai-form');
    const inp=document.getElementById('ai-input'),snd=document.getElementById('ai-send');
    const msgs=document.getElementById('ai-messages'),initEl=document.getElementById('ai-initial-text');
    if(!fab||!chat||!form) return;
    let open=false,typing=false,typed=false;
    let history=[{role:'user',parts:[{text:AI_SYS}]}];

    fab.addEventListener('click',()=>{
      open=true;chat.classList.add('open');fab.classList.add('hidden');
      if(!typed){typed=true;typeText(initEl,"Hi! Ask me about Naadir's skills, projects, or experience.",msgs)}
      inp.focus();
    });
    close.addEventListener('click',()=>{open=false;chat.classList.remove('open');fab.classList.remove('hidden')});

    form.addEventListener('submit',async e=>{
      e.preventDefault();if(typing)return;
      const txt=inp.value.trim();if(!txt)return;
      inp.value='';
      history.push({role:'user',parts:[{text:txt}]});
      addBubble('user',txt);
      const bot=addBubble('bot');
      typing=true;inp.disabled=snd.disabled=true;
      try{
        const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({history})});
        if(!r.ok) throw new Error(r.status);
        const d=await r.json();
        if(d.text){history.push({role:'model',parts:[{text:d.text}]});await typeText(bot.span,d.text,msgs)}
        else throw new Error('empty');
      }catch{
        bot.span.textContent='Something went wrong. Please try again.';
        if(history.length&&history[history.length-1].role==='user') history.pop();
      }
      bot.cursor.classList.add('hidden');
      typing=false;inp.disabled=snd.disabled=false;inp.focus();
    });

    function addBubble(role,text){
      const d=document.createElement('div');
      d.className=`ai-msg ai-msg-${role}`;
      if(role==='user'){d.textContent=text;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d}
      d.innerHTML='<span class="ai-msg-text"></span><span class="ai-cursor"></span>';
      msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
      return{span:d.querySelector('.ai-msg-text'),cursor:d.querySelector('.ai-cursor')};
    }
  }

  function typeText(el,text,sc){
    return new Promise(res=>{
      let i=0;el.textContent='';
      (function t(){if(i<text.length){el.textContent+=text[i++];if(sc)sc.scrollTop=sc.scrollHeight;setTimeout(t,13)}else res()})();
    });
  }

  /* ══════════════════════════════════════════════
     6. REVEAL, HEADER, ACTIVE NAV
     ══════════════════════════════════════════════ */
  function initReveal(){
    const obs=new IntersectionObserver(es=>{
      es.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          if(e.target.querySelector('#skills-grid')) setTimeout(animateSkills,150);
          obs.unobserve(e.target);
        }
      });
    },{threshold:0.07});
    document.querySelectorAll('.reveal-section').forEach(el=>obs.observe(el));
  }

  function initHeader(){
    const h=document.getElementById('site-header');
    window.addEventListener('scroll',()=>{ h?.classList.toggle('scrolled',scrollY>30); },{passive:true});
    const tog=document.querySelector('.nav-toggle'),nav=document.querySelector('.top-nav');
    if(tog&&nav){
      tog.addEventListener('click',()=>{const o=tog.classList.toggle('open');tog.setAttribute('aria-expanded',o);nav.classList.toggle('show',o)});
      nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{tog.classList.remove('open');nav.classList.remove('show')}));
    }
    document.querySelectorAll('section[id]').forEach(s=>{
      new IntersectionObserver(es=>{
        es.forEach(e=>{if(e.isIntersecting) document.querySelectorAll('.top-nav a[href^="#"]').forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id))});
      },{threshold:0.2,rootMargin:'-52px 0px -50% 0px'}).observe(s);
    });
  }

  /* ══ INIT ══ */
  function init(){
    const y=document.getElementById('year');if(y) y.textContent=new Date().getFullYear();
    initHeader();
    initHeroRail();
    populateGrids();
    initTabs();
    initVideoCards();
    initSkills();
    initBooks();
    initAI();
    initReveal();
  }

  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',init) : init();
})();
