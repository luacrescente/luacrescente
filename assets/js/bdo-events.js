/* Seção "Eventos" da Home — v6
   - Duas abas: Temporários / Permanentes
   - Timeline tipo Garmoth: barra por evento
   - Janela começa 2 dias antes de hoje
   - Badge "Xd" FORA da barra (direita)
   - Permanentes: barra cinza, sem badge, sem ∞
*/
(function(){
  'use strict';

  const root = document.getElementById('eventsTimeline');
  if(!root) return;

  const CACHE_KEY = 'luaCrescenteEventsCache_v6';
  const START_KEY = 'luaCrescenteEventStart_v6';
  const DAY_MS = 86400000;
  const DAY_WIDTH = 44;
  const ROW_HEIGHT = 36;
  const BAR_HEIGHT = 24;
  const PERMANENT_WINDOW_DAYS = 60;
  const DAYS_BACK = 2;

  function cacheTTL(){
    const now = new Date();
    const br = new Date(now.getTime() - 3 * 3600 * 1000);
    const day = br.getUTCDay();
    const hour = br.getUTCHours();
    if(day === 4 && hour >= 8 && hour < 10) return 5 * 60 * 1000;
    return 24 * 60 * 60 * 1000;
  }

  function esc(v){
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function fmtDay(d){ return String(d.getDate()).padStart(2,'0'); }
  const WEEKDAYS = ['Do','Se','Te','Qu','Qu','Se','Sá'];
  const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const PALETTE = ['#7a5a3d','#7a3d4a','#a04a2e','#3f6d89','#5a4f8a','#3f7a5a','#8a6a3d','#5a6a7a'];
  function colorForIndex(i){ return PALETTE[i % PALETTE.length]; }

  function readStarts(){
    try{ const raw = localStorage.getItem(START_KEY); return raw ? JSON.parse(raw) : {}; }
    catch{ return {}; }
  }
  function writeStarts(map){
    try{ localStorage.setItem(START_KEY, JSON.stringify(map)); }catch{}
  }

  let allEvents = [];
  let activeTab = 'temporary';

  function render(){
    if(!allEvents.length){
      root.innerHTML = '<div class="events-status">Nenhum evento em andamento encontrado no momento.</div>';
      return;
    }

    const tempEvents = allEvents.filter(e => !e.isPermanent);
    const permEvents = allEvents.filter(e => e.isPermanent);
    const list = activeTab === 'temporary' ? tempEvents : permEvents;
    const valid = list.filter(e => e && e.title && e.link);

    const tabsHtml = `
      <div class="events-tabs" role="tablist">
        <button type="button" class="events-tab ${activeTab==='temporary'?'active':''}" data-tab="temporary" role="tab" aria-selected="${activeTab==='temporary'}">
          ⏱️ Temporários
        </button>
        <button type="button" class="events-tab ${activeTab==='permanent'?'active':''}" data-tab="permanent" role="tab" aria-selected="${activeTab==='permanent'}">
          ∞ Permanentes
        </button>
      </div>`;

    if(!valid.length){
      root.innerHTML = tabsHtml + '<div class="events-status">Nenhum evento nesta categoria no momento.</div>';
      bindTabs();
      return;
    }

    const now = new Date();
    const today0 = startOfDay(now);
    const starts = readStarts();

    const prepared = valid.map((e, idx) => {
      const idKey = String(e.id);
      let startISO = starts[idKey];
      if(!startISO){
        startISO = today0.toISOString();
        starts[idKey] = startISO;
      }
      const realStart = startOfDay(new Date(startISO));

      let endDate;
      if(e.isPermanent){
        endDate = new Date(today0.getTime() + PERMANENT_WINDOW_DAYS * DAY_MS);
      } else {
        const dLeft = Math.max(0, Number(e.daysLeft) || 0);
        endDate = new Date(today0.getTime() + dLeft * DAY_MS);
      }

      const effectiveStart = realStart.getTime() < today0.getTime() ? today0 : realStart;
      const cameFromBefore = realStart.getTime() < today0.getTime();

      return { ...e, _start: effectiveStart, _end: endDate, _cameFromBefore: cameFromBefore, _idx: idx };
    });

    writeStarts(starts);

    let maxEnd = today0.getTime() + 14 * DAY_MS;
    prepared.forEach(p => { if(p._end.getTime() > maxEnd) maxEnd = p._end.getTime(); });

    // 2 dias pra trás (regra do usuário)
    const windowStart = new Date(today0.getTime() - DAYS_BACK * DAY_MS);
    const windowEnd = new Date(maxEnd + 2 * DAY_MS);

    const totalDays = Math.round((windowEnd - windowStart) / DAY_MS) + 1;
    const dayX = (d) => Math.round((startOfDay(d) - windowStart) / DAY_MS) * DAY_WIDTH;

    let ruler = '';
    for(let i = 0; i < totalDays; i++){
      const d = new Date(windowStart.getTime() + i * DAY_MS);
      const isToday = d.getTime() === today0.getTime();
      const isFirst = d.getDate() === 1;
      ruler += `<div class="events-ruler-day${isToday?' is-today':''}${isFirst?' is-first-of-month':''}" style="left:${i*DAY_WIDTH}px">
        ${isFirst ? `<span class="events-ruler-m">${MONTHS_SHORT[d.getMonth()]}</span>` : ''}
        <span class="events-ruler-wd">${WEEKDAYS[d.getDay()]}</span>
        <span class="events-ruler-n">${fmtDay(d)}</span>
      </div>`;
    }

    const todayX = dayX(today0);

    let rows = '';
    prepared.forEach((p, i) => {
      const x1raw = dayX(p._start);
      const x2raw = dayX(p._end) + DAY_WIDTH;
      const x1 = Math.max(0, x1raw);
      const x2 = Math.min(totalDays * DAY_WIDTH, x2raw);
      const w = Math.max(DAY_WIDTH, x2 - x1);
      const color = p.isPermanent ? '#4a4f5a' : colorForIndex(p._idx);

      let label;
      if(p.isPermanent){
        label = '';
      } else {
        const msLeft = p._end - now;
        const daysLeft = Math.max(0, Math.ceil(msLeft / DAY_MS));
        if(msLeft <= 0) label = 'Encerrado';
        else if(daysLeft <= 1) label = 'Hoje';
        else label = `${daysLeft}d`;
      }

      const badgeHtml = (!p.isPermanent && label)
        ? `<span class="events-bar-days" style="left:${x2 + 6}px">${esc(label)}</span>`
        : '';

      rows += `<a class="events-row${p._cameFromBefore?' came-from-before':''}${p.isPermanent?' is-permanent':''}"
                  href="${esc(p.link)}" target="_blank" rel="noopener"
                  style="top:${i*ROW_HEIGHT}px"
                  data-title="${esc(p.title)}">
        <span class="events-bar" style="left:${x1}px;width:${w}px;background:${color};">
          ${p._cameFromBefore ? '<span class="events-bar-arrow" aria-hidden="true">‹</span>' : ''}
          <span class="events-bar-label">${esc(p.title)}</span>
        </span>
        ${badgeHtml}
      </a>`;
    });

    const rowsHeight = prepared.length * ROW_HEIGHT;
    const canvasHeight = 30 + rowsHeight + 6;

    root.innerHTML = tabsHtml + `
      <div class="events-scroll">
        <div class="events-canvas" style="width:${totalDays*DAY_WIDTH}px;height:${canvasHeight}px">
          <div class="events-ruler" style="height:30px">${ruler}</div>
          <div class="events-today-line" style="left:${todayX}px;height:${canvasHeight}px"></div>
          <div class="events-rows" style="top:30px;height:${rowsHeight}px">${rows}</div>
        </div>
      </div>`;

    bindStickyLabels();
    bindTabs();

    // Rola pro começo (o marcador de hoje fica 2 dias da borda esquerda)
    const scroller = root.querySelector('.events-scroll');
    if(scroller) scroller.scrollLeft = 0;
  }

  function bindStickyLabels(){
    const scroller = root.querySelector('.events-scroll');
    if(!scroller) return;
    const rows = Array.from(root.querySelectorAll('.events-row'));
    function update(){
      const sl = scroller.scrollLeft;
      rows.forEach(row => {
        const bar = row.querySelector('.events-bar');
        const label = row.querySelector('.events-bar-label');
        const arrow = row.querySelector('.events-bar-arrow');
        if(!bar || !label) return;

        const barLeft = parseFloat(bar.style.left) || 0;
        const barWidth = parseFloat(bar.style.width) || 0;
        const barRight = barLeft + barWidth;

        if(barRight < sl){
          label.style.transform = '';
          label.style.opacity = '0';
          return;
        }
        label.style.opacity = '1';

        if(barLeft < sl){
          const offset = sl - barLeft;
          const maxOffset = Math.max(0, barWidth - label.offsetWidth - 60);
          label.style.transform = `translateX(${Math.min(offset, maxOffset)}px)`;
          if(arrow) arrow.style.opacity = '0';
        } else {
          label.style.transform = '';
          if(arrow) arrow.style.opacity = '0.85';
        }
      });
    }
    scroller.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
  }

  function bindTabs(){
    root.querySelectorAll('.events-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if(tab === activeTab) return;
        activeTab = tab;
        render();
      });
    });
  }

  function readCache(){
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(!data || !data.ts || Date.now() - data.ts > cacheTTL()) return null;
      return data.events;
    }catch{ return null; }
  }
  function writeCache(events){
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ts:Date.now(), events})); }catch{}
  }

  async function load(){
    const cached = readCache();
    if(cached && cached.length){
      allEvents = cached;
      render();
      return;
    }
    try{
      const res = await fetch('/.netlify/functions/bdo-events?ts=' + Date.now(), {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if(data.error && (!data.events || !data.events.length)){
        root.innerHTML = '<div class="events-status">Não foi possível carregar os eventos agora. Tente novamente mais tarde.</div>';
        return;
      }
      allEvents = data.events || [];
      writeCache(allEvents);
      render();
    }catch(err){
      console.error('[Eventos]', err);
      root.innerHTML = '<div class="events-status">Não foi possível carregar os eventos agora.</div>';
    }
  }

  load();
})();