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

  /* DATA is loaded from assets/js/data.js (compiled by GitHub Actions) */
  const DATA = (window.__PORTFOLIO && window.__PORTFOLIO.DATA) || {};

  const BOOKS = [
    {title:'SMART OFFICE: Harness AI to Work Better', img:'smartOffice.png'},
    {title:'Prompt Playground: 1000 AI Prompts', img:'prompt.png'},
    {title:'Start Coding with AI', img:'code.png'},
    {title:'Cognitive Upgrade: Learn Faster with AI', img:'cognitive.png'}
  ];

  /* ══════════════════════════════════════════════
     1. HERO RAIL — smooth infinite carousel
        + staggered per-panel MP4 injection
     ══════════════════════════════════════════════ */
  function initHeroRail(){
    const rail = document.getElementById('heroRail');
    if(!rail) return;

    // Build infinite loop track from original panels
    const orig = Array.from(rail.querySelectorAll('.hero-panel'));
    const track = document.createElement('div');
    track.className = 'hero-track';
    orig.forEach(p=>track.appendChild(p));
    orig.forEach(p=>{ const c=p.cloneNode(true); c.setAttribute('aria-hidden','true'); track.appendChild(c); });
    rail.appendChild(track);

    const all        = track.querySelectorAll('.hero-panel');
    const firstClone = all[orig.length];

    let x=0, loopW=1;
    let drag=false, dx0=0, off0=0, hasDragged=false;
    const PX_PER_SEC = window.matchMedia('(pointer:coarse)').matches ? 24 : 32;

    /* Compute the parallelogram clip-path offset in px from actual panel height.
       tan(8°) ≈ 0.14054. Set as a CSS custom property so the clip-path in CSS
       stays accurate at every viewport size. Called once on init and on resize. */
    function updateClipPath(){
      const panel = all[0];
      if(!panel) return;
      const offset = Math.round(Math.tan(8 * Math.PI / 180) * panel.offsetHeight);
      document.documentElement.style.setProperty('--panel-offset-x', offset + 'px');
    }

    /* startScroll — engages the compositor-thread CSS animation from position x.
       A negative animationDelay offsets the keyframe so the carousel starts
       exactly at x pixels into the loop — no visible jump on resume after drag. */
    function startScroll(){
      const dur = loopW / PX_PER_SEC;
      document.documentElement.style.setProperty('--hero-loop-w', loopW + 'px');
      document.documentElement.style.setProperty('--hero-scroll-dur', dur + 's');
      track.style.transform = '';
      track.style.animationDelay = (-(x / loopW) * dur) + 's';
      track.classList.add('is-scrolling');
    }

    function measure(){
      if(!firstClone||!all[0]) return;
      // updateClipPath MUST run before reading offsetLeft.
      // Setting --panel-offset-x changes margin-right on every panel
      // (margin-right: calc(12px - var(--panel-offset-x))), so loopW
      // must be computed AFTER the variable is updated — reading
      // offsetLeft here forces a synchronous reflow so the new margin
      // is already in effect.
      updateClipPath();
      loopW = Math.max(1, Math.round(firstClone.offsetLeft - all[0].offsetLeft));
      x = ((x%loopW)+loopW)%loopW;
      if(!drag) startScroll();
    }

    rail.addEventListener('pointerdown', e=>{
      if(e.pointerType==='mouse'&&e.button!==0) return;
      // Read the current compositor position before killing the animation —
      // getComputedStyle returns the live animated matrix value synchronously.
      const mat = new DOMMatrix(getComputedStyle(track).transform);
      x = ((-mat.m41 % loopW) + loopW) % loopW;
      track.classList.remove('is-scrolling');
      track.style.transform = `translate3d(${-Math.round(x)}px,0,0)`;
      drag=true; hasDragged=false; dx0=e.clientX; off0=x;
      rail.classList.add('dragging');
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', e=>{
      if(!drag) return;
      if(Math.abs(e.clientX - dx0) > 5) hasDragged = true;
      x = ((off0-(e.clientX-dx0)*1.4)%loopW+loopW)%loopW;
      track.style.transform = `translate3d(${-Math.round(x)}px,0,0)`;
      e.preventDefault();
    });
    function stopDrag(){
      if(!drag) return;
      drag=false; rail.classList.remove('dragging');
      startScroll();
    }
    /* Prevent panel content links from navigating when user was dragging */
    rail.addEventListener('click', e=>{
      if(hasDragged){
        const link = e.target.closest('a.hero-panel-content');
        if(link){ e.preventDefault(); }
        hasDragged = false;
      }
    });
    rail.addEventListener('pointerup', stopDrag);
    rail.addEventListener('pointercancel', stopDrag);
    rail.addEventListener('lostpointercapture', stopDrag);
    rail.addEventListener('touchstart',()=>{ drag=true; },{passive:true});
    rail.addEventListener('touchend', stopDrag ,{passive:true});

    measure();
    window.addEventListener('resize', measure, {passive:true});

    // Originals first, then clones after a delay so originals always win the
    // decode queue — clones are the mirror for wide-screen loop continuity.
    const clones = Array.from(all).slice(orig.length);
    injectPanelMedia(orig, clones);
  }

  /* injectPanelMedia — MP4/WebM video injection for hero parallelograms.
     Originals stagger at 150ms intervals starting immediately.
     Clones stagger at 150ms intervals starting after all originals have begun,
     so the browser prioritises the visible panels on initial load.            */
  function injectPanelMedia(panels, mirrors){

    function makeVideo(targetPanel){
      if(targetPanel.querySelector('.panel-media')) return;
      const src = targetPanel.dataset.media;
      if(!src) return;

      const video = document.createElement('video');
      video.src         = src;
      video.autoplay    = true;
      video.muted       = true;
      video.loop        = true;
      video.playsInline = true;
      video.setAttribute('autoplay','');
      video.setAttribute('muted','');
      video.setAttribute('loop','');
      video.setAttribute('playsinline','');
      video.setAttribute('aria-hidden','true');
      video.className   = 'panel-media';

      targetPanel.insertBefore(video, targetPanel.querySelector('.hero-panel-glass'));
      video.play().catch(()=>{});
    }

    // Originals: 0ms, 150ms, 300ms, 450ms, 600ms
    panels.forEach((panel, i)=>{
      if(!panel.dataset.media) return;
      setTimeout(()=>{ makeVideo(panel); }, i * 150);
    });

    // Clones: start after all originals (750ms base), same 150ms cadence
    if(mirrors){
      mirrors.forEach((panel, i)=>{
        if(!panel.dataset.media) return;
        setTimeout(()=>{ makeVideo(panel); }, 750 + i * 150);
      });
    }
  }

  /* ══════════════════════════════════════════════
     2. TABS & EDITORIAL CARDS
     ══════════════════════════════════════════════ */

  /* Resolve video href + thumbnail ID from card data.
     Accepts either: videoId:"ABC" (YouTube ID) or video:"https://youtu.be/ABC" (full URL). */
  function resolveVideo(p){
    if(p.videoId) return { id: p.videoId, href: `https://www.youtube.com/watch?v=${p.videoId}` };
    if(p.video){
      const m = p.video.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      const id = m ? m[1] : null;
      return { id, href: p.video };
    }
    return null;
  }

  /* Priority href when user clicks a card body (not a button): live > video > details > code */
  function cardHref(p){
    const vid = resolveVideo(p);
    return p.demo || (vid && vid.href) || p.details || p.code || null;
  }

  /* Featured card (n===1) — editorial horizontal split, single image. */
  function buildFeaturedCard(p){
    const vid = resolveVideo(p);
    const src = vid ? `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`
                    : `${IMGS}${p.img || (p.imgs && p.imgs[0]) || ''}`;
    const href = cardHref(p);
    return `
      <div class="card card-featured"${href?` data-href="${href}"`:''}>
        <div class="card-editorial-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="card-links">
            ${p.demo?`<a href="${p.demo}" target="_blank" rel="noreferrer">Live</a>`:''}
            ${vid?`<a href="${vid.href}" target="_blank" rel="noreferrer">Video</a>`:''}
            ${p.details?`<a href="${p.details}" target="_blank" rel="noreferrer">Details</a>`:''}
            ${p.code?`<a href="${p.code}" target="_blank" rel="noreferrer">Code</a>`:''}
          </div>
        </div>
        <div class="card-editorial-img">
          <img src="${src}" alt="${p.title}" loading="lazy">
        </div>
      </div>`;
  }

  /* Gallery cards (n>1) — landscape split: text left, image right */
  function buildGalleryCard(p){
    const vid = resolveVideo(p);
    const src = vid ? `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`
                    : `${IMGS}${p.img}`;
    const href = cardHref(p);
    return `
      <div class="card card-gallery"${href?` data-href="${href}"`:''}>
        <img src="${src}" alt="${p.title}" loading="lazy">
        <div class="card-gal-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="card-links">
            ${p.demo?`<a href="${p.demo}" target="_blank" rel="noreferrer">Live</a>`:''}
            ${vid?`<a href="${vid.href}" target="_blank" rel="noreferrer">Video</a>`:''}
            ${p.details?`<a href="${p.details}" target="_blank" rel="noreferrer">Details</a>`:''}
            ${p.code?`<a href="${p.code}" target="_blank" rel="noreferrer">Code</a>`:''}
          </div>
        </div>
      </div>`;
  }

  function buildCard(p){
    return p.n === 1 ? buildFeaturedCard(p) : buildGalleryCard(p);
  }

  /* initGrid — renders featured card + paginated gallery (6 per page) */
  function initGrid(g, arr){
    const EMPTY_PAGINATION = `
      <div class="pagination pagination-spacer">
        <button class="page-btn page-prev" disabled>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="page-dots"></span>
        <button class="page-btn page-next" disabled>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>`;

    if(!arr.length){
      g.innerHTML = `<div class="gallery-wrap"><div class="gallery-cards"><div class="card placeholder-card"><div><h3>Coming Soon</h3><p>Projects arriving shortly.</p></div></div></div>${EMPTY_PAGINATION}</div>`;
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
      /* Pagination is ALWAYS rendered — even on page 1 of 1 (visibility:hidden)
         so the dots row always occupies its reserved space at the bottom */
      const paginator = `
        <div class="pagination${totalPages <= 1 ? ' pagination-spacer' : ''}">
          <button class="page-btn page-prev"${page===0?' disabled':''}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span class="page-dots">${totalPages > 1 ? dots : ''}</span>
          <button class="page-btn page-next"${page===totalPages-1?' disabled':''}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>`;

      const galHtml = slice.map(buildCard).join('');
      g.innerHTML = [
        ...featured.map(buildCard),
        `<div class="gallery-wrap"><div class="gallery-cards">${galHtml}</div>${paginator}</div>`
      ].join('');

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

    showTab('python', bar.querySelector('[data-target="python"]')?.dataset.desc||'');
    showSub('python','desktop');
  }

  /* Click a card body (not a button) → open priority link: live > video > details > code */
  function initVideoCards(){
    document.addEventListener('click', e=>{
      const card = e.target.closest('[data-href]');
      if(!card) return;
      if(e.target.closest('.card-links')) return; // let buttons handle themselves
      const href = card.dataset.href;
      if(href) window.open(href, '_blank', 'noreferrer');
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
      {name:'AI / Agents',          cats:['ai'],                        tags:['ai','gemini'],                  base:16},
      {name:'Automation',           cats:[],                            tags:['automation','extendscript'],    base:22},
      {name:'Data Visualisation',   cats:[],                            tags:['data-viz','pyqt'],              base:16},
      {name:'Data Transformation',  cats:['excelvba','powerbi'],        tags:['power-query','etl','vba','excel','dataflow'], base:20},
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
    // Hero CTA "AI Assistant" button — toggles chat open/closed
    document.getElementById('hero-ai-btn')?.addEventListener('click',()=>{
      chat.classList.contains('open') ? close.click() : fab.click();
    });

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

  /* ══════════════════════════════════════════════
     7. MOBILE PARALLAX — scroll-driven inner div
        (replaces broken background-attachment:fixed on touch)
     ══════════════════════════════════════════════ */
  function initMobileParallax(){
    if(!window.matchMedia('(max-width:900px)').matches) return;
    const inners = document.querySelectorAll('.parallax-strip .parallax-inner');
    if(!inners.length) return;
    function update(){
      inners.forEach(inner=>{
        const strip = inner.parentElement;
        const rect  = strip.getBoundingClientRect();
        // progress 0→1 as strip travels from viewport-bottom to viewport-top
        const progress = 1 - (rect.bottom / (window.innerHeight + rect.height));
        // shift ±60px — well within the 600%/top:-250% overflow margin
        inner.style.transform = `translateY(${(progress - 0.5) * 120}px)`;
      });
    }
    window.addEventListener('scroll', update, {passive:true});
    update();
  }

  /* ══ 8. PARALLAX IMAGE AUTO-DETECT ══════════════════════════════════
     Probes assets/images/ for parallax.webp → .jpg → .jpeg → .png in
     order of compression efficiency.  First one that loads wins and is
     written into --parallax-img so every strip updates instantly.
     Drop any of those four files into the folder — no code change needed.
     ══════════════════════════════════════════════════════════════════ */
  function initParallaxImage(){
    const candidates = [
      'assets/images/parallax.webp',
      'assets/images/parallax.jpg',
      'assets/images/parallax.jpeg',
      'assets/images/parallax.png'
    ];
    function tryNext(i){
      if(i >= candidates.length) return; // none found — CSS default stands
      const img = new Image();
      img.onload = ()=>{
        // img.src is the browser-resolved absolute URL — safe for use in CSS
        // regardless of where the stylesheet lives relative to the document.
        document.documentElement.style.setProperty(
          '--parallax-img', `url('${img.src}')`
        );
      };
      img.onerror = ()=> tryNext(i + 1);
      img.src = candidates[i];
    }
    tryNext(0);
  }

  /* ══ INIT ══ */
  function init(){
    const y=document.getElementById('year');if(y) y.textContent=new Date().getFullYear();
    initParallaxImage();
    initHeader();
    initHeroRail();
    populateGrids();
    initTabs();
    initVideoCards();
    initSkills();
    initBooks();
    initAI();
    initReveal();
    initMobileParallax();
  }

  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',init) : init();
})();
